import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { AiFillLike, AiFillDislike } from 'react-icons/ai';
import './Post.css'
const apiUrl = process.env.REACT_APP_URL;

const Post = (props) => {
      const [Article, setArticle] = useState();
      const [error, setError] = useState();
      const { _id } = useParams();
      const [liked, setLiked] = useState(false);
      const [comment, setComment] = useState('');

      const handleChange = (event) => {
        setComment(event.target.value);
      };
      
      const handleLikeClick = async (postId) => {
        if (liked) {
          handleUnlike();
        } else {
          handleLike();
        }
      };
    
      const handleLike = async (postId) => {
        try {
          const response = await axios.get(`/increaselike/${postId}`);
    
          if (response.status === 200) {
            console.log(response.data.message);
            setLiked(true);
          } else {
            console.error('Error increasing like count:', response.statusText);
          }
        } catch (error) {
          console.error('Error increasing like count:', error);
        }
      };
    
      const handleUnlike = async (postId) => {
        try {
          const response = await axios.get(`/decreaselike/${postId}`);
    
          if (response.status === 200) {
            console.log(response.data.message);
            setLiked(false);
          } else {
            console.error('Error decreasing like count:', response.statusText);
          }
        } catch (error) {
          console.error('Error decreasing like count:', error);
        }
      };

      const handleSubmit = (event) => {
        // event.preventDefault();
        // if (!comment.trim()) return;
        // onCommentSubmit(comment);
        // setComment(''); 
      };

      useEffect( () => {
        const fetchPost = async ()=>{
            try{
                const response = await fetch(apiUrl+`/post-api/post/${_id}`);
                const result = await response.json();
                console.log(result);
                setArticle(result);
            }catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            }
        }       
        fetchPost();
      }, []);

      return (
        <div className="main-body">
            { error ? <div className="main-body">
                    <h1>Error</h1>
                    <p>{error}</p>
                </div> : Article ?  
                <div className="post-container"> 
                <div>
                  <h1 className="post-title">TITLE</h1>
                  <button className={`like-button ${liked ? 'liked' : ''}`} onClick={handleLikeClick}>
                      {liked ? 'Liked!' : 'Like'}
                    </button>
                </div>
                    <hr></hr>
                    <p className="post-content">CONTENT</p>
                    <p className="post-author">created By - {Article.createdBy}</p>
                    <hr></hr>
                    {/* {
                        Article.comments.map( (comment) => (
                            <h2>{comment.content}</h2>       
                        ))
                    } */}
                    <form onSubmit={handleSubmit}>
                      <textarea
                        value={comment}
                        onChange={handleChange}
                        placeholder="Write your comment..."
                        rows={4}
                        cols={50}
                      />
                      <br />
                      <button type="submit">Submit</button>
                    </form>
                </div>: <div><p>Loading</p></div> }            
        </div>
      );  
};

export default Post;