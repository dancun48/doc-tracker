import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {useNavigate} from 'react-router-dom'

export const AdminContext = createContext();

// axios instance with base configuration
const createAxiosInstance = () => {
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  const instance = axios.create({
    baseURL: backendUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to automatically add token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("aToken");
      if (token) {
        config.headers.aToken = token;
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
      const navigate = useNavigate()
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem("aToken");
        toast.error("Session expired. Please login again.");
        navigate(backendUrl + '/api/admin/login')
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);

  // Create axios instance
  const axiosInstance = createAxiosInstance();

  const getAllDoctors = async () => {
    try {
      const { data } = await axiosInstance.post("/api/admin/all-doctors", {});

      if (data.success) {
        setDoctors(data.doctors);
        console.log(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axiosInstance.post("/api/admin/change-availability", { docId });
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axiosInstance.get("/api/admin/appointments");
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const appointmentCancel = async (appointmentId) => {
    try {
      const { data } = await axiosInstance.post("/api/admin/cancel-appointment", { appointmentId });
      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axiosInstance.get("/api/admin/dashboard");
      if (data.success) {
        setDashData(data.dashData);
        console.log(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl: import.meta.env.VITE_BACKEND_URL, // Keep this if needed elsewhere
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    appointmentCancel,
    dashData,
    getDashData,
    axiosInstance, // Export if needed by other components
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;