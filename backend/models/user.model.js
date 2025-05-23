const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    phoneNo: { type: String, unique: true, required: true, trim: true, maxLength: 10, match: /^\d{10}$/ },
    password: { type: String, required: true, trim: true, select: false },
    role: { type: String, enum: ["admin","employee", "client"],default: "client", required: true, lowercase: true },
    location: { type: String, default: "Not provided" },
    JobTitle: { type: String, default: "" },
    department: { type: String, default: "Not provided" },
    joinDate: { type: Date, default: Date.now },
    bio: { type: String, default: "" },
    image : {
        data : Buffer,
        contentType : String
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
