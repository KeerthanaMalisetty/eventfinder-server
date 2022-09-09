import express, { response } from "express";
import { client } from "../index.js"
import { ObjectId } from 'mongodb';
const router = express.Router();

//get bookings by id 
router.get("/bookings/:id", async function (request, response) {
    const { id } = (request.params);
    const booking = await client.db("Events").collection("Bookings").find({ userid: id }).toArray()
    console.log(booking)
    response.send(booking)
})


//update user profile
router.put('/edituser/:id', async function (request, response) {
    const { id } = (request.params);
    console.log(request.params);
    const data = request.body;
    console.log(data);
    const event = await client.db("Events").collection("user").updateOne({ _id: ObjectId(id) }, { $set: data });
    response.send(event)
})

//get user by id
router.get("/user/:id", async function (request, response) {
    const { id } = (request.params);
    const user = await client.db("Events").collection("user").findOne({ _id: ObjectId(id) })
    console.log(user)
    response.send(user)
})

export const profileRouter = router;