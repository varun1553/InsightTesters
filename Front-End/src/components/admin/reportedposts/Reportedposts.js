import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Button } from "react-bootstrap"; // Import Bootstrap components
const apiUrl = process.env.REACT_APP_URL;

function Reportedposts() {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [filter, setFilter] = useState("asc");

  const fetchReportedPosts = async () => {
    try {
      const response = await axios.get(apiUrl+'/post-api/reportedposts');
      setReportedPosts(response.data);
    } catch (error) {
      console.error("Error fetching reported posts:", error);
    }
  };

  useEffect(() => {
    fetchReportedPosts();
  }, []);

  const handleDeletePost = async (reportpostId, postId) => {
    try {
      await axios.delete(apiUrl+`/post-api/delete-post/${postId}`);
      await axios.delete(apiUrl+`/post-api/report-post-delete/${reportpostId}`);
      
      fetchReportedPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleFilterChange = async (e) => {
    setFilter(e.target.value);
  };

  let sortedReportedPosts = [];
  if (Array.isArray(reportedPosts)) {
    sortedReportedPosts = [...reportedPosts]; 
    sortedReportedPosts.sort((a, b) => {
      if (filter === "asc") {
        return a.count - b.count;
      } else {
        return b.count - a.count;
      }
    });
  }

  return (
    <div>
      <h2 className="text-center mt-3 mb-4">Reported Posts</h2>
      <div className="d-flex justify-content-end mb-3" style={{ marginLeft: 'auto', width: 150, marginRight:200 }}>
        <select className="form-select" value={filter} onChange={handleFilterChange}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
        {sortedReportedPosts.map((report) => (
          <div key={report._id} className="col">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>{report.post.title}</Card.Title>
                <Card.Text>Content: {report.post.content}</Card.Text>
                <Card.Text>Category: {report.post.category}</Card.Text>
                <Card.Text>Visibility: {report.post.visibility}</Card.Text>
                <Card.Text>Created By: {report.post.createdBy}</Card.Text>
                <Card.Text>Report Count: {report.count}</Card.Text>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-end">
                <Button variant="danger" onClick={() => handleDeletePost(report._id, report.post._id)}>Delete</Button>
              </Card.Footer>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reportedposts;
