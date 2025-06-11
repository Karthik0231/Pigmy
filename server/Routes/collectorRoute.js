const express = require("express");
const router = express.Router();
const {
    loginCollector,
    viewAssignedCustomers,
    getAssignedCustomerDeposits, // Import new function
    approveDeposit, // Import new function
    rejectDeposit, // Import new function
    deleteDeposit, // Import new function
    getAssignedCustomerWithdrawalRequests, // Import new function
    approveWithdrawalRequest, // Import new function
    rejectWithdrawalRequest, // Import new function
    deleteWithdrawalRequest, // Import new function
    getAssignedCustomerStatement,
    submitFeedback,
    viewFeedbacks,
} = require("../Controller/collectorController");
const multer = require("multer");
const { VerifyCollectorToken } = require("../middleware/authCollector");

// Storage configuration for admin and collector images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/collector");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });

router.post("/login", loginCollector);
router.get("/viewCustomers",VerifyCollectorToken, viewAssignedCustomers);

// New routes for deposit management (Protected by VerifyCollectorToken)
router.get("/deposits", VerifyCollectorToken, getAssignedCustomerDeposits);
router.put("/deposits/approve/:depositId", VerifyCollectorToken, approveDeposit);
router.put("/deposits/reject/:depositId", VerifyCollectorToken, rejectDeposit);
router.delete("/deposits/delete/:depositId", VerifyCollectorToken, deleteDeposit);

// New routes for withdrawal request management (Protected by VerifyCollectorToken)
router.get("/withdrawal-requests", VerifyCollectorToken, getAssignedCustomerWithdrawalRequests);
router.put("/withdrawal-requests/approve/:requestId", VerifyCollectorToken, approveWithdrawalRequest);
router.put("/withdrawal-requests/reject/:requestId", VerifyCollectorToken, rejectWithdrawalRequest);
router.delete("/withdrawal-requests/delete/:requestId", VerifyCollectorToken, deleteWithdrawalRequest);

router.get("/customer-statement/:customerId", VerifyCollectorToken, getAssignedCustomerStatement);

router.post('/feedback', VerifyCollectorToken, submitFeedback);
router.get('/feedbacks', VerifyCollectorToken, viewFeedbacks);

module.exports = router;