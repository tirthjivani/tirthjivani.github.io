import React from 'react';
import Navbar from './Navbar';
import Tirth from './Tirth';
import About from './About';
import Project from './Project';
import Footer from './Footer';
import { motion } from 'framer-motion';
import me from '../assets/img/me.png';
import loot from '../assets/img/projects/loot.png';
import petpuja from '../assets/img/projects/petpuja.png';
import afterglow from '../assets/img/projects/afterglow.png';
import mooddl from '../assets/img/projects/mooddl.png';
import services from '../assets/img/projects/sellerapp-service.png';

export default function Homescreen() {
  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-12 bg-dark text-light selection:bg-accent/80">
      <Navbar />
      <Tirth />

      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2, duration: 1, ease: 'easeOut' }}
      >
        <div
          className="flex flex-col gap-4 lg:gap-8
         my-4 lg:my-8"
        >
          <div className="flex flex-col-reverse md:flex-row gap-4 lg:gap-8">
            <div className="flex flex-col justify-between gap-8 lg:gap-0 w-full md:w-1/2">
              <h5>
                Bangalore-based designer & developer. Passionate about <em>minimalism</em>. Crafting impactful{' '}
                <em>UX</em>,<em>branding</em>, and <em>visual identities</em>.
              </h5>
              <Project
                title={'LooT'}
                desc={
                  'It is a coupon management platform for users to save and use all the coupon codes they have at one place.'
                }
                image={loot}
                alt={'tirth-jivani-branding'}
                link={'https://tome.app/tirthjivani/tirth-jivani-loot-case-study-cluzgmpuc0sfnod61bcuw31x6'}
              />
            </div>
            <div className="h-max w-full md:w-1/2 overflow-hidden rounded-3xl">
              <img src={me} alt="me" onContextMenu={handleContextMenu} className="w-full" />
            </div>
          </div>

          <div className="w-full flex flex-row">
            <Project
              title={'SellerApp Services'}
              desc={
                'It was our first view to introduction of SellerApp Services in the dashboard for users to request.'
              }
              image={services}
              alt={'tirth-jivani-project-sellerapp-services'}
              linkName={'Case Study'}
              link={'https://tome.app/tirthjivani/tirth-jivani-petpuja-case-study-clurbhdtg057bpq5zx0ix07m5'}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 lg:gap-8">
            <Project
              title={'Mooddl'}
              desc={'It is an e-learning platform a.k.a. LMS for online universities and colleges.'}
              image={mooddl}
              alt={'tirth-jivani-project-mooddl'}
              link={'https://tirthjivani.myportfolio.com/mooddl'}
            />
            <Project
              className={'h-full'}
              title={'Afterglow'}
              desc={
                'This app was designed for interior design items, that focused on how a user, who was color blind, partially blind, or completely blind, uses an e-commerce app.'
              }
              image={afterglow}
              alt={'tirth-jivani-project-afterglow'}
              linkName={'Case Study'}
              link={'https://tome.app/tirthjivani/tirth-jivani-afterglow-case-study-cluygcfe00evepl615yuu69i2'}
            />
          </div>

          <About />

          <div className="flex flex-col md:flex-row gap-4 lg:gap-8">
            <Project
              title={'Petpuja'}
              desc={
                'It is a streamlined payment app that allows users to easily order, pick up, or in-table order from any restaurant with clear tracking of the order.'
              }
              image={petpuja}
              alt={'tirth-jivani-project-petpuja'}
              linkName={'Case Study'}
              link={'https://tome.app/tirthjivani/tirth-jivani-petpuja-case-study-clurbhdtg057bpq5zx0ix07m5'}
            />
            <Project
              title={'Afterglow'}
              desc={
                'This app was designed for interior design items, that focused on how a user, who was color blind, partially blind, or completely blind, uses an e-commerce app.'
              }
              image={afterglow}
              alt={'tirth-jivani-project-afterglow'}
              linkName={'Case Study'}
              link={'https://tome.app/tirthjivani/tirth-jivani-afterglow-case-study-cluygcfe00evepl615yuu69i2'}
            />
          </div>
        </div>
        <Footer />
      </motion.div>
    </div>
  );
}
