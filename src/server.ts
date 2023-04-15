import app from "./app";
import env from "./util/validateEnv";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { createServer } from "http";

const port = env.PORT;
const server = createServer(app);

mongoose.set("strictQuery", true);
mongoose.set("runValidators", true);
mongoose
  .connect(env.MONGO_CONNECTION_STRING)
  .then(() => {
    console.log("Mongoose connected");
    server.listen(port, () => {
      console.log("Server running on port: " + port);
    });
  })
  .catch(console.error);

const allowedOrigins = [
  "http://localhost:3000",
  "https://uat.petnanny.live",
  "https://uat.petnanny.live/",
];
const io = new Server(server, { cors: { origin: allowedOrigins } });

interface User {
  userId: string;
  socketId: string;
}

let users: User[] = [];
const addUser = (userId: string, socketId: string) => {
  !users.some((user) => user.userId === userId) && users.push({ userId, socketId });
};
const removeUser = (socketId: string) => {
  users = users.filter((user) => user.socketId !== socketId);
};
const getUser = (userId: string) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when connect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (userId: string) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    } else {
      console.log(`User with ID ${receiverId} not found`);
    }
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
