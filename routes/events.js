import express, { response } from "express";
import { client } from "../index.js"
import { ObjectId } from 'mongodb';
const router = express.Router();



//get all events
router.get("/", async function (request, response) {
    const skip = request.query.skip ? Number(request.query.skip) : 0;
    const DEFAULT_LIMIT = 12;
    // const events = await client.db("Events").collection("events").find({}).sort({ _id: -1 }).toArray()
    const events = await client.db("Events").collection("events").find({}).sort({ _id: -1 }).skip(skip).limit(DEFAULT_LIMIT).toArray()
    events[0] ? response.send(events) : response.send({ msg: "No more events" });
})

//get event by id
router.get("/:id", async function (request, response) {
    // const { id } = request.params
    var reqId = request.params.id
    var id = reqId.toString();
    console.log(typeof (id))
    const event = await client.db("Events").collection("events").findOne({ _id: ObjectId(id) })
    // console.log(event)
    response.send(event);
})

//post bookings data
router.post("/bookings", async function (request, response) {
    const data = request.body;
    const bookings = await client.db("Events").collection("Bookings").insertOne(data);
    response.send(bookings)
})


//get billing  data  for the booked event by id
router.get("/billing/:id", async function (request, response) {
    const { id } = request.params
    const event = await client.db("Events").collection("Bookings").find({ id: id }).sort({ _id: -1 }).limit(1).toArray();
    response.send(event[0]);
})


//get events by location
router.get('/:place', async function (request, response) {
    const { place } = request.params;
    const events = await client.db("Events").collection("events").find({ city: place }).toArray();
    console.log(events)
    response.send(events)
})


router.post('/city', async (req, res) => {
    const { city } = req.body;
    // console.log(req.body);
    if (city === "Location") {
        const events = await client.db("Events").collection("events").find({}).sort({ _id: -1 }).toArray();
        res.send(events)
    } else {
        const events = await client.db("Events").collection("events").find({ city: city }).toArray();
        res.send(events)
    }


})


export const eventsRouter = router;