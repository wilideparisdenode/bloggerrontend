import React from 'react'

function AbouteMe() {
  return (
   // Example for a React/Next.js component
<div className='about_us'>
  <div className='section'>
    <h2>
      Share Your Knowledge with the World
    </h2>
    <span className='subheading'>
      Write, Publish, Inspire
    </span>
    <p>
      Our platform empowers writers to share their expertise and connect with readers who are passionate about learning. Whether you're a developer sharing coding tips, a designer discussing UI trends, or a business expert offering insights, this is your space to make an impact.
    </p>
    <p>
      Join thousands of writers who are already sharing their stories and building their audience. Start writing today and let your voice be heard.
    </p>
    <button type="button" onClick={() => window.location.href = '/create-ariticle'}>
      Start Writing
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