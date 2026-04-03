import Document from "../models/Document.js";
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