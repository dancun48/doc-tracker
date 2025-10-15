import validator from "validator";
import bcrypt, { hash } from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";

//--------api to register a user----------------

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing details" });
    }
    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }
    // validating password strength
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Enter a strong password (at least 8 characters)",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    // _id for user to login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//------------api for user login--------------------

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials!" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//--------api to get user profile data---------------

const getProfile = async (req, res) => {
  try {
    // Get user ID from middleware (not from req.body)
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password"); // exclude password field

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//---------api to update user profile------------

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, dob, gender } = req.body;

    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data missing" });
    }
    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageUrl = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageUrl });
    }

    res.json({ success: true, message: "Profile updated!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//----api to book appointment----

const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;

    // Get token from headers
    const token = req.headers.token;
    if (!token) {
      return res.json({
        success: false,
        message: "Authentication token required",
      });
    }

    // Verify token and extract userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    console.log("Appointment booking for user:", userId);

    if (!userId || !docId || !slotDate || !slotTime) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData) {
      return res.json({ success: false, message: "Doctor not found!" });
    }

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available!" });
    }

    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res.json({ success: false, message: "User not found!" });
    }

    let slots_booked = docData.slots_booked || {};

    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot not available!" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [slotTime];
    }

    const userDataPlain = userData.toObject ? userData.toObject() : userData;
    const docDataPlain = docData.toObject ? docData.toObject() : docData;

    delete docDataPlain.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData: userDataPlain,
      docData: docDataPlain,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment booked successfully!" });
  } catch (error) {
    console.log("Appointment booking error:", error);
    res.json({ success: false, message: error.message });
  }
};

/// api to get user appointments for frontend my-ppointments page

const listAppointment = async (req, res) => {
  try {
    // Get token from headers
    const token = req.headers.token;
    if (!token) {
      return res.json({
        success: false,
        message: "Authentication token required",
      });
    }
    // Verify token and extract userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    console.log("Appointment for:", userId);
    // const {/*userId*/} = req.user.id;
    const appointments = await appointmentModel.find({ userId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log("Appointment booking error:", error);
    res.json({ success: false, message: error.message });
  }
};

// api to cancel appointment

const cancelAppointment = async (req, res) => {
  try {
    // Handle both object and direct string formats
    let appointmentId;

    if (typeof req.body === "string") {
      // If body is directly the ID string
      appointmentId = req.body;
    } else {
      // If body is an object with appointmentId property
      appointmentId = req.body.appointmentId;
    }

    console.log("=== CANCEL APPOINTMENT START ===");
    console.log("Request body:", req.body);
    console.log("Extracted appointmentId:", appointmentId);

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    // Rest of your cancellation logic remains the same...
    const token = req.headers.token;
    if (!token) {
      return res.json({
        success: false,
        message: "Authentication token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const appointmentData = await appointmentModel.findOne({
      _id: appointmentId,
    });

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Continue with your existing cancellation logic...
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    if (appointmentData.cancelled) {
      return res.json({
        success: false,
        message: "Appointment already cancelled",
      });
    }

    const { docId, slotDate, slotTime } = appointmentData;

    await appointmentModel.findOneAndUpdate(
      { _id: appointmentId },
      { cancelled: true }
    );

    // Release doctor slot
    const doctorData = await doctorModel.findById(docId);
    if (
      doctorData &&
      doctorData.slots_booked &&
      doctorData.slots_booked[slotDate]
    ) {
      let slots_booked = doctorData.slots_booked;
      slots_booked[slotDate] = slots_booked[slotDate].filter(
        (e) => e !== slotTime
      );
      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    }

    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    console.log("Appointment cancellation error:", error);
    res.json({ success: false, message: error.message });
  }
};

// api to make payment for appointments
const initiatePayment = async (req, res) => {
  try {
    const { appointmentId, paymentMethod = "merchant" } = req.body;
    const token = req.headers.token;

    if (!token) {
      return res.json({
        success: false,
        message: "Authentication token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get appointment details
    const appointment = await appointmentModel.findOne({ _id: appointmentId });
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    if (appointment.payment) {
      return res.json({ success: false, message: "Payment already completed" });
    }

    // Generate unique reference
    const reference = `APT${appointmentId.slice(-8)}${Date.now()
      .toString()
      .slice(-6)}`;

    // Update appointment with payment reference
    await appointmentModel.findOneAndUpdate(
      { _id: appointmentId },
      {
        paymentReference: reference,
        paymentStatus: "pending",
        paymentMethod: paymentMethod,
      }
    );

    // For now, simulate successful payment
    // In production, integrate with Jenga API here
    setTimeout(async () => {
      await appointmentModel.findOneAndUpdate(
        { _id: appointmentId },
        {
          payment: true,
          paymentStatus: "paid",
          paymentDate: new Date(),
        }
      );
      console.log("✅ Payment completed for:", appointmentId);
    }, 3000);

    res.json({
      success: true,
      message: "Payment initiated successfully",
      paymentReference: reference,
      nextSteps: "Payment will be processed automatically",
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// api to verify payment status
const verifyPayment = async (req, res) => {
  try {
    const { paymentReference, appointmentId } = req.body;

    const appointment = await appointmentModel.findOne({ _id: appointmentId });
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.payment) {
      res.json({
        success: true,
        message: "Payment verified successfully",
        appointmentId: appointmentId,
        status: "paid",
      });
    } else {
      res.json({
        success: false,
        message: "Payment not completed yet",
        status: "pending",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.json({ success: false, message: error.message });
  }
};

// api to get payment status
const getPaymentStatus = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Payment system is active",
      status: "operational",
    });
  } catch (error) {
    console.error("Payment status error:", error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  initiatePayment,
  verifyPayment,
  getPaymentStatus
};
