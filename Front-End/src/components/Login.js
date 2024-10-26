import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Button, Spinner, Alert, Modal } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { userLogin } from "../slices/userSlice";
import { adminLogin } from "../slices/adminSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const apiUrl = process.env.REACT_APP_URL;

function Login() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { isError, isLoading, isSuccess, errMsg } = useSelector((state) => state.user);
  const { isError: adminIsError, isLoading: adminIsLoading, isSuccess: adminIsSuccess, errMsg: adminErrMsg } = useSelector((state) => state.admin);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentVerificationCode, setSentVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [emailVerificationError, setEmailVerificationError] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
    resetForgotPasswordForm();
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    resetForgotPasswordForm();
  };

  const resetForgotPasswordForm = () => {
    setUsername("");
    setEmail("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotPasswordError("");
    setEmailVerificationError("");
    setCodeVerified(false);
    setIsUserVerified(false);
    setIsVerificationSent(false);
  };

  const handleForgotPassword = () => {
    setShowModal(true);
  };

  const onFormSubmit = async (userCredentialsObject) => {
    try {
      if (userCredentialsObject.userType === "user") {
        await dispatch(userLogin(userCredentialsObject)).unwrap();
      } else if (userCredentialsObject.userType === "admin") {
        await dispatch(adminLogin(userCredentialsObject)).unwrap();
      }
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      navigate("/userdashboard");
    } else if (adminIsSuccess) {
      navigate("/admindashboard");
    }
  }, [isSuccess, adminIsSuccess]);

  const handleVerifyUsername = async () => {
    try {
      const response = await axios.post(`${apiUrl}/user-api/verify-username`, { username });
      console.log(response.data)
      if (response.data.message === "Username verified successfully") {
        setIsUserVerified(true);
        alert("Username verified. Please enter your registered email.");
      } else {
        setForgotPasswordError("Username does not exist.");
      }
    } catch (error) {
      setForgotPasswordError("Error verifying username. Please try again.");
    }
  };

  const handleSendVerification = async () => {
    try {
      const response = await axios.post(`${apiUrl}/user-api/verifying-and-send-code`, { email, username });
      if (response.data.message === "Verification code sent") {
        setSentVerificationCode(response.data.verificationCode);
        setIsVerificationSent(true);
        alert("Verification code sent to your email.");
      } else {
        setForgotPasswordError("Email does not match the username.");
      }
    } catch (error) {
      setForgotPasswordError("Error sending verification code. Please try again.");
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode === sentVerificationCode) {
      setCodeVerified(true);
      alert("Email verified successfully!");
      setShowModal(false);
      setShowPasswordModal(true);
    } else {
      setEmailVerificationError("Invalid verification code. Please try again.");
    }
  };

  const handlePasswordChangeSubmit = async () => {
    try {
      if (newPassword !== confirmPassword) {
        setForgotPasswordError("Passwords do not match.");
        return;
      }
      const response = await axios.put(`${apiUrl}/user-api/change-password`, {
        username,
        newPassword,
      });
      alert("Password updated successfully.");
      setShowPasswordModal(false);
    } catch (error) {
      setForgotPasswordError("Failed to update password. Please try again.");
    }
  };

  return (
    <div className="container">
      {/* Login Form */}
      <p className="display-2 text-center text-primary">Login</p>
      <div className="row">
        <div className="col-12 col-sm-8 col-md-6 mx-auto">
          <Form onSubmit={handleSubmit(onFormSubmit)}>
            <Form.Group className="mb-3 custom-form-group">
              <Form.Label>Select User Type</Form.Label> <br />
              <Form.Check inline type="radio" id="user">
                <Form.Check.Input
                  type="radio"
                  value="user"
                  {...register("userType", { required: true })}
                />
                <Form.Check.Label>User</Form.Check.Label>
              </Form.Check>
              <Form.Check inline type="radio" id="admin">
                <Form.Check.Input
                  type="radio"
                  value="admin"
                  {...register("userType", { required: true })}
                />
                <Form.Check.Label>Admin</Form.Check.Label>
              </Form.Check>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Username"
                {...register("username", { required: true })}
              />
              {errors.username && <p className="text-danger">* Username is required</p>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter Password"
                {...register("password", { required: true })}
              />
              {errors.password && <p className="text-danger">* Password is required</p>}
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button onClick={handleForgotPassword} variant="link">
                Forgot Password?
              </Button>
              <Button
                className="general_button"
                type="submit"
                disabled={isLoading || adminIsLoading}
              >
                {isLoading || adminIsLoading ? <Spinner animation="border" size="sm" /> : "Login"}
              </Button>
            </div>

            {isError && <Alert variant="danger">{errMsg}</Alert>}
            {adminIsError && <Alert variant="danger">{adminErrMsg}</Alert>}
          </Form>

          {/* Forgot Password Modal */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Forgot Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* Ask for username */}
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" onClick={handleVerifyUsername}>
                Verify Username
              </Button>
              {forgotPasswordError && <Alert variant="danger" className="mt-2">{forgotPasswordError}</Alert>}

              {isUserVerified && (
                <>
                  {/* If username is verified, ask for email */}
                  <Form.Group className="mt-3">
                    <Form.Label>Registered Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
                  <Button variant="primary" onClick={handleSendVerification} disabled={isVerificationSent}>
                    {isVerificationSent ? "Code Sent" : "Send Verification Code"}
                  </Button>
                </>
              )}

              {isVerificationSent && (
                <>
                  {/* Input field for the verification code */}
                  <Form.Group className="mt-3">
                    <Form.Label>Verification Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter the verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </Form.Group>
                  <Button variant="secondary" onClick={handleVerifyCode}>
                    Verify Code
                  </Button>
                  {emailVerificationError && <Alert variant="danger" className="mt-2">{emailVerificationError}</Alert>}
                </>
              )}

            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
              {isVerificationSent && (
                <Button variant="secondary" onClick={handleVerifyCode} className="mt-2">
                  Verify Code
                </Button>
              )}
            </Modal.Footer>
          </Modal>

          {/* Change Password Modal */}
          <Modal show={showPasswordModal} onHide={handleClosePasswordModal}>
            <Modal.Header closeButton>
              <Modal.Title>Change Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Form.Group>
              {forgotPasswordError && <Alert variant="danger">{forgotPasswordError}</Alert>}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClosePasswordModal}>
                Close
              </Button>
              <Button variant="primary" onClick={handlePasswordChangeSubmit}>
                Change Password
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default Login;
