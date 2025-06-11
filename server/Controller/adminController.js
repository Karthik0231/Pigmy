const secretKey = "pigmy";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminSchema = require("../model/Admin");
const CustomerSchema = require("../model/Customer");
const CollectorSchema = require("../model/Collector");
const PigmyPlanSchema = require("../model/PigmyPlan"); // Import PigmyPlan model
const DepositSchema = require("../model/Deposit"); // Import Deposit model
const WithdrawalRequestSchema = require("../model/WithdrawalRequest"); 
const FeedbackSchema = require("../model/Feedback"); // Import Feedback model
const fs = require("fs");

const registerAdmin = async (req, res) => {
    try{
        const { name, email, password } = req.body;

        // Check if admin already exists
        const existingAdmin = await AdminSchema.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new admin
        const newAdmin = new AdminSchema({
            name,
            email,
            password: hashedPassword,
        }).save();

        res.status(201).json({ message: "Admin registered successfully" });
    }
    catch (error) {
        console.error("Error registering admin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    }

    const loginAdmin = async (req, res) => {
        try{
            const {email,password}=req.body;
            const admin=await AdminSchema.findOne({email});
            if(!admin){
                return res.status(400).json({message:"Invalid credentials"});
            }
            const isPasswordValid=await bcrypt.compare(password,admin.password);
            if(!isPasswordValid){
                return res.status(400).json({message:"Invalid Password"});
            }
            const token=jwt.sign(admin.id,secretKey);
            res.status(200).json({message:"Login successful",token,success:true});
            console.log("Login successful:", admin); // 🧪 Add this
        }
        catch (error) {
            console.error("Error logging in admin:", error);
            res.status(500).json({ message: "Internal server error" });
            }
        }


        const viewUsers = async (req, res) => {
                    try {
                        const users = await CustomerSchema.find().select('-password');
                        res.status(200).json({
                            users,
                            success: true,
                            message: "Users fetched successfully"
                        });
                    } catch (error) {
                        console.error("Error fetching users:", error);
                        res.status(500).json({
                            message: "Internal server error",
                            success: false
                        });
                    }
                };

                const deleteUser = async (req, res) => {
                    try {
                        const { userId } = req.params;

                        const user = await CustomerSchema.findById(userId);
                        if (!user) {
                            return res.status(404).json({
                                message: "User not found",
                                success: false
                            });
                        }

                        await CustomerSchema.findByIdAndDelete(userId);

                        res.status(200).json({
                            message: "User deleted successfully",
                            success: true
                        });
                    } catch (error) {
                        console.error("Error deleting user:", error);
                        res.status(500).json({
                            message: "Internal server error",
                            success: false
                        });
                    }
                };


const viewCollectors = async (req, res) => {
    try {
        const collectors = await CollectorSchema.find().select('-password');
        res.status(200).json({
            collectors,
            success: true,
            message: "Collectors fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching collectors:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

const addCollector = async (req, res) => {
    try {
        const { name, email, password, phone, status } = req.body;
        const image = req.file ? req.file.filename : null;

        // Validation
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                message: "All required fields must be provided",
                success: false
            });
        }

        // Check by mobile and email
        const existingCollector = await CollectorSchema.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingCollector) {
            return res.status(400).json({
                message: "Collector with this email or phone already exists",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newCollector = new CollectorSchema({
            name,
            email,
            password: hashedPassword,
            phone,
            status: status || 'active',
            image
        });

        const savedCollector = await newCollector.save();
        
        res.status(201).json({
            message: "Collector registered successfully",
            success: true,
            collector: {
                _id: savedCollector._id,
                name: savedCollector.name,
                email: savedCollector.email,
                phone: savedCollector.phone,
                status: savedCollector.status,
                image: savedCollector.image
            }
        });
        
        console.log("Collector registered successfully:", savedCollector._id);
    } catch (error) {
        console.error("Error registering collector:", error);
        res.status(500).json({ 
            message: "Internal server error",
            success: false
        });
    }
}

const deleteCollector = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        // if (!mongoose.Types.ObjectId.isValid(id)) {
        //     return res.status(400).json({
        //         message: "Invalid collector ID format",
        //         success: false
        //     });
        // }

        // Check if the collector exists
        if(!id){
            return res.status(400).json({
                message: "Invalid collector ID format",
                success: false  
            })
          }  

        const collector = await CollectorSchema.findById(id);
        if (!collector) {
            return res.status(404).json({
                message: "Collector not found",
                success: false
            });
        }

        await CollectorSchema.findByIdAndDelete(id);
        
        res.status(200).json({
            message: "Collector deleted successfully",
            success: true
        });
        
        console.log("Collector deleted successfully:", id);
    } catch (error) {
        console.error("Error deleting collector:", error);
        
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return res.status(400).json({ 
                message: "Invalid collector ID",
                success: false
            });
        }
        
        res.status(500).json({ 
            message: "Internal server error",
            success: false
        });
    }
}

const updateCollector = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, status } = req.body;
        const image = req.file ? req.file.filename : undefined;

        // Check if collector exists
        const existingCollector = await CollectorSchema.findById(id);
        if (!existingCollector) {
            return res.status(404).json({
                message: "Collector not found",
                success: false
            });
        }

        // Check for duplicate email/phone (excluding current collector)
        if (email || phone) {
            const duplicateCheck = await CollectorSchema.findOne({
                $and: [
                    { _id: { $ne: id } },
                    { $or: [{ email }, { phone }] }
                ]
            });

            if (duplicateCheck) {
                return res.status(400).json({
                    message: "Email or phone already exists for another collector",
                    success: false
                });
            }
        }

        // Prepare update object
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (status) updateData.status = status;
        if (image) updateData.image = image;

        const updatedCollector = await CollectorSchema.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            message: "Collector updated successfully",
            success: true,
            collector: updatedCollector
        });
        
        console.log("Collector updated successfully:", id);
    } catch (error) {
        console.error("Error updating collector:", error);
        
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Validation error: " + error.message,
                success: false
            });
        }
        
        res.status(500).json({ 
            message: "Internal server error",
            success: false
        });
    }
}


// Get all customers
const getAllCustomers = async (req, res) => {
    try {
        const customers = await CustomerSchema.find({})
            .populate('packageId', 'plan_name deposit_frequency duration_months deposit_amount interest_rate maturity_amount') // Fixed: was 'pigmyplan'
            .populate('collectorId', 'name email phone') // Populate collector details
            .sort({ createdAt: -1 }); // Sort by newest first
        
        res.json({ success: true, customers });
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ success: false, message: "Failed to fetch customers" });
    }
};

                // Add new customer
const addCustomer = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            gender,
            dob,
            address,
            password,
            accountNumber,
            accountType,
            packageId,
            collectorId
        } = req.body;

        // Basic validation
        if (!name || !phone || !address || !accountNumber || !accountType || !packageId || !collectorId || !password) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        // Check for unique account number
        const existingAccountNumberCustomer = await CustomerSchema.findOne({ accountNumber });
        if (existingAccountNumberCustomer) {
            return res.status(400).json({ success: false, message: "Customer with this account number already exists" });
        }

        // Verify packageId and collectorId exist
        const pigmyPlan = await PigmyPlanSchema.findById(packageId);
        if (!pigmyPlan) {
            return res.status(400).json({ success: false, message: "Invalid Pigmy Plan selected" });
        }

        const collector = await CollectorSchema.findById(collectorId);
        if (!collector) {
            return res.status(400).json({ success: false, message: "Invalid Collector selected" });
        }

        // Calculate maturity date
        const startDate = new Date();
        const maturityDate = new Date(startDate);
        maturityDate.setMonth(maturityDate.getMonth() + pigmyPlan.duration_months);

        // Handle file uploads
        let profileImagePath = null;
        let kycDocs = { aadhar: null, pan: null };

        if (req.files) {
            if (req.files.profileImage) {
                profileImagePath = req.files.profileImage[0].path;
            }
            if (req.files.aadhar) {
                kycDocs.aadhar = req.files.aadhar[0].path;
            }
            if (req.files.pan) {
                kycDocs.pan = req.files.pan[0].path;
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCustomer = new CustomerSchema({
            name,
            email: email || undefined, // Don't set empty string
            phone,
            gender: gender || 'Other',
            dob: dob ? new Date(dob) : undefined,
            address,
            accountNumber,
            accountType,
            packageId,
            collectorId,
            startDate,
            maturityDate,
            balance: 0,
            password: hashedPassword,
            isClosed: false,
            profileImage: profileImagePath,
            kycDocs: kycDocs,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newCustomer.save();
        
        // Add customer to collector's assignedCustomers array and save
        collector.assignedCustomers.push(newCustomer._id);
        await collector.save();

        // Populate the saved customer for response
        const savedCustomer = await CustomerSchema.findById(newCustomer._id)
            .populate('packageId', 'plan_name deposit_frequency duration_months deposit_amount interest_rate maturity_amount')
            .populate('collectorId', 'name email phone');


        res.status(201).json({ 
            success: true, 
            message: "Customer added successfully", 
            customer: savedCustomer 
        });

    } catch (error) {
        console.error("Error adding customer:", error);
        res.status(500).json({ success: false, message: "Failed to add customer" });
    }
};

// Update an existing customer
const updateCustomer = async (req, res) => {
    try {
        const customerId = req.params.id;
        const {
            name,
            email,
            phone,
            gender,
            dob,
            address,
            accountNumber,
            accountType,
            packageId,
            collectorId,
            isClosed,
            status
        } = req.body;

        // Find the customer
        const customer = await CustomerSchema.findById(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        // Store the old collectorId to handle collector reassignment
        const oldCollectorId = customer.collectorId?.toString();
        const newCollectorId = collectorId?.toString();

        // Check for unique phone or account number if they are being changed
        
        if (accountNumber && accountNumber !== customer.accountNumber) {
            const existingAccountCustomer = await CustomerSchema.findOne({ accountNumber: accountNumber });
            if (existingAccountCustomer && existingAccountCustomer._id.toString() !== customerId) {
                return res.status(400).json({ success: false, message: "Customer with this account number already exists" });
            }
        }

        // Verify packageId and collectorId exist if they are being changed
        if (packageId && packageId !== customer.packageId.toString()) {
            const pigmyPlan = await PigmyPlanSchema.findById(packageId);
            if (!pigmyPlan) {
                return res.status(400).json({ success: false, message: "Invalid Pigmy Plan selected" });
            }
            // Recalculate maturity date if package changes
            const startDate = customer.startDate || new Date();
            const maturityDate = new Date(startDate);
            maturityDate.setMonth(maturityDate.getMonth() + pigmyPlan.duration_months);
            customer.maturityDate = maturityDate;
        }

        if (collectorId && collectorId !== customer.collectorId.toString()) {
            const collector = await CollectorSchema.findById(collectorId);
            if (!collector) {
                return res.status(400).json({ success: false, message: "Invalid Collector selected" });
            }
        }

        // Handle file uploads for update
        if (req.files) {
            if (req.files.profileImage) {
                // Delete old profile image if exists
                if (customer.profileImage && fs.existsSync(customer.profileImage)) {
                    fs.unlinkSync(customer.profileImage);
                }
                customer.profileImage = req.files.profileImage[0].path;
            }
            if (req.files.aadhar) {
                // Delete old aadhar if exists
                if (customer.kycDocs.aadhar && fs.existsSync(customer.kycDocs.aadhar)) {
                    fs.unlinkSync(customer.kycDocs.aadhar);
                }
                customer.kycDocs.aadhar = req.files.aadhar[0].path;
            }
            if (req.files.pan) {
                // Delete old pan if exists
                if (customer.kycDocs.pan && fs.existsSync(customer.kycDocs.pan)) {
                    fs.unlinkSync(customer.kycDocs.pan);
                }
                customer.kycDocs.pan = req.files.pan[0].path;
            }
        }

        // Update fields
        customer.name = name || customer.name;
        customer.email = email !== undefined ? email : customer.email;
        customer.phone = phone || customer.phone;
        customer.gender = gender || customer.gender;
        customer.dob = dob ? new Date(dob) : customer.dob;
        customer.address = address || customer.address;
        customer.accountNumber = accountNumber || customer.accountNumber;
        customer.accountType = accountType || customer.accountType;
        customer.packageId = packageId || customer.packageId;
        customer.collectorId = collectorId || customer.collectorId;
        customer.isClosed = isClosed !== undefined ? isClosed : customer.isClosed;
        customer.status = status || customer.status;
        customer.updatedAt = new Date();

        await customer.save();

        // Handle collector reassignment
        if (newCollectorId && oldCollectorId !== newCollectorId) {
            // Remove customer from old collector's assignedCustomers array
            if (oldCollectorId) {
                await CollectorSchema.findByIdAndUpdate(
                    oldCollectorId,
                    { $pull: { assignedCustomers: customerId } }
                );
            }

            // Add customer to new collector's assignedCustomers array
            await CollectorSchema.findByIdAndUpdate(
                newCollectorId,
                { $addToSet: { assignedCustomers: customerId } }
            );
        }
        
        // Populate the updated customer for response
        const updatedCustomer = await CustomerSchema.findById(customerId)
            .populate('packageId', 'plan_name deposit_frequency duration_months deposit_amount interest_rate maturity_amount')
            .populate('collectorId', 'name email phone');

        res.json({ 
            success: true, 
            message: "Customer updated successfully", 
            customer: updatedCustomer 
        });

    } catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({ success: false, message: "Failed to update customer" });
    }
};

// Delete a customer
const deleteCustomer = async (req, res) => {
    try {
        const customerId = req.params.id;

        const customer = await CustomerSchema.findById(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        // Delete associated files
        if (customer.profileImage && fs.existsSync(customer.profileImage)) {
            fs.unlinkSync(customer.profileImage);
        }
        if (customer.kycDocs.aadhar && fs.existsSync(customer.kycDocs.aadhar)) {
            fs.unlinkSync(customer.kycDocs.aadhar);
        }
        if (customer.kycDocs.pan && fs.existsSync(customer.kycDocs.pan)) {
            fs.unlinkSync(customer.kycDocs.pan);
        }

        await CustomerSchema.findByIdAndDelete(customerId);

        res.json({ success: true, message: "Customer deleted successfully" });

    } catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).json({ success: false, message: "Failed to delete customer" });
    }
};

// Add new Pigmy Plan
const addPigmyPlan = async (req, res) => {
    try {
      const {
        plan_name,
        deposit_frequency,
        deposit_amount,
        duration_months,
        interest_rate,
        maturity_amount,
        is_active
      } = req.body;
  
      // Basic validation
      if (!plan_name || !deposit_frequency || !deposit_amount || !duration_months || !interest_rate || !maturity_amount) {
        return res.status(400).json({ success: false, message: 'All required fields must be provided' });
      }
  
      // Check if plan name already exists
      const existingPlan = await PigmyPlanSchema.findOne({ plan_name });
      if (existingPlan) {
        return res.status(400).json({ success: false, message: 'Plan with this name already exists' });
      }
  
      const newPlan = new PigmyPlanSchema({
        plan_name,
        deposit_frequency,
        deposit_amount,
        duration_months,
        interest_rate,
        maturity_amount,
        is_active: is_active !== undefined ? is_active : true // Default to true if not provided
      });
  
      const savedPlan = await newPlan.save();
  
      res.status(201).json({
        success: true,
        message: 'Pigmy Plan added successfully',
        plan: savedPlan
      });
  
    } catch (error) {
      console.error('Error adding Pigmy Plan:', error);
      // Handle Mongoose validation errors specifically
      if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors).map(val => val.message);
          return res.status(400).json({ success: false, message: messages.join(', ') });
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  
  // Update Pigmy Plan by ID
  const updatePigmyPlan = async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
  
      // Check if plan exists
      const existingPlan = await PigmyPlanSchema.findById(id);
      if (!existingPlan) {
        return res.status(404).json({ success: false, message: 'Pigmy Plan not found' });
      }
  
      // Check for duplicate plan name (excluding the current plan)
      if (updates.plan_name && updates.plan_name !== existingPlan.plan_name) {
          const duplicateCheck = await PigmyPlanSchema.findOne({ plan_name: updates.plan_name, _id: { $ne: id } });
          if (duplicateCheck) {
              return res.status(400).json({ success: false, message: 'Plan with this name already exists' });
          }
      }
  
      const updatedPlan = await PigmyPlanSchema.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true } // Return the updated document and run schema validators
      );
  
      res.status(200).json({
        success: true,
        message: 'Pigmy Plan updated successfully',
        plan: updatedPlan
      });
  
    } catch (error) {
      console.error('Error updating Pigmy Plan:', error);
       if (error.name === 'CastError' && error.kind === 'ObjectId') {
          return res.status(400).json({ success: false, message: 'Invalid Plan ID format' });
      }
      if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors).map(val => val.message);
          return res.status(400).json({ success: false, message: messages.join(', ') });
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  
  // Delete Pigmy Plan by ID
  const deletePigmyPlan = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if plan exists
      const plan = await PigmyPlanSchema.findById(id);
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Pigmy Plan not found' });
      }
  
      await PigmyPlanSchema.findByIdAndDelete(id);
  
      res.status(200).json({
        success: true,
        message: 'Pigmy Plan deleted successfully'
      });
  
    } catch (error) {
      console.error('Error deleting Pigmy Plan:', error);
       if (error.name === 'CastError' && error.kind === 'ObjectId') {
          return res.status(400).json({ success: false, message: 'Invalid Plan ID format' });
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  
  // Get all Pigmy Plans
  const getAllPigmyPlans = async (req, res) => {
    try {
      const plans = await PigmyPlanSchema.find();
      res.status(200).json({
        success: true,
        message: 'Pigmy Plans fetched successfully',
        plans
      });
    } catch (error) {
      console.error('Error fetching Pigmy Plans:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  
  // Get single Pigmy Plan by ID
  const getPigmyPlanById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const plan = await PigmyPlanSchema.findById(id);
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Pigmy Plan not found' });
      }
  
      res.status(200).json({
        success: true,
        message: 'Pigmy Plan fetched successfully',
        plan
      });
  
    } catch (error) {
      console.error('Error fetching Pigmy Plan:', error);
       if (error.name === 'CastError' && error.kind === 'ObjectId') {
          return res.status(400).json({ success: false, message: 'Invalid Plan ID format' });
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  const fetchCustomerPaymentSummary = async (req, res) => {
    try {
        // Aggregate to get total deposits and withdrawals per customer
        const depositSummary = await DepositSchema.aggregate([
            { $match: { status: 'approved' } }, // Only count approved deposits for total
            {
                $group: {
                    _id: "$customerId",
                    totalDeposits: { $sum: "$amount" }
                }
            }
        ]);

        const withdrawalSummary = await WithdrawalRequestSchema.aggregate([
             { $match: { status: 'approved' } }, // Only count approved withdrawals for total
            {
                $group: {
                    _id: "$customerId",
                    totalWithdrawals: { $sum: "$amount" }
                }
            }
        ]);

        // Convert summaries to maps for easy lookup
        const depositMap = new Map(depositSummary.map(item => [item._id.toString(), item.totalDeposits]));
        const withdrawalMap = new Map(withdrawalSummary.map(item => [item._id.toString(), item.totalWithdrawals]));

        // Fetch all customers and combine with summary data
        const customers = await CustomerSchema.find({})
            .populate('collectorId', 'name image') // Populate collector name
            .select('name accountNumber accountType balance collectorId profileImage'); // Select relevant customer fields

        const summary = customers.map(customer => {
            const customerId = customer._id.toString();
            const totalDeposits = depositMap.get(customerId) || 0;
            const totalWithdrawals = withdrawalMap.get(customerId) || 0;

            return {
                _id: customer._id,
                name: customer.name,
                accountNumber: customer.accountNumber,
                accountType: customer.accountType,
                balance: customer.balance, // Assuming balance is maintained on customer schema
                totalDeposits: totalDeposits,
                totalWithdrawals: totalWithdrawals,
                collectorId: customer.collectorId, // Includes populated collector name
                profileImage: customer.profileImage,
            };
        });

        res.status(200).json({
            success: true,
            message: "Customer payment summary fetched successfully",
            summary: summary
        });

    } catch (error) {
        console.error("Error fetching customer payment summary:", error);
        res.status(500).json({ success: false, message: "Failed to fetch customer payment summary" });
    }
};

// Function to fetch detailed payments (deposits and withdrawal requests) for a specific customer
const fetchCustomerPaymentDetails = async (req, res) => {
    try {
        const { customerId } = req.params;

        // Check if customer exists (optional but good practice)
        const customer = await CustomerSchema.findById(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        // Fetch all deposits for the customer
        const deposits = await DepositSchema.find({ customerId: customerId }).sort({ date: -1 });

        // Fetch all withdrawal requests for the customer
        const withdrawalRequests = await WithdrawalRequestSchema.find({ customerId: customerId }).sort({ requestDate: -1 });

        res.status(200).json({
            success: true,
            message: "Customer payment details fetched successfully",
            deposits: deposits,
            withdrawalRequests: withdrawalRequests
        });

    } catch (error) {
        console.error("Error fetching customer payment details:", error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
             return res.status(400).json({ success: false, message: 'Invalid Customer ID' });
         }
        res.status(500).json({ success: false, message: "Failed to fetch customer payment details" });
    }
};

// Function to reject a deposit (Admin side)
const rejectDepositAdmin = async (req, res) => {
    try {
        const { depositId } = req.params;
        const { rejectedReason } = req.body;

        const deposit = await DepositSchema.findById(depositId);
        const customer = await CustomerSchema.findById(deposit.customerId);

        if (!deposit) {
            return res.status(404).json({ success: false, message: "Deposit not found" });
        }

        // Only allow rejection if the status is 'pending'
        if (deposit.status !=='approved' && deposit.paymentMethod!=='online'){
            return res.status(400).json({ success: false, message: 'Cannot reject this deposit' });
    }

        deposit.status = 'rejected';
        deposit.rejectedReason = rejectedReason || 'Rejected by admin'; // Store reason
        deposit.updatedAt = new Date(); // Update timestamp
        //deduct the amount from the customer's balance
        customer.balance -= deposit.amount;
        await customer.save();

        await deposit.save();

        // Note: Rejecting a deposit means it was never approved, so no balance change is needed.

        res.status(200).json({
            success: true,
            message: "Deposit rejected successfully",
            deposit: deposit
        });

    } catch (error) {
        console.error("Error rejecting deposit:", error);
         if (error.name === 'CastError' && error.kind === 'ObjectId') {
             return res.status(400).json({ success: false, message: 'Invalid Deposit ID' });
         }
        res.status(500).json({ success: false, message: "Failed to reject deposit" });
    }
};

// Function to reject a withdrawal request (Admin side)
const rejectWithdrawalRequestAdmin = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { rejectionReason } = req.body;


        const withdrawalRequest = await WithdrawalRequestSchema.findById(requestId);

        if (!withdrawalRequest) {
            return res.status(404).json({ success: false, message: "Withdrawal request not found" });
        }

         // Only allow rejection if the status is 'pending'
        if (withdrawalRequest.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Cannot reject a withdrawal request with status '${withdrawalRequest.status}'` });
        }

        withdrawalRequest.status = 'rejected';
        withdrawalRequest.rejectionReason = rejectionReason || 'Rejected by admin'; // Store reason
        withdrawalRequest.updatedAt = new Date(); // Update timestamp

        await withdrawalRequest.save();

        // Note: Rejecting a withdrawal request means it was never approved, so no balance change is needed.

        res.status(200).json({
            success: true,
            message: "Withdrawal request rejected successfully",
            withdrawalRequest: withdrawalRequest
        });

    } catch (error) {
        console.error("Error rejecting withdrawal request:", error);
         if (error.name === 'CastError' && error.kind === 'ObjectId') {
             return res.status(400).json({ success: false, message: 'Invalid Withdrawal Request ID' });
         }
        res.status(500).json({ success: false, message: "Failed to reject withdrawal request" });
    }
};

const getAllFeedbacks = async (req, res) => {
    try {
        // Fetch feedback and conditionally populate source details
        const feedback = await FeedbackSchema.find()
            .populate('sourceId','name email phone')
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({
            success: true,
            feedback,
            message: "Feedback fetched successfully"
        });
        console.log(feedback);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Update feedback status
const updateFeedbackStatus = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const { status, notes } = req.body; // Now accepting both status and notes

        // Validate status
        const validStatuses = ['new', 'in_progress', 'resolved', 'archived', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status provided",
                success: false
            });
        }

        const feedback = await FeedbackSchema.findById(feedbackId);

        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found",
                success: false
            });
        }

        feedback.status = status;
        if (notes !== undefined) {
            feedback.notes = notes;
        }

        await feedback.save();

        res.status(200).json({
            success: true,
            message: "Feedback updated successfully",
            feedback
        });
    } catch (error) {
        console.error("Error updating feedback status:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Fetch comprehensive report data
const getComprehensiveReport = async (req, res) => {
    try {
        // Fetch data from all relevant models concurrently
        const [
            customers,
            collectors,
            pigmyPlans,
            deposits,
            withdrawalRequests,
            feedbackList
        ] = await Promise.all([
            CustomerSchema.find().select('-password').populate('packageId'), // Populate customer's pigmy plan
            CollectorSchema.find().select('-password'),
            PigmyPlanSchema.find(),
            DepositSchema.find().populate('customerId', 'name accountNumber').populate('collectorId', 'name'), // Populate customer and collector for deposits
            WithdrawalRequestSchema.find().populate('customerId', 'name accountNumber'), // Populate customer for withdrawal requests
            FeedbackSchema.find()
                .populate('sourceId','name email phone')
                .sort({ createdAt: -1 })
        ]);

        // You can add further aggregation or processing here if needed
        // For now, we'll return the raw lists

        res.status(200).json({
            success: true,
            report: {
                customers,
                collectors,
                pigmyPlans,
                deposits,
                withdrawalRequests,
                feedbackList
            },
            message: "Comprehensive report fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching comprehensive report:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

                module.exports = {
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
                    // Add new exports for Pigmy Plans
                    addPigmyPlan,
                    updatePigmyPlan,
                    deletePigmyPlan,
                    getAllPigmyPlans,
                    getPigmyPlanById,
                    rejectDepositAdmin,
                    rejectWithdrawalRequestAdmin,
                    // {{ edit_2 }}
                    // Add new exports for Pigmy Plans  
fetchCustomerPaymentSummary,
fetchCustomerPaymentDetails,
getAllFeedbacks,
updateFeedbackStatus,
getComprehensiveReport
                }