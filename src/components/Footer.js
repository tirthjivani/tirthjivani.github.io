import React, { useEffect, useRef } from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
import { motion, useAnimation, useInView } from 'framer-motion';

const SocialLink = ({ name, link }) => {
  return (
    <>
      <a href={link} className="group flex flex-row items-center gap-1 p-1 w-fit">
        <motion.span className="group-hover:rotate-45 group-hover:duration-300 group-hover:ease-out duration-300 ease-in">
          <FiArrowUpRight />
        </motion.span>
        <motion.span className="group-hover:pl-2 group-hover:duration-300 group-hover:ease-out duration-300 ease-in">
          {name}
        </motion.span>
      </a>
    </>
  );
};

export default function Footer() {
  const ref = useRef(null);
  const inView = useInView(ref, {
    rootMargin: '0px 0px 200px 0px', // top right bottom left
  });
  const controls = useAnimation();

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

  return (
    <div ref={ref}>
      <motion.div
        initial="hidden"
        animate={controls}
        variants={containerVariants}
        className="p-8 md:p-12 lg:p-16 mb-8 md:mb-12 bg-footer-pattern bg-no-repeat bg-cover rounded-3xl"
      >
        <h3 className="w-full lg:w-3/4 mb-8 md:mb-24 lg:mb-48">
          Currently I’m open to new opportunities and projects. Feel free to reach out.
        </h3>
        <div className="flex flex-col-reverse md:flex-row justify-between gap-3 body-text">
          <div className="w-fit flex flex-col md:gap-1">
            <SocialLink name={'Resume'} link={'./Resume.pdf'} />
            <SocialLink name={'Linkedin'} link={'https://www.linkedin.com/in/tirthjivani'} />
            <SocialLink name={'Instagram'} link={'https://www.instagram.com/tirthjivani'} />
            <SocialLink name={'Read.cv'} link={'https://read.cv/tirth'} />
          </div>
          <div className="flex justify-start items-start md:justify-end md:items-end flex-col text-right gap-0 md:gap-2 mt-4 mb-24 md:mb-0 md:mt-0">
            <a
              className="hover:text-light/40 w-fit body-text"
              href="mailto:tirthjivani17@gmail.com?subject=Hey%20Tirth%20%3A)%20"
            >
              tirthjivani17@gmail.com
            </a>
            <a className="hover:text-light/40 w-fit body-text" href="tel:09898219779">
              +91 98 98 219 779
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
