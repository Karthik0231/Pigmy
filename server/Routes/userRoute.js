const express = require("express");
const router = express.Router();
const {
    loginUser,
    getUserDetails, // Import the new function
    changePassword, // Import the new function
    recordDeposit,
    getDepositHistory,
    checkDepositStatus,
    createWithdrawalRequest,
    getWithdrawalHistory,
    viewFeedbacks,
    // {{ edit_1 }}
    submitFeedback, // Import the new feedback function
} = require("../Controller/userController");
const multer = require("multer");
const { VerifyCustomerToken } = require("../middleware/authUser"); // Import the middleware

// Storage configuration for admin and collector images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/customer");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });


// Public routes
router.post("/login", loginUser);

// Protected routes (require token)
router.get("/details", VerifyCustomerToken, getUserDetails);
// router.put("/change-password", VerifyCustomerToken, changePassword); // Assuming you have this route

// New route to change password (protected)
router.put("/change-password", VerifyCustomerToken, changePassword);

router.post('/deposit', VerifyCustomerToken, recordDeposit);

// GET /customer/deposit-history - Get customer's deposit history
router.get('/deposit-history', VerifyCustomerToken, getDepositHistory);

// GET /customer/deposit-status - Check current deposit status
router.get('/deposit-status', VerifyCustomerToken, checkDepositStatus);

router.post('/withdrawal-request', VerifyCustomerToken, createWithdrawalRequest);

// New route for getting withdrawal history
router.get('/withdrawal-history', VerifyCustomerToken, getWithdrawalHistory);

// GET /customer/profile - Get customer profile with plan details
// router.get('/profile', VerifyCustomerToken, getCustomerProfile);

// {{ edit_2 }}
// New route for submitting feedback (protected)
router.post('/feedback', VerifyCustomerToken, submitFeedback);
router.get('/feedbacks', VerifyCustomerToken, viewFeedbacks);
module.exports = router;

