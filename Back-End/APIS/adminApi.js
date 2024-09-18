const exp = require("express");
const adminApp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
require("dotenv").config();

adminApp.use(exp.json());
adminApp.use(exp.urlencoded({ extended: true }));

//Admin API Routes
adminApp.post(
    "/login",
    expressAsyncHandler(async (request, response) => {
        let adminCollectionObject = request.app.get("adminCollectionObject");
        let adminCredObj = request.body;
        console.log(adminCredObj)

        try {
            let adminOfDB = await adminCollectionObject.findOne({
                username: adminCredObj.username,
            });

            if (!adminOfDB) {
                return response.status(400).json({ message: "Invalid user" });
            }

            if (adminCredObj.password !== adminOfDB.password) {
                return response.status(400).json({ message: "Invalid password" });
            }

            let token = jwt.sign(
                { username: adminOfDB.username },
                'mySecretKey',
                { expiresIn: "1h" }
            );

            response.status(200).json({
                message: "success",
                payload: token,
                adminObj: adminOfDB,
            });
        } catch (error) {
            console.error("Error during admin login:", error);
            response.status(500).json({ message: "Internal server error" });
        }
    })
);

module.exports = adminApp;
