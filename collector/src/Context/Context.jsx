import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { config } from "../Config/Config";
import { useNavigate } from "react-router-dom";

export const CollectorContext = createContext();

export default function CollectorContextProvider({ children }) {
  const { host } = config;
  const [collector, setCollector] = useState(null);
  const [state, setState] = useState(false); // Used to trigger re-fetches
  const [assignedCustomers, setAssignedCustomers] = useState([]);
  const [deposits, setDeposits] = useState([]); // New state for deposits
  const [loading, setLoading] = useState(false); // New loading state
  const [error, setError] = useState(''); // New error state
  const [success, setSuccess] = useState(''); // New success state
  const [withdrawalRequests, setWithdrawalRequests] = useState([]); // New state for withdrawal requests
  const [requestLoading, setRequestLoading] = useState(false); // Loading state for 
  const [customerStatement,setCustomerStatement]=useState([]);

  const token = localStorage.getItem("collectorToken");

  const navigate = useNavigate();

  // Function to clear messages
  const clearMessages = () => {
      setError('');
      setSuccess('');
  };

  const collectorLogin = (data) => {
    setLoading(true);
    clearMessages();
    axios
        .post(`${host}/collector/login`, data)
        .then((res) => {
            if (res.data.success) {
                localStorage.setItem("collectorToken", res.data.token);
                // You might want to store the collector details here if the API returns them
                // setCollector(res.data.collector); // Assuming API returns collector details
                setState(!state); // Trigger re-fetch of assigned customers/deposits
                Swal.fire({
                    title: "Success",
                    text: "Login successful",
                    icon: "success"
                });
                navigate("/assigned-customers"); // Navigate to dashboard after login
            } else {
                Swal.fire({
                    title: "Error",
                    text: res.data.message,
                    icon: "error"
                });
            }
        })
        .catch((err) => {
            console.error("Login error:", err);
            Swal.fire({
                title: "Error",
                text: err.response?.data?.message || "Login failed",
                icon: "error"
            });
        });
  };

  // Function to fetch assigned customers
  const fetchAssignedCustomers = async () => {
      if (!token) {
          console.log("No collector token found.");
          setAssignedCustomers([]);
          return;
      }
      setLoading(true);
      clearMessages();
      try {
          const res = await axios.get(`${host}/collector/viewCustomers`, {
              headers: {
                  "auth-token": token,
              },
          });
          if (res.status === 200) {
              setAssignedCustomers(res.data);
              setSuccess("Assigned customers fetched."); // Optional success message
          } else {
               setError(res.data.message || "Failed to fetch assigned customers.");
               setAssignedCustomers([]);
          }
      } catch (err) {
          console.error("Assigned customers fetch error:", err);
           // Handle 401 specifically if needed, e.g., redirect to login
           if (err.response && err.response.status === 401) {
               console.log("Token expired or invalid. Redirecting to login.");
               localStorage.removeItem("collectorToken");
               navigate("/login");
           }
          setAssignedCustomers([]); // Clear customers on error
      }
  };

  const fetchAssignedCustomerDeposits = async () => {
    if (!token) {
        console.log("No collector token found.");
        setDeposits([]);
        return;
    }
    setLoading(true);
    clearMessages();
    try {
        const res = await axios.get(`${host}/collector/deposits`, {
            headers: {
                "auth-token": token,
            },
        });
        if (res.data.success) {
            setDeposits(res.data.deposits);
            setSuccess(res.data.message); // Optional success message
        } else {
            setError(res.data.message || "Failed to fetch deposits.");
            setDeposits([]);
        }
    } catch (err) {
        console.error("Error fetching deposits:", err);
        setError(err.response?.data?.message || "Failed to fetch deposits.");
        setDeposits([]);
         if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          Swal.fire({
             icon: 'error',
             title: 'Session Expired',
             text: 'Please log in again.',
          }).then(() => {
              localStorage.removeItem("collectorToken");
              navigate('/login'); // Redirect to collector login page
          });
     }
    } finally {
        setLoading(false);
    }
};

// New function to approve a deposit
const approveDeposit = async (depositId) => {
    setLoading(true);
    clearMessages();
    try {
        const res = await axios.put(`${host}/collector/deposits/approve/${depositId}`, {}, { // PUT request with empty body
            headers: {
                "auth-token": token,
            },
        });
        if (res.data.success) {
            setSuccess(res.data.message);
            fetchAssignedCustomerDeposits(); // Refresh the list after action
        } else {
            setError(res.data.message || "Failed to approve deposit.");
        }
         return res.data; // Return result for component to handle modals etc.
    } catch (err) {
        console.error("Error approving deposit:", err);
        setError(err.response?.data?.message || "Failed to approve deposit.");
         return { success: false, message: err.response?.data?.message || err.message };
    } finally {
        setLoading(false);
    }
};

// New function to reject a deposit
const rejectDeposit = async (depositId, reason) => {
    setLoading(true);
    clearMessages();
    try {
        const res = await axios.put(`${host}/collector/deposits/reject/${depositId}`, { rejectedReason: reason }, {
            headers: {
                "auth-token": token,
            },
        });
        if (res.data.success) {
            setSuccess(res.data.message);
            fetchAssignedCustomerDeposits(); // Refresh the list after action
        } else {
            setError(res.data.message || "Failed to reject deposit.");
        }
         return res.data; // Return result for component to handle modals etc.
    } catch (err) {
        console.error("Error rejecting deposit:", err);
        setError(err.response?.data?.message || "Failed to reject deposit.");
         return { success: false, message: err.response?.data?.message || err.message };
    } finally {
        setLoading(false);
    }
};

// New function to delete a deposit
const deleteDeposit = async (depositId) => {
    setLoading(true);
    clearMessages();
    try {
        const res = await axios.delete(`${host}/collector/deposits/delete/${depositId}`, {
            headers: {
                "auth-token": token,
            },
        });
        if (res.data.success) {
            setSuccess(res.data.message);
            fetchAssignedCustomerDeposits(); // Refresh the list after action
        } else {
            setError(res.data.message || "Failed to delete deposit.");
        }
         return res.data; // Return result for component to handle modals etc.
    } catch (err) {
        console.error("Error deleting deposit:", err);
        setError(err.response?.data?.message || "Failed to delete deposit.");
         return { success: false, message: err.response?.data?.message || err.message };
    } finally {
        setLoading(false);
    }
};

const fetchAssignedCustomerWithdrawalRequests = async () => {
    if (!token) {
        console.log("No collector token found.");
        setWithdrawalRequests([]);
        return;
    }
    setLoading(true); // Start loading for this fetch
    clearMessages();
    try {
        const res = await axios.get(`${host}/collector/withdrawal-requests`, {
            headers: {
                "auth-token": token,
            },
        });
        setLoading(false); // Stop loading on success
        if (res.data.success) {
            setWithdrawalRequests(res.data.requests);
            setSuccess("Assigned customer withdrawal requests fetched."); // Optional success message
        } else {
            setError(res.data.message || "Failed to fetch assigned customer withdrawal requests.");
            setWithdrawalRequests([]);
        }
    } catch (err) {
        setLoading(false); // Stop loading on error
        console.error("Assigned customer withdrawal requests fetch error:", err);
         if (err.response && err.response.status === 401) {
               console.log("Token expired or invalid. Redirecting to login.");
               localStorage.removeItem("collectorToken");
               navigate("/login");
           }
        setError(err.response?.data?.message || "Failed to fetch assigned customer withdrawal requests.");
        setWithdrawalRequests([]);
    }
  };

const approveWithdrawalRequest = async (requestId) => {
    if (!token) {
       Swal.fire("Error", "You are not logged in.", "error");
       return { success: false, message: "Not logged in." };
   }
   setRequestLoading(true); // Use requestLoading for action
   clearMessages();
   try {
       const res = await axios.put(`${host}/collector/withdrawal-requests/approve/${requestId}`, {}, { // PUT request with empty body
           headers: {
               "auth-token": token,
           },
       });
       setRequestLoading(false); // Stop loading
       if (res.data.success) {
           Swal.fire("Success", res.data.message, "success");
           fetchAssignedCustomerWithdrawalRequests(); // Re-fetch requests to update list
           return { success: true, message: res.data.message };
       } else {
           Swal.fire("Error", res.data.message, "error");
           return { success: false, message: res.data.message };
       }
   } catch (err) {
       setRequestLoading(false); // Stop loading
       console.error("Approve withdrawal request error:", err);
       Swal.fire("Error", err.response?.data?.message || "Failed to approve withdrawal request.", "error");
       return { success: false, message: err.response?.data?.message || "Failed to approve withdrawal request." };
   }
};

// New function to reject a withdrawal request
const rejectWithdrawalRequest = async (requestId, remarks) => {
    if (!token) {
       Swal.fire("Error", "You are not logged in.", "error");
       return { success: false, message: "Not logged in." };
   }
   setRequestLoading(true); // Use requestLoading for action
   clearMessages();
   try {
       const res = await axios.put(`${host}/collector/withdrawal-requests/reject/${requestId}`, { remarks }, {
           headers: {
               "auth-token": token,
           },
       });
       setRequestLoading(false); // Stop loading
       if (res.data.success) {
           Swal.fire("Success", res.data.message, "success");
           fetchAssignedCustomerWithdrawalRequests(); // Re-fetch requests to update list
           return { success: true, message: res.data.message };
       } else {
           Swal.fire("Error", res.data.message, "error");
           return { success: false, message: res.data.message };
       }
   } catch (err) {
       setRequestLoading(false); // Stop loading
       console.error("Reject withdrawal request error:", err);
       Swal.fire("Error", err.response?.data?.message || "Failed to reject withdrawal request.", "error");
       return { success: false, message: err.response?.data?.message || "Failed to reject withdrawal request." };
   }
};

// New function to delete a withdrawal request
const deleteWithdrawalRequest = async (requestId) => {
    if (!token) {
       Swal.fire("Error", "You are not logged in.", "error");
       return { success: false, message: "Not logged in." };
   }
   setRequestLoading(true); // Use requestLoading for action
   clearMessages();
   try {
       const res = await axios.delete(`${host}/collector/withdrawal-requests/delete/${requestId}`, {
           headers: {
               "auth-token": token,
           },
       });
       setRequestLoading(false); // Stop loading
       if (res.data.success) {
           Swal.fire("Success", res.data.message, "success");
           fetchAssignedCustomerWithdrawalRequests(); // Re-fetch requests to update list
           return { success: true, message: res.data.message };
       } else {
           Swal.fire("Error", res.data.message, "error");
           return { success: false, message: res.data.message };
       }
   } catch (err) {
       setRequestLoading(false); // Stop loading
       console.error("Delete withdrawal request error:", err);
       Swal.fire("Error", err.response?.data?.message || "Failed to delete withdrawal request.", "error");
       return { success: false, message: err.response?.data?.message || "Failed to delete withdrawal request." };
   }
};

// Effect to fetch assigned customers and deposits on token change or state change
useEffect(() => {
   if (token) {
       fetchAssignedCustomers();
       fetchAssignedCustomerDeposits(); // Fetch deposits here
   } else {
       setAssignedCustomers([]);
       setDeposits([]); // Clear deposits if no token
   }
}, [token, state]); // eslint-disable-line react-hooks/exhaustive-deps


const fetchCustomerStatement = async (customerId) => {
  setLoading(true);
  setError(null);
  try {
    const res = await axios.get(`${host}/collector/customer-statement/${customerId}`, {
      headers: {
        "auth-token": token,
      },
    });
    setCustomerStatement(res.data);
  } catch (err) {
    setError(err.response?.data?.message || "Failed to fetch customer statement");
  } finally {
    setLoading(false);
  }
};

const submitCollectorFeedback = async (feedbackData) => {
    setLoading(true); // Set loading state for the feedback submission
    setError(''); // Clear previous errors
    setSuccess(''); // Clear previous success messages
    try {
        const response = await axios.post(`${host}/collector/feedback`, feedbackData, {
            headers: {
                "auth-token": token, // Include the collector's token
            },
        });
        if (response.data.success) {
            setSuccess(response.data.message);
            Swal.fire("Success", response.data.message, "success");
            // Optionally, you might want to refetch feedbacks after submission
            // setState(!state);
            return { success: true, message: response.data.message };
        } else {
            setError(response.data.message);
             return { success: false, message: response.data.message };
        }
    } catch (err) {
        console.error("Error submitting collector feedback:", err);
        const errorMessage = err.response?.data?.message || "Failed to submit feedback. Please try again.";
        setError(errorMessage);
         return { success: false, message: errorMessage };
    } finally {
        setLoading(false); // Reset loading state
    }
};

// Function to fetch collector feedbacks
const fetchCollectorFeedbacks = async () => {
    if (!token) {
        console.error("No token found. Cannot fetch feedbacks.");
        return []; // Return empty array if not logged in
    }
    try {
        const response = await axios.get(`${host}/collector/feedbacks`, {
            headers: {
                "auth-token": token, // Include the collector's token
            },
        });
        if (response.data.success) {
            return response.data.feedbacks; // Return the array of feedbacks
        } else {
            console.error("Failed to fetch collector feedbacks:", response.data.message);
            return []; // Return empty array on failure
        }
    } catch (err) {
        console.error("Error fetching collector feedbacks:", err);
        return []; // Return empty array on error
    }
};


  return (
    <CollectorContext.Provider
      value={{
        collector, // You might want to fetch and set collector details after login
        assignedCustomers,
        deposits, // Provide deposits state
        loading, // Provide loading state
        error, // Provide error state
        success, // Provide success state
        collectorLogin,
        fetchAssignedCustomers,
        fetchAssignedCustomerDeposits, // Provide fetch deposits function
        approveDeposit, // Provide approve function
        rejectDeposit, // Provide reject function
        deleteDeposit, // Provide delete function
        clearMessages, // Provide clear messages function
        approveWithdrawalRequest,
        rejectWithdrawalRequest,
        deleteWithdrawalRequest,
        withdrawalRequests,
        requestLoading,
        fetchAssignedCustomerWithdrawalRequests,
        fetchCustomerStatement,
        customerStatement,
        submitCollectorFeedback,
        fetchCollectorFeedbacks,
      }}
    >
      {children}
    </CollectorContext.Provider>
  );
}
