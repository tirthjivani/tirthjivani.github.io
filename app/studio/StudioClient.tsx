"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ArchiveItem = { src: string; alt?: string };
type ArchivesFile = { items: ArchiveItem[] };
type StudioTab = "projects" | "archives";
type ChangedFile = {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed" | "untracked";
};
type PublishStatus = { files: ChangedFile[]; ahead: number; branch: string };

type CaseStudyLink = { title: string; href?: string };

type CaseStudyImage = {
  src: string;
  alt?: string;
  colStart?: number;
  colSpan?: number;
  rowSpan?: number;
  aspect?: number;
  video?: boolean;
  caption?: string;
};

type CaseStudySection =
  | { kind: "body"; text: string }
  | { kind: "intro"; label: string; heading: string }
  | { kind: "images"; items: CaseStudyImage[]; gap?: number };

type ProjectSeed = {
  slug: string;
  title: string;
  client: string;
  role: string;
  year: string;
  caseStudy: boolean;
  category?: string;
  liveLink?: string;
  impact?: string;
  src?: string;
  video?: string;
  introduction?: string;
  seoDescription?: string;
  timeline?: string;
  caseStudies?: CaseStudyLink[];
  sections?: CaseStudySection[];
};

type SeedsFile = {
  hidden: string[];
  projects: ProjectSeed[];
};

type SaveState = "idle" | "saving" | "saved" | "error";

const EMPTY_PROJECT: ProjectSeed = {
  slug: "",
  title: "",
  client: "",
  role: "",
  year: new Date().getFullYear().toString(),
  caseStudy: false,
  category: "",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
}

export function StudioClient() {
  // Working copies — what the user is currently editing in-memory.
  const [data, setData] = useState<SeedsFile | null>(null);
  const [archives, setArchives] = useState<ArchivesFile | null>(null);
  // Last-applied snapshots — what's currently on disk. Drives the "dirty"
  // flag for the Apply button; updated only after a successful Apply.
  const [appliedData, setAppliedData] = useState<SeedsFile | null>(null);
  const [appliedArchives, setAppliedArchives] = useState<ArchivesFile | null>(
    null
  );
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [tab, setTab] = useState<StudioTab>("projects");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Git-state for the Publish flow: list of changed files between disk and
  // origin's HEAD plus any locally-committed-but-unpushed work.
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPublishStatus = useCallback(async () => {
    try {
      const r = await fetch("/api/studio/publish");
      if (!r.ok) return;
      const j = (await r.json()) as PublishStatus;
      setPublishStatus(j);
    } catch {
      // Non-fatal — the publish surface just won't show counts until next try.
    }
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/api/studio/projects").then(async (r) => {
        if (!r.ok) throw new Error(`projects load failed (${r.status})`);
        return (await r.json()) as SeedsFile;
      }),
      fetch("/api/studio/archives").then(async (r) => {
        if (!r.ok) throw new Error(`archives load failed (${r.status})`);
        return (await r.json()) as ArchivesFile;
      }),
    ])
      .then(([seeds, archivesFile]) => {
        if (!alive) return;
        setData(seeds);
        setAppliedData(seeds);
        setArchives(archivesFile);
        setAppliedArchives(archivesFile);
        setSelectedSlug(seeds.projects[0]?.slug ?? null);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setLoadError(e instanceof Error ? e.message : "load failed");
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    void fetchPublishStatus();
  }, [fetchPublishStatus]);

  const persistTo = useCallback(
    async (url: string, payload: unknown) => {
      const r = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(j?.error ?? `save failed (${r.status})`);
      }
    },
    []
  );

  // Manual Apply: writes the in-memory state to disk in both datasources.
  // Auto-save is intentionally disabled — uploads still hit /upload directly
  // (so binaries land in /public), but the JSON metadata only commits to
  // disk when the user hits Apply.
  const dirty = useMemo(() => {
    if (!data || !appliedData || !archives || !appliedArchives) return false;
    return (
      JSON.stringify(data) !== JSON.stringify(appliedData) ||
      JSON.stringify(archives) !== JSON.stringify(appliedArchives)
    );
  }, [data, archives, appliedData, appliedArchives]);

  const applyChanges = useCallback(async () => {
    if (!data || !archives) return;
    setSaveState("saving");
    setErrorMsg(null);
    try {
      await Promise.all([
        persistTo("/api/studio/projects", data),
        persistTo("/api/studio/archives", archives),
      ]);
      setAppliedData(data);
      setAppliedArchives(archives);
      setSaveState("saved");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaveState("idle"), 1500);
      await fetchPublishStatus();
    } catch (e) {
      setSaveState("error");
      setErrorMsg(e instanceof Error ? e.message : "save failed");
    }
  }, [data, archives, persistTo, fetchPublishStatus]);

  const publishToProd = useCallback(async () => {
    setPublishing(true);
    setPublishError(null);
    try {
      const r = await fetch("/api/studio/publish", { method: "POST" });
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(j?.error ?? `publish failed (${r.status})`);
      }
      await fetchPublishStatus();
      setPublishOpen(false);
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : "publish failed");
    } finally {
      setPublishing(false);
    }
  }, [fetchPublishStatus]);

  const updateProject = useCallback(
    (slug: string, patch: Partial<ProjectSeed>) => {
      setData((d) => {
        if (!d) return d;
        const next: SeedsFile = {
          hidden: d.hidden,
          projects: d.projects.map((p) =>
            p.slug === slug ? { ...p, ...patch } : p
          ),
        };
        return next;
      });
    },
    []
  );

  const toggleHidden = useCallback(
    (slug: string) => {
      setData((d) => {
        if (!d) return d;
        const hidden = d.hidden.includes(slug)
          ? d.hidden.filter((s) => s !== slug)
          : [...d.hidden, slug];
        return { ...d, hidden };
      });
    },
    []
  );

  const addProject = useCallback(() => {
    setData((d) => {
      if (!d) return d;
      // Generate a unique slug for the new entry.
      const base = "new-project";
      let slug = base;
      let i = 1;
      const taken = new Set(d.projects.map((p) => p.slug));
      while (taken.has(slug)) {
        slug = `${base}-${i++}`;
      }
      const next: SeedsFile = {
        hidden: d.hidden,
        projects: [{ ...EMPTY_PROJECT, slug }, ...d.projects],
      };
      setSelectedSlug(slug);
      return next;
    });
  }, []);

  const deleteProject = useCallback(
    (slug: string) => {
      setData((d) => {
        if (!d) return d;
        const next: SeedsFile = {
          hidden: d.hidden.filter((s) => s !== slug),
          projects: d.projects.filter((p) => p.slug !== slug),
        };
        if (selectedSlug === slug) {
          setSelectedSlug(next.projects[0]?.slug ?? null);
        }
        return next;
      });
    },
    [selectedSlug]
  );

  const renameSlug = useCallback(
    (oldSlug: string, newSlug: string) => {
      const cleaned = slugify(newSlug);
      if (!cleaned) return;
      setData((d) => {
        if (!d) return d;
        if (d.projects.some((p) => p.slug === cleaned)) return d;
        const next: SeedsFile = {
          hidden: d.hidden.map((s) => (s === oldSlug ? cleaned : s)),
          projects: d.projects.map((p) =>
            p.slug === oldSlug ? { ...p, slug: cleaned } : p
          ),
        };
        setSelectedSlug(cleaned);
        return next;
      });
    },
    []
  );

  const selected = useMemo(
    () => data?.projects.find((p) => p.slug === selectedSlug) ?? null,
    [data, selectedSlug]
  );

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--bg)] px-[20px] text-center text-[color:var(--fg)]">
        <div className="flex flex-col gap-[12px]">
          <div className="text-[20px]">Studio unavailable</div>
          <div className="text-[13px] text-white/60">{loadError}</div>
        </div>
      </div>
    );
  }

  if (!data || !archives) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--bg)] text-[color:var(--fg)]">
        <div className="text-[13px] text-white/60">Loading studio…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[color:var(--bg)] text-[color:var(--fg)]">
      <header className="shrink-0 grid grid-cols-12 items-center gap-x-[10px] border-b border-white/10 bg-[color:var(--bg)] px-[20px] py-[14px]">
        <Link
          href="/"
          className="col-span-3 text-[13px] leading-none tracking-[-0.02em] hover:underline"
        >
          TIRTH J. / STUDIO
        </Link>
        <div className="col-span-6 flex items-center justify-center gap-[4px]">
          <TabButton active={tab === "projects"} onClick={() => setTab("projects")}>
            Projects ({data.projects.length})
          </TabButton>
          <TabButton active={tab === "archives"} onClick={() => setTab("archives")}>
            Archives ({archives.items.length})
          </TabButton>
        </div>
        <div className="col-span-3 flex items-center justify-end gap-[14px] text-[12px] leading-none">
          <SaveIndicator state={saveState} error={errorMsg} />
          <StudioThemeToggle />
          <ApplyAndPublishButtons
            dirty={dirty}
            applying={saveState === "saving"}
            onApply={applyChanges}
            publishStatus={publishStatus}
            onOpenPublish={() => setPublishOpen(true)}
          />
        </div>
      </header>

      <PublishModal
        open={publishOpen}
        status={publishStatus}
        publishing={publishing}
        error={publishError}
        onClose={() => setPublishOpen(false)}
        onPublish={publishToProd}
      />

      {tab === "projects" ? (
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside
            data-lenis-prevent
            className="max-h-[35vh] shrink-0 overflow-y-auto border-b border-white/10 md:max-h-none md:w-[320px] md:border-b-0 md:border-r"
          >
            <div className="p-[24px]">
              <ProjectList
                projects={data.projects}
                hidden={data.hidden}
                selectedSlug={selectedSlug}
                onSelect={setSelectedSlug}
                onAdd={addProject}
                onToggleHidden={toggleHidden}
                onDelete={deleteProject}
              />
            </div>
          </aside>
          <section
            data-lenis-prevent
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <div className="p-[24px] pb-[80px]">
              {selected ? (
                <ProjectEditor
                  project={selected}
                  hidden={data.hidden.includes(selected.slug)}
                  onChange={(patch) => updateProject(selected.slug, patch)}
                  onRenameSlug={(s) => renameSlug(selected.slug, s)}
                  onToggleHidden={() => toggleHidden(selected.slug)}
                />
              ) : (
                <div className="text-[13px] text-white/40">
                  No project selected. Add one from the left.
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <section data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-[24px] pb-[80px]">
            <ArchivesEditor
              items={archives.items}
              onChange={(items) => setArchives({ items })}
            />
          </div>
        </section>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-[14px] py-[8px] text-[12px] leading-none transition-colors ${
        active
          ? "bg-[color:var(--fg)] text-[color:var(--bg)]"
          : "text-white/50 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function StudioThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (isDark) root.classList.remove("light");
    else root.classList.add("light");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {}
  }, [isDark, hydrated]);
  return (
    <button
      type="button"
      onClick={() => setIsDark((v) => !v)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="border border-white/20 px-[8px] py-[4px] text-[11px] leading-none hover:border-white hover:text-white"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
}

function SaveIndicator({
  state,
  error,
}: {
  state: SaveState;
  error: string | null;
}) {
  const base = "inline-flex items-center gap-[6px]";
  const dot = "inline-block h-[6px] w-[6px] rounded-full";
  if (state === "saving") {
    return (
      <span className={`${base} text-amber-300`}>
        <span className={`${dot} bg-amber-300 animate-pulse`} />
        Saving…
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className={`${base} text-emerald-400`}>
        <span className={`${dot} bg-emerald-400`} />
        Saved
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className={`${base} text-red-400`}>
        <span className={`${dot} bg-red-400`} />
        Error: {error}
      </span>
    );
  }
  return (
    <span className={`${base} text-white/40`}>
      <span className={`${dot} bg-white/30`} />
      Idle
    </span>
  );
}

function ProjectList({
  projects,
  hidden,
  selectedSlug,
  onSelect,
  onAdd,
  onToggleHidden,
  onDelete,
}: {
  projects: ProjectSeed[];
  hidden: string[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onAdd: () => void;
  onToggleHidden: (slug: string) => void;
  onDelete: (slug: string) => void;
}) {
  const hiddenSet = new Set(hidden);
  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center justify-between text-[12px] leading-none text-white/40">
        <span>Projects ({projects.length})</span>
        <button
          type="button"
          onClick={onAdd}
          className="text-white hover:underline"
        >
          + New
        </button>
      </div>
      <ul className="flex flex-col">
        {projects.map((p) => {
          const isSelected = p.slug === selectedSlug;
          const isHidden = hiddenSet.has(p.slug);
          return (
            <li
              key={p.slug}
              className={`group flex items-center justify-between border-b border-white/5 py-[10px] text-[13px] leading-none ${
                isSelected ? "text-white" : "text-white/60 hover:text-white"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(p.slug)}
                className="flex flex-1 items-center gap-[8px] text-left"
              >
                <span
                  aria-hidden
                  className={`inline-block h-[6px] w-[6px] rounded-full ${
                    isSelected ? "bg-white" : "bg-white/20"
                  }`}
                />
                <span className="truncate">
                  {p.title || <span className="italic">(untitled)</span>}
                </span>
                {p.caseStudy && (
                  <span className="ml-[4px] text-[10px] uppercase tracking-[0.1em] text-white/40">
                    CS
                  </span>
                )}
                {isHidden && (
                  <span className="ml-[4px] text-[10px] uppercase tracking-[0.1em] text-white/40">
                    hidden
                  </span>
                )}
              </button>
              <div className="flex items-center gap-[10px] text-[11px] leading-none text-white/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => onToggleHidden(p.slug)}
                  className="hover:underline hover:text-white"
                >
                  {isHidden ? "Show" : "Hide"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(`Delete "${p.title || p.slug}"? Cannot be undone.`)
                    ) {
                      onDelete(p.slug);
                    }
                  }}
                  className="hover:underline hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProjectEditor({
  project,
  hidden,
  onChange,
  onRenameSlug,
  onToggleHidden,
}: {
  project: ProjectSeed;
  hidden: boolean;
  onChange: (patch: Partial<ProjectSeed>) => void;
  onRenameSlug: (slug: string) => void;
  onToggleHidden: () => void;
}) {
  const text = (key: keyof ProjectSeed) =>
    (project[key] as string | undefined) ?? "";

  const setText = (key: keyof ProjectSeed) => (v: string) =>
    onChange({ [key]: v || undefined } as Partial<ProjectSeed>);

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Header row */}
      <div className="flex flex-col gap-[12px] md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-[6px]">
          <label className="text-[10px] uppercase tracking-[0.1em] text-white/40">
            Title
          </label>
          <Input
            value={project.title}
            onChange={setText("title")}
            placeholder="Project title"
            className="text-[32px] leading-[1.1] tracking-[-0.02em]"
          />
        </div>
        <div className="flex items-center gap-[12px] text-[12px]">
          <button
            type="button"
            onClick={onToggleHidden}
            className={`px-[10px] py-[6px] border ${
              hidden
                ? "border-white text-white"
                : "border-white/20 text-white/60 hover:border-white hover:text-white"
            }`}
          >
            {hidden ? "Hidden" : "Visible"}
          </button>
        </div>
      </div>

      {/* Slug */}
      <Row>
        <Field label="Slug (URL id)">
          <SlugInput value={project.slug} onCommit={onRenameSlug} />
        </Field>
        <Field label="Category">
          <Input
            value={text("category")}
            onChange={setText("category")}
            placeholder="e.g. Product Redesign"
          />
        </Field>
      </Row>

      {/* Client / Role */}
      <Row>
        <Field label="Client">
          <Input value={project.client} onChange={setText("client")} />
        </Field>
        <Field label="Role">
          <Input value={project.role} onChange={setText("role")} />
        </Field>
      </Row>

      {/* Year / Timeline */}
      <Row>
        <Field label="Year">
          <Input
            value={project.year}
            onChange={setText("year")}
            placeholder="e.g. 2025 or 2023 - 2024"
          />
        </Field>
        <Field label="Timeline">
          <Input
            value={text("timeline")}
            onChange={setText("timeline")}
            placeholder="e.g. 5 months"
          />
        </Field>
      </Row>

      {/* Action chooser */}
      <Field label="Action when clicked">
        <div className="flex gap-[2px]">
          <ActionTab
            active={project.caseStudy}
            onClick={() => onChange({ caseStudy: true })}
          >
            Case Study
          </ActionTab>
          <ActionTab
            active={!project.caseStudy && !!project.liveLink}
            onClick={() => onChange({ caseStudy: false })}
          >
            Live Link
          </ActionTab>
          <ActionTab
            active={!project.caseStudy && !project.liveLink}
            onClick={() =>
              onChange({ caseStudy: false, liveLink: undefined })
            }
          >
            None
          </ActionTab>
        </div>
        <div className="mt-[8px] text-[11px] text-white/40">
          {project.caseStudy
            ? `Clicking the card opens /project/${project.slug || "[slug]"}`
            : project.liveLink
              ? `Clicking the card opens ${project.liveLink} in a new tab`
              : "Card is not clickable"}
        </div>
      </Field>

      {/* Live link */}
      {!project.caseStudy && (
        <Field label="Live link URL">
          <Input
            value={text("liveLink")}
            onChange={setText("liveLink")}
            placeholder="https://example.com"
          />
        </Field>
      )}

      {/* Impact */}
      <Field label="Impact tag (optional)">
        <Input
          value={text("impact")}
          onChange={setText("impact")}
          placeholder="e.g. 80%+ UX Improvement"
        />
      </Field>

      {/* Image upload */}
      <Field label="Image">
        <FileUpload
          slug={project.slug}
          currentPath={project.src}
          accept="image/*"
          onUploaded={(p) => onChange({ src: p })}
          onClear={() => onChange({ src: undefined })}
        />
      </Field>

      {/* Video upload */}
      <Field label="Video (optional, overrides image in list)">
        <FileUpload
          slug={project.slug}
          currentPath={project.video}
          accept="video/*"
          onUploaded={(p) => onChange({ video: p })}
          onClear={() => onChange({ video: undefined })}
        />
      </Field>

      {/* Case-study-only fields */}
      {project.caseStudy && (
        <>
          <Field label="Introduction">
            <Textarea
              value={text("introduction")}
              onChange={setText("introduction")}
              rows={4}
              placeholder="Paragraph that opens the case study"
            />
          </Field>
          <Field label="SEO description">
            <Textarea
              value={text("seoDescription")}
              onChange={setText("seoDescription")}
              rows={3}
              placeholder="One-sentence summary for search engines and social cards"
            />
          </Field>
          <Field label="Case study links (sub-pages)">
            <CaseStudyLinks
              links={project.caseStudies ?? []}
              onChange={(next) =>
                onChange({ caseStudies: next.length ? next : undefined })
              }
            />
          </Field>
          <Field label="Case study sections (page content)">
            <SectionsEditor
              projectSlug={project.slug}
              sections={project.sections ?? []}
              onChange={(next) =>
                onChange({ sections: next.length ? next : undefined })
              }
            />
          </Field>
        </>
      )}

      <PreviewCard project={project} hidden={hidden} />
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2">{children}</div>;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="text-[10px] uppercase tracking-[0.1em] text-white/40">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border-b border-white/15 bg-transparent py-[8px] text-[13px] leading-none text-white placeholder:text-white/30 focus:border-white focus:outline-none ${className}`}
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full resize-y border border-white/15 bg-transparent p-[10px] text-[13px] leading-[1.4] text-white placeholder:text-white/30 focus:border-white focus:outline-none"
    />
  );
}

function SlugInput({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (v: string) => void;
}) {
  // Uncontrolled input keyed by `value` — when the prop changes externally
  // (rename), React remounts and resets the defaultValue. The commit only
  // fires on blur/enter, so transient edits don't broadcast on every
  // keystroke.
  return (
    <div className="flex items-center gap-[8px]">
      <input
        key={value}
        type="text"
        defaultValue={value}
        onBlur={(e) => {
          const cleaned = slugify(e.target.value);
          if (cleaned && cleaned !== value) onCommit(cleaned);
          else e.target.value = value;
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-full border-b border-white/15 bg-transparent py-[8px] font-mono text-[13px] leading-none text-white focus:border-white focus:outline-none"
      />
      <span className="text-[11px] text-white/40">
        commit on blur / enter
      </span>
    </div>
  );
}

function ActionTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 border px-[12px] py-[10px] text-[13px] leading-none transition-colors ${
        active
          ? "border-white bg-white text-black"
          : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function FileUpload({
  slug,
  tag,
  currentPath,
  accept,
  onUploaded,
  onClear,
  size = "lg",
}: {
  slug: string;
  tag?: string;
  currentPath?: string;
  accept: string;
  onUploaded: (path: string) => void;
  onClear: () => void;
  size?: "lg" | "sm";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Local-only cache-bust token. Saved data stays clean; we just append
  // ?t=… to the in-DOM preview src so a replace upload doesn't show the
  // browser-cached old file.
  const [bust, setBust] = useState(0);
  const isVideo = accept.includes("video");

  const handleFile = async (file: File) => {
    if (!slug) {
      setError("Set a slug first");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", slug);
      if (tag) form.append("tag", tag);
      const r = await fetch("/api/studio/upload", {
        method: "POST",
        body: form,
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(j?.error ?? `upload failed (${r.status})`);
      }
      const j = (await r.json()) as { path: string };
      // Persist the clean path. Next.js' next/image blocks query strings
      // on local images by default, so the saved value must not include
      // a ?t=… cache-buster.
      onUploaded(j.path);
      setBust(Date.now());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "upload failed");
    } finally {
      setBusy(false);
    }
  };

  const cleanPath = currentPath?.split("?")[0];
  const previewSrc = cleanPath
    ? bust
      ? `${cleanPath}?t=${bust}`
      : cleanPath
    : undefined;
  const previewClass =
    size === "sm" ? "h-[70px] w-[100px]" : "h-[110px] w-[170px]";

  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex items-center gap-[14px]">
        <div
          className={`flex items-center justify-center overflow-hidden border border-white/15 bg-white/[0.02] ${previewClass}`}
        >
          {previewSrc ? (
            isVideo ? (
              <video
                src={previewSrc}
                className="h-full w-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt=""
                className="h-full w-full object-cover"
              />
            )
          ) : (
            <span className="text-[11px] text-white/30">No file</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-[6px]">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.target.value = "";
            }}
          />
          <div className="flex gap-[8px]">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="border border-white/20 px-[10px] py-[6px] text-[12px] hover:border-white disabled:opacity-50"
            >
              {busy ? "Uploading…" : currentPath ? "Replace" : "Upload"}
            </button>
            {currentPath && (
              <button
                type="button"
                onClick={onClear}
                className="text-[12px] text-white/40 hover:underline hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
          <div className="font-mono text-[11px] text-white/40 break-all">
            {cleanPath ?? "—"}
          </div>
          {error && (
            <div className="text-[11px] text-red-300">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function CaseStudyLinks({
  links,
  onChange,
}: {
  links: CaseStudyLink[];
  onChange: (links: CaseStudyLink[]) => void;
}) {
  const update = (i: number, patch: Partial<CaseStudyLink>) => {
    onChange(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  };
  const remove = (i: number) => {
    onChange(links.filter((_, idx) => idx !== i));
  };
  return (
    <div className="flex flex-col gap-[10px]">
      {links.map((l, i) => (
        <div
          key={i}
          className="grid grid-cols-12 items-center gap-[10px] border-b border-white/10 py-[6px]"
        >
          <div className="col-span-4">
            <Input
              value={l.title}
              onChange={(v) => update(i, { title: v })}
              placeholder="Link title"
            />
          </div>
          <div className="col-span-7">
            <Input
              value={l.href ?? ""}
              onChange={(v) => update(i, { href: v || undefined })}
              placeholder="https://…"
            />
          </div>
          <div className="col-span-1 flex justify-end">
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-[12px] text-white/40 hover:text-red-300"
              aria-label="Remove link"
            >
              ×
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...links, { title: "", href: "" }])}
        className="self-start text-[12px] text-white/60 hover:underline hover:text-white"
      >
        + Add link
      </button>
    </div>
  );
}

function SectionsEditor({
  projectSlug,
  sections,
  onChange,
}: {
  projectSlug: string;
  sections: CaseStudySection[];
  onChange: (next: CaseStudySection[]) => void;
}) {
  const update = (i: number, next: CaseStudySection) =>
    onChange(sections.map((s, idx) => (idx === i ? next : s)));
  const remove = (i: number) =>
    onChange(sections.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    const a = next[i];
    const b = next[j];
    next[i] = b;
    next[j] = a;
    onChange(next);
  };
  const add = (kind: CaseStudySection["kind"]) => {
    const newSection: CaseStudySection =
      kind === "body"
        ? { kind: "body", text: "" }
        : kind === "intro"
          ? { kind: "intro", label: "", heading: "" }
          : { kind: "images", items: [] };
    onChange([...sections, newSection]);
  };

  return (
    <div className="flex flex-col gap-[12px]">
      {sections.length === 0 && (
        <div className="border border-dashed border-white/10 px-[14px] py-[20px] text-center text-[12px] text-white/40">
          No sections yet. Add one below.
        </div>
      )}
      {sections.map((section, i) => (
        <SectionCard
          key={i}
          index={i}
          total={sections.length}
          projectSlug={projectSlug}
          section={section}
          onChange={(next) => update(i, next)}
          onMoveUp={() => move(i, -1)}
          onMoveDown={() => move(i, 1)}
          onRemove={() => remove(i)}
        />
      ))}
      <div className="flex flex-wrap gap-[8px] pt-[4px]">
        <AddSectionButton onClick={() => add("intro")}>+ Intro</AddSectionButton>
        <AddSectionButton onClick={() => add("body")}>+ Body</AddSectionButton>
        <AddSectionButton onClick={() => add("images")}>
          + Images
        </AddSectionButton>
      </div>
    </div>
  );
}

function AddSectionButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-white/20 px-[12px] py-[8px] text-[12px] leading-none text-white/80 hover:border-white hover:text-white"
    >
      {children}
    </button>
  );
}

function SectionCard({
  index,
  total,
  projectSlug,
  section,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  index: number;
  total: number;
  projectSlug: string;
  section: CaseStudySection;
  onChange: (next: CaseStudySection) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-white/15">
      <div className="flex items-center justify-between border-b border-white/10 px-[12px] py-[8px] text-[11px] leading-none text-white/60">
        <div className="flex items-center gap-[8px]">
          <span className="text-white/40">#{index + 1}</span>
          <span className="uppercase tracking-[0.1em] text-white">
            {section.kind}
          </span>
        </div>
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="hover:text-white disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="hover:text-white disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Remove this section?")) onRemove();
            }}
            className="hover:text-red-300"
            aria-label="Remove section"
          >
            ×
          </button>
        </div>
      </div>
      <div className="px-[12px] py-[14px]">
        {section.kind === "intro" && (
          <IntroSectionFields section={section} onChange={onChange} />
        )}
        {section.kind === "body" && (
          <BodySectionFields section={section} onChange={onChange} />
        )}
        {section.kind === "images" && (
          <ImagesSectionFields
            section={section}
            projectSlug={projectSlug}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}

function IntroSectionFields({
  section,
  onChange,
}: {
  section: Extract<CaseStudySection, { kind: "intro" }>;
  onChange: (next: CaseStudySection) => void;
}) {
  return (
    <div className="flex flex-col gap-[12px]">
      <Field label="Label (e.g. 01 / Brief)">
        <Input
          value={section.label}
          onChange={(v) => onChange({ ...section, label: v })}
          placeholder="01"
        />
      </Field>
      <Field label="Heading">
        <Textarea
          value={section.heading}
          onChange={(v) => onChange({ ...section, heading: v })}
          rows={2}
          placeholder="Section heading"
        />
      </Field>
    </div>
  );
}

function BodySectionFields({
  section,
  onChange,
}: {
  section: Extract<CaseStudySection, { kind: "body" }>;
  onChange: (next: CaseStudySection) => void;
}) {
  return (
    <Field label="Body text">
      <Textarea
        value={section.text}
        onChange={(v) => onChange({ ...section, text: v })}
        rows={6}
        placeholder="Paragraph(s) of body copy"
      />
    </Field>
  );
}

function ImagesSectionFields({
  section,
  projectSlug,
  onChange,
}: {
  section: Extract<CaseStudySection, { kind: "images" }>;
  projectSlug: string;
  onChange: (next: CaseStudySection) => void;
}) {
  const updateItem = (i: number, patch: Partial<CaseStudyImage>) => {
    onChange({
      ...section,
      items: section.items.map((it, idx) =>
        idx === i ? { ...it, ...patch } : it
      ),
    });
  };
  const removeItem = (i: number) => {
    onChange({ ...section, items: section.items.filter((_, idx) => idx !== i) });
  };
  const moveItem = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= section.items.length) return;
    const next = [...section.items];
    const a = next[i];
    const b = next[j];
    next[i] = b;
    next[j] = a;
    onChange({ ...section, items: next });
  };
  const addItem = () => {
    onChange({
      ...section,
      items: [...section.items, { src: "" }],
    });
  };

  return (
    <div className="flex flex-col gap-[12px]">
      <Field label="Gap between images (px, optional)">
        <Input
          value={section.gap?.toString() ?? ""}
          onChange={(v) => {
            const n = v.trim() === "" ? undefined : Number(v);
            onChange({
              ...section,
              gap: Number.isFinite(n) ? (n as number) : undefined,
            });
          }}
          placeholder="e.g. 10"
        />
      </Field>

      {section.items.length === 0 && (
        <div className="border border-dashed border-white/10 px-[12px] py-[16px] text-center text-[11px] text-white/40">
          No images. Add one below.
        </div>
      )}

      {section.items.map((item, i) => (
        <div
          key={i}
          className="border border-white/10 px-[12px] py-[12px]"
        >
          <div className="mb-[10px] flex items-center justify-between text-[11px] leading-none text-white/40">
            <span>Image #{i + 1}</span>
            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                onClick={() => moveItem(i, -1)}
                disabled={i === 0}
                className="hover:text-white disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveItem(i, 1)}
                disabled={i === section.items.length - 1}
                className="hover:text-white disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="hover:text-red-300"
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          </div>
          <FileUpload
            slug={projectSlug}
            tag={`cs-${i}-${item.src ? hashTag(item.src) : "new"}`}
            currentPath={item.src || undefined}
            accept={item.video ? "video/*" : "image/*"}
            onUploaded={(p) => updateItem(i, { src: p })}
            onClear={() => updateItem(i, { src: "" })}
            size="sm"
          />
          <div className="mt-[10px] grid grid-cols-1 gap-[10px] md:grid-cols-2">
            <Field label="Alt text">
              <Input
                value={item.alt ?? ""}
                onChange={(v) =>
                  updateItem(i, { alt: v || undefined })
                }
              />
            </Field>
            <Field label="Caption">
              <Input
                value={item.caption ?? ""}
                onChange={(v) =>
                  updateItem(i, { caption: v || undefined })
                }
              />
            </Field>
            <Field label="Col start (1-12)">
              <NumberInput
                value={item.colStart}
                onChange={(n) => updateItem(i, { colStart: n })}
                min={1}
                max={12}
              />
            </Field>
            <Field label="Col span (1-12)">
              <NumberInput
                value={item.colSpan}
                onChange={(n) => updateItem(i, { colSpan: n })}
                min={1}
                max={12}
              />
            </Field>
            <Field label="Row span">
              <NumberInput
                value={item.rowSpan}
                onChange={(n) => updateItem(i, { rowSpan: n })}
                min={1}
              />
            </Field>
            <Field label="Aspect (w/h, e.g. 1.78)">
              <NumberInput
                value={item.aspect}
                onChange={(n) => updateItem(i, { aspect: n })}
                step={0.01}
              />
            </Field>
          </div>
          <label className="mt-[10px] flex items-center gap-[8px] text-[12px] text-white/70">
            <input
              type="checkbox"
              checked={!!item.video}
              onChange={(e) =>
                updateItem(i, { video: e.target.checked || undefined })
              }
              className="h-[14px] w-[14px] accent-white"
            />
            Treat as video
          </label>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="self-start border border-white/20 px-[12px] py-[8px] text-[12px] leading-none text-white/80 hover:border-white hover:text-white"
      >
        + Add image
      </button>
    </div>
  );
}

function hashTag(s: string): string {
  // Lightweight stable-ish tag derived from the path so re-uploads of the
  // same item reuse a filename.
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h.toString(36).slice(0, 8);
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value?: number;
  onChange: (n: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value ?? ""}
      min={min}
      max={max}
      step={step}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") {
          onChange(undefined);
          return;
        }
        const n = Number(raw);
        if (Number.isFinite(n)) onChange(n);
      }}
      className="w-full border-b border-white/15 bg-transparent py-[8px] text-[13px] leading-none text-white placeholder:text-white/30 focus:border-white focus:outline-none"
    />
  );
}

function PreviewCard({
  project,
  hidden,
}: {
  project: ProjectSeed;
  hidden: boolean;
}) {
  const mediaSrc = project.video ?? project.src;
  const isVideo = !!project.video;
  const actionText = project.caseStudy
    ? "View Case Study"
    : project.liveLink
      ? "View Live"
      : "—";
  return (
    <div className="mt-[12px] border border-white/10 p-[16px]">
      <div className="mb-[10px] text-[10px] uppercase tracking-[0.1em] text-white/40">
        Preview
      </div>
      <div className="grid grid-cols-12 gap-[14px]">
        <div className="col-span-12 md:col-span-5">
          <div className="aspect-[16/10] w-full overflow-hidden bg-white/[0.02]">
            {mediaSrc ? (
              isVideo ? (
                <video
                  src={mediaSrc}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaSrc}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-[12px] text-white/30">
                no media
              </div>
            )}
          </div>
        </div>
        <div className="col-span-12 flex flex-col gap-[6px] md:col-span-7">
          <div className="text-[20px] leading-[1.1] tracking-[-0.02em]">
            {project.title || "(untitled)"}
          </div>
          <div className="text-[12px] text-white/60">{project.client}</div>
          <div className="mt-[6px] flex flex-wrap gap-x-[14px] gap-y-[4px] text-[11px] text-white/40">
            <span>{project.category ?? "—"}</span>
            <span>{project.role}</span>
            <span>{project.year}</span>
          </div>
          {project.impact && (
            <div className="mt-[4px] text-[11px] text-white/60">
              {project.impact}
            </div>
          )}
          <div className="mt-[14px] flex items-center gap-[12px] text-[12px]">
            <span
              className={`border px-[10px] py-[6px] ${
                project.caseStudy || project.liveLink
                  ? "border-white"
                  : "border-white/15 text-white/40"
              }`}
            >
              {actionText}
            </span>
            {hidden && (
              <span className="text-[11px] uppercase tracking-[0.1em] text-white/40">
                hidden from portfolio
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchivesEditor({
  items,
  onChange,
}: {
  items: ArchiveItem[];
  onChange: (items: ArchiveItem[]) => void;
}) {
  // `itemsRef` keeps the latest array in scope so the bulk-upload loop can
  // call `onChange(itemsRef.current.concat(newItem))` after each file —
  // closing over `items` directly would lose every append except the last.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const remove = (i: number) => {
    if (!confirm("Remove this archive image?")) return;
    onChange(items.filter((_, idx) => idx !== i));
  };
  const add = () => {
    onChange([{ src: "", alt: "" }, ...items]);
  };
  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };
  const updateAlt = (i: number, alt: string) => {
    onChange(items.map((it, idx) => (idx === i ? { ...it, alt } : it)));
  };
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex items-center justify-between gap-[12px]">
        <h2 className="text-[20px] leading-none tracking-[-0.02em]">
          Archives
        </h2>
        <div className="flex items-center gap-[8px]">
          <BulkArchiveUpload
            onUploaded={(src) => {
              onChange([...itemsRef.current, { src, alt: "" }]);
            }}
          />
          <button
            type="button"
            onClick={add}
            className="border border-white/20 px-[12px] py-[8px] text-[12px] leading-none hover:border-white hover:text-white"
          >
            + Add empty
          </button>
        </div>
      </div>
      <div className="text-[12px] text-white/40">
        Auto-saved. Drag tiles in the preview to reorder. Bulk upload sends
        files through the Squoosh → WebP pipeline one at a time.
      </div>

      <div className="grid grid-cols-1 gap-[24px] md:grid-cols-10">
        {/* Live masonry preview — mirrors the /archives page. Tiles are
            HTML5-draggable; dropping one onto another reorders the array. */}
        <div className="md:col-span-7">
          <SectionLabel>Preview (drag to rearrange)</SectionLabel>
          {items.length === 0 ? (
            <div className="border border-dashed border-white/15 p-[40px] text-center text-[13px] text-white/40">
              Empty. Bulk-upload or "+ Add empty" to start.
            </div>
          ) : (
            <MasonryPreview
              items={items}
              onReorder={reorder}
              onDelete={remove}
            />
          )}
        </div>

        {/* Right column: uploaded-images library, stacked vertically. */}
        <div data-lenis-prevent className="md:col-span-3">
          <SectionLabel>Uploaded ({items.length})</SectionLabel>
          <div className="flex flex-col gap-[10px]">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-[8px] border border-white/10 p-[10px]"
              >
                <FileUpload
                  slug="archive"
                  tag={`slot-${i + 1}-${item.src ? "filled" : "empty"}`}
                  currentPath={item.src}
                  accept="image/*"
                  onUploaded={(p) =>
                    onChange(
                      itemsRef.current.map((it, idx) =>
                        idx === i ? { ...it, src: p } : it
                      )
                    )
                  }
                  onClear={() =>
                    onChange(
                      itemsRef.current.map((it, idx) =>
                        idx === i ? { ...it, src: "" } : it
                      )
                    )
                  }
                  size="sm"
                />
                {item.src && (
                  <ArchiveFilenameEditor
                    src={item.src}
                    onRenamed={(newPath) =>
                      onChange(
                        itemsRef.current.map((it, idx) =>
                          idx === i ? { ...it, src: newPath } : it
                        )
                      )
                    }
                  />
                )}
                <Input
                  value={item.alt ?? ""}
                  onChange={(v) => updateAlt(i, v)}
                  placeholder={
                    item.src
                      ? `Alt — defaults to "${defaultAltFromSrc(item.src)}"`
                      : "Alt text (optional)"
                  }
                />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="self-start text-[10px] leading-none text-white/40 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-[10px] text-[10px] uppercase tracking-[0.1em] text-white/40">
      {children}
    </div>
  );
}

// CSS multi-column masonry preview that exactly mirrors /archives/page.tsx.
// HTML5 drag-and-drop reorders tiles: each item is `draggable`, stores its
// index in `dataTransfer`, and the drop target swaps it in via `onReorder`.
function MasonryPreview({
  items,
  onReorder,
  onDelete,
}: {
  items: ArchiveItem[];
  onReorder: (from: number, to: number) => void;
  onDelete: (i: number) => void;
}) {
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  return (
    <div
      className="[column-gap:10px] columns-2 lg:columns-3"
      style={{ columnFill: "balance" }}
    >
      {items.map((item, i) => {
        const isDragging = draggingIdx === i;
        const isOver = overIdx === i && draggingIdx !== null && draggingIdx !== i;
        return (
          <div
            key={i}
            draggable
            onDragStart={(e) => {
              setDraggingIdx(i);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", String(i));
            }}
            onDragEnd={() => {
              setDraggingIdx(null);
              setOverIdx(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (overIdx !== i) setOverIdx(i);
            }}
            onDragLeave={() => {
              if (overIdx === i) setOverIdx(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const from = Number(e.dataTransfer.getData("text/plain"));
              setOverIdx(null);
              setDraggingIdx(null);
              if (!Number.isNaN(from) && from !== i) onReorder(from, i);
            }}
            className={`group relative mb-[10px] inline-block w-full cursor-grab overflow-hidden border-2 transition-colors active:cursor-grabbing ${
              isOver
                ? "border-emerald-400"
                : isDragging
                  ? "border-amber-300 opacity-50"
                  : "border-transparent"
            }`}
            style={{ breakInside: "avoid" }}
          >
            {item.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.alt ?? ""}
                draggable={false}
                className="block h-auto w-full object-cover"
              />
            ) : (
              <div className="flex h-[140px] w-full items-center justify-center bg-white/5 text-[11px] text-white/40">
                no source
              </div>
            )}
            <span className="absolute left-[6px] top-[6px] rounded bg-black/60 px-[6px] py-[2px] text-[10px] leading-none text-white">
              #{i + 1}
            </span>
            {/* Per-tile delete. Hidden until hover so it doesn't clutter the
                preview, and stops drag propagation so clicking the X
                doesn't also kick off a drag/reorder. */}
            <button
              type="button"
              draggable={false}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(i);
              }}
              aria-label={`Delete archive #${i + 1}`}
              className="absolute right-[6px] top-[6px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-black/60 text-[13px] leading-none text-white opacity-0 transition-opacity hover:bg-red-400 group-hover:opacity-100"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

function BulkArchiveUpload({
  onUploaded,
}: {
  onUploaded: (src: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sequential uploader: walks the picked files, posts each to the existing
  // /api/studio/upload endpoint (which runs the file through Squoosh →
  // WebP), waits BETWEEN_MS before starting the next so the worker pool
  // gets a beat to clean up before re-engaging. Each successful upload
  // append-fires `onUploaded(path)` so the archives list grows live in the
  // editor and auto-save streams the new entries to disk one by one.
  const handleFiles = async (files: FileList) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setError(null);
    setProgress({ done: 0, total: list.length });
    const BETWEEN_MS = 250;
    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("slug", "archive");
        // Stamp each upload with the current epoch + index so concurrent
        // bulk runs (e.g. two browser tabs) don't clobber each other.
        form.append("tag", `${Date.now()}-${i + 1}`);
        const r = await fetch("/api/studio/upload", {
          method: "POST",
          body: form,
        });
        if (!r.ok) {
          const j = (await r.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(j?.error ?? `upload failed (${r.status})`);
        }
        const j = (await r.json()) as { path: string };
        onUploaded(j.path);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : `failed on ${file.name}`);
        break;
      }
      setProgress({ done: i + 1, total: list.length });
      if (i < list.length - 1) {
        await new Promise((res) => setTimeout(res, BETWEEN_MS));
      }
    }
    // Clear the picker so re-selecting the same files re-fires `onChange`.
    if (inputRef.current) inputRef.current.value = "";
    setTimeout(() => setProgress(null), 1500);
  };

  const busy = progress !== null && progress.done < progress.total;

  return (
    <div className="flex items-center gap-[10px] text-[12px] leading-none">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="border border-white/20 px-[12px] py-[8px] hover:border-white hover:text-white disabled:opacity-50 disabled:hover:border-white/20 disabled:hover:text-white/60"
      >
        {busy ? "Uploading…" : "Bulk upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
      />
      {progress && (
        <span
          className={
            progress.done >= progress.total
              ? "text-emerald-400"
              : "text-amber-300"
          }
        >
          {progress.done}/{progress.total}
          {progress.done >= progress.total ? " done" : " uploading…"}
        </span>
      )}
      {error && <span className="text-red-400">Error: {error}</span>}
    </div>
  );
}



const IMAGE_EXTS = new Set([".webp", ".png", ".jpg", ".jpeg", ".gif"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm"]);

function classifyFile(file: ChangedFile) {
  const ext = file.path.slice(file.path.lastIndexOf(".")).toLowerCase();
  if (IMAGE_EXTS.has(ext)) return "image" as const;
  if (VIDEO_EXTS.has(ext)) return "video" as const;
  if (file.path.endsWith(".json")) return "json" as const;
  return "other" as const;
}

function publishCounts(status: PublishStatus | null) {
  const buckets = {
    imageAdd: 0,
    imageRemove: 0,
    videoAdd: 0,
    videoRemove: 0,
    jsonChange: 0,
    total: 0,
  };
  if (!status) return buckets;
  for (const f of status.files) {
    buckets.total++;
    const kind = classifyFile(f);
    const removed = f.status === "deleted";
    if (kind === "image") {
      removed ? buckets.imageRemove++ : buckets.imageAdd++;
    } else if (kind === "video") {
      removed ? buckets.videoRemove++ : buckets.videoAdd++;
    } else if (kind === "json") {
      buckets.jsonChange++;
    }
  }
  return buckets;
}

function ApplyAndPublishButtons({
  dirty,
  applying,
  onApply,
  publishStatus,
  onOpenPublish,
}: {
  dirty: boolean;
  applying: boolean;
  onApply: () => void;
  publishStatus: PublishStatus | null;
  onOpenPublish: () => void;
}) {
  const counts = publishCounts(publishStatus);
  const hasUnpublished =
    counts.total > 0 || (publishStatus?.ahead ?? 0) > 0;
  return (
    <div className="flex items-center gap-[8px]">
      <button
        type="button"
        onClick={onApply}
        disabled={!dirty || applying}
        className={`border px-[12px] py-[7px] text-[12px] leading-none transition-colors ${
          dirty
            ? "border-amber-300 text-amber-200 hover:bg-amber-300 hover:text-black"
            : "border-white/15 text-white/40"
        }`}
      >
        {applying ? "Applying…" : dirty ? "Apply changes" : "No changes"}
      </button>
      {hasUnpublished && (
        <button
          type="button"
          onClick={onOpenPublish}
          className="border border-emerald-400 px-[12px] py-[7px] text-[12px] leading-none text-emerald-300 hover:bg-emerald-400 hover:text-black"
        >
          Publish{" "}
          <PublishBadge counts={counts} ahead={publishStatus?.ahead ?? 0} />
        </button>
      )}
    </div>
  );
}

function PublishBadge({
  counts,
  ahead,
}: {
  counts: ReturnType<typeof publishCounts>;
  ahead: number;
}) {
  const bits: string[] = [];
  if (counts.imageAdd) bits.push(`+${counts.imageAdd} img`);
  if (counts.imageRemove) bits.push(`-${counts.imageRemove} img`);
  if (counts.videoAdd) bits.push(`+${counts.videoAdd} vid`);
  if (counts.videoRemove) bits.push(`-${counts.videoRemove} vid`);
  if (counts.jsonChange) bits.push(`Δ${counts.jsonChange} meta`);
  if (!bits.length && ahead > 0) bits.push(`${ahead} commit${ahead === 1 ? "" : "s"}`);
  return <span className="ml-[6px] opacity-80">({bits.join(", ")})</span>;
}

function PublishModal({
  open,
  status,
  publishing,
  error,
  onClose,
  onPublish,
}: {
  open: boolean;
  status: PublishStatus | null;
  publishing: boolean;
  error: string | null;
  onClose: () => void;
  onPublish: () => void;
}) {
  if (!open) return null;
  const files = status?.files ?? [];
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-[20px]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-[820px] flex-col gap-[20px] border border-white/15 bg-[color:var(--bg)] p-[28px] text-[color:var(--fg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-[20px]">
          <div className="flex flex-col gap-[6px]">
            <h2 className="text-[20px] leading-none tracking-[-0.02em]">
              Pending publish
            </h2>
            <div className="text-[12px] text-white/50">
              Branch <span className="text-white">{status?.branch ?? "?"}</span>
              {status?.ahead ? ` · ${status.ahead} commit(s) ahead` : ""}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] text-white/40 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto border border-white/10">
          {files.length === 0 ? (
            <div className="p-[24px] text-center text-[13px] text-white/40">
              No working-tree changes. {status?.ahead
                ? "Push will ship the local commits already made."
                : "Nothing to publish."}
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {files.map((f) => (
                <PendingFileRow key={f.path} file={f} />
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="border border-red-400/40 bg-red-400/10 px-[12px] py-[10px] text-[12px] text-red-300">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            className="border border-white/15 px-[14px] py-[8px] text-[12px] leading-none hover:border-white hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={publishing}
            onClick={onPublish}
            className="border border-emerald-400 bg-emerald-400 px-[14px] py-[8px] text-[12px] leading-none text-black hover:bg-emerald-300 disabled:opacity-50"
          >
            {publishing ? "Pushing…" : "Push to Prod"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PendingFileRow({ file }: { file: ChangedFile }) {
  const kind = classifyFile(file);
  const isVisualMedia = kind === "image" || kind === "video";
  const badgeColor =
    file.status === "deleted"
      ? "text-red-300 border-red-400/40"
      : file.status === "added" || file.status === "untracked"
        ? "text-emerald-300 border-emerald-400/40"
        : "text-amber-300 border-amber-400/40";
  const previewSrc =
    isVisualMedia && file.status !== "deleted"
      ? `/${file.path}`.replace("/public/", "/").replace(/^\/\//, "/")
      : null;
  return (
    <li className="flex items-center gap-[12px] p-[12px]">
      <span
        className={`shrink-0 border px-[8px] py-[3px] text-[10px] uppercase tracking-[0.08em] ${badgeColor}`}
      >
        {file.status}
      </span>
      {previewSrc ? (
        <div className="h-[44px] w-[44px] shrink-0 overflow-hidden border border-white/10 bg-white/5">
          {kind === "video" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <video
              src={previewSrc}
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>
      ) : (
        <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center border border-white/10 text-[10px] uppercase tracking-[0.08em] text-white/40">
          {kind}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-[12px] text-white"
          title={file.path}
        >
          {file.path}
        </div>
      </div>
    </li>
  );
}

// Display + rename the basename of an archive file. Strips the extension
// from the input so users can't accidentally change it (renaming the
// extension without re-encoding would break the actual file format —
// rename is a filesystem op only).
function ArchiveFilenameEditor({
  src,
  onRenamed,
}: {
  src: string;
  onRenamed: (newPath: string) => void;
}) {
  const filename = src.split("/").pop() ?? "";
  const stem = filename.replace(/\.[a-z0-9]+$/i, "");
  const ext = filename.slice(stem.length);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(stem);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Keep the local edit buffer in sync if the file gets renamed externally
  // (e.g. by a sibling row's action) and the parent re-renders this one
  // with a new src.
  useEffect(() => {
    setValue(stem);
    setEditing(false);
    setError(null);
  }, [stem]);

  const commit = async () => {
    setError(null);
    const trimmed = value.trim();
    if (!trimmed || trimmed === stem) {
      setEditing(false);
      setValue(stem);
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/studio/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPath: src, newName: trimmed }),
      });
      const j = (await r.json().catch(() => null)) as
        | { path?: string; error?: string }
        | null;
      if (!r.ok || !j?.path) {
        throw new Error(j?.error ?? `rename failed (${r.status})`);
      }
      onRenamed(j.path);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "rename failed");
      setValue(stem);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-[4px]">
      {editing ? (
        <div className="flex items-center gap-[6px]">
          <input
            type="text"
            value={value}
            disabled={busy}
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void commit();
              else if (e.key === "Escape") {
                setEditing(false);
                setValue(stem);
                setError(null);
              }
            }}
            className="flex-1 border-b border-white/30 bg-transparent py-[4px] font-mono text-[11px] leading-none text-white focus:border-white focus:outline-none"
          />
          <span className="font-mono text-[11px] leading-none text-white/40">
            {ext}
          </span>
          <button
            type="button"
            onClick={() => void commit()}
            disabled={busy}
            className="text-[10px] leading-none text-emerald-300 hover:underline disabled:opacity-50"
          >
            {busy ? "…" : "Save"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="truncate text-left font-mono text-[11px] leading-none text-white/70 hover:text-white"
          title={`Click to rename · current: ${filename}`}
        >
          {filename}
        </button>
      )}
      {error && (
        <span className="text-[10px] leading-none text-red-300">{error}</span>
      )}
    </div>
  );
}

function defaultAltFromSrc(src: string): string {
  const base = src.split("/").pop() ?? "";
  const noExt = base.replace(/\.[a-z0-9]+$/i, "");
  return noExt.replace(/[-_]+/g, " ").trim();
}
