import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Tirth from './Tirth';
import Project from './Project';

import branding from '../assets/imgs/projects/branding.avif';
import me from '../assets/imgs/me.JPG';

export default function Homescreen() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-6 md:px-12 bg-dark text-light">
        <Navbar />
        <Tirth />
        <div className="flex flex-col gap-12 my-12">
          <div className="flex flex-col-reverse md:flex-row gap-8 md:gap-12">
            <div className="flex flex-col gap-12 flex-1">
              <h5>
                A Bangalore based devloper & designer with an infinite love for minimalism, specialised in Branding and
                Visual identities.
              </h5>
              <Project
                image={branding}
                alt={'tirth-jivani-branding'}
                link={'https://cdn.loom.com/sessions/thumbnails/db5148b5cff94e21ab7e4b047b3c0f70-00001.mp4'}
              />
            </div>
            <img src={me} alt="me" className="rounded-3xl flex flex-1 w-full md:w-1/2" />
          </div>
          <div className="flex flex-row gap-12">
            <div className="bg-slate-500 rounded-3xl h-44 flex-1"></div>
          </div>
          <div className="flex flex-row gap-12">
            <div className="bg-slate-500 rounded-3xl h-44 flex-1"></div>
            <div className="bg-slate-500 rounded-3xl h-44 flex-1"></div>
          </div>
          <div className="flex flex-row gap-12">
            <div className="bg-white rounded-3xl h-44 flex-1"></div>
          </div>
          <div className="flex flex-row gap-12">
            <div className="bg-slate-500 rounded-3xl h-44 flex-1"></div>
            <div className="bg-slate-500 rounded-3xl h-44 flex-1"></div>
          </div>
        </div>
        {/* <div className="bg-white rounded-3xl h-screen my-8"></div> */}
        <Footer />
      </div>
    </>
  );
}
