import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Spiral as Hamburger } from "hamburger-react";
import useScrollListener from "./hooks/useScrollListener/ScrollListener";
import lottie from "lottie-web";

export default function Navbar() {
	const [navClassList, setNavClassList] = useState([]);
	const scroll = useScrollListener();
	const [isOpen, setOpen] = useState(false);

	const container = useRef(null);

	useEffect(() => {
		const _classList = [];

		if (scroll.y > 0 && scroll.y - scroll.lastY > 0) _classList.push("nav-bar--hidden");

		setNavClassList(_classList);

		lottie.loadAnimation({
			container: container.current,
			renderer: "svg",
			loop: true,
			autoplay: false,
			animationData: require("../assets/lottie/otherlink.json"),
			speed: 3,
		});

		return () => {
			lottie.destroy();
		};
	}, [scroll.y, scroll.lastY]);

	return (
		<>
			<nav className={navClassList.join(" ")}>
				<div className="hidden md:grid grid-cols-2 gap-2 navbar-text">
					<div className="flex flex-col">
						<Link to="/" className="hover:a-hover w-fit">
							Tirth Jivani <br /> Product Designer
						</Link>
					</div>
					<div className="flex justify-between">
						<div className="flex flex-col">
							<Link to="/projects" className="hover:a-hover w-fit">
								Projects
							</Link>
							<Link to="/info" className="hover:a-hover w-fit">
								Info
							</Link>
						</div>
						<Link to="/others">
							<div
								className="w-8"
								ref={container}
								onMouseEnter={() => {
									lottie.play();
									lottie.setSpeed(4);
								}}
								onMouseLeave={() => lottie.pause()}></div>
						</Link>
					</div>
				</div>

				<div className="md:hidden flex navbar-text">
					<div className="flex flex-row justify-between items-center w-full">
						<Link to="/" className="hover:a-hover w-fit">
							Tirth Jivani <br /> Product Designer
						</Link>
						<Hamburger toggled={isOpen} toggle={setOpen} size={18} direction="left" duration={0.5} easing="ease-out" rounded />
						{isOpen && (
							<div className="bg-dark text-light absolute w-full left-0 top-0 h-[100vh] z-30">
								<Hamburger toggled={isOpen} toggle={setOpen} size={18} direction="left" duration={0.5} easing="ease-out" rounded />
								<div>Home</div>
								<div>Projects</div>
								<div>Info</div>
								<div>Playground</div>
								<div>Contact</div>
							</div>
						)}
					</div>
				</div>
			</nav>
		</>
	);
}
