import React from 'react';
import TJ from '../assets/loader/Tirth Jivani.svg';
import { motion } from 'framer-motion';

export default function Tirth() {
  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <div className="relative top-0 my-12 mb-16 overflow-x-hidden">
        <img src={TJ} alt="Tirth Jivani Text" onContextMenu={handleContextMenu} className="w-full" />
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="absolute top-0 z-10 w-full h-full bg-dark/80"
        ></motion.div>
      </div>
    </>
  );
}
