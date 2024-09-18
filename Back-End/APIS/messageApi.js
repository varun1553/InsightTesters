const exp = require("express");
const messageApp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
require("dotenv").config();

messageApp.use(exp.json());
messageApp.use(exp.urlencoded({ extended: true }));

//Message API Routes
messageApp.post(
    "/send-message",
    expressAsyncHandler(async (request, response) => {
        const { sender, recipient, content } = request.body;
        try {
            let messageCollectionObject = request.app.get("messageCollectionObject");
            let notificationsCollectionObject = request.app.get("notificationsCollectionObject");

            await messageCollectionObject.insertOne({sender, recipient, content});
            const message_notify = "You have received a new message from "+ sender;
            const user_type = "user";
            const m_p_type ="message";
            await notificationsCollectionObject.insertOne({recipient, message_notify, user_type,m_p_type, createdAt: Date.now() })

            response.status(201).json({ message: 'Message sent successfully' });
        } catch (error) {
            console.error('Error sending message:', error);
            // Respond with error message
            response.status(500).json({ message: 'Failed to send message' });
        }
        
    })
);

const pageSize = 10;
messageApp.get(
    "/messages/:user",
    expressAsyncHandler(async (request, response) => {
        try {
            const user = request.params.user;
            const page = parseInt(request.query.page || 1);

            let messageCollectionObject = request.app.get("messageCollectionObject");

            const skip = (page - 1) * pageSize;

            const messages = await messageCollectionObject.find({ recipient: user })
                                                      .skip(skip)
                                                      .limit(pageSize)
                                                      .toArray();

            const totalMessages = await messageCollectionObject.countDocuments({ recipient: user });

            const totalPages = Math.ceil(totalMessages / pageSize);            

            response.json({ messages, totalPages });
        } catch (error) {
            console.error('Error fetching messages:', error);
            response.status(500).json({ message: 'Failed to fetch messages' });
        }
        
    })
);

module.exports = messageApp;
