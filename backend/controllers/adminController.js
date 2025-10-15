import validator from 'validator';
import bcrypt from 'bcrypt';
import { v2 as cloudinary} from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';

// API for adding doctor
const addDoctor = async(req, res)=>{
    try {
        const {name, email, password, specialty, degree, experience, about, fees, address} = req.body;
        const imageFile = req.file;
        if (!imageFile) {
            return res.json({ success: false, message: "Image file is required" });
        }

        // checking for all data to add new doctor
        if(!name || !email || !password || !specialty || !degree || !experience || !about || !fees || !address){
            return res.json({success:false, message: "Missing details"});
        }
        
        // validating email format
        if(!validator.isEmail(email)){
            return res.json({success: false, message: "Please enter a valid email"});
        }

        // validating strong password
        if(password.length < 8){
            return res.json({success: false, message: "Please enter a strong password"});
        }

        // generate a salt to hash the password if correct
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:'image'});
        const imageUrl  = imageUpload.secure_url;

        const doctorData = {name, 
                            email, 
                            image: imageUrl, 
                            password: hashedPassword, 
                            specialty, 
                            degree, 
                            experience, 
                            about, 
                            fees, 
                            address: JSON.parse(address), 
                            date: Date.now()
                        };

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({success:true, message:"Doctor successfully added"});

    } catch (error) {  
        console.log(error);
        res.json({success:false, message: error.message});

    }
}

// ---------API for admin login----------

const loginAdmin = async(req, res)=>{
    try {
        const {email, password} = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.json({success:true, token});
        } else {
            res.json({success:false, message:"invalid Credentials"});
        }

    } catch (error) {
        console.log(error);
        res.json({success:false, message: error.message});
    }
}

// ---------api controller to get all doctors list from the admin panel---------

const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password')  // excludes tge password property from the doctors data
        res.json({success: true, doctors})
        
    } catch (error) {
        console.log(error);
        res.json({success:false, message: error.message});
    }
}

// ----------api to get all appointments list----------------
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({});
        res.json({success:true, appointments})
    } catch (error) {
        console.log(error);
        res.json({success:false, message: error.message});
    }
}

// ---------api to cancel appointment by admin--------------
const appointmentCancel = async (req, res) => {
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
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }
    const appointmentData = await appointmentModel.findOne({
      _id: appointmentId,
    });
    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
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

//-----api to get dashboard data for admin panel--------
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});
    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.reverse().slice(0,5)
    }
    res.json({success:true, dashData});
  } catch (error) {
    console.log("Could not fetch dashboard:", error);
    res.json({ success: false, message: error.message });
  }
}

export {addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard};