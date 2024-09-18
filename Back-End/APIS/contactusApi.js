const exp = require("express");
const contactusApp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
require("dotenv").config();

contactusApp.use(exp.json());
contactusApp.use(exp.urlencoded({ extended: true }));

//Message API Routes
contactusApp.post(
    "/send-inquiry",
    expressAsyncHandler(async (request, response) => {
        const { name, email, subject, message }  = request.body;
        try {
            let contactusCollectionObject = request.app.get("contactusCollectionObject");

            await contactusCollectionObject.insertOne({ name, email, subject, message } );

            response.status(201).json({ message: 'Sent successfully' });
        } catch (error) {
            console.error('Error sending message:', error);
            // Respond with error message
            response.status(500).json({ message: 'Failed to send message' });
        }
    })
);

contactusApp.get(
    "/get-inquiry",
    expressAsyncHandler(async (request, response) => {
        try {
            let contactusCollectionObject = request.app.get("contactusCollectionObject");

            const inquires = await contactusCollectionObject.find().toArray(); 
            response.json(inquires);

        } catch (error) {
            console.error('Error sending message:', error);
            response.status(500).json({ message: 'Failed to send message' });
        }
    })
);

module.exports = contactusApp;
