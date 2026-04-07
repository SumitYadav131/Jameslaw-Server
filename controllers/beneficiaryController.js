import Beneficiary from "../models/Beneficiary.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Register a new beneficiary
export const registerBeneficiary = async (req, res) => {
    const ownerId = req.user.userId; // logged-in user

    const { name, email, password, relationship, dob, streetaddress, pincode, state, city, country, phone } = req.body;

    if (!name || !email || !password || !relationship) {
        return res.status(400).json({ message: "All fields required" });
    }

    try {
        const lowerEmail = email.toLowerCase();

        // check existing
        const existingUser = await User.findOne({ email: lowerEmail });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create beneficiary user
        const beneficiaryUser = await User.create({
            name,
            email: lowerEmail,
            password: hashedPassword,
            phone: phone,
            country: country,
            city: city,
            state: state,
            pincode: pincode,
            dob: dob,
            streetaddress: streetaddress,
            role: "beneficiary",
            ownerId: ownerId

        });

        // create relation
        await Beneficiary.create({
            ownerId,
            beneficiaryId: beneficiaryUser._id,
            relationship
        });

        res.status(201).json({
            message: "Beneficiary added successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get beneficiaries for logged-in user
export const getBeneficiaries = async (req, res) => {
    const ownerId = req.user.userId;
    try {
        const beneficiaries = await Beneficiary.find({ ownerId }).populate("beneficiaryId", "name email dob streetaddress pincode state city country phone");
        res.json({ beneficiaries });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete beneficiary
export const deleteBeneficiary = async (req, res) => {
    const ownerId = req.user.userId;
    const beneficiaryId = req.params.id;
    try {
        await Beneficiary.findOneAndDelete({ ownerId, beneficiaryId });
        await User.findByIdAndDelete(beneficiaryId);
        res.status(200).json({ message: "Beneficiary deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting beneficiary" });

    }
}

// Update beneficiary
export const updateBeneficiary = async (req, res) => {
    try {
        const { id } = req.params;

        const beneficiaryId = id;

        const {
            name,
            email,
            phone,
            streetaddress,
            city,
            state,
            country,
            pincode,
            dob,
            relationship
        } = req.body;

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            beneficiaryId,
            {
                name,
                email,
                phone,
                streetaddress,
                city,
                state,
                country,
                pincode,
                dob
            },
            { new: true }
        );

        // Update beneficiary relationship
        await Beneficiary.findOneAndUpdate(
            { beneficiaryId: beneficiaryId },
            { relationship }
        );

        res.json({
            message: "Beneficiary updated successfully",
            user: updatedUser
        });

    } catch (error) {
        res.status(500).json({
            message: "Update failed",
            error: error.message
        });
    }
};