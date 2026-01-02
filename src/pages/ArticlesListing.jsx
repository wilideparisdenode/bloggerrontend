import { useState, useEffect } from 'react';
import { Link,useLocation } from 'react-router-dom';
import { FaSearch, FaFilter, FaCalendar, FaUser, FaClock, FaEye } from 'react-icons/fa';
import { API } from '../services/api';
 import "../styles/ArticlesListing.css"
const ArticlesListing = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock categories
  const categories = [
    'all',
    'Technology',
    'Programming',
    'Design',
    'Business',
    'Lifestyle',
    'Education'
  ];

// Inside the ArticlesListing component, add:
const location = useLocation();

// Update the useEffect that handles search to also read from URL
useEffect(() => {
  const urlParams = new URLSearchParams(location.search);
  const searchParam = urlParams.get('search');
  if (searchParam) {
    setSearchQuery(searchParam);
  }
}, [location.search]);
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
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

  // Fetch articles data
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
          const Articles = await API.getArticles()
          console.log(Articles)
           if (Articles && Articles.articles){
            // Map backend data to frontend format
            const mappedArticles = Articles.articles.map(article => ({
              ...article,
              id: article._id || article.id,
              author: article.authorId?.name || 'Unknown Author',
              publishDate: formatDate(article.publishedAt || article.createdAt),
              readTime: calculateReadingTime(article.content),
              views: article.views || 0,
              likes: article.likedBy?.length || article.likes || 0
            }));
            
            setArticles(mappedArticles);
            setFilteredArticles(mappedArticles);
           }
        
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Filter and sort articles
  useEffect(() => {
    let result = [...articles];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(article => 
        article.title?.toLowerCase().includes(query) ||
        article.excerpt?.toLowerCase().includes(query) ||
        article.author?.toLowerCase().includes(query) ||
        article.category?.toLowerCase().includes(query) ||
        article.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(article => article.category === selectedCategory);
    }

    // Sort articles
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt || 0);
          const dateB = new Date(b.publishedAt || b.createdAt || 0);
          return dateB - dateA;
        });
        break;
      case 'oldest':
        result.sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt || 0);
          const dateB = new Date(b.publishedAt || b.createdAt || 0);
          return dateA - dateB;
        });
        break;
      case 'popular':
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'title':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      default:
        break;
    }

    setFilteredArticles(result);
  }, [articles, searchQuery, selectedCategory, sortBy]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="articles-listing">
      {/* Header */}
      <div className="listing-header">
        <h1>Explore Articles</h1>
        <p>Discover amazing content across various topics and categories</p>
      </div>

      {/* Filters and Search */}
      <div className="listing-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search articles, authors, topics..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select value={sortBy} onChange={handleSortChange}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
          >
            {category === 'all' ? 'All Articles' : category}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="results-info">
        <p>
          Showing {filteredArticles.length} of {articles.length} articles
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="loading-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="article-card loading"></div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="no-results">
          <h3>No articles found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="articles-grid">
          {filteredArticles.map(article => (
            <article key={article.id} className="article-card">
              <div className="article-image">
                <img 
                  src={article.image?.cloudinaryUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgODBIMjc1VjE3MEgxMjVWODBaIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjEwMCIgcj0iMTUiIGZpbGw9IiNEN0Q3RDciLz4KPHBhdGggZD0iTTE1MCAxNDBIMjUwVjE1MEgxNTBWMTQwWiIgZmlsbD0iI0Q3RDdENyIvPgo8cGF0aCBkPSJNMTUwIDE2MEgyMTVWMTcwSDE1MFYxNjBaIiBmaWxsPSIjRDdEN0Q3Ii8+Cjwvc3ZnPgo='} 
                  alt={article.title}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgODBIMjc1VjE3MEgxMjVWODBaIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjEwMCIgcj0iMTUiIGZpbGw9IiNEN0Q3RDciLz4KPHBhdGggZD0iTTE1MCAxNDBIMjUwVjE1MEgxNTBWMTQwWiIgZmlsbD0iI0Q3RDdENyIvPgo8cGF0aCBkPSJNMTUwIDE2MEgyMTVWMTcwSDE1MFYxNjBaIiBmaWxsPSIjRDdEN0Q3Ii8+Cjwvc3ZnPgo=';
                  }}
                />
                <span className="category-badge">{article.category}</span>
              </div>
              
              <div className="article-content">
                <h3>
                  <Link to={`/read-articles/${article.id || article._id}`}>
                    {article.title}
                  </Link>
                </h3>
                
                <p className="article-excerpt">{article.excerpt || 'No excerpt available'}</p>
                
                <div className="article-meta">
                  <div className="meta-left">
                    <span><FaUser /> {article.author || 'Unknown'}</span>
                    <span><FaCalendar /> {article.publishDate || 'N/A'}</span>
                    <span><FaClock /> {article.readTime || '1 min read'}</span>
                  </div>
                  <div className="meta-right">
                    <span><FaEye /> {(article.views || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="article-actions">
                <Link to={`/read-articles/${article.id}`} className="read-more-btn">
                    Read More
                </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Load More Button (for pagination) */}
      {filteredArticles.length > 0 && (
        <div className="load-more">
          <button className="load-more-btn">
            Load More Articles
          </button>
        </div>
      )}
    </div>
  );
};

export default ArticlesListing;