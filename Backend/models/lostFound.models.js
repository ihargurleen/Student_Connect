import mongoose from "mongoose";

const lostFoundSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        category:{
            type: String,
            enum: ["Lost","Found"],
            required: true,
        },
        location:{
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["Open", "Claimed", "Returned"],
            default: "Open"
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
        },
        {
            timestamps: true
        }
)
export const LostFound = mongoose.model("LostFound", lostFoundSchema);