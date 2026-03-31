import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId, ref: "User"
        },
        transactionId: String,
        amount: Number,
        currency: String,
        status: String,
        paymentDate: Date,
    }, { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);