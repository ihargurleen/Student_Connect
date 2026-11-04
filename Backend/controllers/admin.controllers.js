
import bcrypt from "bcryptjs";
import { User } from "../models/user.models.js";

const allowedRoles = ["Student", "Faculty", "Staff", "Admin"];

export const createUser = async (req, res) => {
    try {
        const { userName, email, password, role } = req.body;

        if (!userName || !email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            userName: userName.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role
        });

        return res.status(201).json({
            message: `${role} account created successfully`,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        return res.status(200).json({
            message: "Users fetched successfully",
            users
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.userId?.id || req.userId;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user._id.toString() === currentUserId?.toString()) {
            return res.status(400).json({
                message: "You cannot delete your own account"
            });
        }

        if (user.role === "Admin") {
            const adminCount = await User.countDocuments({
                role: "Admin"
            });

            if (adminCount <= 1) {
                return res.status(400).json({
                    message: "The last Admin account cannot be deleted"
                });
            }
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const currentUserId = req.userId?.id || req.userId;

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user._id.toString() === currentUserId?.toString()) {
            return res.status(400).json({
                message: "You cannot change your own role"
            });
        }

        if (user.role === "Admin" && role !== "Admin") {
            const adminCount = await User.countDocuments({
                role: "Admin"
            });

            if (adminCount <= 1) {
                return res.status(400).json({
                    message: "The last Admin role cannot be removed"
                });
            }
        }

        user.role = role;
        await user.save();

        return res.status(200).json({
            message: "User role updated successfully",
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
