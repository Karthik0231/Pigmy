import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { config } from "../Config/Config";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

export default function UserContextProvider({ children }) { // Renamed to UserContextProvider for clarity
  const { host } = config;
  const [user,setUser] = useState(null); // State to hold logged-in user details
  const [loading, setLoading] = useState(true); // Add loading state for initial fetch
  const [state, setState] = useState(false); // State to trigger re-fetches if needed
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const token = localStorage.getItem("userToken");

  const navigate = useNavigate();

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Function to fetch logged-in user details
  const fetchUserDetails = async () => {
    if (!token) {
        setUser(null);
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
        const response = await axios.get(`${host}/customer/details`, {
            headers: {
                "auth-token": token,
            },
        });
        if (response.data.success) {
            setUser(response.data.user);
        } else {
            // Handle case where token is invalid or user not found
            console.error("Failed to fetch user details:", response.data.message);
            setUser(null);
            localStorage.removeItem("userToken"); // Clear invalid token
            navigate("/login"); // Redirect to login
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
        setUser(null);
        localStorage.removeItem("userToken"); // Clear token on API error
        navigate("/login"); // Redirect to login
    } finally {
        setLoading(false);
    }
  };

// {{ edit_1 }}
// Function to fetch customer feedbacks
const fetchCustomerFeedbacks = async () => {
    if (!token) {
        console.error("No token found. Cannot fetch feedbacks.");
        return []; // Return empty array if not logged in
    }
    try {
        const response = await axios.get(`${host}/customer/feedbacks`, {
            headers: {
                "auth-token": token, // Include the user's token
            },
        });
        if (response.data.success) {
            return response.data.feedbacks; // Return the array of feedbacks
        } else {
            console.error("Failed to fetch feedbacks:", response.data.message);
            return []; // Return empty array on failure
        }
    } catch (err) {
        console.error("Error fetching feedbacks:", err);
        return []; // Return empty array on error
    }
};

// Function to submit customer feedback
const submitCustomerFeedback = async (feedbackData) => {
    setLoading(true); // Set loading state for the feedback submission
    setError(''); // Clear previous errors
    setSuccess(''); // Clear previous success messages
    try {
        const response = await axios.post(`${host}/customer/feedback`, feedbackData, {
            headers: {
                "auth-token": token, // Include the user's token
            },
        });
        if (response.data.success) {
            setSuccess(response.data.message);
            Swal.fire("Success", response.data.message, "success");
            // Optionally, you might want to refetch user details or update state
            // setState(!state);
            return { success: true, message: response.data.message };
        } else {
            setError(response.data.message);
             return { success: false, message: response.data.message };
        }
    } catch (err) {
        console.error("Error submitting feedback:", err);
        const errorMessage = err.response?.data?.message || "Failed to submit feedback. Please try again.";
        setError(errorMessage);
         return { success: false, message: errorMessage };
    } finally {
        setLoading(false); // Reset loading state
    }
};
  // Function to change user password
  const changeUserPassword = async (oldPassword, newPassword) => {
    if (!token) {
        Swal.fire("Error", "You are not logged in.", "error");
        return false;
    }
    try {
        const response = await axios.put(`${host}/customer/change-password`, {
            oldPassword,
            newPassword,
        }, {
            headers: {
                "auth-token": token,
            },
        });
        if (response.data.success) {
            Swal.fire("Success", response.data.message, "success");
            return true;
        } else {
            Swal.fire("Error", response.data.message, "error");
            return false;
        }
    } catch (error) {
        console.error("Error changing password:", error);
        Swal.fire("Error", error.response?.data?.message || "Failed to change password", "error");
        return false;
    }
  };


  const userLogin = (data) => {
    axios
        .post(`${host}/customer/login`, data)
        .then((res) => {
            if (res.data.success) {
                localStorage.setItem("userToken", res.data.token);
                // After successful login, fetch user details
                fetchUserDetails(); // Fetch details immediately after login
                Swal.fire({
                    title: "Success",
                    text: "Login successful",
                    icon: "success"
                });
                navigate("/details"); // Navigate to dashboard after login
            } else {
                Swal.fire({
                    title: "Error",
                    text: res.data.message,
                    icon: "error"
                });
            }
        })
        .catch((error) => {
            console.error("Login error:", error);
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Login failed",
                icon: "error"
            });
        });
  };



  // Function to record a deposit
// Function to record a deposit
const recordDeposit = async (paymentMethod, referenceId = null, clearDuesAmount = null) => {
    setLoading(true);
    clearMessages();
    try {
        const requestBody = {
            paymentMethod,
            referenceId
        };

        // Add clearDuesAmount to request body if provided
        if (clearDuesAmount) {
            requestBody.clearDuesAmount = clearDuesAmount;
        }

        const response = await axios.post(`${host}/customer/deposit`, requestBody, {
            headers: {
                'auth-token': token
            },
        });

        if (response.data.success) {
            // Update user state with new balance and last deposit date
            setUser(prevUser => ({
                ...prevUser,
                balance: response.data.customer.balance,
                lastDepositDate: response.data.customer.lastDepositDate,
            }));
            setSuccess(response.data.message);
                                  
            // Show additional note for pending deposits
            if (response.data.note) {
                setSuccess(`${response.data.message} ${response.data.note}`);
            }
        } else {
            setError(response.data.message || 'Failed to record deposit.');
        }
        return response.data;
    } catch (err) {
        console.error("Error recording deposit:", err);
        setError(err.response?.data?.message || 'An error occurred while recording the deposit.');
        return { success: false, message: err.response?.data?.message || err.message };
    } finally {
        setLoading(false);
    }
};


// Function to get deposit history
const getDepositHistory = async () => {
    setLoading(true);
    clearMessages();
    try {
        const response = await axios.get(`${host}/customer/deposit-history`, {
            headers: {
                'auth-token': token
            },
        });

        if (response.data.success) {
            return response.data; // Returns { success, message, deposits, summary }
        } else {
            setError(response.data.message || 'Failed to fetch deposit history.');
            return { success: false, deposits: [], summary: {} };
        }
    } catch (err) {
        console.error("Error fetching deposit history:", err);
        setError(err.response?.data?.message || 'An error occurred while fetching deposit history.');
        return { success: false, message: err.response?.data?.message || err.message };
    } finally {
        setLoading(false);
    }
};

// Function to check deposit status
const checkDepositStatus = async () => {
    setLoading(true);
    clearMessages();
    try {
        const response = await axios.get(`${host}/customer/deposit-status`, {
            headers: {
                'auth-token': token
            },
        });

        if (response.data.success) {
            return response.data; // Returns { success, message, depositStatus, customer, plan, recentDeposits }
        } else {
            setError(response.data.message || 'Failed to check deposit status.');
            return { success: false };
        }
    } catch (err) {
        console.error("Error checking deposit status:", err);
        setError(err.response?.data?.message || 'An error occurred while checking deposit status.');
        return { success: false, message: err.response?.data?.message || err.message };
    } finally {
        setLoading(false);
    }
};

const createWithdrawalRequest = async (amount, requirements) => {
    if (!token) {
      Swal.fire("Error", "You are not logged in.", "error");
      return { success: false, message: "Not logged in." };
    }

    try {
      const response = await axios.post(`${host}/customer/withdrawal-request`, {
        amount,
        requirements
      }, {
        headers: {
          "auth-token": token,
        },
      });

      if (response.data.success) {
        Swal.fire("Success", response.data.message, "success");
        // Refresh user details to show the new request and updated balance (if applicable)
        await fetchUserDetails(); // Fetch updated user data including new request
        return { success: true, message: response.data.message };
      } else {
        Swal.fire("Error", response.data.message, "error");
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
      Swal.fire("Error", error.response?.data?.message || "An error occurred while creating the withdrawal request.", "error");
      return { success: false, message: error.response?.data?.message || "An error occurred while creating the withdrawal request." };
    }
  };

  // New function to get withdrawal history (optional if user details already populate it)
  // Keeping this separate function allows fetching history independently if needed
  const getWithdrawalHistory = async () => {
     if (!token) {
      Swal.fire("Error", "You are not logged in.", "error");
      return { success: false, message: "Not logged in." };
    }

    try {
      const response = await axios.get(`${host}/customer/withdrawal-history`, { // Corrected endpoint
        headers: {
          "auth-token": token,
        },
      });

      if (response.data.success) {
        setWithdrawalHistory(response.data.requests); // Assuming you have a state variable for withdrawal history
        // You might want to update user state with this history if fetchUserDetails doesn't
        // For now, fetchUserDetails populates it, so this might be redundant for the page
        // but useful if you need history elsewhere without full user details.
        return { success: true, requests: response.data.requests };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      return { success: false, message: error.response?.data?.message || "An error occurred while fetching withdrawal history." };
    }
  };

const viewFeedbacks = async () => {
    try {
        const response = await axios.get(`${host}/customer/feedbacks`, {
            headers: {
                'auth-token': token
            },
        });

        if (response.data.success) {
            console.log(response.data.feedbacks);
            return response.data.feedbacks;
        } else {
            console.error(response.data.message);
            return [];
        }
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        return [];
    }
};


  // Fetch user details on initial load or when state changes (e.g., after login)
  useEffect(() => {
    fetchUserDetails();
  }, [token, state]); // Re-run if token or state changes

  return (
    <UserContext.Provider value={{ user, loading, userLogin, changeUserPassword, fetchUserDetails,
            recordDeposit,
    getDepositHistory,
    checkDepositStatus, error, success, clearMessages, navigate, setState, setUser,
    createWithdrawalRequest, getWithdrawalHistory, withdrawalHistory,submitCustomerFeedback,
    viewFeedbacks,fetchCustomerFeedbacks
     }}>
      {children}
    </UserContext.Provider>
  );
};
