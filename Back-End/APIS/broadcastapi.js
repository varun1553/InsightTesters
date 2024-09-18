const exp = require("express");
const broadcastApp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
require("dotenv").config();

broadcastApp.use(exp.json());
broadcastApp.use(exp.urlencoded({ extended: true }));

//Message API Routes
broadcastApp.post(
    "/send-message",
    expressAsyncHandler(async (request, response) => {
        const { message } = request.body;
        try {
            let broadcastCollectionObject = request.app.get(
                "broadcastCollectionObject"
            );
            let notificationsCollectionObject = request.app.get("notificationsCollectionObject");

            await broadcastCollectionObject.insertOne({
                message: message,
            });
            const message_notify = "You have received a new message from admin";
            const recipient = "all";
            const user_type = "admin";
            const m_p_type ="message";
            await notificationsCollectionObject.insertOne({recipient, message_notify, user_type, m_p_type, createdAt: Date.now() })

            response.status(201).json({ message: "Sent successfully" });
        } catch (error) {
            console.error("Error sending message:", error);
            response.status(500).json({ message: "Failed to send message" });
        }
    })
);

broadcastApp.get(
    "/all-messages",
    expressAsyncHandler(async (request, response) => {
        try {
            let broadcastCollectionObject = request.app.get("broadcastCollectionObject");

            const allmsgs = await broadcastCollectionObject.find().toArray(); 
            response.json(allmsgs);

        } catch (error) {
            console.error('Error sending message:', error);
            response.status(500).json({ message: 'Failed to send message' });
        }
    })
);

module.exports = broadcastApp;
