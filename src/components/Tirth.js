import React from 'react';
import TJ from '../assets/loader/Tirth Jivani.svg';
import { motion, cubicBezier } from 'framer-motion';

export default function Tirth() {
  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <motion.div
        initial={{ y: '25vh' }}
        animate={{ y: 0 }}
        transition={{ delay: 2, duration: 0.6, ease: 'easeOut' }}
        className="relative top-0 my-12 mb-16 overflow-x-hidden"
      >
        <img
          src={TJ}
          fetchPriority="high"
          loading="eager"
          alt="tirth-jivani-text"
          onContextMenu={handleContextMenu}
          className="w-full"
        />
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, ease: cubicBezier(0.77, 0.79, 0.99, 0.1) }}
          className="absolute top-0 z-10 w-full h-full bg-dark/80"
        ></motion.div>
      </motion.div>
    </>
  );
}
