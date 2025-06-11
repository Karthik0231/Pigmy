const secretKey = "pigmy";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CollectorSchema = require("../model/Collector");
const CustomerSchema = require("../model/Customer");
const PigmyPlanSchema = require("../model/PigmyPlan");
const DepositSchema = require("../model/Deposit");
const WithdrawalRequestSchema = require("../model/WithdrawalRequest");
const FeedbackSchema = require("../model/Feedback"); // Import the Feedback schema


    const loginCollector = async (req, res) => {
        try{
            const {email,password}=req.body;
            const collector=await CollectorSchema.findOne({email});
            if(!collector){
                return res.status(400).json({message:"Invalid credentials"});
            }
            const isPasswordValid=await bcrypt.compare(password,collector.password);
            if(!isPasswordValid){
                return res.status(400).json({message:"Invalid Password"});
            }
            const token=jwt.sign(collector.id,secretKey);
            res.status(200).json({message:"Login successful",token,success:true});
            console.log("Login successful:", collector); // 🧪 Add this
        }
        catch (error) {
            console.error("Error logging in collector:", error);
            res.status(500).json({ message: "Internal server error" });
            }
        }

        // Assuming your VerifyCollectorToken middleware adds the collector ID directly to req.collector
const viewAssignedCustomers = async (req, res) => {
    try {
        // Get the collector ID directly from req.collector
        const collectorId = req.collector;

        console.log("Collector ID from token:", collectorId); // 🧪 Log the ID

        // Find the collector document to get the list of assigned customer IDs
        const collector = await CollectorSchema.findById(collectorId);
        console.log("Collector found:", collector ? collector.name : "None"); // 🧪 Log if collector was found

        if (!collector) {
            return res.status(404).json({ message: "Collector not found" });
        }

        const assignedCustomerIds = collector.assignedCustomers;

        console.log("Assigned customer IDs from collector document:", assignedCustomerIds); // 🧪 Log the array of IDs

        if (!assignedCustomerIds || assignedCustomerIds.length === 0) {
             console.log("No assigned customer IDs found for collector:", collectorId);
            return res.json([]);
        }

        // Find all customers whose _id is in the assignedCustomerIds array
        // and populate the packageId details, including more fields
        const assignedCustomers = await CustomerSchema.find({
            _id: { $in: assignedCustomerIds }
        }).populate('packageId', 'plan_name deposit_frequency duration_months deposit_amount interest_rate maturity_amount is_active'); // ✅ Added more fields to populate

        console.log("Result of CustomerSchema.find query:", assignedCustomers); // 🧪 Log the actual query result
        console.log("Found assigned customers count:", assignedCustomers.length); // 🧪 Log the count of results
        console.log("Populated plan details for assigned customers:", assignedCustomers.map(c => c.packageId)); // 🧪 Log populated plan details


        res.json(assignedCustomers);

    } catch (error) {
        console.error("Error fetching assigned customers:", error);
        res.status(500).json({ message: "Failed to fetch assigned customers" });
    }
};


// New function to get deposits for assigned customers
const getAssignedCustomerDeposits = async (req, res) => {
    try {
        const collectorId = req.collector; // Collector ID from token

        // Find the collector to get assigned customer IDs
        const collector = await CollectorSchema.findById(collectorId);
        if (!collector) {
            return res.status(404).json({ success: false, message: "Collector not found" });
        }

        const assignedCustomerIds = collector.assignedCustomers;

        if (!assignedCustomerIds || assignedCustomerIds.length === 0) {
            return res.status(200).json({ success: true, message: "No customers assigned to this collector.", deposits: [] });
        }

        // Find deposits for the assigned customers
        const deposits = await DepositSchema.find({
            customerId: { $in: assignedCustomerIds }
        })
        .populate('customerId', 'name accountNumber phone') // Populate customer details
        .populate('planId', 'plan_name deposit_amount deposit_frequency') // Populate plan details
        .sort({ depositDate: -1 }); // Sort by newest first

        res.status(200).json({ success: true, message: "Assigned customer deposits fetched successfully.", deposits });

    } catch (error) {
        console.error("Error fetching assigned customer deposits:", error);
        res.status(500).json({ success: false, message: "Failed to fetch assigned customer deposits." });
    }
};

// New function to approve a deposit (primarily for 'in_hand')
const approveDeposit = async (req, res) => {
    try {
        const collectorId = req.collector; // Collector ID from token
        const { depositId } = req.params; // Deposit ID from URL parameter

        // Find the deposit
        const deposit = await DepositSchema.findById(depositId).populate('customerId');

        if (!deposit) {
            return res.status(404).json({ success: false, message: "Deposit not found." });
        }

        // Ensure the deposit belongs to an assigned customer of this collector
        const collector = await CollectorSchema.findById(collectorId);
         if (!collector || !collector.assignedCustomers.includes(deposit.customerId._id)) {
             return res.status(403).json({ success: false, message: "You are not authorized to manage this deposit." });
         }


        // Only approve if the status is 'pending'
        if (deposit.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Deposit is already ${deposit.status}. Cannot approve.` });
        }

        // Update deposit status and details
        deposit.status = 'approved';
        deposit.approvedBy = collectorId;
        deposit.approvedAt = new Date();
        deposit.rejectedReason = undefined; // Clear any previous rejection reason

        // Update customer balance only if balance hasn't been updated for this deposit yet
        if (!deposit.balanceUpdated) {
             const customer = deposit.customerId; // Customer document is already populated
             customer.balance += deposit.amount;
             // Optionally update lastDepositDate here if needed, but the user side already does this on creation
             await customer.save();
             deposit.balanceUpdated = true; // Mark balance as updated
        }


        await deposit.save();

        res.status(200).json({ success: true, message: "Deposit approved successfully.", deposit });

    } catch (error) {
        console.error("Error approving deposit:", error);
        res.status(500).json({ success: false, message: "Failed to approve deposit." });
    }
};

// New function to reject a deposit (can be 'pending' or 'approved' online payments)
const rejectDeposit = async (req, res) => {
    try {
        const collectorId = req.collector; // Collector ID from token
        const { depositId } = req.params; // Deposit ID from URL parameter
        const { rejectedReason } = req.body; // Reason for rejection

        if (!rejectedReason) {
             return res.status(400).json({ success: false, message: "Rejection reason is required." });
        }

        // Find the deposit
        const deposit = await DepositSchema.findById(depositId).populate('customerId');

        if (!deposit) {
            return res.status(404).json({ success: false, message: "Deposit not found." });
        }

         // Ensure the deposit belongs to an assigned customer of this collector
        const collector = await CollectorSchema.findById(collectorId);
         if (!collector || !collector.assignedCustomers.includes(deposit.customerId._id)) {
             return res.status(403).json({ success: false, message: "You are not authorized to manage this deposit." });
         }


        // Only reject if the status is not already 'rejected'
        if (deposit.status === 'rejected') {
            return res.status(400).json({ success: false, message: "Deposit is already rejected." });
        }

        // If the deposit was previously approved and the balance was updated, deduct the amount
        if (deposit.status === 'approved' && deposit.balanceUpdated) {
             const customer = deposit.customerId; // Customer document is already populated
             customer.balance -= deposit.amount;
             await customer.save();
             deposit.balanceUpdated = false; // Mark balance as no longer updated
        }

        // Update deposit status and details
        deposit.status = 'rejected';
        deposit.rejectedReason = rejectedReason;
        deposit.approvedBy = undefined; // Clear approvedBy/At if previously set
        deposit.approvedAt = undefined;

        await deposit.save();

        res.status(200).json({ success: true, message: "Deposit rejected successfully.", deposit });

    } catch (error) {
        console.error("Error rejecting deposit:", error);
        res.status(500).json({ success: false, message: "Failed to reject deposit." });
    }
};

// New function to delete a deposit
const deleteDeposit = async (req, res) => {
    try {
        const collectorId = req.collector; // Collector ID from token
        const { depositId } = req.params; // Deposit ID from URL parameter

        // Find the deposit
        const deposit = await DepositSchema.findById(depositId).populate('customerId');

        if (!deposit) {
            return res.status(404).json({ success: false, message: "Deposit not found." });
        }

         // Ensure the deposit belongs to an assigned customer of this collector
        const collector = await CollectorSchema.findById(collectorId);
         if (!collector || !collector.assignedCustomers.includes(deposit.customerId._id)) {
             return res.status(403).json({ success: false, message: "You are not authorized to manage this deposit." });
         }


        // If the deposit was previously approved and the balance was updated, deduct the amount before deleting
        if (deposit.status === 'approved' && deposit.balanceUpdated) {
             const customer = deposit.customerId; // Customer document is already populated
             customer.balance -= deposit.amount;
             await customer.save();
             // No need to set balanceUpdated to false as the deposit is being deleted
        }

        // Delete the deposit record
        await DepositSchema.findByIdAndDelete(depositId);

        res.status(200).json({ success: true, message: "Deposit deleted successfully." });

    } catch (error) {
        console.error("Error deleting deposit:", error);
        res.status(500).json({ success: false, message: "Failed to delete deposit." });
    }
};

const getAssignedCustomerWithdrawalRequests = async (req, res) => {
    try {
        const collectorId = req.collector; // Collector ID from token

        // Find the collector to get assigned customer IDs
        const collector = await CollectorSchema.findById(collectorId);
        if (!collector) {
            return res.status(404).json({ success: false, message: "Collector not found" });
        }

        const assignedCustomerIds = collector.assignedCustomers;

        if (!assignedCustomerIds || assignedCustomerIds.length === 0) {
            return res.status(200).json({ success: true, message: "No customers assigned to this collector.", requests: [] });
        }

        // Find withdrawal requests for the assigned customers
        const requests = await WithdrawalRequestSchema.find({
            customerId: { $in: assignedCustomerIds }
        })
        .populate('customerId', 'name accountNumber phone balance') // Populate customer details (including balance)
        .populate('handledBy', 'name') // Populate the collector/admin who handled it
        .sort({ date: -1 }); // Sort by newest first

        res.status(200).json({ success: true, message: "Assigned customer withdrawal requests fetched successfully.", requests });

    } catch (error) {
        console.error("Error fetching assigned customer withdrawal requests:", error);
        res.status(500).json({ success: false, message: "Failed to fetch assigned customer withdrawal requests" });
    }
};

// New function for collector to approve a withdrawal request
const approveWithdrawalRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const collectorId = req.collector;

        const request = await WithdrawalRequestSchema.findById(requestId)
            .populate('customerId'); // Populate customer to update balance

        if (!request) {
            return res.status(404).json({ success: false, message: "Withdrawal request not found" });
        }

        // Ensure the request belongs to a customer assigned to this collector
        const collector = await CollectorSchema.findById(collectorId);
        if (!collector || !collector.assignedCustomers.includes(request.customerId._id)) {
             return res.status(403).json({ success: false, message: "You are not authorized to approve this request." });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: "Request has already been processed." });
        }

        // Check if customer still has sufficient balance
        const customer = request.customerId;
         if (request.amount > customer.balance) {
            // This scenario could happen if the customer's balance changed after the request was made
            request.status = 'rejected'; // Automatically reject if balance is insufficient now
            request.handledBy = collectorId;
            request.remarks = `Rejected: Insufficient balance (Requested: ${request.amount}, Current: ${customer.balance})`;
            await request.save();
            return res.status(400).json({ success: false, message: "Customer balance is insufficient for this withdrawal.", request });
        }


        // Update request status
        request.status = 'approved';
        request.handledBy = collectorId; // Record who approved it
        request.remarks = request.remarks || 'Approved'; // Add a default remark if none exists

        await request.save();

        // Deduct amount from customer balance
        customer.balance -= request.amount;
        customer.updatedAt = new Date(); // Update customer's updated timestamp
        await customer.save();

        res.status(200).json({ success: true, message: "Withdrawal request approved successfully. Balance updated.", request });

    } catch (error) {
        console.error("Error approving withdrawal request:", error);
        res.status(500).json({ success: false, message: "Failed to approve withdrawal request." });
    }
};

// New function for collector to reject a withdrawal request
const rejectWithdrawalRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { remarks } = req.body; // Get rejection remarks from body
        const collectorId = req.collector;

        const request = await WithdrawalRequestSchema.findById(requestId);

        if (!request) {
            return res.status(404).json({ success: false, message: "Withdrawal request not found" });
        }

         // Ensure the request belongs to a customer assigned to this collector
        const collector = await CollectorSchema.findById(collectorId);
        if (!collector || !collector.assignedCustomers.includes(request.customerId)) {
             return res.status(403).json({ success: false, message: "You are not authorized to reject this request." });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: "Request has already been processed." });
        }

        // Update request status
        request.status = 'rejected';
        request.handledBy = collectorId; // Record who rejected it
        request.remarks = remarks || 'Rejected by collector'; // Save rejection remarks

        await request.save();

        res.status(200).json({ success: true, message: "Withdrawal request rejected successfully.", request });

    } catch (error) {
        console.error("Error rejecting withdrawal request:", error);
        res.status(500).json({ success: false, message: "Failed to reject withdrawal request." });
    }
};

// New function for collector to delete a withdrawal request (Use with caution)
const deleteWithdrawalRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const collectorId = req.collector;

        const request = await WithdrawalRequestSchema.findById(requestId);

        if (!request) {
            return res.status(404).json({ success: false, message: "Withdrawal request not found" });
        }

         // Ensure the request belongs to a customer assigned to this collector
        const collector = await CollectorSchema.findById(collectorId);
        if (!collector || !collector.assignedCustomers.includes(request.customerId)) {
             return res.status(403).json({ success: false, message: "You are not authorized to delete this request." });
        }

        // Prevent deletion if already approved (to avoid balance inconsistencies)
        if (request.status === 'approved') {
             return res.status(400).json({ success: false, message: "Cannot delete an approved withdrawal request." });
        }

        // Delete the request
        await WithdrawalRequestSchema.findByIdAndDelete(requestId);

        // Optional: Remove the request ID from the customer's withdrawalRequests array
        // This requires finding the customer and updating them.
        // const customer = await CustomerSchema.findById(request.customerId);
        // if (customer) {
        //     customer.withdrawalRequests = customer.withdrawalRequests.filter(id => id.toString() !== requestId);
        //     await customer.save();
        // }


        res.status(200).json({ success: true, message: "Withdrawal request deleted successfully." });

    } catch (error) {
        console.error("Error deleting withdrawal request:", error);
        res.status(500).json({ success: false, message: "Failed to delete withdrawal request." });
    }
};

// New function to get a specific assigned customer's full statement
const getAssignedCustomerStatement = async (req, res) => {
    try {
        const collectorId = req.collector; // Get collector ID from token
        const customerId = req.params.customerId; // Get customer ID from URL parameter

        // 1. Verify the customer is assigned to this collector
        const collector = await CollectorSchema.findById(collectorId);
        if (!collector || !collector.assignedCustomers.includes(customerId)) {
            return res.status(403).json({ success: false, message: "Customer not assigned to this collector." });
        }

        // 2. Fetch customer details and populate package details
        const customer = await CustomerSchema.findById(customerId)
            .select('-password') // Exclude password
            .populate('packageId', 'plan_name deposit_frequency duration_months deposit_amount interest_rate maturity_amount is_active');

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found." });
        }

        // 3. Fetch all deposits for this customer with collector details populated
        const deposits = await DepositSchema.find({ customerId: customerId })
            .populate('collectorId', 'name email phone') // Populate collector details
            .sort({ depositDate: -1 }); // Sort by depositDate descending (newest first)

        // 4. Fetch all withdrawal requests for this customer
        const withdrawalRequests = await WithdrawalRequestSchema.find({ customerId: customerId })
            .populate('handledBy', 'name email phone')
            .sort({ date: -1 }); // Sort by date descending (newest first)

        // 5. Transform deposits to match frontend expectations
        const transformedDeposits = deposits.map(deposit => ({
            _id: deposit._id,
            customerId: deposit.customerId,
            planId: deposit.planId,
            amount: deposit.amount,
            paymentMethod: deposit.paymentMethod,
            date: deposit.depositDate, // Map depositDate to date
            balanceUpdated: deposit.balanceUpdated,
            status: deposit.status,
            createdAt: deposit.createdAt,
            updatedAt: deposit.updatedAt,
            referenceId: deposit.referenceId,
            collectedBy: deposit.collectorId // Map collectorId to collectedBy
        }));

        // Return all the data
        res.status(200).json({
            success: true,
            customer: customer,
            deposits: transformedDeposits, // Use transformed deposits
            withdrawalRequests: withdrawalRequests
        });

    } catch (error) {
        console.error("Error fetching customer statement:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// New function for collectors to submit feedback
const submitFeedback = async (req, res) => {
    try {
        const collectorId = req.collector; // Get collector ID from the authenticated token
        const { type, subject, content, rating } = req.body;

        // Basic validation
        if (!type || !content) {
            return res.status(400).json({ message: "Feedback type and content are required", success: false });
        }

        const newFeedback = new FeedbackSchema({
            source: 'Collector', // Set the source to 'collector'
            sourceId: collectorId, // Link to the collector's ID
            type,
            subject,
            content,
            rating, // Rating is optional
            status: 'new', // Default status
        });

        await newFeedback.save();

        res.status(201).json({ message: "Feedback submitted successfully", success: true, feedback: newFeedback });

    } catch (error) {
        console.error("Error submitting collector feedback:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

// New function for collectors to view their own feedbacks
const viewFeedbacks = async (req, res) => {
    try {
        const collectorId = req.collector; // Get collector ID from the authenticated token

        // Find all feedbacks submitted by this collector
        const feedbacks = await FeedbackSchema.find({ source: 'Collector', sourceId: collectorId })
                                              .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({ feedbacks, success: true });

    } catch (error) {
        console.error("Error fetching collector feedbacks:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};


module.exports = {
    loginCollector,
    viewAssignedCustomers,
    getAssignedCustomerDeposits,
    approveDeposit,
    rejectDeposit,
    deleteDeposit,
    getAssignedCustomerWithdrawalRequests,
    approveWithdrawalRequest,
    rejectWithdrawalRequest,
    deleteWithdrawalRequest,
    getAssignedCustomerStatement,
    submitFeedback, // Export the new function
    viewFeedbacks, // Export the new function
};