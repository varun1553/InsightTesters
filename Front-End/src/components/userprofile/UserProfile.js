import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import './UserProfile.css'; // Import CSS file for styling
const apiUrl = process.env.REACT_APP_URL;

function UserProfile() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [emailError, setEmailError] = useState('');
  let { userObj } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleEmailBlur = () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@my\.unt\.edu$/;
    if (!emailPattern.test(email)) {
      setEmailError('Please enter a valid @my.unt.edu email address');
    } else {
      setEmailError('');
    }
  };

  const handleSave = () => {
    if (emailError) {
      alert('Please fix the email error before saving.');
      return;
    }

    const original_username = userObj.username;
    const updatedUserData = { name, email, username, original_username };

    axios.put(apiUrl + '/user-api/editprofile', updatedUserData)
      .then(response => {
        if (response.status === 200) {
          alert("Profile updated successfully, Login again to view the changes");
          setEditing(false);
        } else {
          console.error('Error updating profile:', response.data);
        }
      })
      .catch(error => console.error('Error updating profile:', error));
  };

  return (
    <div className="user-profile-container">
      {userObj ? (
        <div className="profile-form">
          <h2>Your Profile</h2>
          <div className="form-group">
            <label>Name:</label>
            {editing ? (
              <input type="text" value={name} onChange={e => setName(e.target.value)} />
            ) : (
              <span>{userObj.name}</span>
            )}
          </div>
          <div className="form-group">
            <label>Email:</label>
            {editing ? (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  pattern="[a-zA-Z0-9._%+-]+@my\.unt\.edu"
                  title="Please enter a valid @my.unt.edu email address"
                  className={emailError ? 'is-invalid' : ''}
                />
                {emailError && <div className="invalid-feedback">{emailError}</div>}
              </>
            ) : (
              <span>{userObj.email}</span>
            )}
          </div>
          <div className="form-group">
            <label>Username:</label>
            {editing ? (
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
            ) : (
              <span>{userObj.username}</span>
            )}
          </div>
          <div className="button-group">
            {editing ? (
              <button className="save-button" onClick={handleSave}>Save</button>
            ) : (
              <button className="edit-button" onClick={handleEdit}>Edit</button>
            )}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default UserProfile;
