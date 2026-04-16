import Ticket from "../models/Ticket.js";

// Create Tickets

export const createTicket = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, email, subject, description, attachment } = req.body;
        const ticket = await Ticket.create({
            userId,
            name,
            email,
            subject,
            description,
            attachment,
        });

        res.status(201).json({ message: "Ticket Created Successfully", ticket });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating ticket", error });

    }
}

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
        const tickets = await Ticket.find();
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