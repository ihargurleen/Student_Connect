import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        building:{
            type: String,
            required: true,
            trim: true
        },
        floor: {
            type: String,
            trim: true
        },
        room: {
            type: String,
            trim: true
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Department",
                "Classroom",
                "Laboratory",
                "Library",
                "Canteen",
                "Office",
                "Medical",
                "Parking",
                "Auditorium",
                "Other"
            ]
        },
        description: {
            type: String,
            trim: true
        },
    },
    {
        timestamps: true
    }
);

export const Location = mongoose.model("Location", locationSchema);