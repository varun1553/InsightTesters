//create router to handle user api reqs
const exp = require("express");
const eventApp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
require("dotenv").config();
eventApp.use(exp.json());
eventApp.use(exp.urlencoded());
const { ObjectId } = require('mongodb');


eventApp.post(
  "/new-event",
  expressAsyncHandler(async (request, response) => {
    //get eventCollectionObject
    let eventCollectionObject = request.app.get("eventCollectionObject");

    //get newEventObj as string from client and convert into object
    let newEventObj;
    console.log("Received eventObj data:", request.body.eventObj);
    try {
      // Try to parse the JSON string
      newEventObj = JSON.parse(request.body.eventObj);
    } catch (error) {
      // If parsing fails, handle the error (e.g., log it)
      console.error("Error parsing JSON:", error);
      response.status(400).send({ message: "Invalid JSON data" });
      return;
    }

    // Insert the new event object into the database
    await eventCollectionObject.insertOne(newEventObj);
    response.send({ message: "New Event created" });
  })
);

const ITEMS_PER_PAGE = 10;

eventApp.get(
  "/events",
  expressAsyncHandler(async (request, response) => {
    let eventCollectionObject = request.app.get("eventCollectionObject");

    // Parse query parameters
    const page = parseInt(request.query.page) || 1; // Current page, default to 1

    // Calculate skip value for pagination
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Query to retrieve events based on visibility and pagination

    let totalevents = await eventCollectionObject.countDocuments();
    let totalPages = Math.ceil(totalevents / ITEMS_PER_PAGE);

    // Fetch events for the current page
    let events = await eventCollectionObject.find()
      .sort({ createdAt: -1 }) // Sort by creation date, latest first
      .skip(skip) // Skip events for pagination
      .limit(ITEMS_PER_PAGE) // Limit number of events per page
      .toArray();

    response.send({ message: "Events list", payload: { events, totalPages } });
  })
);

eventApp.delete(
  '/events/:eventId',
  expressAsyncHandler(async (request, response) => {
    // Extract the event ID from the request parameters
    const eventId = request.params.eventId;

    try {
      let eventCollectionObject = request.app.get("eventCollectionObject");
      // Delete the event from the database
      const result = await eventCollectionObject.deleteOne({ _id: new ObjectId(eventId) });

      if (result.deletedCount === 1) {
        // If event was deleted successfully
        response.status(200).send({ message: 'Event deleted successfully' });
      } else {
        // If event with the provided ID was not found
        response.status(404).send({ message: 'Event not found' });
      }
    } catch (error) {
      // If an error occurs during deletion
      console.error('Error deleting event:', error);
      response.status(500).send({ message: 'Internal Server Error' });
    }
  })
);


eventApp.put(
  "/update-events/:eventId",
  expressAsyncHandler(async (request, response) => {
    const eventId = request.params.eventId;
    const { event_name, location, dateTime, ticketPrice } = request.body;
    console.log(eventId)

    try {
      const eventCollectionObject = request.app.get("eventCollectionObject");

      let updatedEvent;

      if (event_name !== null && event_name !== "") {
        updatedEvent = await eventCollectionObject.findOneAndUpdate(
          { _id: new ObjectId(eventId) },
          { $set: { event_name } },
          { new: true }
        );
      }
      if (location !== null && location !== "") {
        updatedEvent = await eventCollectionObject.findOneAndUpdate(
          { _id:new ObjectId(eventId)},
          { $set: { location } },
          { new: true }
        );
      }
      if (dateTime !== null && dateTime !== "") {
        updatedEvent = await eventCollectionObject.findOneAndUpdate(
          { _id:new ObjectId(eventId)},
          { $set: { dateTime } },
          { new: true }
        );
      }
      if (ticketPrice !== null && ticketPrice !== "") {
        updatedEvent = await eventCollectionObject.findOneAndUpdate(
          { _id:new ObjectId(eventId)},
          { $set: { ticketPrice } },
          { new: true }
        );
      }

      if (!updatedEvent) {
        return response.status(404).json({ message: 'Event not found' });
      }

      response.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
      console.error('Error updating event:', error);
      response.status(500).json({ message: 'Internal server error' });
    }
  })
);


module.exports = eventApp;