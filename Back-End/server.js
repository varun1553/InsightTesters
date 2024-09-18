//create express app
const exp = require("express");
const app = exp();
const mclient=require("mongodb").MongoClient;
const cors = require("cors")

//import path modules 
const path=require('path');

app.use(cors());

//connect build of react app with nodejs
app.use(exp.static(path.join(__dirname,'../Front-End/build')))

//DB connection URL
const dbUrl='mongodb+srv://Varun:Varun@cluster0.klf74.mongodb.net/';

//connect with mongoDB server
mclient.connect(dbUrl)
.then((client)=>{

  //get DB object
  let dbObj=client.db("commondatabase");

  //create collection objects
  let userCollectionObject=dbObj.collection("usercollection");
  let adminCollectionObject=dbObj.collection("admincollection");
  let postCollectionObject=dbObj.collection("postcollection");
  let reportPostCollectionObject=dbObj.collection("reportpostcollection");
  let messageCollectionObject=dbObj.collection("messagecollection");
  let contactusCollectionObject=dbObj.collection("contactuscollection");
  let broadcastCollectionObject=dbObj.collection("broadcastcollection");
  let notificationsCollectionObject=dbObj.collection("notificationscollection");
  let likeCollectionObject=dbObj.collection("likeCollectionObject");
  let commentCollectionObject = dbObj.collection("commentcollection");
  let ticketCollectionObject = dbObj.collection("ticketcollection");
  let donationCollectionObject = dbObj.collection("donationcollection");
  let eventCollectionObject=dbObj.collection("eventcollection");

  //sharing collection objects to APIs
  app.set("userCollectionObject",userCollectionObject);
  app.set("adminCollectionObject",adminCollectionObject);
  app.set('postCollectionObject',postCollectionObject)
  app.set("reportPostCollectionObject",reportPostCollectionObject);
  app.set("messageCollectionObject",messageCollectionObject);
  app.set("contactusCollectionObject",contactusCollectionObject);
  app.set("broadcastCollectionObject",broadcastCollectionObject);
  app.set("notificationsCollectionObject",notificationsCollectionObject);
  app.set("likeCollectionObject",likeCollectionObject);
  app.set("commentCollectionObject",commentCollectionObject);
  app.set("ticketCollectionObject", ticketCollectionObject);
  app.set("donationCollectionObject", donationCollectionObject);
  app.set('eventCollectionObject',eventCollectionObject)

  console.log("DB connection success")
})
.catch(err=>console.log('Error in DB connection ',err))


//import userApp and productApp
const userApp = require("./APIS/userApi");
const postApp = require('./APIS/postApi');
const adminApp = require("./APIS/adminApi");
const messageApp = require("./APIS/messageApi");
const contactusApp = require("./APIS/contactusApi");
const broadcastApp = require("./APIS/broadcastapi");
const notificationApp = require("./APIS/notificationApi");
const commentApp = require("./APIS/commentApi")
const eventApp=require("./APIS/eventApi")
const paymentApp = require("./APIS/paymentApi")
const donationApp = require("./APIS/donationApi")
//excute specific middleware based on path
app.use("/user-api", userApp);
app.use("/post-api", postApp);
app.use("/admin-api", adminApp);
app.use("/message-api", messageApp);
app.use("/contactus-api", contactusApp);
app.use("/broadcast-api", broadcastApp);
app.use("/notification-api",notificationApp);
app.use("/comment-api", commentApp);
app.use("/event-api", eventApp);
app.use("/payment-api", paymentApp);
app.use("/donation-api", donationApp);

// dealing with page refresh
app.use('/',(request,response)=>{
  response.sendFile(path.join(__dirname,'../Front-End/build'))
})


//handling invalid paths
app.use((request, response, next) => {
  response.send({ message: `path ${request.url} is invalid` });
});

//error handling middleware
app.use((error, request, response, next) => {
  response.send({ message: "Error occurred", reason: `${error.message}` });
});

//assign port number
const port=4000;
app.listen(port, () => console.log(`Web server listening on port ${port}`));
