import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        planName: String,
        planType: {
            type: String,
            enum: ["monthly", "yearly"],
        },
        price: Number,
        status: String,
        startDate: Date,
        endDate: Date,
        paymentId: String,
    }
);

export default mongoose.model("Subscription", subscriptionSchema);