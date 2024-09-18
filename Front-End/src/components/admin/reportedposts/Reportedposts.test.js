import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Reportedposts from './Reportedposts'; // Adjust the import path to where your Reportedposts component is located
const apiUrl = process.env.REACT_APP_URL;
// Initialize mock adapter
const mock = new MockAdapter(axios);

// Sample data representing reported posts before deletion
const reportedPostsBeforeDeletion = [
  {
    _id: "report1",
    count: 3,
    post: {
      _id: "post1",
      title: "Post 1",
      content: "Content 1",
      category: "Category 1",
      visibility: "Public",
      createdBy: "User 1"
    }
  }
];

// Sample data representing an empty array after deletion
const reportedPostsAfterDeletion = [];

describe('Reportedposts Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mock.reset();

    // Mock GET request for fetching reported posts
    mock.onGet("apiUrl/post-api/reportedposts").reply(200, reportedPostsBeforeDeletion);

    // Mock DELETE requests for post and report deletion
    mock.onDelete(apiUrl+`/post-api/delete-post/post1`).reply(200);
    mock.onDelete(apiUrl+`/post-api/report-post-delete/report1`).reply(200);
  });

  it('handles post deletion correctly', async () => {
    render(<Reportedposts />);

    // Wait for the reported posts to be fetched and displayed
    await waitFor(() => expect(screen.getByText('Post 1')).toBeInTheDocument());

    // Simulate clicking the delete button
    fireEvent.click(screen.getByText('Delete'));

    // Mock the second GET request to fetch reported posts, simulating the state after deletion
    mock.onGet(apiUrl+"/post-api/reportedposts").reply(200, reportedPostsAfterDeletion);

    // Verify the post is removed after deletion
    await waitFor(() => expect(screen.queryByText('Post 1')).not.toBeInTheDocument());
  });

});
