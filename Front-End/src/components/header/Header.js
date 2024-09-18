import React, { useState, useEffect } from "react";
import { Container, Nav, Navbar, NavDropdown, Modal, Button, Form } from "react-bootstrap";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearLoginStatus } from "../../slices/userSlice";
import { adminClearLoginStatus } from "../../slices/adminSlice";
import Home from "../Home";
import Signup from "../Signup";
import Login from "../Login";
import Contactus from "../Contactus";
import UserProfile from "../userprofile/UserProfile";
import Userdashboard from "../userdashboard/Userdashboard";
import Posts from "../Posts/Posts";
import NewPost from "../NewPost/NewPost";
import Admindashboard from '../admin/admindashboard/Admindashboard';
import Messages from "../messages/Messages";
import Reportedposts from "../admin/reportedposts/Reportedposts";
import Inquiry from "../admin/inquiries/Inquiry";
import Notifications from "../notifications/Notifications";
import Post from "../Posts/Post/Post";
import NewEvent from "../new_event/new_event";
import Events from "../new_event/get_event";
import DonateNow from "../DonateNow";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import homeImg from "../../images/image.png";
import "./Header.css";

const stripePromise = loadStripe('pk_test_51P5rdsP9Ok8DmdR9KLz2PgjDUr0E9f57zLmGZvlfwBAeb6d7lxSOaUgLv0cUE49VONJNve7qepuR5sTB9vDnRV6j008PbB03PQ');

function Header() {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSuccess, userObj } = useSelector((state) => state.user);
  const { isSuccess: adminIsSuccess, adminObj } = useSelector((state) => state.admin);
  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'de', name: 'German' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'te', name: 'Telugu' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ur', name: 'Urdu' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'kn', name: 'Kannada' },
    { code: 'or', name: 'Oriya' },
    { code: 'ne', name: 'Nepali' },
    { code: 'ar', name: 'Arabic' }
  ];


  useEffect(() => {
    const checkGoogleTranslateElement = () => {
      const googleTranslateElement = document.querySelector('.goog-te-combo');
      if (googleTranslateElement) {
        setGoogleTranslateLanguage(selectedLanguage);
      } else {
        console.error('Google Translate combo box not found.');
      }
    };

    const timer = setTimeout(checkGoogleTranslateElement, 1000);

    return () => clearTimeout(timer);
  }, [selectedLanguage]);



  // Handle password change
  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/user-api/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: userObj.username, newPassword }),
      });

      if (response.ok) {
        setNewPassword("");
        setConfirmNewPassword("");
        setSuccessMessage("Password updated successfully");
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to update password");
    }
  };

  // Handle user logout
  const userLogout = () => {
    localStorage.clear();
    dispatch(clearLoginStatus());
    navigate("/login");
  };

  // Handle admin logout
  const adminLogout = () => {
    localStorage.clear();
    dispatch(adminClearLoginStatus());
    navigate("/login");
  };

  // Handle language change
  const handleLanguageChange = (event) => {
    const selectedLangCode = event.target.value;
    setSelectedLanguage(selectedLangCode);
    localStorage.setItem('selectedLanguageClient', selectedLangCode);
    setGoogleTranslateLanguage(selectedLangCode); // Update Google Translate language
  };

  // Function to set Google Translate language
  const setGoogleTranslateLanguage = (selectedLangCode) => {
    const googleTranslateElement = document.querySelector('.goog-te-combo');
    if (googleTranslateElement) {
      googleTranslateElement.value = selectedLangCode;
      googleTranslateElement.dispatchEvent(new Event('change'));
    } else {
      console.error('Google Translate combo box not found.');
    }
  };

  return (
    <div>
      <Navbar collapseOnSelect expand="sm" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">
            <img src={homeImg} alt="" className="shadow-lg rounded" style={{ height: 60, width: 150 }} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="ms-auto">
              <div className="language-selector" >
                <select className="notranslate" value={selectedLanguage} onChange={handleLanguageChange}>
                  {languageOptions.map(option => (
                    <option key={option.code} value={option.code}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <div id="google_translate_element" style={{ display: 'none' }}></div>
              </div>

              {!isSuccess && !adminIsSuccess ? (
                <>
                  <Nav.Link as={NavLink} to="/">Home</Nav.Link>
                  <Nav.Link as={NavLink} to="/signup">Signup</Nav.Link>
                  <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
                  <Nav.Link as={NavLink} to="/contactus">Contact Us</Nav.Link>
                </>
              ) : isSuccess ? (
                <>
                  <Nav.Link as={NavLink} to="/userdashboard">Dashboard</Nav.Link>
                  <Nav.Link as={NavLink} to="/post-api/posts">View Posts</Nav.Link>
                  <Nav.Link as={NavLink} to="/messages">Messages</Nav.Link>
                  <Nav.Link as={NavLink} to="/notifications">Notifications</Nav.Link>
                  <Nav.Link as={NavLink} to="/events">Events</Nav.Link>
                  <NavDropdown title={userObj.username} id="user-dropdown">
                    <NavDropdown.Item onClick={() => setShowChangePasswordModal(true)}>
                      Change password
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={userLogout}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : adminIsSuccess ? (
                <>
                  <Nav.Link as={NavLink} to="/admindashboard">Dashboard</Nav.Link>
                  <Nav.Link as={NavLink} to="/reportedposts">Reported posts</Nav.Link>
                  <Nav.Link as={NavLink} to="/inquiries">Inquiries</Nav.Link>
                  <NavDropdown title={adminObj.username} id="admin-dropdown">
                    <NavDropdown.Item onClick={adminLogout}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : <></>}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contactus" element={<Contactus />} />
        <Route path="/events" element={<Events />} />
        <Route path="/new-event" element={<NewEvent />} />
        <Route path="/new-post" element={<NewPost />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/userdashboard" element={<Userdashboard />} />
        <Route path="/admindashboard" element={<Admindashboard />} />
        <Route path="/post-api/posts" element={<Posts />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reportedposts" element={<Reportedposts />} />
        <Route path="/inquiries" element={<Inquiry />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/donate" element={<Elements stripe={stripePromise}><DonateNow /></Elements>} />
      </Routes>

      <Modal show={showChangePasswordModal} onHide={() => setShowChangePasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formNewPassword">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formConfirmNewPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChangePasswordModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleChangePassword}>
            Change Password
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Header;
