import { Server } from "socket.io";
import type { Core } from "@strapi/strapi";

declare module "socket.io" {
  interface Socket {
    userId?: number;
    username?: string;
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: ["http://localhost:8080"],
        methods: ["GET", "POST"],
        credentials: true,
      },
      path: "/ws",
    });

    const onlineUsers: Record<number, string> = {};

    io.on("connection", (socket) => {
      socket.on("userConnected", ({ userId, username }) => {
        socket.userId = userId;
        socket.username = username;
        socket.join(userId.toString());
        onlineUsers[userId] = username;
        io.emit("updateOnlineUsers", onlineUsers);
        console.log(`User ${username} connected and joined room ${userId}`);
      });

      socket.on("disconnect", () => {
        if (!socket.userId) return;
        delete onlineUsers[socket.userId];
        io.emit("updateOnlineUsers", onlineUsers);
        console.log(`User ${socket.username} disconnected`);
      });

      socket.on("initiateCall", ({ callerId, callerUsername, calleeId }) => {
        console.log(`Initiating call from ${callerId} to ${calleeId}`);
        const calleeRoom = calleeId.toString();
        if (!io.sockets.adapter.rooms.has(calleeRoom)) {
          console.log(`Room for calleeId ${calleeId} does not exist. Cannot emit incoming call.`);
          return;
        }
        io.to(calleeRoom).emit("incomingCall", {
          from: callerId,
          username: callerUsername,
        });
        console.log(`Incoming call event emitted to user ${calleeId} in room ${calleeRoom}`);
      });

      socket.on("callRejected", ({ callerId, message }) => {
        console.log('credentails', callerId);
        const callerSocketId = onlineUsers[callerId];
        // if (!callerSocketId) {
        //   console.log(`Caller with user ID ${callerId} is not online`);
        //   return;
        // }
        io.to(callerSocketId).emit("callRejected", { message });
        console.log("callRejected sent to socket:", callerSocketId);
      });

      socket.on("acceptCall", ({ callerId, calleeId, calleeUsername }) => {
        io.to(callerId).emit("callAccepted", {
          by: calleeId,
          username: calleeUsername,
        });
      });
    });
  },
};
