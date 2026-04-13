import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, reqquired: true },
    description: { type: String, required: true },
    attachment: String,
    status: { type: String, ennum: ["open", "close"], default: "open" },

}, { timestamps: true });

export default mongoose.model("Ticket ", ticketSchema);