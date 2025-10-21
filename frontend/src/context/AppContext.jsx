import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

// Create axios instance for general app requests
const createAppAxiosInstance = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  const instance = axios.create({
    baseURL: backendUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to automatically add user token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.token = token;
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
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem("token");
        toast.error("Session expired. Please login again.");
        // Optional: Redirect to login page
        // window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const AppContextProvider = (props) => {
  const currencySymbol = "KES";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : null
  );
  
  const [userData, setUserData] = useState(null);

  // Create axios instance for app
  const axiosInstance = createAppAxiosInstance();

  const getDoctorsData = async () => {
    try {
      const { data } = await axiosInstance.get("/api/doctor/list");
      
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const loadUserProfileData = useCallback(async () => {
    if (!token) {
      setUserData(null);
      return;
    }
    
    try {
      const { data } = await axiosInstance.get("/api/user/get-profile");
      
      if (data.success && data.user) {
        setUserData(data.user);
      } else {
        console.log('API returned no user data');
        toast.error(data.message);
        setUserData(null);
      }
    } catch (error) {
      console.log('Error loading profile:', error);
      toast.error(error.response?.data?.message || error.message);
      setUserData(null);
    }
  }, [token, axiosInstance]); // Removed backendUrl dependency since it's in axiosInstance

  // Optional: User login function
  const userLogin = async (loginData) => {
    try {
      const { data } = await axiosInstance.post("/api/user/login", loginData);
      
      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success("Login successful!");
        await loadUserProfileData(); // Load user data immediately after login
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Optional: User registration function
  const userRegister = async (registerData) => {
    try {
      const { data } = await axiosInstance.post("/api/user/register", registerData);
      
      if (data.success) {
        toast.success("Registration successful! Please login.");
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  // Optional: User logout function
  const userLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserData(null);
    toast.success("Logged out successfully");
  };

  // Optional: Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      const { data } = await axiosInstance.put("/api/user/update-profile", profileData);
      
      if (data.success) {
        setUserData(data.user);
        toast.success("Profile updated successfully!");
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  const value = {
    doctors,
    getDoctorsData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
    userLogin,
    userRegister,
    userLogout,
    updateUserProfile,
    axiosInstance, // Export if needed by other components
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(null);
    }
  }, [token, loadUserProfileData]);

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;