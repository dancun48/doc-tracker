import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState({}); // Track loading states for each payment
  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] +
      " " +
      months[Number(dateArray[1])] +
      ", " +
      dateArray[2] +
      "."
    );
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Jenga Payment Integration
  const handlePayment = async (appointmentId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/user/initiate-payment",
        { appointmentId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Payment initiated!");

        // Start polling for payment status
        startPaymentPolling(response.data.paymentReference, appointmentId);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Payment initiation error:", error);
      toast.error("Failed to initiate payment");
    }
  };

  const startPaymentPolling = (paymentReference, appointmentId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.post(
          backendUrl + "/api/user/verify-payment",
          { paymentReference, appointmentId },
          { headers: { token } }
        );

        if (response.data.success) {
          clearInterval(pollInterval);
          toast.success("Payment completed successfully!");
          getUserAppointments();
        }
      } catch (error) {
        console.log("Payment check error:", error);
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  };

  // Check if payment is in progress for an appointment
  const isPaymentLoading = (appointmentId) => {
    return loadingPayments[appointmentId] || false;
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointments
      </p>
      <div>
        {appointments.slice(0, 3).map((item, index) => (
          <div
            className="grid grid-cols-[1fr_3fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={index}
          >
            <div>
              <img
                className="w-32 bg-green-300"
                src={item.docData.image}
                alt="Doctor"
              />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">
                {item.docData.name}
              </p>
              <p>{item.docData.specialty}</p>
              <p className="text-zinc-700 font-medium mt-1">Address: </p>
              <p className="text-xs">{item.docData.address?.line1}</p>
              <p className="text-xs">{item.docData.address?.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time:{" "}
                </span>
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>

              {/* Payment Status Display */}
              {item.payment && (
                <p className="text-green-600 font-medium mt-2">
                  ✅ Payment Completed
                </p>
              )}
              {item.paymentStatus === "pending" &&
                !item.payment &&
                !item.cancelled && (
                  <p className="text-yellow-600 font-medium mt-2">
                    ⏳ Payment Pending
                  </p>
                )}
            </div>
            <div></div>
            <div className="flex flex-col gap-2 justify-end">
              {/* Pay Online Button - Only show if not paid */}
              {!item.payment && !item.cancelled && (
                <button
                  onClick={() => handlePayment(item._id)}
                  disabled={isPaymentLoading(item._id)}
                  className={`text-sm text-white text-center sm:min-w-48 py-2 border rounded transition-all duration-300 ${
                    isPaymentLoading(item._id)
                      ? "bg-gray-400 cursor-not-allowed mb-3"
                      : "bg-primary hover:bg-green-700 mb-3"
                  }`}
                >
                  {isPaymentLoading(item._id) ? "Processing..." : "Pay Online"}
                </button>
              )}

              {/* Cancel Button - Only show if not paid and not cancelled */}
              {!item.payment && !item.cancelled && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="mb-5 text-sm text-white text-center sm:min-w-48 py-2 border rounded bg-red-400 hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancel Appointment
                </button>
              )}

              {/* Show status if already paid */}
              {item.payment && !item.isCompleted && !item.cancelled && (
                <button
                  disabled
                  className="mb-14 text-sm text-white text-center sm:min-w-48 py-2 border rounded bg-green-600 cursor-default"
                >
                  Paid Successfully
                </button>
              )}

              {/* Show status if cancelled */}
              {item.cancelled && (
                <button
                  disabled
                  className="mb-14 text-sm text-white text-center sm:min-w-48 py-2 border rounded bg-gray-400 cursor-default"
                >
                  Cancelled
                </button>
              )}
              {item.isCompleted && <button className="mb-14 sm:min-w-48 py-2 border border-green-500 rounded text-green-500">Completed</button>}
              {/* <div className="flex flex-col gap-2 justify-end">
                {!item.cancelled && item.payment && !item.isCompleted && <button className="sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50">Paid</button>}
                {!item.cancelled && !item.payment && !item.isCompleted && <button onClick={()=>appointmentRazorpay(item._id)} className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-primary hover:text-white transition-all duration-300">Pay Online</button>}
                {!item.cancelled && !item.isCompleted && <button onClick={()=>cancelAppointment(item._id)} className="text-sm text-stone-500 text-center sm:w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-300">Cancel Appointmet</button>}
                {item.cancelled && !item.isCompleted && <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">Appointment Cancelled</button>}
              </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
