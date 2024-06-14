import React from 'react';
import { motion } from 'framer-motion';

import Img404 from '../assets/loader/404.svg';
import logo from '../assets/img/logo.svg';
import { Link } from 'react-router-dom';

export default function PageNotFound() {
  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  return (
    <div className="text-white overflow-hidden">
      <Link to="/" className="hover:a-hover absolute w-screen text-center top-8 flex justify-center z-50">
        <img src={logo} alt="tirth-jivani-logo" onContextMenu={handleContextMenu} className="w-20" />
      </Link>
      <div className="w-4/5 lg:w-3/5 h-screen mx-auto flex justify-center items-center overflow-x-hidden">
        <img src={Img404} alt="tirth-jivani-text" onContextMenu={handleContextMenu} className="w-full" />
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="absolute top-0 z-10 w-full h-[70%] my-auto bg-dark/80"
        ></motion.div>
      </div>
      <a href="/" className="hover:text-accent absolute w-screen text-center bottom-8 h5 z-50">
        Back to Portfolio
      </a>
    </div>
  );
}
