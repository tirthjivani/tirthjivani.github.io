import "./App.css";
import Homescreen from "./components/Homescreen";
import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Projects from "./components/Projects";
import Info from "./components/Info";
import PageNotFound from "./components/PageNotFound";

function App() {
	return (
		<>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Homescreen />}></Route>
					<Route path="/projects" element={<Projects />}></Route>
					<Route path="/info" element={<Info />}></Route>

					<Route path="*" element={<PageNotFound />}></Route>
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
