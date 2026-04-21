import Document from "../models/Document.js";
import Beneficiary from "../models/Beneficiary.js";

// Upload a document
export const uploadDocument = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { docName } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const doc = await Document.create({
            userId,
            fileName: docName || req.file.filename,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            originalName: req.file.originalname,
        });
        res.json({
            message: "File uploaded successfully", document: doc
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Upload failed" });
    }
}

// Get user's documents
export const getDocuments = async (req, res) => {
    try {
        const userId = req.user.userId;
        let docs;
        // Beneficiaries allow to show owner docs
        const beneficiary = await Beneficiary.findOne({
            beneficiaryId: userId
        })
        if (beneficiary) {
            docs = await Document.find({ userId: beneficiary.ownerId }).sort({ createdAt: -1 });
        } else {
            docs = await Document.find({ userId: userId }).sort({ createdAt: -1 });
        }
        res.json({ success: true, documents: docs, beneficiary, user: userId });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch documents" });
    }
}

// Delete document 
export const deleteDocument = async (req, res) => {
    try {
        const userId = req.user.userId;
        const docId = req.params.id;
        const doc = await Document.findOneAndDelete({ _id: docId, userId });
        res.json({ message: "Document deleted successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to delete document" });
    }
}

// Get document details
export const getDocumentDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = Document.findById(id);
        res.status(200).json({
            message: "Document Fetched Successfully", doc
        })
    } catch (error) {
        res.status(500).json({
            message: "Error fetching the documents", error
        })
    }
} 