
import mongoose from "mongoose";

const transportSchema = new mongoose.Schema(
    {
        routeName: {
            type: String,
            required: true,
            trim: true
        },
        busNumber: {
            type: String,
            required: true,
            trim: true
        },
        startLocation: {
            type: String,
            required: true
        },
        endLocation: {
            type: String,
            required: true
        },
        stops: {
            type: [String],
            default: []
        },
        departureTime: {
            type: String,
            required: true
        },
        arrivalTime: {
            type: String,
            required: true
        },
        availableSeats: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);

export const Transport = mongoose.model("Transport", transportSchema);
