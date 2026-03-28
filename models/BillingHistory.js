import mongoose from "mongoose";

const billinghistorySchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    date: Date,
    status: String,
});


export default mongoose.model("billinghistory", billinghistorySchema);