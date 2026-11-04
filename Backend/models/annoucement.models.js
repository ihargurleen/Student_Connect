import mongoose from "mongoose";

const annoucementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        targetAudience: {
            type: String,
            enum: ["All", "Student", "Faculty", "Staff"],
            default: "All"
        }
    },
    {
        timestamps: true
    }
);

export const Annoucement = mongoose.model("Annoucement", annoucementSchema);