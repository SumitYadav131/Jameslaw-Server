import Subscription from "../models/Subscription.js";

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
            data: subs
        });
    } catch (error) {
        console.log(error);
    }
}