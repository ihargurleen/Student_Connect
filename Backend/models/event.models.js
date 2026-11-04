import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        venue: {
            type: String,
            required: true
        },
        eventDate: {
            type: String,
            required: true
        },
        targetAudience: {
            type: String,
            enum: ["All", "Student", "Faculty", "Staff"],
            default: "All"
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
    },
    {
        timestamps: true
    }
);
export const Event = mongoose.model("Event", eventSchema);