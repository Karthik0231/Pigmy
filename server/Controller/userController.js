const secretKey = "pigmy";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CustomerSchema= require("../model/Customer");
const PigmyPlanSchema = require("../model/PigmyPlan"); // Import PigmyPlanSchema
const DepositSchema = require("../model/Deposit");
const WithdrawalRequestSchema = require("../model/WithdrawalRequest");
const CollectorSchema= require("../model/Collector");
// {{ edit_1 }}
const FeedbackSchema = require("../model/Feedback"); // Import the Feedback schema

  const loginUser = async (req, res) => {
        try{
            const {accountNumber,password}=req.body;
            const user=await CustomerSchema.findOne({accountNumber});
            if(!user){
                return res.status(400).json({message:"Invalid credentials"});
            }
            const isPasswordValid=await bcrypt.compare(password,user.password);
            if(!isPasswordValid){
                return res.status(400).json({message:"Invalid Password"});
            }
            const token=jwt.sign(user.id,secretKey);
            res.status(200).json({message:"Login successful",token,success:true});
            console.log("Login successful:", user); // 🧪 Add this
        }
        catch (error) {
            console.error("Error logging in user:", error);
            res.status(500).json({ message: "Internal server error" });
            }
        }

    // New function to get logged-in user details
    const getUserDetails = async (req, res) => {
        try {
            // req.customer is set by the VerifyCustomerToken middleware
            const userId = req.customer;

            // Find the user and populate the packageId (PigmyPlan) details
            const user = await CustomerSchema.findById(userId)
                .select('-password') // Exclude password from the result
                .populate('packageId', 'plan_name deposit_frequency duration_months deposit_amount interest_rate maturity_amount is_active'); // Populate plan details

            if (!user) {
                return res.status(404).json({ message: "User not found", success: false });
            }

            res.status(200).json({ user, success: true });

        } catch (error) {
            console.error("Error fetching user details:", error);
            res.status(500).json({ message: "Internal server error", success: false });
        }
    };

    // New function to change user password
    const changePassword = async (req, res) => {
        try {
            const userId = req.customer; // User ID from token
            const { oldPassword, newPassword } = req.body;

            const user = await CustomerSchema.findById(userId);

            if (!user) {
                return res.status(404).json({ message: "User not found", success: false });
            }

            // Verify old password
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: "Invalid old password", success: false });
            }

            // Hash the new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // Update the password
            user.password = hashedNewPassword;
            await user.save();

            res.status(200).json({ message: "Password changed successfully", success: true });

        } catch (error) {
            console.error("Error changing password:", error);
            res.status(500).json({ message: "Internal server error", success: false });
        }
    };

const recordDeposit = async (req, res) => {
    try {
        const customerId = req.customer; // User ID from token
        const { paymentMethod, referenceId, clearDuesAmount } = req.body;

        const customer = await CustomerSchema.findById(customerId).populate('packageId');

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        if (!customer.packageId) {
            return res.status(400).json({ success: false, message: "Customer does not have an assigned plan" });
        }

        const plan = customer.packageId;
        const regularDepositAmount = plan.deposit_amount;
        const depositFrequency = plan.deposit_frequency;
        const lastDepositDate = customer.lastDepositDate;
        const now = new Date();

        // Determine if this is a dues clearing or regular deposit
        const isDuesClearing = clearDuesAmount && parseFloat(clearDuesAmount) > 0;
        const actualDepositAmount = isDuesClearing ? parseFloat(clearDuesAmount) : regularDepositAmount;

        // For regular deposits, check if deposit is due based on frequency
        if (!isDuesClearing) {
            let isDepositDue = true;
            
            if (lastDepositDate) {
                if (depositFrequency === 'daily') {
                    const lastDepositDateOnly = new Date(lastDepositDate).toDateString();
                    const todayDateOnly = now.toDateString();
                    isDepositDue = lastDepositDateOnly !== todayDateOnly;
                } else if (depositFrequency === 'weekly') {
                    const startOfWeekLastDeposit = new Date(lastDepositDate);
                    startOfWeekLastDeposit.setDate(lastDepositDate.getDate() - lastDepositDate.getDay());
                    startOfWeekLastDeposit.setHours(0, 0, 0, 0);

                    const startOfWeekNow = new Date(now);
                    startOfWeekNow.setDate(now.getDate() - now.getDay());
                    startOfWeekNow.setHours(0, 0, 0, 0);

                    isDepositDue = startOfWeekLastDeposit.getTime() !== startOfWeekNow.getTime();
                }
            }

            if (!isDepositDue) {
                return res.status(400).json({ 
                    success: false, 
                    message: `You have already made your ${depositFrequency} deposit for this period.` 
                });
            }
        }

        // Validate payment method and reference ID
        if (paymentMethod === 'online' && !referenceId) {
            return res.status(400).json({ 
                success: false, 
                message: "Reference ID is required for online payments." 
            });
        }

        // Validate clearDuesAmount if provided
        if (isDuesClearing) {
            const amount = parseFloat(clearDuesAmount);
            if (isNaN(amount) || amount <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid dues amount provided." 
                });
            }
        }

        // Create new deposit record
        const newDeposit = new DepositSchema({
            customerId: customer._id,
            planId: plan._id,
            collectorId: customer.collectorId,
            amount: actualDepositAmount,
            paymentMethod: paymentMethod,
            referenceId: paymentMethod === 'online' ? referenceId : undefined,
            depositDate: now,
            depositType: isDuesClearing ? 'dues_clearance' : 'regular',
            balanceUpdated: paymentMethod === 'online'
        });

        await newDeposit.save();

        // Update customer balance and last deposit date based on payment method
        if (paymentMethod === 'online') {
            // Online payments are auto-approved and balance is updated immediately
            customer.balance += actualDepositAmount;
            
            // Only update lastDepositDate for regular deposits, not dues clearance
            if (!isDuesClearing) {
                customer.lastDepositDate = now;
            }
            
            customer.updatedAt = now;
            await customer.save();

            const depositTypeText = isDuesClearing ? 'dues clearance' : 'deposit';
            return res.status(200).json({
                success: true,
                message: `Online ${depositTypeText} of ₹${actualDepositAmount} recorded and approved successfully.`,
                customer: {
                    _id: customer._id,
                    balance: customer.balance,
                    lastDepositDate: customer.lastDepositDate,
                },
                deposit: newDeposit
            });
        } else {
            // In-hand payments need collector approval
            const depositTypeText = isDuesClearing ? 'dues clearance' : 'deposit';
            return res.status(200).json({
                success: true,
                message: `In-hand ${depositTypeText} of ₹${actualDepositAmount} recorded. Awaiting collector approval.`,
                customer: {
                    _id: customer._id,
                    balance: customer.balance,
                    lastDepositDate: customer.lastDepositDate,
                },
                deposit: newDeposit,
                note: "Your deposit is pending approval from your assigned collector."
            });
        }

    } catch (error) {
        console.error("Error recording deposit:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: "Failed to record deposit" });
    }
};
// Function to get deposit history
const getDepositHistory = async (req, res) => {
    try {
        const customerId = req.customer;

        const deposits = await DepositSchema.find({ customerId })
            .populate('planId', 'plan_name deposit_frequency deposit_amount')
            .populate('collectorId', 'name')
            .populate('approvedBy', 'name')
            .sort({ depositDate: -1 });

        // Get pending deposits count
        const pendingCount = deposits.filter(d => d.status === 'pending').length;

        res.status(200).json({
            success: true,
            message: "Deposit history fetched successfully",
            deposits,
            summary: {
                total: deposits.length,
                pending: pendingCount,
                approved: deposits.filter(d => d.status === 'approved').length,
                rejected: deposits.filter(d => d.status === 'rejected').length
            }
        });

    } catch (error) {
        console.error("Error fetching deposit history:", error);
        res.status(500).json({ success: false, message: "Failed to fetch deposit history" });
    }
};

// Function to get pending deposits (for collectors)
const getPendingDeposits = async (req, res) => {
    try {
        const collectorId = req.collector; // Assuming collector middleware

        const pendingDeposits = await DepositSchema.find({ 
            collectorId: collectorId,
            status: 'pending' 
        })
        .populate('customerId', 'name accountNumber phone')
        .populate('planId', 'plan_name deposit_amount')
        .sort({ depositDate: -1 });

        res.status(200).json({
            success: true,
            message: "Pending deposits fetched successfully",
            deposits: pendingDeposits
        });

    } catch (error) {
        console.error("Error fetching pending deposits:", error);
        res.status(500).json({ success: false, message: "Failed to fetch pending deposits" });
    }
};

// Function for collector to approve/reject deposits
const updateDepositStatus = async (req, res) => {
    try {
        const { depositId } = req.params;
        const { status, rejectedReason } = req.body;
        const collectorId = req.collector;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid status. Must be 'approved' or 'rejected'" 
            });
        }

        const deposit = await DepositSchema.findById(depositId)
            .populate('customerId')
            .populate('planId');

        if (!deposit) {
            return res.status(404).json({ success: false, message: "Deposit not found" });
        }

        if (deposit.collectorId.toString() !== collectorId) {
            return res.status(403).json({ 
                success: false, 
                message: "You can only approve deposits assigned to you" 
            });
        }

        if (deposit.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: "Deposit has already been processed" 
            });
        }

        // Update deposit status
        deposit.status = status;
        deposit.approvedBy = collectorId;
        
        if (status === 'rejected') {
            deposit.rejectedReason = rejectedReason;
        }

        await deposit.save();

        // If approved, update customer balance
        if (status === 'approved') {
            const customer = deposit.customerId;
            customer.balance += deposit.amount;
            customer.lastDepositDate = deposit.depositDate;
            customer.updatedAt = new Date();
            
            deposit.balanceUpdated = true;
            
            await customer.save();
            await deposit.save();
        }

        res.status(200).json({
            success: true,
            message: `Deposit ${status} successfully`,
            deposit
        });

    } catch (error) {
        console.error("Error updating deposit status:", error);
        res.status(500).json({ success: false, message: "Failed to update deposit status" });
    }
};

const checkDepositStatus = async (req, res) => {
    try {
        const customerId = req.customer; // User ID from token

        const customer = await CustomerSchema.findById(customerId).populate('packageId');

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        if (!customer.packageId) {
            return res.status(400).json({ success: false, message: "Customer does not have an assigned plan" });
        }

        const plan = customer.packageId;
        const depositAmount = plan.deposit_amount;
        const depositFrequency = plan.deposit_frequency;
        const lastDepositDate = customer.lastDepositDate;
        const now = new Date();

        // Check if a deposit is allowed based on frequency and last deposit date
        let isDepositAllowed = true;
        let nextDepositDate = null;
        let daysUntilNextDeposit = 0;

        if (lastDepositDate) {
            const lastDeposit = new Date(lastDepositDate);
            
            if (depositFrequency === 'daily') {
                if (lastDeposit.toDateString() === now.toDateString()) {
                    isDepositAllowed = false;
                    nextDepositDate = new Date(lastDeposit);
                    nextDepositDate.setDate(nextDepositDate.getDate() + 1);
                    daysUntilNextDeposit = Math.ceil((nextDepositDate - now) / (1000 * 60 * 60 * 24));
                }
            } else if (depositFrequency === 'weekly') {
                const startOfWeekLastDeposit = new Date(lastDeposit);
                startOfWeekLastDeposit.setDate(lastDeposit.getDate() - lastDeposit.getDay());
                startOfWeekLastDeposit.setHours(0, 0, 0, 0);

                const startOfWeekNow = new Date(now);
                startOfWeekNow.setDate(now.getDate() - now.getDay());
                startOfWeekNow.setHours(0, 0, 0, 0);

                if (startOfWeekLastDeposit.getTime() === startOfWeekNow.getTime()) {
                    isDepositAllowed = false;
                    nextDepositDate = new Date(startOfWeekNow);
                    nextDepositDate.setDate(nextDepositDate.getDate() + 7);
                    daysUntilNextDeposit = Math.ceil((nextDepositDate - now) / (1000 * 60 * 60 * 24));
                }
            }
        }

        // Get pending deposits count
        const pendingDeposits = await DepositSchema.countDocuments({ 
            customerId: customer._id, 
            status: 'pending' 
        });

        // Get recent deposit history (last 5 deposits)
        const recentDeposits = await DepositSchema.find({ customerId: customer._id })
            .populate('planId', 'plan_name')
            .sort({ depositDate: -1 })
            .limit(5)
            .select('amount status depositDate paymentMethod referenceId');

        res.status(200).json({
            success: true,
            message: "Deposit status retrieved successfully",
            depositStatus: {
                canDeposit: isDepositAllowed,
                nextDepositDate: nextDepositDate,
                daysUntilNextDeposit: daysUntilNextDeposit,
                depositAmount: depositAmount,
                depositFrequency: depositFrequency,
                lastDepositDate: lastDepositDate,
                pendingDepositsCount: pendingDeposits
            },
            customer: {
                _id: customer._id,
                name: customer.name,
                balance: customer.balance,
                accountNumber: customer.accountNumber
            },
            plan: {
                _id: plan._id,
                planName: plan.plan_name,
                depositAmount: plan.deposit_amount,
                depositFrequency: plan.deposit_frequency
            },
            recentDeposits: recentDeposits
        });

    } catch (error) {
        console.error("Error checking deposit status:", error);
        res.status(500).json({ success: false, message: "Failed to check deposit status" });
    }
};

const createWithdrawalRequest = async (req, res) => {
    try {
        const customerId = req.customer; // User ID from token
        const { amount, requirements } = req.body; // Get amount and requirements from request body

        // Basic validation
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, message: "Valid withdrawal amount is required." });
        }

        const withdrawalAmount = parseFloat(amount);

        const customer = await CustomerSchema.findById(customerId);
        const collector= await CollectorSchema.findOne({ assignedCustomers: { $in: [customerId] } });

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found." });
        }

        // Check if the requested amount is available in the customer's balance
        if (withdrawalAmount > customer.balance) {
            return res.status(400).json({ success: false, message: "Requested amount exceeds your current balance." });
        }

        // Create a new withdrawal request document
        const newRequest = new WithdrawalRequestSchema({
            customerId: customer._id,
            amount: withdrawalAmount,
            requirements: requirements || '', // Save requirements if provided
            date: new Date(),
            status: 'pending', // Initial status is pending
            handledBy: collector ? collector._id : null
        });

        await newRequest.save();

        // Add the request ID to the customer's withdrawalRequests array
        customer.withdrawalRequests.push(newRequest._id);
        await customer.save();


        res.status(201).json({ success: true, message: "Withdrawal request submitted successfully. Awaiting approval." });

    } catch (error) {
        console.error("Error creating withdrawal request:", error);
        // Handle potential validation errors from Mongoose if needed
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: "Failed to create withdrawal request" });
    }
};

// New function to get a user's withdrawal history
const getWithdrawalHistory = async (req, res) => {
    try {
        const customerId = req.customer; // User ID from token
        
        // Find withdrawal requests for the customer and populate handledBy
        const requests = await WithdrawalRequestSchema.find({ customerId })
            .populate('handledBy', 'name') // Populate the name of the collector/admin who handled it
            .sort({ date: -1 }); // Sort by date descending

        res.status(200).json({
            success: true,
            message: "Withdrawal history fetched successfully",
            requests: requests
        });

    } catch (error) {
        console.error("Error fetching withdrawal history:", error);
        res.status(500).json({ success: false, message: "Failed to fetch withdrawal history" });
    }
};

const submitFeedback = async (req, res) => {
    try {
        const customerId = req.customer; // Get customer ID from the authenticated token
        const { type, subject, content, rating } = req.body;

        // Basic validation
        if (!type || !content) {
            return res.status(400).json({ message: "Feedback type and content are required", success: false });
        }

        const newFeedback = new FeedbackSchema({
            source: 'Customer', // Set the source to 'Customer'
            sourceId: customerId, // Link to the customer's ID
            type,
            subject,
            content,
            rating, // Rating is optional
            status: 'new', // Default status
        });

        await newFeedback.save();

        res.status(201).json({ message: "Feedback submitted successfully", success: true, feedback: newFeedback });

    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

const viewFeedbacks=async(req,res)=>{
    try{
        const customer=req.customer;
        const feedbacks=await FeedbackSchema.find({sourceId:customer});
        res.status(200).json({success:true,feedbacks});
    }catch(error){
        console.error("Error fetching feedbacks:", error);
        res.status(500).json({ success: false, message: "Failed to fetch feedbacks" });
    }
}

module.exports = {
    loginUser,
    getUserDetails,
    changePassword,
    recordDeposit,
    getDepositHistory,
    getPendingDeposits,
    updateDepositStatus,
    checkDepositStatus,
    createWithdrawalRequest,
    getWithdrawalHistory,
    submitFeedback, // Export the new function]
    viewFeedbacks
};