import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import axios from "axios";

// Register Subscription
export const createSubscription = async (req, res) => {
    try {
        const userId = req.user.userId;

        const { paymentIntentId, amount, planName, planType } = req.body;

        const subscription = await Subscription.create({
            userId,
            planName,
            planType,
            price: amount / 100,
            status: "active",
            startDate: new Date(),
            endDate: planType === "lifetime" ? null : null, // later you can handle monthly/yearly
            paymentId: paymentIntentId,
        });

        await User.findByIdAndUpdate(userId, {
            isPremium: true,
        });

        res.status(200).json({
            message: "Subscription created",
            subscription,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating subscription" });
    }
};

//  Get Subsciption
export const getSubscription = async (req, res) => {
    const userId = req.user.userId;
    console.log(userId);
    try {
        const subs = await Subscription.find({
            userId
        });
        if (!subs) {
            return res.status(404).json({
                message: "No Subscription found"
            });
        }
        return res.status(200).json({
            message: "All Subscriptions",
            subs
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error fetching subscription",
            error: error.message
        });
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

        // Delete subscription
        await Subscription.findByIdAndDelete(subsId);


        // status change 
        // activeSub.status = "inactive";
        // await activeSub.save();

        res.status(200).json({ message: "Subscription cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling subscription:", error);

        res.status(500).json({ message: "Error cancelling subscription: " + error.message });
    }
}