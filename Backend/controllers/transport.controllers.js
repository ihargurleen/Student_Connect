import { Transport } from "../models/transport.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.models.js";

export const createTransport = async (req, res) => {
    try {
        const {
            routeName,
            busNumber,
            startLocation,
            endLocation,
            stops,
            departureTime,
            arrivalTime,
            availableSeats,
            status
        } = req.body;

        if (
            !routeName ||
            !busNumber ||
            !startLocation ||
            !endLocation ||
            !stops ||
            !departureTime ||
            !arrivalTime ||
            availableSeats === undefined ||
            availableSeats === null
        ) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        const transport = await Transport.create({
            routeName,
            busNumber,
            startLocation,
            endLocation,
            stops,
            departureTime,
            arrivalTime,
            availableSeats,
            status
        });

        const students = await User.find({
            role: "Student"
        }).select("_id");

        if (students.length > 0) {
            const notifications = students.map((student) => ({
                recipient: student._id,
                title: `New Transport Route: ${routeName}`,
                message: `A new bus route ${busNumber} has been added from ${startLocation} to ${endLocation}. Departure: ${departureTime}. Arrival: ${arrivalTime}. Available seats: ${availableSeats}.`,
                type: "Transport",
                relatedId: transport._id
            }));

            await Notification.insertMany(notifications);
        }

        return res.status(201).json({
            message: "Transport created and students notified successfully",
            transport
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

export const getAllTransport = async (req, res) => {
    try {
        const transports = await Transport.find();

        return res.status(200).json({
            message: "Transports fetched successfully",
            transports
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const updateTransport = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            routeName,
            busNumber,
            startLocation,
            endLocation,
            stops,
            departureTime,
            arrivalTime,
            availableSeats,
            status
        } = req.body;

        const transport = await Transport.findByIdAndUpdate(
            id,
            {
                routeName,
                busNumber,
                startLocation,
                endLocation,
                stops,
                departureTime,
                arrivalTime,
                availableSeats,
                status
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!transport) {
            return res.status(404).json({
                message: "Transport not found"
            });
        }

        const students = await User.find({
            role: "Student"
        }).select("_id");

        if (students.length > 0) {
            const notifications = students.map((student) => ({
                recipient: student._id,
                title: `Transport Route Updated: ${transport.routeName}`,
                message: `Bus ${transport.busNumber} route has been updated. From ${transport.startLocation} to ${transport.endLocation}. Departure: ${transport.departureTime}. Arrival: ${transport.arrivalTime}. Available seats: ${transport.availableSeats}.`,
                type: "Transport",
                relatedId: transport._id
            }));

            await Notification.insertMany(notifications);
        }

        return res.status(200).json({
            message: "Transport updated and students notified successfully",
            transport
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

export const deleteTransport = async (req, res) => {
    try {
        const { id } = req.params;

        const transport = await Transport.findByIdAndDelete(id);

        if (!transport) {
            return res.status(404).json({
                message: "Transport not found"
            });
        }

        return res.status(200).json({
            message: "Transport deleted successfully",
            transport
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
