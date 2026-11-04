
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/admin.routes.js";
import locationRoutes from "./routes/location.routes.js";
import annoucementRoutes from "./routes/annoucement.routes.js";
import eventRoutes from "./routes/event.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import lostFoundRoutes from "./routes/lostFound.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import transportRoutes from "./routes/transport.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import path from "path";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(cookieParser());

app.use(
  "/uploads",
  express.static(path.resolve("uploads"))
);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/announcements", annoucementRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/lostFound", lostFoundRoutes);
app.use("/api/resource", resourceRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/notification", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 