"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const [data, setData] = useState<SeedsFile | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/studio/projects")
      .then(async (r) => {
        if (!r.ok) throw new Error(`load failed (${r.status})`);
        return (await r.json()) as SeedsFile;
      })
      .then((seeds) => {
        if (!alive) return;
        setData(seeds);
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

  const persist = useCallback(async (next: SeedsFile) => {
    setSaveState("saving");
    setErrorMsg(null);
    try {
      const r = await fetch("/api/studio/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(j?.error ?? `save failed (${r.status})`);
      }
      setSaveState("saved");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaveState("idle"), 1500);
    } catch (e: unknown) {
      setSaveState("error");
      setErrorMsg(e instanceof Error ? e.message : "save failed");
    }
  }, []);

  // Debounced auto-save: whenever data changes, schedule a save 600ms
  // later. The first run (initial load) is skipped via the ref flag so
  // we don't write back the file we just read.
  const skipNextSave = useRef(true);
  useEffect(() => {
    if (!data) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const t = setTimeout(() => void persist(data), 600);
    return () => clearTimeout(t);
  }, [data, persist]);

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
      <div className="flex min-h-screen items-center justify-center px-[20px] text-center">
        <div className="flex flex-col gap-[12px]">
          <div className="text-[20px]">Studio unavailable</div>
          <div className="text-[13px] text-white/60">{loadError}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-[13px] text-white/60">Loading studio…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-black text-white">
      <header className="shrink-0 grid grid-cols-12 items-center gap-x-[10px] border-b border-white/10 bg-black px-[16px] py-[14px]">
        <Link
          href="/"
          className="col-span-3 text-[13px] leading-none tracking-[-0.02em] hover:underline"
        >
          TIRTH J. / STUDIO
        </Link>
        <div className="col-span-6 hidden text-center text-[12px] leading-none text-white/40 md:block">
          localhost · dev only · noindex
        </div>
        <div className="col-span-3 flex items-center justify-end gap-[12px] text-[12px] leading-none">
          <SaveIndicator state={saveState} error={errorMsg} />
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            View site ↗
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside
          data-lenis-prevent
          className="max-h-[35vh] shrink-0 overflow-y-auto border-b border-white/10 md:max-h-none md:w-[300px] md:border-b-0 md:border-r"
        >
          <div className="px-[16px] py-[20px]">
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
          <div className="px-[16px] py-[20px] pb-[80px]">
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
    </div>
  );
}

function SaveIndicator({
  state,
  error,
}: {
  state: SaveState;
  error: string | null;
}) {
  if (state === "saving") {
    return <span className="text-white/40">Saving…</span>;
  }
  if (state === "saved") {
    return <span className="text-white/60">Saved</span>;
  }
  if (state === "error") {
    return <span className="text-red-300">Error: {error}</span>;
  }
  return <span className="text-white/30">Idle</span>;
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
