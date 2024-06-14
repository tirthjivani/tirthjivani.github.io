import React from 'react';

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
  return (
    <div className="p-8 md:p-12 lg:p-16 bg-about-pattern bg-no-repeat bg-cover rounded-3xl">
      <h4 className="w-full lg:w-3/4 mb-16 md:mb-24">
        I’m Tirth Jivani, Indian Product Designer specialised in Branding and Visual Identities.
        <br />
        <br />
        After spending more than 12 years in the most acclaimed creative agencies in France as Ogilvy, AKQA, Marcel I
        decided to go solo serving what i like the most: beauty.
        <br />
        <br />
        Now i’m opening my own Design Agency,{' '}
        <a href="https://thesummerdesign.com" className="hover:opacity-50" target="_blank">
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
    </div>
  );
}
