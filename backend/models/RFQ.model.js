const mongoose = require("mongoose");

const RFQSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  serviceRequired: { type: String, required: true },
  projectDescription: { type: String, required: true },
  file: { type: String }, // URL or file path (optional)
  estimatedBudget: { type: Number },
  deadline: { type: Date, required: true },
  additionalNotes: { type: String },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("RFQ", RFQSchema);
