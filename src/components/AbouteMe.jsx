import React from 'react'

function AbouteMe() {
  return (
   // Example for a React/Next.js component
<div className='about_us'>
  <div className='section'>
    {/* Assuming this is a key section, an h2 is more appropriate */}
    <h2>
      Lorem ipsum dolor sit.
    </h2>
    {/* Changed div to a span and added a class for styling. strong or em could also work. */}
    <span className='subheading'>
      Lorem, ipsum.
    </span>
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit ab excepturi eos ex quia architecto voluptatum eveniet provident pariatur sapiente cupiditate est eius recusandae neque, sint possimus maxime illo! Quis!
    </p>
    <p>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. In, quo.
    </p>
    {/* Added type="button" and fixed the text */}
    <button type="button">
      Get started
    </button>
  </div>
  <div className='section'>
    {/* Added explicit width and height. In Next.js, use the 'next/image' component. */}
    <img
      src="./image1.png"
      alt="Team members collaborating in a modern office environment"
      width={600}
      height={400}
    />
  </div>
</div>
  )
}

export default AbouteMe