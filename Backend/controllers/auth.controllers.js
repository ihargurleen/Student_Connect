
import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { genToken } from "../utils/genToken.js";

export const signup = async (req, res) => {
    try {
        const { userName, email, password } = req.body;

        if (!userName || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const isUserExists = await User.findOne({ email });

        if (isUserExists) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            userName,
            email,
            password: hashedPassword,
            role: "Student"
        });

        return res.status(201).json({
            message: "Student registered successfully",
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

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = await genToken(
            user._id,
            user.userName,
            user.email,
            user.role
        );

        return res.status(200).cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 20 * 60 * 60 * 1000
        }).json({
            message: "Login Successfully",
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

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json(user);

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        return res.clearCookie("token").status(200).json({
            message: "Logout successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};
