import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { config } from "../Config/Config";
import { useNavigate } from "react-router-dom";

export const AdminContext = createContext();

export default function AdminContextProvider({ children }) {
  const { host } = config;
  const [admin, setAdmin] = useState(null);
  const [state, setState] = useState(false);
  const [collectors, setCollectors] = useState([]);
  const [pigmyPlans, setPigmyPlans] = useState([]); // Add state for Pigmy Plans
  const [customers, setCustomers] = useState([]); // Add state for Customers
  const [customerPaymentSummary, setCustomerPaymentSummary] = useState([]);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null); // Details for a specific customer
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  // {{ edit_1 }}
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  // {{ edit_1 ends }}
  // {{ edit_2 }}
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  // {{ edit_2 ends }}
  const token = localStorage.getItem("adminToken");

  const navigate = useNavigate();

  const adminLogin = (data) => {
    axios
        .post(`${host}/admin/login`, data)
        .then((res) => {
            if (res.data.success) {
                localStorage.setItem("adminToken", res.data.token);
                setAdmin(res.data.admin);
                setState(!state);
                Swal.fire({
                    title: "Success",
                    text: "Login successful",
                    icon: "success"
                });
                navigate("/dashboard");
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

const viewCollectors = async () => {
    try {
        const res = await axios.get(`${host}/admin/viewcollectors`, {
            headers: {
                "auth-token": token,
            },
        });
        
        if (res.data.success) {
            setCollectors(res.data.collectors);
        } else {
            console.log(res.data.message);
            Swal.fire({
                title: "Error",
                text: res.data.message,
                icon: "error"
            });
        }
    } catch (err) {
        console.error("Error fetching collectors:", err);
        Swal.fire({
            title: "Error",
            text: err.response?.data?.message || "Failed to fetch collectors",
            icon: "error"
        });
    }
};

const addCollector = async (data) => {
    try {
        const res = await axios.post(`${host}/admin/addcollector`, data, {
            headers: {
                "auth-token": token,
                "Content-Type": "multipart/form-data",
            },
        });
        
        if (res.data.success) {
            Swal.fire({
                title: "Success",
                text: "Collector added successfully",
                icon: "success"
            });
            await viewCollectors(); // Refresh the list
            return { success: true };
        } else {
            Swal.fire({
                title: "Error",
                text: res.data.message,
                icon: "error"
            });
            return { success: false, message: res.data.message };
        }
    } catch (err) {
        console.error("Collector addition error:", err);
        const errorMessage = err.response?.data?.message || "Collector addition failed";
        Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error"
        });
        return { success: false, message: errorMessage };
    }
};

const updateCollector = async (id, data) => {
    try {
        const res = await axios.put(`${host}/admin/updatecollector/${id}`, data, {
            headers: {
                "auth-token": token,
                "Content-Type": "multipart/form-data",
            },
        });
        
        if (res.data.success) {
            Swal.fire({
                title: "Success",
                text: "Collector updated successfully",
                icon: "success"
            });
            await viewCollectors(); // Refresh the list
            return { success: true };
        } else {
            Swal.fire({
                title: "Error",
                text: res.data.message,
                icon: "error"
            });
            return { success: false, message: res.data.message };
        }
    } catch (err) {
        console.error("Collector update error:", err);
        const errorMessage = err.response?.data?.message || "Collector update failed";
        Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error"
        });
        return { success: false, message: errorMessage };
    }
};

const deleteCollector = async (id) => {
    try {
        const res = await axios.delete(`${host}/admin/deletecollector/${id}`, {
            headers: {
                "auth-token": token,
            },
        });
        
        if (res.data.success) {
            Swal.fire({
                title: "Success",
                text: "Collector deleted successfully",
                icon: "success"
            });
            await viewCollectors(); // Refresh the list
            return { success: true };
        } else {
            Swal.fire({
                title: "Error",
                text: res.data.message,
                icon: "error"
            });
            return { success: false, message: res.data.message };
        }
    } catch (err) {
        console.error("Collector deletion error:", err);
        const errorMessage = err.response?.data?.message || "Collector deletion failed";
        Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error"
        });
        return { success: false, message: errorMessage };
    }
};
  
  // Pigmy Plan Functions
  
  const viewPigmyPlans = async () => {
    try {
        const res = await axios.get(`${host}/admin/getallplans`, {
            headers: {
                "auth-token": token,
            },
        });

        if (res.data.success) {
            setPigmyPlans(res.data.plans);
        } else {
            console.log(res.data.message);
            Swal.fire({
                title: "Error",
                text: res.data.message,
                icon: "error"
            });
        }
    } catch (err) {
        console.error("Error fetching pigmy plans:", err);
        Swal.fire({
            title: "Error",
            text: err.response?.data?.message || "Failed to fetch pigmy plans",
            icon: "error"
        });
    }
  };

  const addPigmyPlan = async (data) => {
    try {
        const res = await axios.post(`${host}/admin/addplan`, data, {
            headers: {
                "auth-token": token,
            },
        });

        if (res.data.success) {
            Swal.fire({
                title: "Success",
                text: "Pigmy Plan added successfully",
                icon: "success"
            });
            await viewPigmyPlans(); // Refresh the list
            return { success: true };
        } else {
            Swal.fire({
                title: "Error",
                text: res.data.message,
                icon: "error"
            });
            return { success: false, message: res.data.message };
        }
    } catch (err) {
        console.error("Pigmy Plan addition error:", err);
        const errorMessage = err.response?.data?.message || "Pigmy Plan addition failed";
        Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error"
        });
        return { success: false, message: errorMessage };
    }
  };

  const updatePigmyPlan = async (id, data) => {
    try {
        const res = await axios.put(`${host}/admin/updateplan/${id}`, data, {
            headers: {
                "auth-token": token,
            },
        });

        if (res.data.success) {
            Swal.fire({
                title: "Success",
                text: "Pigmy Plan updated successfully",
                icon: "success"
            });
            await viewPigmyPlans(); // Refresh the list
            return { success: true };
        } else {
            Swal.fire({
                title: "Error",
                text: res.data.message,
                icon: "error"
            });
            return { success: false, message: res.data.message };
        }
    } catch (err) {
        console.error("Pigmy Plan update error:", err);
        const errorMessage = err.response?.data?.message || "Pigmy Plan update failed";
        Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error"
        });
        return { success: false, message: errorMessage };
    }
  };

  const deletePigmyPlan = async (id) => {
    try {
        const res = await axios.delete(`${host}/admin/deleteplan/${id}`, {
            headers: {
                "auth-token": token,
            },
        });

        if (res.data.success) {
            Swal.fire({
                title: "Success",
                text: "Pigmy Plan deleted successfully",
                icon: "success"
            });
            await viewPigmyPlans(); // Refresh the list
            return { success: true };
        } else {
            Swal.fire({
                title: "Error",
                text: res.data.message,
                icon: "error"
            });
            return { success: false, message: res.data.message };
        }
    } catch (err) {
        console.error("Pigmy Plan deletion error:", err);
        const errorMessage = err.response?.data?.message || "Pigmy Plan deletion failed";
        Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error"
        });
        return { success: false, message: errorMessage };
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    viewCollectors();
    viewPigmyPlans(); // Fetch pigmy plans on mount
  }, []); // Empty dependency array means this runs once on mount

const addCustomer = async (data, files = null) => {
    try {
        // Create FormData for file upload
        const formData = new FormData();
        
        // Append all text data
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
                formData.append(key, data[key]);
            }
        });

        // Append files if provided
        if (files) {
            if (files.profileImage) {
                formData.append('profileImage', files.profileImage);
            }
            if (files.aadhar) {
                formData.append('aadhar', files.aadhar);
            }
            if (files.pan) {
                formData.append('pan', files.pan);
            }
        }

        const res = await axios.post(`${host}/admin/addcustomer`, formData, {
            headers: {
                "auth-token": token,
                'Content-Type': 'multipart/form-data'
            },
        });

        if (res.data.success) {
            Swal.fire({
                title: "Success",
                text: "Customer added successfully",
                icon: "success"
            });
            await viewCustomers(); // Refresh the list
            return { success: true };
        } else {
            Swal.fire({
                title: "Error",
                text: res.data.message,
                icon: "error"
            });
            return { success: false, message: res.data.message };
        }
    } catch (err) {
        console.error("Customer add error:", err);
        const errorMessage = err.response?.data?.message || "Customer add failed";
        Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error"
        });
        return { success: false, message: errorMessage };
    }
};

// Update Customer with file support
const updateCustomer = async (id, data, files = null) => {
    try {
        // Create FormData for file upload
        const formData = new FormData();
        
        // Append all text data
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
                formData.append(key, data[key]);
            }
        });

        // Append files if provided
        if (files) {
            if (files.profileImage) {
                formData.append('profileImage', files.profileImage);
            }
            if (files.aadhar) {
                formData.append('aadhar', files.aadhar);
            }
            if (files.pan) {
                formData.append('pan', files.pan);
            }
        }

        const res = await axios.put(`${host}/admin/updatecustomer/${id}`, formData, {
            headers: {
                "auth-token": token,
                'Content-Type': 'multipart/form-data'
            },
        });

        if (res.data.success) {
            Swal.fire({
                title: "Success",
                text: "Customer updated successfully",
                icon: "success"
            });
            await viewCustomers(); // Refresh the list
            return { success: true };
        } else {
            Swal.fire({
                title: "Error",
                text: res.data.message,
                icon: "error"
            });
            return { success: false, message: res.data.message };
        }
    } catch (err) {
        console.error("Customer update error:", err);
        const errorMessage = err.response?.data?.message || "Customer update failed";
        Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error"
        });
        return { success: false, message: errorMessage };
    }
};

// Delete Customer (unchanged)
const deleteCustomer = async (id) => {
    try {
        const res = await axios.delete(`${host}/admin/deletecustomer/${id}`, {
            headers: {
                "auth-token": token,
            },
        });

        if (res.data.success) {
            Swal.fire({
                title: "Success",
                text: "Customer deleted successfully",
                icon: "success"
            });
            await viewCustomers(); // Refresh the list
            return { success: true };
        } else {
            Swal.fire({
                title: "Error",
                text: res.data.message,
                icon: "error"
            });
            return { success: false, message: res.data.message };
        }
    } catch (err) {
        console.error("Customer deletion error:", err);
        const errorMessage = err.response?.data?.message || "Customer deletion failed";
        Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error"
        });
        return { success: false, message: errorMessage };
    }
};

// View Customers (unchanged)
const viewCustomers = async () => {
    try {
        const res = await axios.get(`${host}/admin/getallcustomers`, {
            headers: {
                "auth-token": token,
            },
        });
        if (res.data.success) {
            setCustomers(res.data.customers);
        } else {
            console.error("Failed to fetch customers:", res.data.message);
            setCustomers([]); // Clear customers on failure
        }
    } catch (err) {
        console.error("Customer fetch error:", err);
        setCustomers([]); // Clear customers on error
    }
};

const fetchCustomerPaymentSummary = async () => {
    setPaymentLoading(true);
    setPaymentError('');
    try {
        const res = await axios.get(`${host}/admin/payments/summary`, {
            headers: {
                "auth-token": token,
            },
        });
        if (res.data.success) {
            setCustomerPaymentSummary(res.data.summary);
        } else {
            setPaymentError(res.data.message || "Failed to fetch payment summary");
            setCustomerPaymentSummary([]);
        }
    } catch (error) {
        console.error("Error fetching payment summary:", error);
        setPaymentError("Error fetching payment summary");
        setCustomerPaymentSummary([]);
    } finally {
        setPaymentLoading(false);
    }
};

// Fetch detailed payments (deposits and withdrawal requests) for a specific customer
const fetchCustomerPaymentDetails = async (customerId) => {
    setPaymentLoading(true);
    setPaymentError('');
    setSelectedCustomerDetails(null); // Clear previous details
    try {
        const res = await axios.get(`${host}/admin/payments/details/${customerId}`, {
            headers: {
                "auth-token": token,
            },
        });
        if (res.data.success) {
            setSelectedCustomerDetails(res.data); // Contains deposits and withdrawalRequests arrays
        } else {
            setPaymentError(res.data.message || "Failed to fetch customer payment details");
            setSelectedCustomerDetails(null);
        }
    } catch (error) {
        console.error("Error fetching customer payment details:", error);
        setPaymentError("Error fetching customer payment details");
        setSelectedCustomerDetails(null);
    } finally {
        setPaymentLoading(false);
    }
};

// Reject a specific deposit
const rejectDepositAdmin = async (depositId, reason) => {
    try {
      setPaymentLoading(true);
      const res = await axios.put(`${host}/admin/deposits/reject/${depositId}`, { rejectedReason: reason }, { // <-- Send with key 'rejectionReason'
            headers: {
                "auth-token": token,
            },
        });

        if (res.data.success) {
            Swal.fire("Success", "Deposit rejected successfully", "success");
            // Trigger re-fetch of details for the selected customer if one is active
            if (selectedCustomerDetails?.customer?._id) {
                 fetchCustomerPaymentDetails(selectedCustomerDetails.customer._id);
            } else {
                 // Or re-fetch the summary if no specific customer is selected
                 fetchCustomerPaymentSummary();
            }
        } else {
            setPaymentError(res.data.message || "Failed to reject deposit");
             Swal.fire("Error", res.data.message || "Failed to reject deposit", "error");
        }
    } catch (error) {
        console.error("Error rejecting deposit:", error);
        setPaymentError("Error rejecting deposit");
         Swal.fire("Error", error.response?.data?.message || "Error rejecting deposit", "error");
    } finally {
        setPaymentLoading(false);
    }
};

// Reject a specific withdrawal request
const rejectWithdrawalRequestAdmin = async (requestId, reason) => {
    try {
      setPaymentLoading(true);
      // {{ edit_1 }}
      const res = await axios.put(`${host}/admin/withdrawal-requests/${requestId}/reject`, { rejectionReason: reason }, { // <-- Send with key 'rejectionReason'
            headers: {
                "auth-token": token,
            },
        });
      // {{ edit_1 ends }}

        if (res.data.success) {
            Swal.fire("Success", "Withdrawal request rejected successfully", "success");
             // Trigger re-fetch of details for the selected customer if one is active
            if (selectedCustomerDetails?.customer?._id) {
                 fetchCustomerPaymentDetails(selectedCustomerDetails.customer._id);
            } else {
                 // Or re-fetch the summary if no specific customer is selected
                 fetchCustomerPaymentSummary();
            }
        } else {
            setPaymentError(res.data.message || "Failed to reject withdrawal request");
             Swal.fire("Error", res.data.message || "Failed to reject withdrawal request", "error");
        }
    } catch (error) {
        console.error("Error rejecting withdrawal request:", error);
        setPaymentError("Error rejecting withdrawal request");
         Swal.fire("Error", error.response?.data?.message || "Error rejecting withdrawal request", "error");
    } finally {
        setPaymentLoading(false);
    }
};
const fetchFeedback = async () => {
    setFeedbackLoading(true);
    setFeedbackError('');
    try {
      const res = await axios.get(`${host}/admin/feedback`, {
        headers: {
          "auth-token": token,
        },
      });
      if (res.data.success) {
        setFeedbackList(res.data.feedback);
      } else {
        setFeedbackError(res.data.message || "Failed to fetch feedback");
        setFeedbackList([]);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setFeedbackError("Error fetching feedback");
      setFeedbackList([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Update feedback status
const updateFeedbackStatusAdmin = async (feedbackId, newStatus, notes = '') => {
  setFeedbackLoading(true);
  setFeedbackError('');

  try {
    const res = await axios.put(
      `${host}/admin/feedback/${feedbackId}/status`,
      { status: newStatus, notes }, // ✅ sending both status and notes
      {
        headers: {
          "auth-token": token,
        },
      }
    );

    if (res.data.success) {
      Swal.fire("Success", res.data.message, "success");
      fetchFeedback(); // Refresh list
    } else {
      const msg = res.data.message || "Failed to update feedback status";
      setFeedbackError(msg);
      Swal.fire("Error", msg, "error");
    }
  } catch (error) {
    const msg = error.response?.data?.message || "Error updating feedback status";
    console.error("Error updating feedback status:", error);
    setFeedbackError(msg);
    Swal.fire("Error", msg, "error");
  } finally {
    setFeedbackLoading(false);
  }
};

const fetchComprehensiveReport = async () => {
    setReportLoading(true);
    setReportError('');
    try {
      const res = await axios.get(`${host}/admin/reports`, {
        headers: {
          "auth-token": token,
        },
      });
      if (res.data.success) {
        setReportData(res.data.report);
      } else {
        setReportError(res.data.message || "Failed to fetch report data");
        setReportData(null);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      setReportError("Error fetching report data");
      setReportData(null);
    } finally {
      setReportLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    viewCollectors();
    viewPigmyPlans(); // Fetch pigmy plans on mount
    viewCustomers(); // Fetch customers on mount
    fetchCustomerPaymentSummary();
    // {{ edit_3 }}
    fetchFeedback(); // Fetch feedback on mount
    // {{ edit_3 ends }}
  }, []); // Empty dependency array means this runs once on mount

  return (
    <AdminContext.Provider
    value={{ admin,
    state,
    adminLogin,
    viewCollectors,
    collectors,
    deleteCollector,
    updateCollector,
    addCollector,
    // Add Pigmy Plan context values
    pigmyPlans,
    viewPigmyPlans,
    addPigmyPlan,
    updatePigmyPlan,
    deletePigmyPlan,
    // Add Customer context values
    customers,
    viewCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    customerPaymentSummary,
    selectedCustomerDetails,
    paymentLoading,
    paymentError,
    fetchCustomerPaymentSummary,
    fetchCustomerPaymentDetails,
    rejectDepositAdmin,
    rejectWithdrawalRequestAdmin,
    // {{ edit_4 }}
    // Add Feedback context values
    feedbackList,
    feedbackLoading,
    feedbackError,
    fetchFeedback,
    updateFeedbackStatusAdmin,
    fetchComprehensiveReport,
    reportData,
    reportLoading,
    reportError,
    // {{ edit_4 ends }}
    }}>
      {children}
    </AdminContext.Provider>
  );
}
