import { API } from "../services/api";
import { useState } from "react";
import "../styles/components.css";

function Comment({ isOpen, handleClose, id, onCommentAdded }) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(id, commentText) {
    if (!commentText.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await API.comment(id, commentText);
      setComment(""); // clear after posting
      if (result) {
        // Notify parent component to refresh article data
        if (onCommentAdded) {
          onCommentAdded();
        }
        handleClose();
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      setError(error.message || "Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(id, comment);
    }
  };

  return (
    <div className={`comments-modal ${isOpen ? "open" : ""}`}>
      <div className="comments-modal-content">
        <button className="comments-modal-close" onClick={handleClose}>
          ×
        </button>
        <h3>Add a Comment</h3>
        {error && <div className="error-message">{error}</div>}
        <textarea
          placeholder="Write your comment... (Ctrl+Enter to submit)"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setError(""); // Clear error when user types
          }}
          onKeyPress={handleKeyPress}
          disabled={isSubmitting}
          rows={5}
        />
        <div className="comment-actions">
          <button
            className="submit-comment"
            onClick={() => handleSubmit(id, comment)}
            disabled={isSubmitting || !comment.trim()}
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
          <button
            className="cancel-comment"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Comment;
