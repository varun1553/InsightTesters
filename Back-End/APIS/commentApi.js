const exp = require("express");
const commentApp = exp.Router();
const { ObjectId } = require('mongodb');
const expressAsyncHandler = require("express-async-handler");
require("dotenv").config();

commentApp.use(exp.json());
commentApp.use(exp.urlencoded({ extended: true }));
commentApp.post(
    "/post-comment",
    expressAsyncHandler(async (request, response) => {
        try {
            const { postId, username, content } = request.body;
            const commentCollectionObject = request.app.get("commentCollectionObject");
            const notificationsCollectionObject = request.app.get("notificationsCollectionObject");
            const postCollectionObject= request.app.get("postCollectionObject");

            const comment = {
                postId,
                username,
                content,
                createdAt: new Date(),
            };
            await commentCollectionObject.insertOne(comment);

            const post = await postCollectionObject.findOne({ _id: new ObjectId(postId) });

            const recipient = post.createdBy;
            const message_notify = username + ' commented on your post ' + content
            const user_type = "user";
            const m_p_type = "comment";
            await notificationsCollectionObject.insertOne({ recipient, message_notify, user_type, m_p_type, createdAt: Date.now() });

            response.status(201).json({ message: 'Comment posted successfully' });
        } catch (error) {
            console.error("Error posting comment:", error);
            response.status(500).json({ message: "Failed to post comment" });
        }
    })
);

commentApp.get(
    "/get-comments/:postId",
    expressAsyncHandler(async (request, response) => {
        try {
            const postId = request.params.postId;
            const commentCollectionObject = request.app.get("commentCollectionObject");
            const comments = await commentCollectionObject.find({ postId }).toArray();
            response.status(200).json(comments);
        } catch (error) {
            console.error("Error fetching comments:", error);
            response.status(500).json({ message: "Failed to fetch comments" });
        }
    })
);



module.exports = commentApp;
