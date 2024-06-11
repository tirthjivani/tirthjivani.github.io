import React from 'react';

export default function Project({ className, image, alt, heading, desc, link }) {
  return (
    <div className={className}>
      <a href={link} target="_blank" className="group w-full rounded-3xl flex flex-row items-center flex-1 h-auto">
        <div
          className="bg-cover bg-no-repeat min-h-80 h-full w-full rounded-3xl"
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      </a>
    </div>
  );
}
