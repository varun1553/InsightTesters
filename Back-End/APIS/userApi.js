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

//create route to handle '/getusers' path
userApp.get(
  "/getusers", verifyToken,
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
      response.send({ message: "Invalid user" });
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
  const { name, email, username, original_username } = req.body; 

  try {
    const userCollectionObject = req.app.get("userCollectionObject");

    let updatedUserName, updatedUserEmail, updatedUsername;

    if (name !== null && name !== "") {
      updatedUserName = await userCollectionObject.findOneAndUpdate(
        { username: original_username },
        { $set: {name} },
        { new: true }
      );
    }
    if (email !== null && email !== "" ) {
      updatedUserEmail = await userCollectionObject.findOneAndUpdate(
        { username: original_username },
        { $set: {email} },
        { new: true }
      );
    }
    if (username !== null && username !== "" ){
      updatedUsername = await userCollectionObject.findOneAndUpdate(
        { username: original_username },
        { $set: {username} },
        { new: true }
      );
    }

    if (!updatedUserName && !updatedUserEmail && !updatedUsername) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = updatedUserName || updatedUserEmail || updatedUsername;

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

// userApp.put("/changepassword", expressAsyncHandler(async (request, response) => {
//   // Extract username and new password from the request body
//   const { username, newPassword } = request.body;

//   try {
//     const userCollectionObject = request.app.get("userCollectionObject");
//     const user = await userCollectionObject.findOne({ username });
//     if (!user) {
//       return response.status(404).json({ message: "User not found" });
//     }

//     const hashedPassword = await bcryptjs.hash(newPassword, 6);

//     await userCollectionObject.updateOne({ username }, { $set: { password: hashedPassword } });

//     response.status(200).json({ message: "Password updated successfully" });
//   } catch (error) {
//     console.error("Error updating password:", error);
//     response.status(500).json({ message: "Failed to update password" });
//   }

// }));

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