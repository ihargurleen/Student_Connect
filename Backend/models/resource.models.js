import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
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
        subject: {
            type: String,
            required: true
        },
        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8
        },
        resourceType: {
            type: String,
            enum: ["Notes", "PDF", "Link", "Assignment", "Other"],
            required: true
        },
        resourceUrl: {
            type: String,
            required: true
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);
export const Resource = mongoose.model("Resource", resourceSchema);