import express, { response } from "express";
import { client } from "../index.js"
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';


const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


//add events
router.post("/addevent", async function (request, response) {
    const data = request.body;
    if (data.poster) {
        data.poster = await cloudinary.uploader.upload(data.poster, {
            upload_preset: "eventfinder"
        })
    }
    const result = await client.db("Events").collection("events").insertOne({ ...data, poster: data.poster.secure_url });
    response.send(result)
    console.log(result)
})



//get all users
router.get("/users", async function (request, response) {
    const events = await client.db("Events").collection("user").find({}).toArray()
    response.send(events);
})

//get all Bookings
router.get("/eventbookings", async function (request, response) {
    const events = await client.db("Events").collection("Bookings").find({}).toArray()
    response.send(events);
})


//update evnt by id
router.put('/editevent/:id', async function (request, response) {
    const { id } = request.params;
    console.log(id);
    const data = request.body;
    if (data.poster) {
        data.poster = await cloudinary.uploader.upload(data.poster, {
            upload_preset: "eventfinder"
        })
    }
    console.log(data);
    const event = await client.db("Events").collection("events").updateOne({ _id: ObjectId(id) }, {
        $set: {
            poster: data.poster.secure_url,
            name: data.name,
            place: data.place,
            about: data.about,
            language: data.language,
        }
    });
    response.send(event)
})


//delete event by id
router.delete("/delete/:id", async function (request, response) {
    const { id } = request.params
    const event = await client.db("Events").collection("events").deleteOne({ _id: ObjectId(id) })
    console.log(event)
    response.send({ msg: "deleted" })
})

export const adminRouter = router;