import { FaTwitter, FaGithub, FaLinkedin, FaHeart } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Brand Section */}
        <div className="footer-section">
          <h3 className="footer-logo">BlogHub</h3>
          <p className="footer-description">
            Sharing knowledge, inspiring minds. Join our community of writers and readers.
          </p>
          <div className="social-links">
            <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://github.com" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
              <FaGithub />
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Explore</h4>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/read-articles">All Articles</a></li>
            <li><a href="/create-ariticle">Write Article</a></li>
            <li><a href="/dash-board">Dashboard</a></li>
          </ul>
        </div>

        {/* Community */}
        <div className="footer-section">
          <h4>Community</h4>
          <ul className="footer-links">
            <li><a href="/about">About Us</a></li>
            <li><a href="/guidelines">Writing Guidelines</a></li>
            <li><a href="/community">Join Community</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-section">
          <h4>Support</h4>
          <ul className="footer-links">
            <li><a href="/help">Help Center</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/cookies">Cookie Policy</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>
          © {currentYear} BlogHub. Made with <FaHeart className="heart-icon" /> All rights reserved.
        </p>
        <div className="footer-legal">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/cookies">Cookies</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;