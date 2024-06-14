import React from 'react';
import Navbar from './Navbar';
import Tirth from './Tirth';
import About from './About';
import Project from './Project';
import Footer from './Footer';

import me from '../assets/img/me.png';

import branding from '../assets/img/projects/branding.avif';

import petpuja from '../assets/img/projects/petpuja.png';
import afterglow from '../assets/img/projects/afterglow.png';
import mooddl from '../assets/img/projects/mooddl.png';

export default function Homescreen() {
  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 bg-dark text-light selection:bg-accent/80">
        <Navbar />
        <Tirth />
        <div className="flex flex-col gap-8 lg:gap-12 my-8 lg:my-12">
          <div className="flex flex-col-reverse md:flex-row gap-8 lg:gap-12">
            <div className="flex flex-col justify-between gap-12 lg:gap-0 w-full md:w-1/2">
              <h5>
                A Bangalore based devloper & designer with an infinite love for minimalism, specialised in Branding and
                Visual identities.
              </h5>
              <Project
                title={'Tea Cup'}
                desc={'Rebranded the company X which is the fastest tea selling company in India.'}
                image={branding}
                alt={'tirth-jivani-branding'}
                link={'https://cdn.loom.com/sessions/thumbnails/db5148b5cff94e21ab7e4b047b3c0f70-00001.mp4'}
              />
            </div>
            <div className="h-max w-full md:w-1/2 overflow-hidden rounded-3xl">
              <img src={me} alt="me" onContextMenu={handleContextMenu} className="w-full" />
            </div>
          </div>
          <div className="w-full flex flex-row">
            <Project
              title={'Mooddl'}
              desc={'It is an e-learning platform a.k.a. LMS for online universities and colleges.'}
              image={mooddl}
              alt={'tirth-jivani-project-mooddl'}
              link={'https://tirthjivani.myportfolio.com/mooddl'}
            />
          </div>
          {/* <div className="w-full flex flex-col md:flex-row gap-8 lg:gap-12">
            <Project
              title={'Tea Cup'}
              desc={'Rebranded the company X which is the fastest tea selling company in India.'}
              image={branding}
              alt={'tirth-jivani-branding'}
              link={'https://cdn.loom.com/sessions/thumbnails/db5148b5cff94e21ab7e4b047b3c0f70-00001.mp4'}
            />
            <Project
              title={'Tea Cup'}
              desc={'Rebranded the company X which is the fastest tea selling company in India.'}
              image={branding}
              alt={'tirth-jivani-branding'}
              link={'https://cdn.loom.com/sessions/thumbnails/db5148b5cff94e21ab7e4b047b3c0f70-00001.mp4'}
            />
          </div> */}
          <About />
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            <Project
              title={'Petpuja'}
              desc={
                'It is a streamlined payment app that allows users to easily order, pick up, or in-table order from any restaurant with clear tracking of the order.'
              }
              image={petpuja}
              alt={'tirth-jivani-project-petpuja'}
              linkName={'Case Study'}
              link={'https://tome.app/tirthjivani/petpuja-case-study-tirth-jivani-clurbhdtg057bpq5zx0ix07m5'}
            />
            <Project
              title={'Afterglow'}
              desc={
                'This app was designed for interior design items, that focused on how a user, who was color blind, partially blind, or completely blind, uses an e-commerce app.'
              }
              image={afterglow}
              alt={'tirth-jivani-project-afterglow'}
              linkName={'Case Study'}
              link={'https://tirthjivani.myportfolio.com/interior-design'}
            />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
