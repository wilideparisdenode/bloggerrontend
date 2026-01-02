import React from 'react'
import BlogCard from './ BlogCard'

function Hero() {
  return (
    <> 
    <div className='hero'>
        <h1>Discover Amazing Stories and Insights</h1>
        <p>
            Join our community of writers and readers. Explore thought-provoking articles on technology, programming, design, business, lifestyle, and education. Share your knowledge and learn from experts.
        </p>
        <button onClick={() => window.location.href = '/browse-articles'}>Explore Articles</button>
    </div>
    <BlogCard/>
    </>
   
  )
}

export default Hero