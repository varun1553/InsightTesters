import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from "react-redux";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { Modal, Button, Form } from 'react-bootstrap';
import { Link, Routes, Route } from 'react-router-dom';
import NewPost from "../NewPost/NewPost";
import Post from './Post/Post';
import TempPost from './TempPost/TempPost';
const apiUrl = process.env.REACT_APP_URL;

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewType, setViewType] = useState('all'); // Default view type is 'all'
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPost, setEditPost] = useState({});
  const { userObj } = useSelector((state) => state.user); // Access userObj from Redux
  const filteredPosts = viewType === 'all' ? posts.filter(post => post.createdBy != userObj.username) : posts.filter(post => post.createdBy === userObj.username);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, viewType]);

  const fetchPosts = async () => {
    try {
      let url = apiUrl+'/post-api/posts';
      let createdByParam = '';
      if (viewType === 'my') {
        createdByParam = `?createdBy=${userObj.name}`;
      } else if (viewType === 'all') {
        createdByParam = `?excludeCreatedBy=${userObj.name}`;
      }
      url += `${createdByParam}&page=${currentPage}`;
      const response = await axios.get(url);
      console.log(response.data.payload.posts);
      setPosts(response.data.payload.posts);
      setTotalPages(response.data.payload.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDeletePost = async (postId) => {
    try {
      console.log(postId);
      await axios.delete(apiUrl+`/post-api/delete-post/${postId}`);
      // Assuming the delete operation was successful, update the UI by refetching the posts
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleReportPost = async (postId) => {
    // Implement report post functionality here
    try {
      const response = await axios.post(apiUrl+`/post-api/reportpost/${postId}`);
      if (response.data.message === "Post reported successfully") {
        alert("Post reported successfully");
      }

    } catch (error) {
      console.error("Unsuccessful report");
    }
  };

  const handleEditPost = (post) => {
    setEditPost(post);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleSaveEdit = async () => {
    try {
      // Send the updated post details to the backend
      await axios.put(apiUrl+`/post-api/edit-post/${editPost._id}`, editPost);
      // Assuming the update operation was successful, close the modal and refresh the posts
      setShowEditModal(false);
      fetchPosts();
    } catch (error) {
      console.error("Error editing post:", error);
    }
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

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '5px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div>
      {/* Navigation Bar */}
      <Navbar bg="light" expand="lg">
        <Navbar.Brand>Posts</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link
              onClick={() => setViewType('all')}
              style={{ color: viewType === 'all' ? 'white' : 'black', backgroundColor: viewType === 'all' ? 'blue' : 'transparent' }}
            >
              All Posts
            </Nav.Link>
            <Nav.Link
              onClick={() => setViewType('my')}
              style={{ color: viewType === 'my' ? 'white' : 'black', backgroundColor: viewType === 'my' ? 'blue' : 'transparent' }}
            >
              My Posts
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div className='container mt-3' style={{ textDecoration: 'none' }}>
        <div className='col-12'>
          {/* <div className='col-10'></div> */}
          <div >
            <Link to="/new-post" style={{ textDecoration: 'none', marginLeft: 'auto' }}>
              <button style={buttonStyle}>
                <span>Add new post</span>
                <span style={{ marginLeft: '5px' }}>+</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formBasicTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={editPost.title} onChange={(e) => setEditPost({ ...editPost, title: e.target.value })} />
            </Form.Group>
            <Form.Group controlId="formBasicContent">
              <Form.Label>Content</Form.Label>
              <Form.Control as="textarea" rows={3} value={editPost.content} onChange={(e) => setEditPost({ ...editPost, content: e.target.value })} />
            </Form.Group>
            <Form.Group controlId="formBasicCategory">
              <Form.Label>Category</Form.Label>
              <Form.Control type="text" value={editPost.category} onChange={(e) => setEditPost({ ...editPost, category: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Post List */}
      <div className="container mt-3">
        {filteredPosts.length > 0 ? (
          <ul className="list-group">
            {filteredPosts.map((post, index) => (
              <li key={post._id} className="list-group-item" style={{ marginBottom: index < posts.length - 1 ? '20px' : '0' }}>
                {viewType === 'my' && post.createdBy === userObj.username ? (
                  <div className="d-flex justify-content-between align-items-center">
                    {/* <div>
                      <h3>{post.title}</h3>
                      <p>{post.content}</p>
                      <p>Category: {post.category}</p>
                    </div> */}
                      <TempPost key={post._id} post={post} />

                    <DropdownButton
                      align="end"
                      title={<span style={{ color: 'inherit' }}>&#8942;</span>}
                      id={`dropdown-menu-align-end-${post._id}`}
                      style={{ background: 'none', border: 'none', boxShadow: 'none' }}
                    >
                      <Dropdown.Item eventKey="1" onClick={() => handleEditPost(post)}>Edit</Dropdown.Item>
                      <Dropdown.Item eventKey="2" onClick={() => handleDeletePost(post._id)}>Delete</Dropdown.Item>
                    </DropdownButton>
                  </div>
                ) : null}

                {viewType === 'all' && post.createdBy !== userObj.username ? (
                  
                  <div className="d-flex justify-content-between align-items-center">
                    {/* <Link className="post_link" to={`${url}/post/${post._id}`}>
                    <div className='post_container'>
                      <h3>{post.title}</h3>
                      <p>{post.content}</p>
                      <p>Category: {post.category}</p>
                    </div>
                    </Link> */}
                    <TempPost key={post._id} post={post} />
                    <div>
                    
                      {/* <button onClick={liked ? handleUnlike(post._id) : handleLike(post._id)}>
                        {liked ? <i className="fas fa-heart"></i> : <i className="far fa-heart"></i>}
                        {post.likecount}
                      </button>
                      <button>
                        <i className="far fa-comment"></i>
                      </button> */}

                    {/* <button className={`like-button ${liked ? 'liked' : ''}`} onClick={handleLikeClick}>
                      {liked ? 'Liked!' : 'Like'}
                    </button> */}
                    </div>
                    
                    <DropdownButton
                      align="end"
                      title={<span style={{ color: 'inherit' }}>&#8942;</span>}
                      id={`dropdown-menu-align-end-${post._id}`}
                      style={{ background: 'none', border: 'none', boxShadow: 'none' }}
                    >
                      <Dropdown.Item eventKey="3" onClick={() => handleReportPost(post._id)}>Report</Dropdown.Item>
                    </DropdownButton>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p>No posts available.</p>
        )}

        {/* Pagination */}
        <nav className="mt-4">
          <ul className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
              <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(pageNumber)}>{pageNumber}</button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div>
        <Routes>
          <Route path="/new-post" element={<NewPost />} />
          <Route path="/post/:id" element={<Post/>}/>
        </Routes>
      </div>
    </div>

  );
};

export default Posts;
