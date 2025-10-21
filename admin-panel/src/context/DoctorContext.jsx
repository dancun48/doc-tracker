import { useState } from "react";
import { createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const DoctorContext = createContext();

// Create axios instance inside the same file
const createDoctorAxiosInstance = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  const instance = axios.create({
    baseURL: backendUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to automatically add doctor token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("dToken");
      if (token) {
        config.headers.dToken = token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle errors globally
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // const navigate = useNavigate()
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem("dToken");
        toast.error("Session expired. Please login again.");
        // navigate(backendUrl + '/api/doctor/login')
        window.location.href = '/doctor/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const DoctorContextProvider = (props) => {
  const navigate = useNavigate();
  const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") ? localStorage.getItem("dToken") : ""
  );
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);

  // Create axios instance for doctor
  const axiosInstance = createDoctorAxiosInstance();

  const getAppointments = async () => {
    try {
      const { data } = await axiosInstance.get("/api/doctor/appointments");
      
      if (data.success) {
        setAppointments(data.appointments);
        console.log(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axiosInstance.post("/api/doctor/complete-appointment", { appointmentId });
      
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axiosInstance.post("/api/doctor/cancel-appointment", { appointmentId });
      
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axiosInstance.get("/api/doctor/dashboard");
      
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axiosInstance.get("/api/doctor/profile");
      
      if (data.success) {
        setProfileData(data.profileData);
        console.log(data.profileData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Optional: Login function if needed
  const doctorLogin = async (loginData) => {
    try {
      const { data } = await axiosInstance.post("/api/doctor/login", loginData);
      
      if (data.success) {
        setDToken(data.token);
        localStorage.setItem("dToken", data.token);
        toast.success("Login successful!");
        navigate("/doctor/dashboard");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Optional: Logout function
  const doctorLogout = () => {
    localStorage.removeItem("dToken");
    setDToken("");
    setAppointments([]);
    setDashData(false);
    setProfileData(false);
    toast.success("Logged out successfully");
    navigate("/doctor/login");
  };

  const value = {
    dToken,
    setDToken,
    backendUrl: import.meta.env.VITE_BACKEND_URL,
    appointments,
    setAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
    doctorLogin,
    doctorLogout,
    axiosInstance, // Export if needed by other components
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;