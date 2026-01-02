import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { API } from '../services/api';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaHeart, 
  FaComment,
  FaChartLine,
  FaFileAlt,
  FaCalendar,
  FaClock
} from 'react-icons/fa';
import '../styles/components.css';
import '../styles/overview.css';

function OverView() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  });

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate reading time
  const calculateReadingTime = (content) => {
    if (!content) return '1 min read';
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const minutes = Math.ceil(words.length / 200);
    return `${minutes} min read`;
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    const fetchUserArticles = async () => {
      setIsLoading(true);
      try {
        // Fetch articles by authorId
        const response = await API.getArticles({ authorId: user.id });
        
        if (response && response.articles) {
          // Map articles to include formatted data
          const mappedArticles = response.articles.map(article => ({
            ...article,
            id: article._id || article.id,
            publishDate: formatDate(article.publishedAt || article.createdAt),
            readTime: calculateReadingTime(article.content),
            likes: article.likedBy?.length || article.likes || 0,
            comments: article.comments?.length || 0
          }));

          setArticles(mappedArticles);

          // Calculate stats
          const totalViews = mappedArticles.reduce((sum, article) => sum + (article.views || 0), 0);
          const totalLikes = mappedArticles.reduce((sum, article) => sum + (article.likes || 0), 0);
          const totalComments = mappedArticles.reduce((sum, article) => sum + (article.comments || 0), 0);

          setStats({
            totalArticles: mappedArticles.length,
            totalViews,
            totalLikes,
            totalComments
          });
        }
      } catch (error) {
        console.error('Error fetching user articles:', error);
        setError('Failed to load your articles. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserArticles();
  }, [user, isAuthenticated, navigate]);

  const handleDelete = async (articleId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await API.deleteArticle(articleId);
      // Remove article from state
      setArticles(articles.filter(article => article.id !== articleId));
      // Update stats
      const deletedArticle = articles.find(a => a.id === articleId);
      if (deletedArticle) {
        setStats(prev => ({
          ...prev,
          totalArticles: prev.totalArticles - 1,
          totalViews: prev.totalViews - (deletedArticle.views || 0),
          totalLikes: prev.totalLikes - (deletedArticle.likes || 0),
          totalComments: prev.totalComments - (deletedArticle.comments || 0)
        }));
      }
      setSuccess('Article deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting article:', error);
      setError(error.message || 'Failed to delete article. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="overview-container">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="overview-container">
      {/* Error/Success Messages */}
      {error && (
        <div className="error-message" style={{
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          background: 'rgba(220, 38, 38, 0.1)',
          color: '#dc2626',
          borderRadius: '8px',
          border: '1px solid #dc2626'
        }}>
          {error}
        </div>
      )}
      {success && (
        <div className="success-message" style={{
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          background: 'rgba(34, 197, 94, 0.1)',
          color: '#22c55e',
          borderRadius: '8px',
          border: '1px solid #22c55e'
        }}>
          {success}
        </div>
      )}
      
      {/* Header */}
      <div className="overview-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name || 'User'}!</p>
        </div>
        <Link to="/create-ariticle" className="create-article-btn">
          <FaPlus /> Create New Article
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaFileAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.totalArticles}</h3>
            <p>Total Articles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaEye />
          </div>
          <div className="stat-content">
            <h3>{stats.totalViews.toLocaleString()}</h3>
            <p>Total Views</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaHeart />
          </div>
          <div className="stat-content">
            <h3>{stats.totalLikes.toLocaleString()}</h3>
            <p>Total Likes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaComment />
          </div>
          <div className="stat-content">
            <h3>{stats.totalComments.toLocaleString()}</h3>
            <p>Total Comments</p>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="articles-section">
        <h2>Your Articles</h2>
        
        {articles.length === 0 ? (
          <div className="no-articles">
            <FaFileAlt className="no-articles-icon" />
            <h3>No articles yet</h3>
            <p>Start writing your first article to share your knowledge with the world!</p>
            <Link to="/create-ariticle" className="create-first-btn">
              <FaPlus /> Create Your First Article
            </Link>
          </div>
        ) : (
          <div className="articles-list">
            {articles.map(article => (
              <div key={article.id} className="article-item">
                <div className="article-item-image">
                  <img 
                    src={article.image?.cloudinaryUrl || 'https://via.placeholder.com/150'} 
                    alt={article.title}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
                
                <div className="article-item-content">
                  <div className="article-item-header">
                    <h3>
                      <Link to={`/read-articles/${article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    <span className={`status-badge ${article.status || 'published'}`}>
                      {article.status || 'published'}
                    </span>
                  </div>
                  
                  <p className="article-item-excerpt">
                    {article.excerpt || 'No excerpt available'}
                  </p>
                  
                  <div className="article-item-meta">
                    <span><FaCalendar /> {article.publishDate}</span>
                    <span><FaClock /> {article.readTime}</span>
                    <span><FaEye /> {article.views || 0} views</span>
                    <span><FaHeart /> {article.likes || 0} likes</span>
                    <span><FaComment /> {article.comments || 0} comments</span>
                  </div>
                  
                  <div className="article-item-actions">
                    <Link 
                      to={`/read-articles/${article.id}`} 
                      className="action-btn view-btn"
                    >
                      <FaEye /> View
                    </Link>
                    <button 
                      onClick={() => handleDelete(article.id, article.title)}
                      className="action-btn delete-btn"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OverView;
