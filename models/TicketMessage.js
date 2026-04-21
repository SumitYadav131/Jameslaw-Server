import mongoose from "mongoose";

const ticketMessageSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true
    },

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    senderRole: {
        type: String,
        enum: ["user", "admin"],
        required: true
    },

    message: {
        type: String
    },

    attachment: {
        type: String
    }

}, { timestamps: true });

export default mongoose.model("TicketMessage", ticketMessageSchema);