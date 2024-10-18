import React, { useState } from 'react';
import { useSelector } from "react-redux";
import axios from 'axios';
import './NewPost.css';
import { useForm } from "react-hook-form";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
const apiUrl = process.env.REACT_APP_URL;

function NewPost() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  let { userObj } = useSelector((state) => state.user);

  const onFormSubmit = async (postObj) => {
    try {
      // Add current user's name to the postObj
      postObj.createdBy = userObj.username;
      postObj.likecount = 0;
      const formData = new FormData();

      console.log(postObj);
      formData.append("postObj", JSON.stringify(postObj));
      const response = await axios.post(apiUrl + "/post-api/new-post", formData, {
        headers: {
          "Content-Type": 'application/json',
        },
      });

      alert(response.data.message);
      if (response.data.message === "New Post created") {
        navigate('/post-api/posts');
      }
    } catch (error) {
      console.error("Error adding new post:", error);
      alert(error);
    }
  };

  return (
    <div className="new-post-card" style={{ marginTop: '40px' }}>
      <h2>Create New Post</h2>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Form.Group className="mb-3" controlId="title">
          <Form.Label>Title: </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Title.."
            {...register("title", {
              required: "Title is required",
              minLength: {
                value: 5,
                message: "Title must be at least 5 characters long",
              },
              maxLength: {
                value: 100,
                message: "Title must not exceed 100 characters",
              },
            })}
          />
          {errors.title && (
            <p className="text-danger">{errors.title.message}</p>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="content">
          <Form.Label>Content: </Form.Label>
          <Form.Control
            as="textarea"
            placeholder="Enter Content.."
            {...register("content", {
              required: "Content is required",
              minLength: {
                value: 10,
                message: "Content must be at least 10 characters long",
              },
              maxLength: {
                value: 500,
                message: "Content must not exceed 500 characters",
              },
            })}
          />
          {errors.content && (
            <p className="text-danger">{errors.content.message}</p>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="imageURL">
          <Form.Label>Image URL:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Image URL.."
            {...register("imageUrl", {
              required: "Image URL is required",
              pattern: {
                value: /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))/i,
                message: "Please enter a valid image URL",
              },
            })}
          />
          {errors.imageUrl && (
            <p className="text-danger">{errors.imageUrl.message}</p>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="category">
          <Form.Label>Category:</Form.Label>
          <Form.Select
            {...register("category", {
              required: "Category is required",
            })}
          >
            <option value="">Select Category</option>
            <option value="technology">Technology</option>
            <option value="education">Education</option>
            <option value="travel">Travel</option>
          </Form.Select>
          {errors.category && (
            <p className="text-danger">{errors.category.message}</p>
          )}
        </Form.Group>

        <Button variant="primary" type="submit">
          Create Post
        </Button>
      </Form>
    </div>
  );
}

export default NewPost;
