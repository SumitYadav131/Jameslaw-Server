import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import PendingUser from "../models/PendingUser.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { GoogleGenAI } from "@google/genai";


const clientUrl = process.env.CLIENT_url;
const geminiKey = process.env.geminiKey;

// Register User
export const registerUser = async (req, res) => {

    // const baseurl = "https://jameslaw-server.onrender.com";

    const baseurl = process.env.BASE_URL;

    console.log(baseurl);

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
        // Will add nodemailer 
        console.log("Verify Link:", verifyLink);

        // Email logic here

        await sendEmail(
            email,
            "Verify Your Account",
            `<h2>Click below to verify</h2>
         <a href="${verifyLink}">/Verify Email</a>`
        ).catch(err => console.log("Email failed:", err));

        res.status(200).json({
            message: "Verification email sent. Please check your email."
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Fail seding mail" });

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
    // console.log("running login route");
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

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = otp;
        user.otpExpire = Date.now() + 5 * 60 * 1000; // 5 min

        await user.save();

        // Send mail
        await sendEmail(
            user.email,
            "Your Login OTP",
            `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`
        ).catch(err => console.log("Email failed:", err));

        res.json({
            message: "OTP sent to email",
            userId: user._id
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "server Error"
        })
    }
}

// Get All Users 

// export const getAllUsers = async (req, res) => {
//     try {
//         const users = await User.find();
//         res.json({ users });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Server Error" });
//     }
// }

// Modified role based fetch users 
export const getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;

        let filter = {};

        if (role && role !== "all") {
            filter.role = role;
        }

        const users = await User.find(filter).sort({ createdAt: -1 });

        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

// Verify Otp
export const verifyOtp = async (req, res) => {
    const { userId, otp } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user || user.otp != otp || user.otpExpire < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        // Clear OTP
        user.otp = undefined;
        user.otpExpire = undefined;

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );



        res.json({
            message: "Login successful",
            token,
            user
        });
    } catch (error) {
        console.log(error);
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
            res
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

        res.redirect(`${clientUrl}/login`)

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

        const hashpassword = await bcrypt.hash(newPassword, 10);

        user.password = hashpassword;

        await user.save();

        return res.json({ message: "Password Changed Successfully" });
    } catch (error) {
        res.status(500).json({
            message: "server error",
            error: error.message
        });
    }




}

// Get Profile Details
export const getProfileDetails = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
}

// Forgot Password Link
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000 // 15min

        await user.save();

        const resetURL = `${clientUrl}resetpassword/${resetToken}`;

        //     const message = `
        //   <h2>Password Reset Request</h2>
        //   <p>Hello ${user.name},</p>
        //   <p>Click below to reset password:</p>
        //   <a href="${resetURL}">${resetURL}</a>
        //   <p>This link expires in 15 minutes</p>
        // `;

        const message = `
<div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">

    <!-- Header -->
    <div style="background-color: #F5B301; padding: 20px; text-align: center; color: #ffffff;">
      <h2 style="margin: 0;">Password Reset</h2>
    </div>

    <!-- Body -->
    <div style="padding: 30px;">
      <p style="font-size: 16px;">Hello <strong>${user.name}</strong>,</p>

      <p style="font-size: 14px; color: #555;">
        We received a request to reset your password. Click the button below to set a new password.
      </p>

      <!-- Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetURL}" 
           style="background-color: #F5B301; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 14px; display: inline-block;">
          Reset Password
        </a>
      </div>

      <p style="font-size: 13px; color: #777;">
        This link will expire in <strong>15 minutes</strong>.
      </p>

      <p style="font-size: 13px; color: #777;">
        If you did not request this, you can safely ignore this email.
      </p>

      <!-- Fallback link -->
      <p style="font-size: 12px; color: #999; margin-top: 20px;">
        Or copy and paste this URL into your browser:<br/>
        <a href="${resetURL}" style="color: #4CAF50;">${resetURL}</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
      © ${new Date().getFullYear()} Your Company. All rights reserved.
    </div>

  </div>
</div>
`;

        await sendEmail(user.email, "Reset Password", message);

        res.json({
            messages: "Reset link send to Email",
            reseturl: resetURL
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Forgetting password" })
    }
}

// Reset Password
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;
    try {
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match" });
        }
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: "Token invalid or expired" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.json({ message: "Password reset successfully" });

    } catch (error) {
        console.log(error);
        res.json({ message: "Error reseting password" });
    }
}

export const generateContent = async (req, res) => {
    try {
        const { prompt } = req.body;
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });
        console.log(response.text);
        res.json({
            status: "true",
            response: response.text
        })
    } catch (err) {
        console.log(err);
    }

}