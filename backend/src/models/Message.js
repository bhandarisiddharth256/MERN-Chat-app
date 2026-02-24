import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
    },

    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    
  },
  {
    timestamps: true,
  },
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
