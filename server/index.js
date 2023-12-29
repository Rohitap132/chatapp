const express = require("express");//import express
const http = require("http");
const cors = require("cors");//import cors
const { Server } = require("socket.io");//import socket io
const mongoose = require("mongoose"); // Import Mongoose

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",// react app url where server request is made
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// connecting to mongodb atlas
mongoose.connect("mongodb+srv://rohit2002:Vishnu456123@cluster0.qq4vmee.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//creating a schema with instance as room
const userSchema = new mongoose.Schema({
  room: String,
  author:String,
  message:String,
});

const User = mongoose.model("User", userSchema);//creating a collection with name user

app.use("/api", require("./routes")); //route created

io.on("connection", (socket) => {//request recieved
  console.log(`User Connected: ${socket.id}`);//when request made 

  socket.on("join_room", async (data) => {
    socket.join(data);

    //Saving user information to MongoDB
    const newUser = new User({
      room: data,
    });

    await newUser.save();

    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {  //waits for the send_message request from client side
    console.log("Received message data:", data);
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);//when exits the server 
  });
});

const PORT = process.env.PORT || 3001;//server running on port 3001
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

