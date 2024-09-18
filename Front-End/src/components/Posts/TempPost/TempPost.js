import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TempPost.css';
import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa";
import { TfiComments } from "react-icons/tfi";
import { useSelector } from "react-redux";

const TempPost = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [showCommentSection, setShowCommentSection] = useState(false); // State to toggle comment section
  const [key, setKey] = useState(0); // Key to force re-render
  const { userObj } = useSelector((state) => state.user);

  useEffect(() => {
    getLikeStatus(post._id);
    fetchComments(post._id);
  }, [post._id, key]); // Include key in dependency array

  const handleChange = (event) => {
    setComment(event.target.value);
  };

  const handleLikeClick = (postId) => {
    handleLike(postId);
  };

  const handleLike = async (postId) => {
    try {
      const username = userObj ? userObj.username : null;
      if (!username) {
        return;
      }
      const response = await axios.put(`/post-api/setlike/${postId}/${username}`);
      const { liked, likecount } = response.data; // Update like count from API response
      setLiked(liked);
      setLikeCount(likecount);
      setKey(prevKey => prevKey + 1); // Increment key to force re-render
    } catch (error) {
      console.error('Error increasing like count:', error);
    }
  };

  const getLikeStatus = async (postId) => {
    try {
      const username = userObj ? userObj.username : null;
      if (!username) {
        return;
      }
      const response = await axios.get(`/post-api/getlikepost/${postId}/${username}`);
      const { liked, likecount } = response.data;
      setLiked(liked);
      setLikeCount(likecount);
    } catch (error) {
      console.error('Error getting like status:', error);
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/comment-api/post-comment', {
        postId: post._id,
        username: userObj.username,
        content: comment,
      });
      console.log(response.data.message);
      setComment('');
      fetchComments(post._id);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(`/comment-api/get-comments/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const toggleCommentSection = () => {
    setShowCommentSection(!showCommentSection);
  };

  return (
    <div className="temp_post-container">
      <h3 className="temp_post-title">{post.title}</h3>
      <p className="temp_post-likes">{post.content}</p>
      
      <div className="buttons_container">
        {liked ? (
          <button className="temp_post-button" onClick={() => handleLikeClick(post._id)}>
            <FcLike size={'1rem'}/>
          </button>
        ) : (
          <button className="temp_post-button" onClick={() => handleLikeClick(post._id)}>
            <FaRegHeart size={'1rem'}/>
          </button>
        )}
        
        <button className="temp_post-button" onClick={toggleCommentSection}>
          <TfiComments size={'1rem'}/>
        </button>
        
        <div>
          <p>Liked by {likeCount} users.</p>
        </div>
        
        {showCommentSection && (
          <div className="temp_comment-section">
            <h2>Comments</h2>
            {comments.map((comment, index) => (
              <div key={index} className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">{comment.username}</h5>
                  <p className="card-text">{comment.content}</p>
                  <p className="card-text"><small className="text-muted">Posted at: {new Date(comment.createdAt).toLocaleString()}</small></p>
                </div>
              </div>
            ))}

            <form onSubmit={handleCommentSubmit} className="mb-3">
              <div className="input-group">
                <textarea
                  value={comment}
                  onChange={handleChange}
                  placeholder="Write your comment..."
                  className="form-control"
                  rows={4}
                  cols={50}
                />
              </div>
              <div className="mt-3">
                <button className="btn btn-primary mr-2" type="submit">Submit</button>
                <button className="btn btn-secondary ml-auto" onClick={toggleCommentSection}>Close</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TempPost;
