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
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const { isError, isLoading, isSuccess, errMsg } = useSelector(
    (state) => state.user
  );
  const {
    isError: adminIsError,
    isLoading: adminIsLoading,
    isSuccess: adminIsSuccess,
    errMsg: adminErrMsg,
  } = useSelector((state) => state.admin);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [username, setUsername] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [secondforgotPasswordError, setsecondforgotPasswordError] = useState("");

  
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
    setSecurityQuestion("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotPasswordError("");
    setsecondforgotPasswordError("")
  };

  const handleForgotPassword = () => {
    setShowModal(true);
  };

  const onFormSubmit = (userCredentialsObject) => {
    if (userCredentialsObject.userType === "user") {
      dispatch(userLogin(userCredentialsObject));
    } else if (userCredentialsObject.userType === "admin") {
      dispatch(adminLogin(userCredentialsObject));
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const userType = localStorage.getItem("userType");
      navigate("/userdashboard");
    } else if (adminIsSuccess) {
      navigate("/admindashboard");
    }
  }, [isSuccess, adminIsSuccess]);

  const handleForgotPasswordSubmit = async () => {
    try {
      const response = await axios.post(apiUrl+'/user-api/forgotpassword', {
        username,
        securityQuestion,
      });
      console.log(response)
      if (response.data.message === "Username and Security Matched") {
        setShowModal(false);
        setShowPasswordModal(true);
      } else {
        setForgotPasswordError(response.data.message);
      }
    } catch (error) {
      setForgotPasswordError("Failed to submit. Please try again.");
    }
  };

  const handlePasswordChangeSubmit = async () => {
    try {
      setsecondforgotPasswordError("")
      const response = await axios.put(apiUrl+'user-api/change-password', {
        username,
        newPassword,
      });
      alert("Password updated successfully")
      setShowPasswordModal(false);
    } catch (error) {
      setsecondforgotPasswordError("Failed to update password. Please try again.");
    }
  };

  return (
    <div className="container">
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
              {errors.username && (
                <p className="text-danger">* Username is required</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter Password"
                {...register("password", { required: true })}
              />
              {errors.password && (
                <p className="text-danger">* Password is required</p>
              )}
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button
                // className="general_button"
                onClick={handleForgotPassword}
                variant="link"
              >
                Forgot Password?
              </Button>
              <Button
                className="general_button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading || adminIsLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Login"
                )}
              </Button>
            </div>


            {isError && <Alert variant="danger">{errMsg}</Alert>}
          </Form>

          {/* Forgot Password Modal */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Forgot Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Security Question</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Security Question (e.g., Favorite Number)"
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                  />
                </Form.Group>
              </Form>
              {forgotPasswordError && (
                <Alert variant="danger">{forgotPasswordError}</Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
              <Button variant="primary" onClick={handleForgotPasswordSubmit}>
                Submit
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Password Change Modal */}
          <Modal show={showPasswordModal} onHide={handleClosePasswordModal}>
            <Modal.Header closeButton>
              <Modal.Title>Change Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Form.Group>
              </Form>
              {secondforgotPasswordError && (
                <Alert variant="danger">{secondforgotPasswordError}</Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClosePasswordModal}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={handlePasswordChangeSubmit}
                disabled={!newPassword || newPassword !== confirmPassword}
              >
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
