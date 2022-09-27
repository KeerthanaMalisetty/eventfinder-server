
import { MongoClient } from "mongodb";
import express, { response } from "express";
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import Stripe from "stripe";
import { uuid } from 'uuidv4';
import bodyParser from "body-parser";
import { v2 as cloudinary } from 'cloudinary';
import { userRouter } from './routes/user.js'
import { eventsRouter } from "./routes/events.js";
import { profileRouter } from "./routes/profile.js";
import { adminRouter } from "./routes/admin.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();



//middleware
app.use(express.json({ limit: "50mb" }))



app.use(bodyParser.json())

app.get('/', function (request, response) {
  response.send('Hello World')
})

app.use(cors());
// {
//   origin: "*",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }
// ));

// const MONGO_URL = 'mongodb://127.0.0.1';
const MONGO_URL = process.env.Mongo_Url;


async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  // const client = await mongoclient.connect(MONGO_URL);
  await client.connect();
  console.log("Mongodb connected");
  return client;
}

export const client = await createConnection();


const stripe = new Stripe('sk_test_51LWlLFSEfh3ebicsHR0WF69BfXH3exslCqnrwjJ5v8rD9NgNM5i0fIZqiMoCCrXkdR0nImx5gB7pbItvUzjnPC7U00nPo5kM83');


// PAYMENT GATEWAY
app.post("/payment", async function (req, res) {
  console.log(req.body);
  let error;
  let status;
  try {
    const { product, token } = req.body;
    const customer = await stripe.customers.create({
      name: token.name,
      email: token.email,
      source: token.id,
    });
    const Idempotencykey = uuid();
    const charge = await stripe.charges.create(
      {
        amount: product.price,
        currency: "INR",
        customer: customer.name,
        receipt_email: token.email,
        description: `Purchased the ${product.name}`,

      },
      {
        Idempotencykey,
      }
    );
    console.log("Charge:", { charge });
    status = "success";
  } catch (error) {
    console.log("Error:", error);
    status = "failure";
  }
  res.json({ error, status });
});

//send email

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email,
    pass: process.env.Pswd,
  }
})


app.post("/sendmail", async function (request, response) {
  const { bookingid, Toemail, username, eventname } = request.body
  console.log(Toemail);
  let mailOptions = {
    from: "eventfinder19@gmail.com",
    to: `${Toemail}`,
    subject: "Here are your Tickets!",
    html: `<div className="email" style="
    // border: 1px solid black;
    background-color: blueviolet;
    padding: 20px;
    font-family: sans-serif;
    line-height: 2;
    font-size: 20px; 
    ">
    <div style="
    margin-top:25px;
    margin-left:15px;
    margin-right:15px;
    width:80%;
    background-color:white">
    <h2 style="fontsize:23px;
    color:black;
    margin-left:20px;">hi ${username} </h2>
    <p style="fontsize:23px;
    color:black;
    margin-left:18px;"> Your booking for the event <span style="fontsize:22px;
    color:bluevioet;">${eventname}</span> has been confirmed. </p>

    <p style="fontsize:20px;
    color:black;
    margin-left:20px;"> Enjoy Your Event ! </p>
    </div>
     </div>`
  };

  await transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error" + err);
      response.json({ status: "Email not sent" });
    } else {
      console.log("Email sent successfully");
      response.json({ status: "Email sent" });
    }
  });

})


//Routes
app.use("/", userRouter);
app.use("/events", eventsRouter);
app.use("/profile", profileRouter)
app.use("/admin", adminRouter)
app.listen(PORT, () => console.log(`App started in port  ${PORT}`));