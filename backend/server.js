import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";

// app config
const app = express();

const PORT = process.env.PORT || 5001;
// allows the backend to connect with the frontend
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);

connectDB();
connectCloudinary(); // online sotorage for images

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// api endpoints
app.use("/api/admin", adminRouter); // localhost:5001/api/admin
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/payment", paymentRouter);

app.get("/", (req, res) => {
  res.send("API working");
});

app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});
