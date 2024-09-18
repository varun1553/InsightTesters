//create router to handle user api reqs
const exp = require("express");
const postApp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
const { ObjectId } = require('mongodb');
require("dotenv").config();
const verifyToken = require('./middlewares/verifyToken')
postApp.use(exp.json());
postApp.use(exp.urlencoded());


postApp.post(
  "/new-post",
  expressAsyncHandler(async (request, response) => {
    //get postCollectionObject
    let postCollectionObject = request.app.get("postCollectionObject");
    let notificationsCollectionObject = request.app.get("notificationsCollectionObject");

    //get newPostObj as string from client and convert into object
    let newPostObj;
    console.log("Received postObj data:", request.body.postObj);
    try {
      // Try to parse the JSON string
      newPostObj = JSON.parse(request.body.postObj);
    } catch (error) {
      // If parsing fails, handle the error (e.g., log it)
      console.error("Error parsing JSON:", error);
      response.status(400).send({ message: "Invalid JSON data" });
      return;
    }

    // Insert the new post object into the database
    await postCollectionObject.insertOne(newPostObj);
    const recipient = "all";
    const message_notify = newPostObj.createdBy + " added a new post";
    const user_type = "user";
    const m_p_type = "post"
    await notificationsCollectionObject.insertOne({ recipient, message_notify, user_type, m_p_type, createdAt: Date.now() })
    response.send({ message: "New Post created" });
  })
);

postApp.post(
  "/reportpost/:postId",
  expressAsyncHandler(async (request, response) => {
    // Get postCollectionObject
    let postCollectionObject = request.app.get("postCollectionObject");
    let reportPostCollectionObject = request.app.get("reportPostCollectionObject");

    const postId = request.params.postId;

    try {
      // Check if the post with the given postId exists
      const post = await postCollectionObject.findOne({ _id: new ObjectId(postId) });
      console.log(post)
      if (!post) {
        response.status(404).send({ message: "Post not found" });
        return;
      }

      // Check if the post already exists in reportPostCollectionObject
      const existingReport = await reportPostCollectionObject.findOne({ "post._id": post._id });
      if (existingReport) {
        // If the post exists, increase the count
        await reportPostCollectionObject.updateOne({ "post._id": post._id }, { $inc: { count: 1 } });
      } else {
        // If the post does not exist, insert it with count 1
        await reportPostCollectionObject.insertOne({ post, count: 1 });
      }

      response.send({ message: "Post reported successfully" });
    } catch (error) {
      console.error("Error reporting post:", error);
      response.status(500).send({ message: "Internal server error" });
    }
  })
);

postApp.get("/reportedposts", expressAsyncHandler(async (request, response) => {
  try {
    const reportPostCollectionObject = request.app.get("reportPostCollectionObject");
    const reportedPosts = await reportPostCollectionObject.find().toArray();
    response.json(reportedPosts);
  } catch (error) {
    console.error("Error fetching reported posts:", error);
    response.status(500).json({ message: "Internal server error" });
  }
}));



postApp.put(
  "/edit-post/:postId",
  expressAsyncHandler(async (request, response) => {
    try {
      const postId = request.params.postId;
      const { title, content, category } = request.body; // Assuming these are the fields you want to update

      // Get postCollectionObject
      let postCollectionObject = request.app.get("postCollectionObject");

      // Check if the post with the given postId exists
      const post = await postCollectionObject.findOne({ _id: new ObjectId(postId) });
      if (!post) {
        return response.status(404).send({ message: "Post not found" });
      }

      // Update the post with the new values
      await postCollectionObject.updateOne(
        { _id: new ObjectId(postId) },
        { $set: { title, content, category } }
      );

      response.send({ message: "Post updated successfully" });
    } catch (error) {
      console.error("Error updating post:", error);
      response.status(500).send({ message: "Internal server error" });
    }
  })
);


const ITEMS_PER_PAGE = 10;

postApp.get(
  "/posts",
  expressAsyncHandler(async (request, response) => {
    let postCollectionObject = request.app.get("postCollectionObject");

    // Parse query parameters
    const page = parseInt(request.query.page) || 1; // Current page, default to 1
    const currentUser = request.query.currentUser; // Get currentUser parameter

    // Calculate skip value for pagination
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Construct the query object based on currentUser parameter
    let query = {};
    if (currentUser) {
      // Fetch posts excluding the ones created by the current user
      query.createdBy = { $ne: currentUser };
    }

    let totalPosts = await postCollectionObject.countDocuments(query);
    let totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);

    // Fetch posts for the current page
    let posts = await postCollectionObject.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .toArray();

    response.send({ message: "Posts list", payload: { posts, totalPages } });
  })
);




postApp.delete(
  "/delete-post/:postId",
  expressAsyncHandler(async (request, response) => {
    // Get postCollectionObject
    let postCollectionObject = request.app.get("postCollectionObject");

    const postId = request.params.postId;

    try {
      // Check if the post with the given postId exists
      const post = await postCollectionObject.findOne({ _id: new ObjectId(postId) });
      console.log(post)
      if (!post) {
        response.status(404).send({ message: "Post not found" });
        return;
      }

      // Delete the post
      await postCollectionObject.deleteOne({ _id: new ObjectId(postId) });

      response.send({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      response.status(500).send({ message: "Internal server error" });
    }
  })
);

postApp.delete(
  "/report-post-delete/:reportpostId",
  expressAsyncHandler(async (request, response) => {
    let reportPostCollectionObject = request.app.get("reportPostCollectionObject");
    let notificationsCollectionObject = request.app.get("notificationsCollectionObject");

    const postId = request.params.reportpostId;
    try {
      const post = await reportPostCollectionObject.findOne({ _id: new ObjectId(postId) });
      console.log(post)
      if (!post) {
        response.status(404).send({ message: "Post not found" });
        return;
      }

      const recipient = post.post.createdBy;
      const message_notify = "Your post with title " + post.post.title + " is deleted by admin";
      const user_type = "user";
      const m_p_type = "post"
      await notificationsCollectionObject.insertOne({ recipient, message_notify, user_type, m_p_type, createdAt: Date.now() })

      await reportPostCollectionObject.deleteOne({ _id: new ObjectId(postId) });

      response.send({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      response.status(500).send({ message: "Internal server error" });
    }
  })
);

postApp.put(
  "/setlike/:postId/:username",
  expressAsyncHandler(async (request, response) => {
    try {
      const postId = request.params.postId;
      const postCollectionObject = request.app.get("postCollectionObject");
      const likeCollectionObject = request.app.get("likeCollectionObject");
      const notificationsCollectionObject = request.app.get("notificationsCollectionObject");

      // Get the current user's username (you need to implement user authentication to get the username)
      const username = request.params.username; // Example: request.user.username

      // Check if the post is already liked by the current user
      const existingLike = await likeCollectionObject.findOne({ postId, username });
      if (existingLike) {
        // Post already liked by the user, so decrease the like count and remove the like
        await postCollectionObject.updateOne({ _id: new ObjectId(postId) }, { $inc: { likecount: -1 } });
        await likeCollectionObject.deleteOne({ postId, username });
        response.status(200).json({ message: 'Like removed successfully', liked: false });
      } else {
        // Post not liked by the user, so increase the like count and add the like
        await postCollectionObject.updateOne({ _id: new ObjectId(postId) }, { $inc: { likecount: 1 } });
        await likeCollectionObject.insertOne({ postId, username });
        response.status(200).json({ message: 'Like added successfully', liked: true });

        // Find the post in the postCollectionObject to get the createdBy field
        const post = await postCollectionObject.findOne({ _id: new ObjectId(postId) });
        const recipient = post.createdBy;
        const message_notify = username + ' liked your post'
        const user_type = "user";
        const m_p_type = "like";
        await notificationsCollectionObject.insertOne({ recipient, message_notify, user_type, m_p_type, createdAt: Date.now() });
      }
    } catch (error) {
      console.error('Error increasing like count:', error);
      response.status(500).json({ message: 'Internal server error' });
    }
  })
);

postApp.get('/getlikepost/:postId/:username',
  expressAsyncHandler(async (request, response) => {
    try {
      const postId = request.params.postId;
      const username = request.params.username;
      const likeCollectionObject = request.app.get("likeCollectionObject");

      const existingLike = await likeCollectionObject.findOne({ postId, username });
      const liked = !!existingLike; // Convert existingLike to boolean

      // Fetch like count from postCollectionObject
      const postCollectionObject = request.app.get("postCollectionObject");
      const post = await postCollectionObject.findOne({ _id: new ObjectId(postId) });
      const likecount = post ? post.likecount : 0;

      response.status(200).json({ liked, likecount });
    } catch (error) {
      console.error('Error checking if post is liked:', error);
      response.status(500).json({ message: 'Internal server error' });
    }
  })
);





//private route for testing
postApp.get('/test', verifyToken, (request, response) => {
  response.send({ message: "This reply is from private route" })
})

//create a route to modify user data

//create a route to delete user by username

//export userApp
module.exports = postApp;