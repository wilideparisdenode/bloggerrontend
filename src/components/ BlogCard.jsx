import { blogD } from "./data.js";
import { useEffect } from "react";
// import "../styles/components.css"
function  BlogCard() {
   console.log(blogD[0].imageSrc)
  return (
    <div className='blog'>
         {blogD.map((blog,i)=>(

            <div className="card"  key={i}>
                <img src={blog.imageSrc} alt="" className="poster" />
                <h3 className="title">{blog.title}</h3>
                <p className="content">
                    {blog.content.slice(0,20)+". . ."}
                </p>
            </div>
         ))}
    </div>
  )
}

export default  BlogCard