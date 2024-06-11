import React from 'react';
import { Link } from 'react-router-dom';

import logo from '../assets/imgs/logo.svg';

export default function Navbar() {
  const handleScroll = () => {
    window.scroll({
      top: document.body.offsetHeight,
      left: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <nav className="flex justify-between items-center navbar-text py-8">
        <div className="opacity-30">©2024</div>
        <Link to="/" className="hover:a-hover flex justify-center">
          <img src={logo} className="w-20" />
        </Link>
        <div onClick={handleScroll} className="hover:a-hover text-right">
          Contact
        </div>
      </nav>
    </>
  );
}
