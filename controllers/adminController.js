import User from "../models/User.js";

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Deleting User" });
    }
}

export const registerUserByAdmin = async (req, res) => {
    try {
        const { name, email, password, phone, country, city, pincode, state, dob, streetaddress } = req.body;
        if (!name || !email || !password || !country || !state || !pincode || !phone || !streetaddress) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const normalizedEmail = email.toLowerCase();

        if (await User.findOne({ email: normalizedEmail })) {
            return res.status(409).json({ message: "User already exists" });
        }
        const newUser = await User.create({
            name,
            email: normalizedEmail,
            password,
            phone,
            country,
            city,
            state,
            pincode,
            dob,
            streetaddress,
            role: "user"
        });
        res.status(201).json({
            message: "User registered successfully",
            user: newUser
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error Registering User"
        })
    }
}

export const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        res.status(200).json({
            message: "User details fetched successfully",
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error fething user details",
        })
    }
}