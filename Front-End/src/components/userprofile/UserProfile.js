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
  const [linkedIn, setLinkedIn] = useState('');
  const [leetCode, setLeetCode] = useState('');
  const [gitHub, setGitHub] = useState('');
  const [degree, setDegree] = useState('');
  const [courses, setCourses] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sentVerificationCode, setSentVerificationCode] = useState(''); // Store sent code
  const [verificationSent, setVerificationSent] = useState(false);

  let { userObj } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (userObj) {
      setName(userObj.name);
      setEmail(userObj.email);
      setUsername(userObj.username);
      setLinkedIn(userObj.linkedIn);
      setLeetCode(userObj.leetCode);
      setGitHub(userObj.gitHub);
      setDegree(userObj.degree);
      setCourses(userObj.courses);
      setIsEmailVerified(userObj.isEmailVerified);
    }
  }, [userObj]);

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

  const handleSendVerification = async () => {
    try {
      const response = await axios.post(`${apiUrl}/user-api/send-verification-code`, { email, username });
      console.log(response.data)
      setSentVerificationCode(response.data.verificationCode); // Store the sent verification code
      setVerificationSent(true);
      alert('Verification code sent to your email!');
    } catch (error) {
      console.error('Error sending verification code:', error);
    }
  };

  const handleVerifyEmail = () => {
    console.log(verificationCode)
    console.log(sentVerificationCode)
    if (verificationCode === sentVerificationCode) {
      setIsEmailVerified(true);
      alert('Email verified successfully!');
    } else {
      alert('Invalid verification code. Please try again.');
    }
  };

  const handleSave = () => {
    if (emailError) {
      alert('Please fix the email error before saving.');
      return;
    }

    const original_username = userObj.username;
    const updatedUserData = { 
      name, 
      email, 
      username, 
      linkedIn, 
      leetCode, 
      gitHub, 
      degree, 
      courses, 
      original_username 
    };

    axios.put(`${apiUrl}/user-api/editprofile`, updatedUserData)
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
                  //onBlur={handleEmailBlur}
                  //pattern="[a-zA-Z0-9._%+-]+@my\.unt\.edu"
                  title="Please enter a valid @my.unt.edu email address"
                  className={emailError ? 'is-invalid' : ''}
                />
                {emailError && <div className="invalid-feedback">{emailError}</div>}
                {!isEmailVerified && (
                  <>
                    <button onClick={handleSendVerification}>Verify</button>
                    {verificationSent && (
                      <>
                        <input 
                          type="text" 
                          placeholder="Enter verification code" 
                          value={verificationCode} 
                          onChange={e => setVerificationCode(e.target.value)} 
                        />
                        <button onClick={handleVerifyEmail}>Confirm</button>
                      </>
                    )}
                  </>
                )}
                {isEmailVerified && <span style={{ color: 'green' }}>Verified</span>}
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
          <div className="form-group">
            <label>LinkedIn Profile URL:</label>
            {editing ? (
              <input type="text" value={linkedIn} onChange={e => setLinkedIn(e.target.value)} placeholder="https://www.linkedin.com/in/your-profile" />
            ) : (
              <span>{userObj.linkedIn || 'Not provided'}</span>
            )}
          </div>
          <div className="form-group">
            <label>LeetCode Profile URL:</label>
            {editing ? (
              <input type="text" value={leetCode} onChange={e => setLeetCode(e.target.value)} placeholder="https://leetcode.com/your-username" />
            ) : (
              <span>{userObj.leetCode || 'Not provided'}</span>
            )}
          </div>
          <div className="form-group">
            <label>GitHub Username:</label>
            {editing ? (
              <input type="text" value={gitHub} onChange={e => setGitHub(e.target.value)} placeholder="GitHub Username" />
            ) : (
              <span>{userObj.gitHub || 'Not provided'}</span>
            )}
          </div>
          <div className="form-group">
            <label>Latest Degree Passout Year:</label>
            {editing ? (
              <input type="text" value={degree} onChange={e => setDegree(e.target.value)} placeholder="Year of degree completion" />
            ) : (
              <span>{userObj.degree || 'Not provided'}</span>
            )}
          </div>
          <div className="form-group">
            <label>Courses Taken:</label>
            {editing ? (
              <textarea
                value={courses}
                onChange={e => setCourses(e.target.value)}
                placeholder="List of courses (comma-separated)"
              />
            ) : (
              <span>{userObj.courses || 'Not provided'}</span>
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
