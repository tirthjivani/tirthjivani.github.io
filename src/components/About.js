import { motion, useAnimation, useInView } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

const Skills = [
  'UX/UI Design',
  'Brand Strategy',
  'Art Direction',
  'Packaging',
  'Communication',
  'Digital Design',
  'Graphic Design',
  'Marketing Design',
];

const Clients = ['SellerApp', 'MeriStreet', 'IIRS, ISRO', 'Google'];

export default function About() {
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
        className="p-8 md:p-12 lg:p-16 bg-about-pattern bg-no-repeat bg-cover rounded-3xl"
      >
        <h4 className="w-full lg:w-3/4 mb-16 md:mb-24">
          I’m Tirth Jivani, Product Designer who is specialised in Branding, Interactions and Visual Identities. I
          design products.
          <br />
          <br />
          Through past experiences in tech, and product, my work aims to promote an holistic approach of aesthetics and
          balanced designs. FYI I developed this website by myself. In addition to designing digital products, I'm die
          hard part of OG CSGO community.
          <br />
          <br />
          Now i’m opening my own Design Agency,{' '}
          <a
            href="https://thesummerdesign.com"
            className="hover:opacity-50 hover:cursor-pointer"
            target="_blank"
            rel="noreferrer"
          >
            SummerDesigns
          </a>
          .
        </h4>
        <div className="flex flex-row justify-between md:justify-end items-end gap-24 body-text h-fit">
          <div className="flex items-start md:items-end flex-col text-left md:text-right gap-1">
            <div className="opacity-50 mb-4">Worked with</div>
            {Clients.map((cli, key) => (
              <div key={key}>{cli}</div>
            ))}
          </div>
          <div className="flex justify-end items-end md:items-end flex-col text-right gap-1">
            <div className="opacity-50 mb-4">Skills</div>
            {Skills.map((skill, key) => (
              <div key={key}>{skill}</div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
