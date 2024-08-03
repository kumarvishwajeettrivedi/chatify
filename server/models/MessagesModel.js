import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  "Users",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: false,
  },
  messageType: {
    type: String,
    enum: ["text","file"],
    required: true,
  },
  content: {
    type:String,
    required:function(){
      return this.messageType === "text";
    },
  },
  fileUrl: {
    type:String,
    required:function(){
      return this.messageType === "file";
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.pre('validate', function(next) {
  if (this.messageType === 'text' && !this.content) {
    this.invalidate('content', 'Content is required for text messages');
  }
  if (this.messageType === 'file' && !this.fileUrl) {
    this.invalidate('fileUrl', 'File URL is required for file messages');
  }
  next();
});

const Message = mongoose.model("Messages", messageSchema);

export default Message;