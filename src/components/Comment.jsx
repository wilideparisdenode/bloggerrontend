import { API } from "../services/api";
import { useState } from "react";
import "../styles/components.css";

function Comment({ isOpen, handleClose, id }) {
  const [comment, setComment] = useState("");

  async function handleSubmit(id, comment) {
    if (!comment.trim()) return;

    try {
     let ar= await API.comment(id, comment); // Make sure your API expects (id, comment)
      setComment(""); // clear after posting
      if (ar)handleClose();
    } catch (error) {
      console.error("Failed to post comment: "+ error.message);
    }
  }

  return (
    <div className={`comments-modal ${isOpen ? "open" : ""}`}>
      <div className="comments-modal-content">
        <button className="comments-modal-close" onClick={handleClose}>
          ×
        </button>
        <textarea
          placeholder="Write your comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          className="submit-comment"
          onClick={() => handleSubmit(id, comment)}
        >
          Post Comment
        </button>
      </div>
    </div>
  );
}

export default Comment;
