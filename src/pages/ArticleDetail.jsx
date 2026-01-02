import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate,useSearchParams } from 'react-router-dom';
import Comment from '../components/Comment';
import { FaArrowLeft, FaCalendar, FaUser, FaClock, FaHeart, FaShare, FaBookmark,FaComment} from 'react-icons/fa';
import "../styles/articleDetails.css"
import { API } from '../services/api';
import { useAuth } from '../services/auth';

const ArticleDetail = () => {
  const { id } = useParams(); // Get article ID from URL
  const [searchParams]=useSearchParams();
  const search=searchParams.get("search")
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [error, setError] = useState(null);
  
  const [iscomment,setIscomment]=useState(false)
  
  function handlecomment(){
     iscomment?setIscomment(false):setIscomment(true);
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper function to calculate reading time
  const calculateReadingTime = (content) => {
    if (!content) return '1 min read';
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const minutes = Math.ceil(words.length / 200);
    return `${minutes} min read`;
  };

  const fetchArticle = async () => {
    setIsLoading(true);
    try {
      if(id){
        const foundArticle = await API.getArticleById(id);
        
        // Map backend data to frontend format
        const mappedArticle = {
          ...foundArticle,
          id: foundArticle._id || foundArticle.id,
          author: foundArticle.authorId?.name || 'Unknown Author',
          authorId: {
            ...foundArticle.authorId,
            _id: foundArticle.authorId?._id || foundArticle.authorId,
            name: foundArticle.authorId?.name,
            bio: foundArticle.authorId?.bio,
            createdAt: foundArticle.authorId?.createdAt
          },
          publishDate: formatDate(foundArticle.publishedAt || foundArticle.createdAt),
          readTime: calculateReadingTime(foundArticle.content),
          likes: foundArticle.likedBy?.length || foundArticle.likes || 0,
          tags: foundArticle.tags || [],
          comments: foundArticle.comments || []
        };
        
        // Check if current user has liked this article
        if (user && foundArticle.likedBy) {
          const userLiked = foundArticle.likedBy.some(
            (likedUserId) => likedUserId.toString() === user.id?.toString() || likedUserId._id?.toString() === user.id?.toString()
          );
          setIsLiked(userLiked);
        }
        
        setArticle(mappedArticle);
      } else if(search){
        // Handle search if needed
        console.log('Search functionality not implemented for article detail');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError(error.message || 'Failed to load article. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id || search) {
      fetchArticle();
    }
  }, [id, search, user]);

  // Handle comment refresh
  const handleCommentAdded = () => {
    // Refresh article data to show new comment
    fetchArticle();
  };
   const handleLike = async() => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      
      const r = await API.like(id);
      if (r) {
        setIsLiked(!isLiked);
        // Update article likes count
        setArticle(prev => ({
          ...prev,
          likes: r.likes || (isLiked ? prev.likes - 1 : prev.likes + 1)
        }));
      }
    } catch (error) {
      console.error('Error liking article:', error);
      setError(error.message || 'Failed to like article. Please try again.');
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
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
      setError('Link copied to clipboard!');
      setTimeout(() => setError(null), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="article-detail loading">
        <div className="loading-spinner">Loading article...</div>
      </div>
    );
  }

  if (error && !isLoading && !article) {
    return (
      <div className="article-detail error">
        <h2>Error Loading Article</h2>
        <p>{error}</p>
        <Link to="/" className="back-button">
          <FaArrowLeft /> Back to Home
        </Link>
      </div>
    );
  }

  if (!article && !isLoading) {
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
      {/* Error Message */}
      {error && (
        <div className="error-message" style={{
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          background: error.includes('copied') ? 'rgba(37, 99, 235, 0.1)' : 'rgba(220, 38, 38, 0.1)',
          color: error.includes('copied') ? 'var(--primary-color)' : '#dc2626',
          borderRadius: '8px',
          border: `1px solid ${error.includes('copied') ? 'var(--primary-color)' : '#dc2626'}`,
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      
      {/* Navigation */}
     <Comment isOpen={iscomment} handleClose={handlecomment} id={id} onCommentAdded={handleCommentAdded}/>
   
      
    
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
            <FaHeart /> {article.likes || 0}
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

      {/* Article Banner Image */}
      {article.image?.cloudinaryUrl && (
        <div className="article-banner">
          <img 
            src={article.image.cloudinaryUrl} 
            alt={article.title}
            className="banner-image"
          />
        </div>
      )}

      {/* Article Content */}
      <article 
        className="article-content"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="article-tags">
          {article.tags.map((tag, index) => (
            <span key={index} className="tag">#{tag}</span>
          ))}
        </div>
      )}

      {/* Comments Section */}
      {article.comments && article.comments.length > 0 && (
        <div className="comments-section">
          <h3>Comments ({article.comments.length})</h3>
          <div className="comments-list">
            {article.comments.map((comment, index) => (
              <div key={comment._id || index} className="comment-item">
                <div className="comment-author">
                  <strong>{comment.userId?.name || 'Anonymous'}</strong>
                  <span className="comment-date">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <div className="comment-text">{comment.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Articles or Author Info */}
      <div className="article-footer">
        <div className="author-bio">
          <h3>About the Author</h3>
          <div className="author-info">
            <p>
              <strong>{article.author}</strong>
              {article.authorId?.createdAt && (
                <span className="join-date">
                  {' • Joined '}
                  {new Date(article.authorId.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              )}
            </p>
            {article.authorId?.bio && (
              <p className="author-bio-text">{article.authorId.bio}</p>
            )}
            {!article.authorId?.bio && (
              <p className="author-bio-text">
                {article.author} is a passionate writer and web developer with experience in creating engaging content about technology and programming.
              </p>
            )}
          </div>
        </div>
        {/*  this div will handle the users actions */}
        <div className='article-actions Raction'>
          <button className='submit-comment'  onClick={handlecomment}><FaComment/> comment</button>
          <div className='like'>

          </div>
        </div>
        <div className="navigation-links">
          <Link to="/browse-articles" className="nav-link">
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