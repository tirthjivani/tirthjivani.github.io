import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import logo from '../assets/img/logo.svg';

export default function Navbar() {
  const handleScroll = () => {
    window.scroll({
      top: document.body.offsetHeight,
      left: 0,
      behavior: 'smooth',
    });
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <motion.nav
        initial={{ y: -200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
        className="flex justify-between items-center navbar-text py-8"
      >
        <div className="opacity-30">©2024</div>
        <Link to="/" className="hover:a-hover flex justify-center">
          <img src={logo} alt="tirth-jivani-logo" onContextMenu={handleContextMenu} className="w-28" />
        </Link>
        <div onClick={handleScroll} className="hover:a-hover text-right">
          Contact
        </div>
      </motion.nav>
    </>
  );
}
