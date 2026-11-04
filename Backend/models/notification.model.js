import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      title: {
        type: String,
        required: true,
        trim : true
      },
      message: {
        type: String,
        required: true,
        trim: true
      }, 
      type: {
        type: String,
        enum: [
            "Announcement",
            "Event",
            "Issue",
            "LostFound",
            "Resource",
            "Transport",
            "General"
        ],
        default: "General"
      },
      relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
      },
      isRead: {
        type: Boolean,
        default: false
      }
    },
    {
        timestamps: true
    }
);
export const Notification = mongoose.model("Notification", notificationSchema);