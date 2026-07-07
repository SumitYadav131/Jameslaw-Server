import Document from "../models/Document.js";
import Beneficiary from "../models/Beneficiary.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

// Upload a document
export const uploadDocument = async (req, res) => {
    try {
        const fileUrl = req.file.location;

        const doc = await Document.create({
            fileName: req.file.originalname,
            filePath: fileUrl,
            userId: req.user.userId,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
        });

        res.status(200).json({
            message: "Uploaded successfully",
            document: doc,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Upload failed" });
    }
};

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
            docs = await Document.find({
                beneficiaries: userId
            }).sort({ createdAt: -1 });

        } else {
            docs = await Document.find({ userId: userId }).sort({ createdAt: -1 });
        }
        res.json({ success: true, documents: docs, beneficiary, user: userId });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch documents" });
    }
}

export const deleteDocument = async (req, res) => {
    try {
        const docId = req.params.id;

        const doc = await Document.findById(docId);

        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Extract file key from S3 URL
        const fileUrl = doc.filePath;
        const fileKey = fileUrl.split(".amazonaws.com/")[1];

        // Delete from S3
        await s3.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileKey,
            })
        );

        // Delete from DB
        await Document.findByIdAndDelete(docId);

        res.status(200).json({ message: "Document deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message || "Failed to delete document" });
    }
};

// Get document details
export const getDocumentDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await Document.findById(id).lean();

        if (!doc) {
            return res.status(404).json({
                message: "Document not found"
            });
        }

        // Optional: security check
        // if (doc.userId.toString() !== req.user.id) {
        //   return res.status(403).json({
        //     message: "Unauthorized access"
        //   });
        // }

        res.status(200).json({
            message: "Document Fetched Successfully",
            doc
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error fetching the document",
            error: error.message
        });
    }
};

// Assign Beneficiaries
export const assignBeneficiaries = async (req, res) => {
    try {
        const { docId } = req.params;
        const { beneficiaries } = req.body; // array of userIds

        const doc = await Document.findByIdAndUpdate(
            docId,
            { beneficiaries },
            { new: true }
        );

        res.json({
            message: "Beneficiaries assigned",
            doc
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to assign beneficiaries" });
    }
};