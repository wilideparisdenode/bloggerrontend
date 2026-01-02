import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API } from "../services/api";
import { FaCalendar, FaUser, FaEye } from "react-icons/fa";
// import "../styles/components.css"

function BlogCard() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await API.getArticles({ limit: 6, page: 1 });
        
        if (response && response.articles) {
          // Map articles to include formatted data
          const mappedArticles = response.articles.map(article => ({
            ...article,
            id: article._id || article.id,
            author: article.authorId?.name || 'Unknown Author',
            publishDate: formatDate(article.publishedAt || article.createdAt),
            imageUrl: article.image?.cloudinaryUrl || '/image1.png',
            excerpt: article.excerpt || (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'No excerpt available')
          }));
          
          setArticles(mappedArticles);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to load articles. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (isLoading) {
    return (
      <div className='blog'>
        {[1, 2, 3, 4].map(i => (
          <div className="card loading" key={i}>
            <div className="loading-skeleton" style={{ height: '200px', width: '100%', marginBottom: '1rem', borderRadius: '12px 12px 0 0' }}></div>
            <div style={{ padding: '0 1.5rem' }}>
              <div className="loading-skeleton" style={{ height: '24px', width: '90%', marginBottom: '0.75rem' }}></div>
              <div className="loading-skeleton" style={{ height: '16px', width: '100%', marginBottom: '0.5rem' }}></div>
              <div className="loading-skeleton" style={{ height: '16px', width: '80%' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='blog'>
        <div className="error-message" style={{ 
          gridColumn: '1 / -1', 
          padding: '2rem', 
          textAlign: 'center',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ color: 'var(--text-primary)', margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className='blog'>
        <div style={{ 
          gridColumn: '1 / -1', 
          padding: '2rem', 
          textAlign: 'center',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No articles available yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className='blog'>
      {articles.map((article) => (
        <Link to={`/read-articles/${article.id}`} key={article.id} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="poster"
              loading="lazy"
              onError={(e) => {
                e.target.src = '/image1.png';
              }}
            />
            <h3 className="title">{article.title}</h3>
            <p className="content">{article.excerpt}</p>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              fontSize: '0.875rem', 
              color: 'var(--text-muted)',
              marginTop: '0.75rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              padding: '0 1.5rem 1.5rem'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FaUser /> {article.author}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FaCalendar /> {article.publishDate}
              </span>
              {article.views && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaEye /> {article.views}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default BlogCard;
