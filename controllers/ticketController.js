import Ticket from "../models/Ticket.js";
import mongoose from "mongoose";
import TicketMessage from "../models/TicketMessage.js";
// Create Tickets

export const createTicket = async (req, res) => {
    try {
        const userId = req.user.userId;

        const { name, email, subject, description } = req.body;

        let fileUrl = "";

        //  FILE COMES FROM req.file
        if (req.file) {
            fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }


        const ticket = await Ticket.create({
            userId,
            name,
            email,
            subject,
            description,
            attachment: fileUrl,
        });


        await TicketMessage.create({
            ticketId: ticket._id,
            senderId: userId,
            senderRole: "user",
            message: description
        });

        res.status(201).json({
            message: "Ticket Created Successfully",
            ticket,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error creating ticket",
            error,
        });
    }
};

// export const createTicket = async (req, res) => {
//     try {
//         const { name, email, subject, description } = req.body;

//         const ticket = await Ticket.create({
//             userId: req.user.id, // from auth middleware
//             name,
//             email,
//             subject,
//             description,
//             attachment: req.file ? req.file.path : ""
//         });


//         res.status(201).json({ message: "Ticket created", ticket });

//     } catch (error) {
//         res.status(500).json({ message: "Error creating ticket" });
//     }
// };

// Get Tickets


export const getTickets = async (req, res) => {
    try {
        console.log({ userId: req.user.userId })
        const tickets = await Ticket.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.status(200).json({
            message: "Tickets Fetched Successfully",
            tickets
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching tickets", error });
    }
}

// Delete Tickets
export const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findByIdAndDelete(id);
        res.status(200).json({
            message: "Ticket Deleted Successfully", ticket
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error deleting Ticket ", error
        })
    }
}

// Update Status to close
export const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findByIdAndUpdate(id, { status: "close" }, { new: true });
        res.status(200).json({
            message: "Ticket Status Updated Successfully", ticket
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error updating the status ", error
        })
    }
}

// Fetch specific User Ticket
export const getUserTicket = async (req, res) => {
    try {
        const { id } = req.params;
        // VALIDATION FOR ID
        if (!id || id === "null" || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Ticket ID" });
        }
        const ticket = await Ticket.findById(id);
        res.status(200).json({
            message: "User Ticket Fetched ", ticket
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error fetching the user ticket", error
        })
    }
}

// Send ticket message
export const sendMessage = async (req, res) => {
    try {
        const { ticketId, message } = req.body;

        if (!ticketId) {
            return res.status(400).json({ message: "Ticket ID required" });
        }

        const newMessage = await TicketMessage.create({
            ticketId,
            senderId: req.user.userId,
            senderRole: req.user.role === "admin" ? "admin" : "user",
            message,
            attachment: req.file ? req.file.path : null
        });

        res.status(201).json({
            message: "Message sent",
            data: newMessage
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to send message" });
    }
};

// Get converstation 
export const getConversation = async (req, res) => {
    try {
        const { id } = req.params;

        // const messages = await TicketMessage.findById(id)
        const messages = await TicketMessage.find({ ticketId: id })

            .populate("senderId", "name email")
            .sort({ createdAt: 1 });

        res.json({
            message: "Conversation fetched",
            messages
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch conversation" });
    }
};

// Get all tickets for admin
export const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 }).populate("userId", "name email");
        res.status(200).json({
            message: "All Tickets Fetched Successfully",
            tickets
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching all tickets", error });
    }
}