import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate,useSearchParams } from 'react-router-dom';
import Comment from '../components/Comment';
import { FaArrowLeft, FaCalendar, FaUser, FaClock, FaHeart, FaShare, FaBookmark,FaComment} from 'react-icons/fa';
import "../styles/articleDetails.css"
import { API } from '../services/api';
const ArticleDetail = () => {
  const { id } = useParams(); // Get article ID from URL
  const [searchParams]=useSearchParams();
  const search=searchParams.get("search")
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [iscomment,setIscomment]=useState(false)
  // Mock data - replace with actual API call
  // Update the useEffect to use the id from URL
  function handlecomment(){
     iscomment?setIscomment(false):setIscomment(true);
  }
useEffect(() => {
  const fetchArticle = async () => {
    setIsLoading(true);
    try {
      // Use the actual id from URL to fetch specific article
      console.log('Fetching article with ID:', id);
      console.log(search);
      
      if(id){
        const foundArticle=await API.getArticleById(id)
          if(foundArticle.likedBy.length>0)setIsLiked(true)
           setArticle(foundArticle);
      }else if(search){
                  foundArticle =mockArticles.find(article=>article.category.toLowerCase().includes(search.toLocaleLowerCase())||article.title.toLowerCase().includes(search.toLocaleLowerCase()) );
      setArticle(foundArticle);
      }
    
      
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (id||search) {
    fetchArticle();
  }
}, [id,search]);
   const handleLike = async() => {
    try {
      
   const r=await API.like(id);
   if(r)setIsLiked(!isLiked);
    } catch (error) {
       throw new Error("err");
    }
    
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Add actual bookmark API call
  };

  const handleShare = () => {
    // Simple share functionality
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.content.substring(0, 100),
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="article-detail loading">
        <div className="loading-spinner">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-detail error">
        <h2>Article not found</h2>
        <p>The article you're looking for doesn't exist.</p>
        <Link to="/" className="back-button">
          <FaArrowLeft /> Back to Home
        </Link>
      </div>
    );
  }
  

  return (
    <div className="article-detail">
      {/* Navigation */}
     <Comment isOpen={iscomment} handleClose={handlecomment} id={id}/>
   
      
    
      <div className="article-nav">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Back
        </button>
      </div>

      {/* Article Header */}
      <header className="article-header">
        <div className="article-meta">
          <span className="category-tag">{article.category}</span>
          <div className="meta-info">
            <span><FaUser /> {article.author}</span>
            <span><FaCalendar /> {article.publishDate}</span>
            <span><FaClock /> {article.readTime}</span>
          </div>
        </div>
        
        <h1 className="article-title">{article.title}</h1>
        
        {/* Action Buttons */}
        <div className="article-actions">
          <button 
            onClick={handleLike} 
            className={`action-btn ${isLiked ? 'liked' : ''}`}
          >
            <FaHeart /> {isLiked ? article.likes + 1 : article.likes}
          </button>
          <button onClick={handleShare} className="action-btn">
            <FaShare /> Share
          </button>
          <button 
            onClick={handleBookmark} 
            className={`action-btn ${isBookmarked ? 'bookmarked' : ''}`}
          >
            <FaBookmark />
          </button>
        </div>
      </header>

      {/* Article Content */}
      <article 
        className="article-content"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Tags */}
      <div className="article-tags">
        {article.tags.map((tag, index) => (
          <span key={index} className="tag">#{tag}</span>
        ))}
      </div>

      {/* Related Articles or Author Info */}
      <div className="article-footer">
        <div className="author-bio">
          <h3>About the Author</h3>
          <p><strong>{article.author}</strong> is a passionate writer and web developer with over 5 years of experience in creating engaging content about technology and programming.</p>
        </div>
        {/*  this div will handle the users actions */}
        <div className='article-actions Raction'>
          <button className='submit-comment'  onClick={handlecomment}><FaComment/> comment</button>
          <div className='like'>

          </div>
        </div>
        <div className="navigation-links">
          <Link to="/read-articles" className="nav-link">
            ← Read More Articles
          </Link>
          <Link to="/create-ariticle" className="nav-link">
            Write Your Own Article →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;