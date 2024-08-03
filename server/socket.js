import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client Disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    const { sender, recipient, content, messageType, fileUrl } = message;
    console.log("sendMessage called with:", message);
  
    if (messageType === 'text' && !content) {
      console.error("Error: Content is required for sending a text message.");
      return;
    }
  
    if (messageType === 'file' && !fileUrl) {
      console.error("Error: File URL is required for sending a file message.");
      return;
    }
  
    const senderSocketId = userSocketMap.get(sender);
    const recipientSocketId = userSocketMap.get(recipient);
  
    try {
      const createdMessage = await Message.create({
        sender,
        recipient,
        content,
        messageType,
        fileUrl,
        timestamp: new Date(),
      });
  
      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");
  
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", messageData);
      }
      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", messageData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;
    console.log("sendChannelMessage called with:", message);
  
    if (messageType === 'text' && !content) {
      console.error("Error: Content is required for sending a text message.");
      return;
    }
  
    if (messageType === 'file' && !fileUrl) {
      console.error("Error: File URL is required for sending a file message.");
      return;
    }
  
    try {
      const createdMessage = await Message.create({
        sender,
        recipient: null,
        content,
        messageType,
        fileUrl,
        timestamp: new Date(),
      });
  
      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .exec();
  
      await Channel.findByIdAndUpdate(channelId, {
        $push: { messages: createdMessage._id },
      });
  
      const channel = await Channel.findById(channelId).populate("members");
  
      const finalData = { ...messageData._doc, channelId: channel._id };
  
      if (channel && channel.members) {
        channel.members.forEach((member) => {
          const memberSocketId = userSocketMap.get(member._id.toString());
          if (memberSocketId) {
            io.to(memberSocketId).emit("receive-channel-message", finalData);
          }
        });
        const adminSocketId = userSocketMap.get(channel.admin._id.toString());
        if (adminSocketId) {
          io.to(adminSocketId).emit("receive-channel-message", finalData);
        }
      }
    } catch (error) {
      console.error("Error sending channel message:", error);
    }
  };
  
  

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      console.log("User ID not provided during connection.");
    }
    console.log("working1")
    socket.on("sendMessage", sendMessage);
    console.log("working2")
    socket.on("send-channel-message", sendChannelMessage);
    console.log("working3")
    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
