import Message from "../models/MessagesModel.js";
import { mkdirSync, renameSync } from 'fs';
import path from 'path';

export const getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId;
    const user2 = req.body.id;

    if (!user1 || !user2) {
      return res.status(400).send("Both user id's are required.");
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    return res.status(200).json({ messages });

  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required");
    }
    
    const date = Date.now();
    const fileDir = path.join('uploads', 'files', date.toString());
    const fileName = path.join(fileDir, req.file.originalname);

    mkdirSync(fileDir, { recursive: true });
    renameSync(req.file.path, fileName);

    return res.status(200).json({ filePath: fileName });

  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};
