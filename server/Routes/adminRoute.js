const express = require("express");
const router = express.Router();
const {
    registerAdmin,
    loginAdmin,
    viewUsers,
    deleteUser,
    viewCollectors,
    addCollector,
    deleteCollector,
    updateCollector,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getAllCustomers,
    // Add new functions for Pigmy Plans
    addPigmyPlan,
    updatePigmyPlan,
    deletePigmyPlan,
    getAllPigmyPlans,
    getPigmyPlanById,
    // {{ edit_1 }}
    // Add new functions for Pigmy Plans
    fetchCustomerPaymentSummary,
    fetchCustomerPaymentDetails,
    rejectDepositAdmin,
    rejectWithdrawalRequestAdmin,
    getAllFeedbacks,
    updateFeedbackStatus,
    // {{ edit_1 ends }}
    // {{ edit_2 }}
    // Add new function for Comprehensive Report
    getComprehensiveReport,
    // {{ edit_2 ends }}
} = require("../Controller/adminController");
const multer = require("multer");
const { VerifyAdminToken } = require("../middleware/authAdmin");

// Storage configuration for admin and collector images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/admin");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

// Storage configuration for customer files
const customerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Different folders based on file field
        if (file.fieldname === 'profileImage') {
            cb(null, "uploads/customer/profiles");
        } else if (file.fieldname === 'aadhar' || file.fieldname === 'pan') {
            cb(null, "uploads/customer/kyc");
        } else {
            cb(null, "uploads/customer");
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });
const customerUpload = multer({ storage: customerStorage });

// Admin and Auth Routes
router.post("/register", upload.single("image"), registerAdmin);
router.post("/login", loginAdmin);
router.get("/viewusers", VerifyAdminToken, viewUsers);
router.delete("/deleteuser/:id", VerifyAdminToken, deleteUser);

// Collector Routes
router.get("/viewcollectors", VerifyAdminToken, viewCollectors);
router.post("/addcollector", VerifyAdminToken, upload.single("image"), addCollector);
router.delete("/deletecollector/:id", VerifyAdminToken, deleteCollector);
router.put("/updatecollector/:id", VerifyAdminToken, upload.single("image"), updateCollector);

// Customer Routes (Protected) - Updated with proper file handling
router.get("/getallcustomers", VerifyAdminToken, getAllCustomers);
router.post("/addcustomer", VerifyAdminToken, customerUpload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aadhar', maxCount: 1 },
    { name: 'pan', maxCount: 1 }
]), addCustomer);
router.put("/updatecustomer/:id", VerifyAdminToken, customerUpload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aadhar', maxCount: 1 },
    { name: 'pan', maxCount: 1 }
]), updateCustomer);
router.delete("/deletecustomer/:id", VerifyAdminToken, deleteCustomer);

// Pigmy Plan routes
router.post("/addplan", VerifyAdminToken, addPigmyPlan);
router.put("/updateplan/:id", VerifyAdminToken, updatePigmyPlan);
router.delete("/deleteplan/:id", VerifyAdminToken, deletePigmyPlan);
router.get("/getallplans", VerifyAdminToken, getAllPigmyPlans);
router.get("/getplanbyid/:id", VerifyAdminToken, getPigmyPlanById);

router.get("/payments/summary", VerifyAdminToken, fetchCustomerPaymentSummary); // Get summary for all customers
router.get("/payments/details/:customerId", VerifyAdminToken, fetchCustomerPaymentDetails); // Get details for a specific customer
router.put("/deposits/reject/:depositId", VerifyAdminToken, rejectDepositAdmin); // Reject a specific deposit
router.put("/withdrawal-requests/reject/:requestId", VerifyAdminToken, rejectWithdrawalRequestAdmin); // Reject a specific withdrawal request

router.get("/feedback", VerifyAdminToken, getAllFeedbacks);
router.put("/feedback/:feedbackId/status", VerifyAdminToken, updateFeedbackStatus);

// {{ edit_3 }}
// Comprehensive Report Route
router.get("/reports", VerifyAdminToken, getComprehensiveReport);
// {{ edit_3 ends }}

module.exports = router;