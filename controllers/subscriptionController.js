import Subscription from "../models/Subscription";


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