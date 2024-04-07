import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Homescreen() {
	return (
		<>
			<Navbar />
			<div className="h-[100vh] bg-accent p-4"></div>
			<Footer />
		</>
	);
}
