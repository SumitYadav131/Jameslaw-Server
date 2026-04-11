import mongoose from "mongoose";

const beneficiarySchema = new mongoose.Schema({

    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    relationship: {
        type: String,
        enum: ["father", "mother", "child", "other"],
    }

}, { timestamps: true });

export default mongoose.model("Beneficiary", beneficiarySchema);
