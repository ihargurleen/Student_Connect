import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
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
        location: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: [
                "Classroom",
                "Library",
                "Hostel",
                "WiFi",
                "Other"
            ],
            required: true,
        },
        status: {
            type: String,
            enum: ["Open", "In Progress", "Resolved"],
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
);

export const Issue = mongoose.model("Issue", issueSchema);