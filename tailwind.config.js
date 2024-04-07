/** @type {import('tailwindcss').Config} */

module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
	theme: {
		extend: {},
		colors: {
			dark: "#1E1D1D",
			light: "#EDEBE9",
			gray: "#908D8A",
			accent: "#FA6955",
		},
	},
	plugins: [],
};
