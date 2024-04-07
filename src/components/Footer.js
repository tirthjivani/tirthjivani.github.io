import React from "react";
import { FiArrowUpRight } from "react-icons/fi";

export default function Footer() {
	return (
		<>
			<div className="p-8">
				<div>Other projects Section</div>
				<div className="my-8">
					<div className="grid grid-cols-4 gap-2 body-text">
						<div className="flex flex-col">
							<div className="text-gray">Let's connect - </div>
							<a className="hover:a-hover w-fit" href="mailto:tirthjivani17@gmail.com?subject=Hey%20Tirth%20%3A)%20">
								tirthjivani17@gmail.com
							</a>
						</div>
						<div className="flex flex-col">
							<div className="flex flex-row items-center gap-1">
								<FiArrowUpRight /> <span>Linkedin</span>
							</div>
							<div className="flex flex-row items-center gap-1">
								<FiArrowUpRight /> <span>Instagram</span>
							</div>
							<div className="flex flex-row items-center gap-1">
								<FiArrowUpRight /> <span>Read.cv</span>
							</div>
						</div>
						<div className="col-span-2 flex items-center justify-end">© 2024</div>
					</div>
				</div>
			</div>
		</>
	);
}
