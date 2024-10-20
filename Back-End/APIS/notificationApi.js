const exp = require("express");
const notificationApp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
require("dotenv").config();
const { ObjectId } = require('mongodb');


notificationApp.use(exp.json());
notificationApp.use(exp.urlencoded({ extended: true }));

//Message API Routes
notificationApp.get(
    "/get-notifications/:username",
    expressAsyncHandler(async (request, response) => {
        try {
            console.log("Hi")
            let notificationsCollectionObject = request.app.get("notificationsCollectionObject");
            const user = request.params.username;
            const your_notifications = await notificationsCollectionObject.find({ $or: [{ recipient: user }, { recipient: "all" }] }).toArray();
            response.send({ message: "notification list", payload: { your_notifications } });
        } catch (error) {
            console.log("Error getting notifications ", error);
            response.status(500).send({ message: "Internal server error" });
        }
    })
);

notificationApp.delete(
    "/delete-notification/:id",
    expressAsyncHandler(async (request, response) => {
        try {
            let notificationsCollectionObject = request.app.get("notificationsCollectionObject");
            const notificationId = request.params.id;

            // Remove the notification from the database
            const result = await notificationsCollectionObject.deleteOne({ _id: new ObjectId(notificationId) });

            if (result.deletedCount === 1) {
                response.send({ message: "Notification deleted successfully" });
            } else {
                response.status(404).send({ message: "Notification not found" });
            }
        } catch (error) {
            console.log("Error deleting notification ", error);
            response.status(500).send({ message: "Internal server error" });
        }
    })
);


module.exports = notificationApp;
