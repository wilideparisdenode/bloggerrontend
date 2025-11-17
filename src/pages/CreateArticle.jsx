import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPaperPlane, FaSave, FaFolder, FaTags, FaFileAlt , FaImage} from 'react-icons/fa';
import { API } from '../services/api';
import TipTapRichEditor from "./TipTapRichEditor";
import "../styles/createArticle.css";

const CreateArticle = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    excerpt: '',
    file:null,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
const handleImageChange=(e)=>{

  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
setFormData((prev)=>({...prev,file:file}))
  }

}
  const handleContentChange = (content) => {
    setFormData({ ...formData, content });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Saving article:', formData);
    const   res=  await API.createArticle(formData);
       if(res) {
        navigate('/dash-board');
       } 
    } catch (error) {
      console.error('Error publishing article:', error);
      alert('Error publishing article. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraft = () => {
    const drafts = JSON.parse(localStorage.getItem('articleDrafts') || '[]');
    const draftData = { ...formData, savedAt: new Date().toISOString() };
    drafts.push(draftData);
    localStorage.setItem('articleDrafts', JSON.stringify(drafts));
    alert('Draft saved!');
  };

  return (
    <div className="create-article">
      <div className="create-article-header">
        <div className="header-content">
          <h1>Create Your Story</h1>
          <p>Share your knowledge and inspire others</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="article-form">
        {/* Title Section */}
        <div className="title-section">
          <input
            type="text"
            // id="title"
            name="title"
            // value={formData.title}
            onChange={handleChange}
            placeholder="Give your article  engaging title..."
            className="title-input"
            required
          />
        </div>

        {/* Metadata Section */}
        <div className="metadata-section">
          <div className="metadata-grid">
            <div className="form-group">
              <label htmlFor="category">
                <FaFolder className="label-icon" />
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option value="Technology">Technology</option>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Education">Education</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tags">
                <FaTags className="label-icon" />
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="react, javascript, tutorial"
              />
            </div>
            <div className="form-group">
              <label htmlFor="tags">
               <FaImage  className='lebel-icon'/>
                upload
              </label>
              <input
                type="file"
                id="upload"
                name="file"
                onChange={handleImageChange}
              
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">
              <FaFileAlt className="label-icon" />
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Write a compelling summary that will make readers want to read more..."
              rows="3"
              className="excerpt-input"
            />
          </div>
        </div>

      {/* Rich Text Editor */}
<div className="editor-section">
  <label className="editor-label">
    <FaFileAlt className="label-icon" />
    Content
  </label>

  <TipTapRichEditor
    initialContent={formData.content} 
    onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
  />
</div>


        {/* Action Buttons */}
        <div className="form-actions">
          <div className="left-actions">
            <button 
              type="button" 
              className="draft-btn"
              onClick={saveDraft}
            >
              <FaSave />
              Save Draft
            </button>
          </div>
          <div className="right-actions">
            <Link to="/dash-board" className="cancel-btn">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="publish-btn"
              disabled={isLoading}
            >
              <FaPaperPlane />
              {isLoading ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateArticle;