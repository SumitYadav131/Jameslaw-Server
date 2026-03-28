import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        planName: String,
        planType: String,
        price: Number,
        status: String,
        startDate: Date,
        endDate: Date,
        paymentId: String,
    }
);

export default mongoose.model("subscription", subscriptionSchema);