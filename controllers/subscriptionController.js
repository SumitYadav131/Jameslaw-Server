import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import axios from "axios";

// Register Subscription
export const registerSubscription = async (req, res) => {
    const {
        planName,
        planType,
        price,
        status,
        startDate,
        endDate,
        paymentId
    } = req.body;

    const userId = req.user.userId;


    if (!userId || !planName || !planType || !price) {
        return res.status(400).json({
            message: "Required fields missing"
        });
    }

    try {
        const newSub = await Subscription.create({
            userId,
            planName,
            planType,
            price,
            status: status || "active",
            startDate: startDate || new Date(),
            endDate,
            paymentId
        });

        res.status(201).json({
            message: "Subscribed to plan " + planName,
            data: newSub
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

//  Get Active Subsciption
export const getActiveSubscription = async (req, res) => {
    const userId = req.user.userId;
    console.log(userId);
    try {
        const subs = await Subscription.findOne({
            userId,
            status: "active"
        });
        if (!subs) {
            return res.status(404).json({
                message: "No Active Subscription"
            });
        }
        return res.status(200).json({
            message: "Active Subscription",
            subs
        });
    } catch (error) {
        console.log(error);
    }
}

// cancel subscription
export const cancelSubscription = async (req, res) => {
    const userId = req.user.userId;
    const token = req.headers.authorization?.split(" ")[1];
    const subsId = req.body.subsId;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const activeSub = await Subscription.findOne({ userId, status: "active", _id: subsId });
        if (!activeSub) {
            return res.status(404).json({ message: "No active subscription found" });
        }
        // status change 
        activeSub.status = "inactive";
        await activeSub.save();

        res.status(200).json({ message: "Subscription cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling subscription:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}