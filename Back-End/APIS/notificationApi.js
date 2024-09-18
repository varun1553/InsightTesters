const exp = require("express");
const notificationApp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
require("dotenv").config();

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



module.exports = notificationApp;
