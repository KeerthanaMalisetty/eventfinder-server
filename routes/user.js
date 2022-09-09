import express, { response } from "express";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { auth } from '../middleware/auth.js';
import dotenv from "dotenv";
import { client } from "../index.js"
const router = express.Router();
dotenv.config();



//login & signup api's
//user signup................
router.post("/signup", async function (request, response) {
    const { name, password, email } = request.body;
    // console.log("data",data); 
    const userfromDB = await getuserByName(name);
    console.log(userfromDB);

    if (userfromDB) {
        response.send({ message: "username already exists" })
    }
    else {
        const hashedpassword = await genHashedPassword(password);
        const result = await client.db("Events").collection("user").insertOne({
            name: name,
            password: hashedpassword,
            email: email,
        });
        response.send(result);
    }
})

async function getuserByName(name) {
    return await client.db("Events").collection("user").findOne({ name: name })
}
async function genHashedPassword(password) {
    const no_of_rounds = 10;
    const salt = await bcrypt.genSalt(no_of_rounds);
    const hashedpassword = await bcrypt.hash(password, salt)
    console.log(salt, hashedpassword);
    return hashedpassword;
}


//login api
router.post("/login", async function (request, response) {
    const { name, password } = (request.body);
    const userfromDB = await getuserByName(name);
    console.log(userfromDB);
    if (!userfromDB) {
        response.status(400).send({ msg: "Invalid credentials" })
    }
    else {
        const storedpassword = userfromDB.password;
        const isPasswordMatch = await bcrypt.compare(password, storedpassword);
        console.log(isPasswordMatch);

        if (isPasswordMatch) {
            // var jwt = require('jsonwebtoken');
            const token = jwt.sign({ id: userfromDB._id }, process.env.SECRET_KEY);
            response.send({ msg: "successfull login", token: token, userid: userfromDB._id, name: userfromDB.name, email: userfromDB.email })
        }
        else {
            response.send({ msg: "Invalid credentials" })
        }
    }


    //   const data = request.body;
    //   const result = await client.db("Events").collection("user").findOne(data);
    //  result ? response.send(result) : response.send({"msg":"invalid credentials"});
})




//forgotpassword

router.post("/", async function (request, response) {
    const { email } = request.body;
    const result = await client.db("Events").collection("user").findOne({ email: email })
    if (result) {
        response.send({ msg: "Email verified" })
    }
    else {
        response.send({ msg: "User doen't exist" })
    }
})

// await client.db("Events").collection("user").updateOne({email: email})

router.post("/", async function (request, response) {
    const { Newpassword, Confirmpassword, email } = request.body;

    if (Newpassword === Confirmpassword) {
        const changepassword = await genHashedPassword(Newpassword)
        const result = await client.db("Events").collection("user").updateOne({ email: email },
            { $set: { password: changepassword } })
        response.send({ msg: "Password had been Changed" })
    }
    else {
        response.send({ msg: "Both the passwords must be same" })
    }
})

export const userRouter = router;