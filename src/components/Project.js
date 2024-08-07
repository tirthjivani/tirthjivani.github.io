import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';

export default function Project({
  image,
  alt = 'tirth-jivani-project',
  title,
  desc,
  link,
  linkName = 'Checkout',
  accentColor = 'dark',
  textColor = 'light',
}) {
  const ref = useRef(null);
  const inView = useInView(ref, {
    rootMargin: '200px 200px 200px 200px', // top right bottom left
  });
  const controls = useAnimation();

  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0, y: 400 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 3,
        type: 'spring',
        stiffness: 150,
        damping: 20,
      },
    },
  };

  const titleVariants = {
    initial: { opacity: 0, y: '50%' },
    final: { opacity: 1, y: 0 },
  };

  const buttonVariants = {
    initial: { opacity: 0, y: '-50%' },
    final: { opacity: 1, y: 0 },
  };

  return (
    <div className={'w-full'} ref={ref}>
      <motion.div initial="hidden" animate={controls} variants={containerVariants}>
        <motion.a
          href={link}
          target="_blank"
          initial="initial"
          whileHover="final"
          animate="initial"
          className="relative group w-full rounded-3xl flex flex-row overflow-hidden cursor-pointer"
        >
          <div className="relative blur-0 group-hover:blur-lg transition ease-out duration-700 flex place-content-center w-full h-full place-items-center">
            <img src={image} alt={alt} onContextMenu={handleContextMenu} className="w-full" />
          </div>
          <div className="absolute h-[100%] w-full">
            <motion.div className="p-8 flex flex-col justify-between h-[100%] w-full">
              <motion.div className="w-4/5">
                <motion.h3
                  className={`text-${textColor}`}
                  variants={titleVariants}
                  transition={{ duration: 0.3, delay: 0.2, type: 'spring', stiffness: 160, damping: 17, mass: 3 }}
                >
                  {title}
                </motion.h3>
                <motion.div
                  className={`text-${textColor}`}
                  variants={titleVariants}
                  transition={{ duration: 0.4, delay: 0.2, type: 'spring', stiffness: 160, damping: 17, mass: 1 }}
                >
                  {desc}
                </motion.div>
              </motion.div>
              <motion.div
                className={`w-fit p-3 px-6 bg-${accentColor} text-${textColor} rounded-full flex flex-row items-center gap-2`}
                variants={buttonVariants}
                transition={{ duration: 0.3, delay: 0.2, type: 'spring', stiffness: 160, damping: 17, mass: 2 }}
              >
                {linkName} <FiArrowUpRight size={20} />
              </motion.div>
            </motion.div>
          </div>
        </motion.a>
      </motion.div>
    </div>
  );
}
