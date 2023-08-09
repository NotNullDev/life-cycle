import http from "http";
import { Server } from "socket.io";

export const initWs = (app) => {
  const server = http.createServer(app);
  const io = new Server(server);

  io.on("connection", (con) => {
    console.log(con);
    console.log("something connected!");
  });

  console.log("socketio waiting for connections");
};
