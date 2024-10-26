import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Button, Container } from "react-bootstrap";
import { MdLogin } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const apiUrl = process.env.REACT_APP_URL;

function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [formStep, setFormStep] = useState(1);
  const [email, setEmail] = useState('');
  const [sentVerificationCode, setSentVerificationCode] = useState('');

  const onFormSubmit = async (userObj) => {
    if (!isVerified) {
      alert("Please verify your email first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userObj", JSON.stringify(userObj));

      const response = await axios.post(`${apiUrl}/user-api/create-user`, formData, {
        headers: {
          "Content-Type": 'application/json',
        },
      });

      alert(response.data.message);
      if (response.data.message === "New User created") {
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong in creating user");
    }
  };

  const handleSendVerification = async (email) => {
    try {
      const response = await axios.post(`${apiUrl}/user-api/signup-send-verification-code`, { email });
      setSentVerificationCode(response.data.verificationCode);
      setVerificationSent(true);
      alert("Verification code sent to your email!");
      setFormStep(2);
    } catch (error) {
      console.error("Error sending verification code:", error);
      alert("Failed to send verification code.");
    }
  };

  const handleVerifyEmail = () => {
    if (verificationCode === sentVerificationCode) {
      setIsVerified(true);
      alert("Email verified successfully! You can now proceed to sign up.");
    } else {
      setVerificationError("Invalid verification code. Please try again.");
    }
  };

  return (
    <Container>
      <div className="display-2 text-center text-primary">Signup</div>
      <div className="row">
        <div className="col-12 col-sm-8 col-md-6 mx-auto">
          {formStep === 1 && (
            <Form onSubmit={handleSubmit((data) => {
              setEmail(data.email);
              handleSendVerification(data.email);
            })}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="name">Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your Name"
                  {...register("name", { required: true })}
                  id="name"
                />
                {errors.name && <p className="text-danger">* Name is required</p>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="username">Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Username"
                  {...register("username", { required: true })}
                  id="username"
                />
                {errors.username && <p className="text-danger">* Username is required</p>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="password">Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter Password"
                  {...register("password", { required: true })}
                  id="password"
                />
                {errors.password && <p className="text-danger">* Password is required</p>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="email">Email</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter email"
                  {...register("email", {
                    required: true,
                    pattern: {
                     // value: /^[a-zA-Z0-9._%+-]+@my\.unt\.edu$/,
                      //message: "Please enter a valid @my.unt.edu email address",
                    },
                  })}
                  id="email"
                />
                {errors.email && <p className="text-danger">{errors.email.message}</p>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="city">City</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter city"
                  {...register("city", { required: true })}
                  id="city"
                />
                {errors.city && <p className="text-danger">* City is required</p>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="security">Security Question</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter any favourite number"
                  {...register("security", { required: true })}
                  id="security"
                />
                {errors.security && <p className="text-danger">* This Question is required</p>}
              </Form.Group>

              <Button variant="primary" type="submit">
                Send Verification Code to Email
              </Button>
            </Form>
          )}

          {formStep === 2 && (
            <Form onSubmit={handleSubmit(onFormSubmit)}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="verificationCode">Verification Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  id="verificationCode"
                />
                {verificationError && <p className="text-danger">{verificationError}</p>}
              </Form.Group>

              <Button variant="secondary" onClick={handleVerifyEmail}>
                Verify Email
              </Button>

              {isVerified && (
                <Button className="general_button" variant="primary" type="submit">
                  Signup <MdLogin />
                </Button>
              )}
            </Form>
          )}
        </div>
      </div>
    </Container>
  );
}

export default Signup;
