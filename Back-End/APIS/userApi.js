//create router to handle user api reqs
const exp = require("express");
const userApp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
//import bcryptjs for password hashing
const bcryptjs = require("bcryptjs");
//import jsonwebtoken to create token
const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyToken = require('./middlewares/verifyToken')

//to extract body of request object
userApp.use(exp.json());
userApp.use(exp.urlencoded());

//USER API Routes

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mahankalifamily4@gmail.com',
    pass: 'ycca smtu hgox clmk', // Use App Password if 2-Step Verification is enabled
  },
});

transporter.sendMail({
  from: 'mahankalifamily4@gmail.com',
  to: 'varun.mahankali39@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email.',
}, (error, info) => {
  if (error) {
    return console.log('Error:', error);
  }
  console.log('Email sent:', info.response);
});

// Middleware to extract body of request object
userApp.use(exp.json());
userApp.use(exp.urlencoded());

// Send verification code
userApp.post("/send-verification-code", expressAsyncHandler(async (req, res) => {
  const { email, username } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification Code',
      text: `Your verification code is ${verificationCode}`,
    });

    // Send the verification code in the response
    res.status(200).json({ message: 'Verification code sent', verificationCode });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ message: 'Error sending verification code', error: error.message });
  }
}));


userApp.post("/verifying-and-send-code", expressAsyncHandler(async (req, res) => {
  const { email, username } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const userCollectionObject = req.app.get("userCollectionObject");
    // Find the user by username
    const user = await userCollectionObject.findOne({ username });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the email matches the user's email
    if (user.email !== email) {
      return res.status(400).json({ message: 'Email does not match the username' });
    }

    // Send the verification code to the user's email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification Code',
      text: `Your verification code is ${verificationCode}`,
    });

    // Send the verification code in the response
    res.status(200).json({ message: 'Verification code sent', verificationCode });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ message: 'Error sending verification code', error: error.message });
  }
}));



userApp.post("/signup-send-verification-code", expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log("Email for verification code:", email); // Log the email

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Send the verification code via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification Code',
      text: `Your verification code is ${verificationCode}`,
    });

    console.log("Verification code sent to:", verificationCode); // Log when the email is sent

    // Save the verification code to the database
    const userCollectionObject = req.app.get("userCollectionObject");
    //await userCollectionObject.updateOne({ email }, { $set: { verificationCode } });

    res.status(200).json({ message: 'Verification code sent', verificationCode }); // Return the verification code
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ message: 'Error sending verification code', error: error.message });
  }
}));


// Verify email
userApp.post("/verify-email", expressAsyncHandler(async (req, res) => {
  const { email, verificationCode, username } = req.body;

  try {
    const userCollectionObject = req.app.get("userCollectionObject");
    console.log("Hi")
    const user = await userCollectionObject.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verificationCode === verificationCode) {
      await userCollectionObject.updateOne({ username }, { $set: { isEmailVerified: true } });
      res.status(200).json({ verified: true });
    } else {
      res.status(400).json({ verified: false, message: 'Invalid verification code' });
    }
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
}));



//create route to handle '/getusers' path
userApp.get(
  "/getusers",
  expressAsyncHandler(async (request, response) => {
    //get userCollectionObject
    let userCollectionObject = request.app.get("userCollectionObject");
    //get all users
    let users = await userCollectionObject.find().toArray();
    //send res
    response.send({ message: "Users list", payload: users });
  })
);

//create route to user login
userApp.post(
  "/login",
  expressAsyncHandler(async (request, response) => {
    //get userCollectionObject
    let userCollectionObject = request.app.get("userCollectionObject");
    //get user credentials obj from client
    let userCredObj = request.body;
    //seacrh for user by username
    let userOfDB = await userCollectionObject.findOne({
      username: userCredObj.username,
    });
    //if username not existed
    if (userOfDB == null) {
      response.send({ message: "Invalid username" });
    }
    //if username existed
    else {
      //compare passwords
      let status = await bcryptjs.compare(
        userCredObj.password,
        userOfDB.password
      );
      //if passwords not matched
      if (status == false) {
        response.send({ message: "Invalid password" });
      }
      //if passwords are matched
      else {
        //create token
        let token = jwt.sign(
          { username: userOfDB.username },
          'mySecretKey',
          { expiresIn: 10 }
        );
        //send token
        response.send({
          message: "success",
          payload: token,
          userObj: userOfDB,
        });
      }
    }
  })
);

userApp.put('/editprofile', expressAsyncHandler(async (req, res) => {
  const { name, email, username, original_username, linkedIn, leetCode, gitHub, degree, courses } = req.body; 

  try {
    const userCollectionObject = req.app.get("userCollectionObject");

    let updateFields = {}; // Create an object to store the fields to update

    // Update name if it's provided
    if (name && name.trim() !== "") {
      updateFields.name = name;
    }

    // Update email if it's provided
    if (email && email.trim() !== "") {
      updateFields.email = email;
    }

    // Update username if it's provided
    if (username && username.trim() !== "") {
      updateFields.username = username;
    }

    // Update LinkedIn if it's provided
    if (linkedIn && linkedIn.trim() !== "") {
      updateFields.linkedIn = linkedIn;
    }

    // Update LeetCode if it's provided
    if (leetCode && leetCode.trim() !== "") {
      updateFields.leetCode = leetCode;
    }

    // Update GitHub if it's provided
    if (gitHub && gitHub.trim() !== "") {
      updateFields.gitHub = gitHub;
    }

    // Update degree if it's provided
    if (degree && degree.trim() !== "") {
      updateFields.degree = degree;
    }

    // Update courses if it's provided
    if (courses && courses.trim() !== "") {
      updateFields.courses = courses;
    }

    // Check if there are any fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Update the user's profile with the new fields
    const updatedUser = await userCollectionObject.findOneAndUpdate(
      { username: original_username },
      { $set: updateFields },
      { new: true }
    );

    // If no user is found with the provided original_username
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}));




userApp.put("/change-password", expressAsyncHandler(async (request, response) => {
  // Extract username and new password from the request body
  const { username, newPassword } = request.body;

  try {
    const userCollectionObject = request.app.get("userCollectionObject");
    const user = await userCollectionObject.findOne({ username });
    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 6);

    await userCollectionObject.updateOne({ username }, { $set: { password: hashedPassword } });

    response.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    response.status(500).json({ message: "Failed to update password" });
  }

}));

userApp.post("/verify-username", expressAsyncHandler(async (request, response) => {
  // Extract username from the request body
  const { username } = request.body;

  try {
    const userCollectionObject = request.app.get("userCollectionObject");
    // Find the user by username
    const user = await userCollectionObject.findOne({ username });

    // Check if user exists
    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    // If user exists, respond with a success message
    return response.status(200).json({ message: "Username verified successfully" });

  } catch (error) {
    console.error("Error verifying username:", error);
    return response.status(500).json({ message: "Error verifying username" });
  }
}));


userApp.post("/forgotpassword", expressAsyncHandler(async (request, response) => {
  // Extract username and new password from the request body
  const { username, securityQuestion } = request.body;

  try {
    const userCollectionObject = request.app.get("userCollectionObject");
    const user = await userCollectionObject.findOne({ username });
    if (!user) {
      response.status(404).json({ message: "User not found" });
    }

    if(user.security === securityQuestion){
      response.status(200).json({message: "Username and Security Matched"})
    }
    else{
      response.status(404).json({message: "Security answer is not matched"})
    }

    
  } catch (error) {
    console.error("Error updating password:", error);
    response.status(500).json({ message: "Failed to update password" });
  }

}));

userApp.post(
  "/create-user",
  expressAsyncHandler(async (request, response) => {
    //console.log(request.file.path);
    //get userCollectionObject
    let userCollectionObject = request.app.get("userCollectionObject");
    //get userObj as string from client and convert into object
    let newUserObj;
    console.log("Received userObj data:", request.body.userObj);
    try {
      // Try to parse the JSON string
      console.log("hi")
      newUserObj = JSON.parse(request.body.userObj);
    } catch (error) {
      // If parsing fails, handle the error (e.g., log it)
      console.error("Error parsing JSON:", error);
      response.status(400).send({ message: "Invalid JSON data" });
      return;
    }
    newUserObj.verificationCode = null; 

    //seacrh for user by username
    let userOfDB = await userCollectionObject.findOne({
      username: newUserObj.username,
    });
    console.log(userOfDB)
    //if user existed
    if (userOfDB !== null) {
      response.send({
        message: "Username has already taken..Plz choose another",
      });
    }
    else {
      //hash password
      let hashedPassword = await bcryptjs.hash(newUserObj.password, 6);
      //replace plain password with hashed password in newUserObj
      newUserObj.password = hashedPassword;
      //insert newUser
      console.log(newUserObj)
      await userCollectionObject.insertOne(newUserObj);
      //send response
      response.send({ message: "New User created" });
    }
  })
);


//private route for testing
userApp.get('/test', verifyToken, (request, response) => {
  response.send({ message: "This reply is from private route" })
})

//create a route to modify user data

//create a route to delete user by username

//export userApp
module.exports = userApp;