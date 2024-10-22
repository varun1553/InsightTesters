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
  const [selectedCategory, setSelectedCategory] = useState(''); // State for selected category
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPost, setEditPost] = useState({});
  const { userObj } = useSelector((state) => state.user); // Access userObj from Redux

  // Filter posts based on view type and selected category
  const filteredPosts = posts.filter(post => {
    const isViewTypeMatch = viewType === 'all' 
      ? post.createdBy !== userObj.username 
      : post.createdBy === userObj.username;

    const isCategoryMatch = selectedCategory 
      ? post.category === selectedCategory 
      : true;

    return isViewTypeMatch && isCategoryMatch;
  });

  useEffect(() => {
    fetchPosts();
  }, [currentPage, viewType]);

  const fetchPosts = async () => {
    try {
      let url = apiUrl + '/post-api/posts';
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
      await axios.delete(`${apiUrl}/post-api/delete-post/${postId}`);
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleReportPost = async (postId) => {
    try {
      const response = await axios.post(`${apiUrl}/post-api/reportpost/${postId}`);
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
      await axios.put(`${apiUrl}/post-api/edit-post/${editPost._id}`, editPost);
      setShowEditModal(false);
      fetchPosts();
    } catch (error) {
      console.error("Error editing post:", error);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
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

      {/* Category Filter Dropdown */}
      <div className="container mt-3">
        <DropdownButton id="dropdown-basic-button" title="Select Category">
          <Dropdown.Item onClick={() => handleCategoryChange('')}>All Categories</Dropdown.Item>
          <Dropdown.Item onClick={() => handleCategoryChange('education')}>Education</Dropdown.Item>
          <Dropdown.Item onClick={() => handleCategoryChange('travel')}>Travel</Dropdown.Item>
          <Dropdown.Item onClick={() => handleCategoryChange('technology')}>Technology</Dropdown.Item>
        </DropdownButton>
      </div>

      <div className='container mt-3' style={{ textDecoration: 'none' }}>
        <div className='col-12'>
          <div>
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
                <div className="d-flex justify-content-between align-items-center">
                  <TempPost post={post} />
                  {viewType === 'my' && post.createdBy === userObj.username ? (
                    <DropdownButton
                      align="end"
                      title={<span style={{ color: 'inherit' }}>&#8942;</span>}
                      id={`dropdown-menu-align-end-${post._id}`}
                      style={{ background: 'none', border: 'none', boxShadow: 'none' }}
                    >
                      <Dropdown.Item eventKey="1" onClick={() => handleEditPost(post)}>Edit</Dropdown.Item>
                      <Dropdown.Item eventKey="2" onClick={() => handleDeletePost(post._id)}>Delete</Dropdown.Item>
                    </DropdownButton>
                  ) : viewType === 'all' && post.createdBy !== userObj.username ? (
                    <DropdownButton
                      align="end"
                      title={<span style={{ color: 'inherit' }}>&#8942;</span>}
                      id={`dropdown-menu-align-end-${post._id}`}
                      style={{ background: 'none', border: 'none', boxShadow: 'none' }}
                    >
                      <Dropdown.Item eventKey="1" onClick={() => handleReportPost(post._id)}>Report</Dropdown.Item>
                    </DropdownButton>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No posts available.</p>
        )}
      </div>

      {/* Pagination */}
      <nav>
        <ul className="pagination justify-content-center">
          {Array.from({ length: totalPages }, (_, index) => (
            <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                {index + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Posts;
