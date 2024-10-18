import React, { useEffect, useState } from "react";
import './Userdashboard.css';
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { Nav } from "react-bootstrap";
import { Outlet, NavLink } from "react-router-dom";
import { Link, Routes, Route } from 'react-router-dom';
import UserProfile from "../userprofile/UserProfile";
import NewPost from "../NewPost/NewPost";
import Posts from "../Posts/Posts";
import Messages from "../messages/Messages";
import Notifications from "../notifications/Notifications";
import NewEvent from "../new_event/new_event";
import Events from "../new_event/get_event";
import DonateNow from "../DonateNow";
import axios from 'axios'; // Import axios

const apiUrl = process.env.REACT_APP_URL;

function Userdashboard() {
  let { userObj } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]); // Initialize users as an empty array
  const [loading, setLoading] = useState(true); // Loading state for users

  // Fetch users function
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiUrl}/user-api/getusers`);
      if (response.data && Array.isArray(response.data.payload)) {
        setUsers(response.data.payload); // Ensure payload is an array
      } else {
        console.error('Unexpected response structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '40px', marginLeft: '30px' }}>
        <h3 style={{ marginRight: '10px' }}>Hello, {userObj.name}!</h3>
        <h5>Connect with your alumni network.</h5>
      </div>

      <div className="userdashboard-container">
        <div className="user-dashboard-cards">
          <Link eventKey="10" as={NavLink} to="/profile" exact>
            <figure className="user-dashboard-card">
              <figcaption className="user-dashboard-card_title">
                View Profile
              </figcaption>
            </figure>
          </Link>
        </div>
        <div className="user-dashboard-cards">
          <Link eventKey="11" as={NavLink} to="/post-api/posts" exact>
            <figure className="user-dashboard-card">
              <figcaption className="user-dashboard-card_title">
                Posts
              </figcaption>
            </figure>
          </Link>
        </div>
        <div className="user-dashboard-cards">
          <Link eventKey="12" as={NavLink} to="/events" exact>
            <figure className="user-dashboard-card">
              <figcaption className="user-dashboard-card_title">
                Events
              </figcaption>
            </figure>
          </Link>
        </div>
        <div className="user-dashboard-cards">
          <Link eventKey="13" as={NavLink} to="/notifications" exact>
            <figure className="user-dashboard-card">
              <figcaption className="user-dashboard-card_title">
                Notifications
              </figcaption>
            </figure>
          </Link>
        </div>
        <div className="user-dashboard-cards">
          <Link eventKey="14" as={NavLink} to="/messages" exact>
            <figure className="user-dashboard-card">
              <figcaption className="user-dashboard-card_title">
                Messages
              </figcaption>
            </figure>
          </Link>
        </div>
        <div className="user-dashboard-cards">
          <Link eventKey="15" as={NavLink} to="/donate" exact>
            <figure className="user-dashboard-card">
              <figcaption className="user-dashboard-card_title">
                Donate
              </figcaption>
            </figure>
          </Link>
        </div>
      </div>

      <div className="user-dashboard">
        <div className="user-dashboard-sidebar">
        </div>

        <div>
          <Routes>
            <Route path="/new-post" element={<NewPost />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/post-api/posts" element={<Posts />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/events" element={<Events />} />
            <Route path="/new-event" element={<NewEvent />} />
            <Route path="/donate" element={<DonateNow />} />
          </Routes>
        </div>

        <div className="container mt-4">
          <h3 className="text-center mb-4">Registered Users</h3>
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <div className="row">
              {users.length > 0 ? ( // Check if users array has items
                users.map((user, index) => (
                  <div key={index} className="col-md-4 mb-4">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">{user.username}</h5>
                        <p className="card-text">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center">No users found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Userdashboard;
