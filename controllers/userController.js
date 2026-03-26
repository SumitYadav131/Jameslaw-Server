import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import PendingUser from "../models/PendingUser.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// Register User
export const registerUser = async (req, res) => {

    // const baseurl = "https://jameslaw-server.onrender.com";

    const baseurl = process.BASE_URL;


    const { name, email, password, phone, country, city, pincode, state, dob, streetaddress } = req.body;

    if (!name || !email || !password || !country || !state || !pincode || !phone || !streetaddress) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const normalizedEmail = email.toLowerCase();

        if (await User.findOne({ email: normalizedEmail })) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Remove old pending user 
        await PendingUser.deleteMany({ email: normalizedEmail });

        const hashpass = await bcrypt.hash(password, 10);

        const verifyToken = crypto.randomBytes(32).toString("hex");

        await PendingUser.create({
            name,
            email: normalizedEmail,
            password: hashpass,
            phone: phone,
            country: country,
            city: city,
            state: state,
            pincode: pincode,
            dob: dob,
            streetaddress: streetaddress,
            verifyToken,
            verifyTokenExpiry: Date.now() + 60 * 60 * 1000
        });

        const verifyLink = `${baseurl}/verify-email?token=${verifyToken}`;

        // const verifyLink = `http://localhost:3000/verify-email?token=${verifyToken}`;

        // Will add nodemailer 
        console.log("Verify Link:", verifyLink);

        // Email logic here

        await sendEmail(
            email,
            "Verify Your Account",
            `<h2>Click below to verify</h2>
         <a href="${verifyLink}">Verify Email</a>`
        );

        res.status(200).json({
            message: "Verification email sent. Please check your email."
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });

    }
}

// Check User
export const checkUser = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(409).json({ message: "email is required" });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        res.status(200).json({
            exists: !!user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
}

// Login User
export const loginUser = async (req, res) => {
    console.log("running login route");
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const lowerEmail = email.toLowerCase();

        const user = await User.findOne({ email: lowerEmail });

        if (!user) {
            return res.status(401).json({ message: "invalid Credentials" })
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1D" }
        );

        res.json({
            message: "Login Successful",
            token,
            user: {
                // changed id name
                _id: user._id,
                name: user.name,
                email: user.email,
                state: user.state,
                phone: user.phone,
                country: user.country,
                city: user.city,
                pincode: user.pincode,
                streetaddress: user.streetaddress,
                dob: user.dob
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "server Error"
        })
    }
}

// Verify Email
export const verifyEmail = async (req, res) => {
    const { token } = req.query;
    try {
        const pendingUser = await PendingUser.findOne({
            verifyToken: token,
            verifyTokenExpiry: { $gt: Date.now() }
        });

        console.log(PendingUser);

        if (!pendingUser) {
            return res.status(400).send("Invalid or expired token");
        }

        const user = await User.create({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password,
            phone: pendingUser.phone,
            country: pendingUser.country,
            city: pendingUser.city,
            state: pendingUser.state,
            pincode: pendingUser.pincode,
            dob: pendingUser.dob,
            streetaddress: pendingUser.streetaddress,
            isVerified: true
        });

        await PendingUser.deleteOne({
            _id: pendingUser._id
        });

        res.redirect('http://localhost:5173/login')

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}


// Update Profile
export const updateProfile = async (req, res) => {
    const { userid, email, phone, state, city, pincode, streetaddress, country, dob, name } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(userid, {
            email, phone, pincode, city, state, country, streetaddress, dob, name
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "user not found" });
        }

        res.json({
            message: "Profile Updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }

}

// Update Profile Pass
export const updateProfilepass = async (req, res) => {
    const { userid, oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).json({
                message: "User Not Found"
            })
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect Old Password"
            })
        }

        const hashpassword = await bcrypt.hash(newPassword);

        user.password = hashpassword;

        await user.save();

        return res.json({ message: "Password Changed Successfully" });
    } catch (error) {
        res.status(500).json({
            message: "server error" . error
        });
    }




}