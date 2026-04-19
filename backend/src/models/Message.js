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

    // ✅ DELETE FEATURE
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isEdited: { type: Boolean, default: false },
    editedAt: Date,

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    // ✅ REPORT FEATURE
    reports: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          enum: ["spam", "abuse", "harassment", "other"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
