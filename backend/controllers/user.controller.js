const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const { z } = require("zod");
const fs = require("fs");
const path = require("path");

// Register Schema Validation
const RegisterSchema = z.object({
  firstName: z.string().min(3, "First Name must be at least 3 characters long!"),
  lastName: z.string().min(3, "Last Name must be at least 3 characters long!"),
  phoneNo: z.string().length(10, "Phone number must be exactly 10 digits"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password should be at least 6 characters long!"),
  role: z.enum(["admin", "employee", "client"]),
});

// Login Schema Validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long!"),
  role: z.enum(["admin", "employee", "client"]),
  accessId: z.string(),
});

// Signup Function
const Signup = async (req, res) => {
  try {
    const result = RegisterSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ msg: "Validation failed", errors: result.error.errors });
    }
    console.log("BACKEND - Received signup data:", result.data);
    const { firstName, lastName, phoneNo, email, password, role } = result.data;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ msg: "Email already exists. Try a different email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      firstName,
      lastName,
      phoneNo,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({ msg: "User registered successfully!", success: true });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// Signin Function
const Signin = async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ msg: "Validation failed", errors: result.error.errors });
    }

    const { email, password, role, accessId } = result.data;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ msg: "Incorrect email ID", success: false });
    }

    const isPassMatched = await bcrypt.compare(password, user.password);
    if (!isPassMatched) {
      return res.status(401).json({ msg: "Incorrect password", success: false });
    }

    if ((role === "admin" || role === "employee") && accessId !== process.env.ACCESS_ID) {
      return res.status(401).json({ msg: "Incorrect Access Id", success: false });
    }
    console.log("BACKEND - Login attempt for:", result.data.email, "with role:", result.data.role);

    const token = jwt.sign(
      {
        id: user._id,
        name: user.firstName,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      msg: `Welcome, ${user.firstName}!`,
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// Get user info
const userInfo = async (req, res) => {
  try {
    console.log("Authenticated user:", req.user);
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    console.log("Fetched user:", user);
    return res.status(200).json({ user });
  } catch (error) {
    console.error("UserInfo error:", error);
    return res.status(500).json({ msg: "Internal server error", error: error.message });
  }
};

// Update user profile
const Updateuser = async (req, res) => {
  try {
    const updates = req.body;
    console.log("Update request body:", updates);

    if (!updates) {
      return res.status(400).json({ msg: "No data provided" });
    }

    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized user" });
    }

    // Handle file upload if present
    if (req.file) {
      console.log("Processing uploaded file:", req.file.filename);
      const imagePath = path.join(__dirname, "../Uploads/", req.file.filename);

      try {
        if (!fs.existsSync(imagePath)) {
          console.error(`File does not exist at path: ${imagePath}`);
          return res.status(500).json({ msg: "Error: Uploaded file not found" });
        }

        const imageData = fs.readFileSync(imagePath);
        updates.image = {
          data: imageData,
          contentType: req.file.mimetype,
        };

        console.log("Image processed successfully");
        // Optionally clean up the file
        // fs.unlinkSync(imagePath);
      } catch (fileError) {
        console.error("Error processing image file:", fileError);
        return res.status(500).json({ msg: "Error processing image file: " + fileError.message });
      }
    }

    const allowedUpdates = ["firstName", "lastName", "phoneNo", "location", "JobTitle", "department", "bio", "image"];
    const updateFields = Object.keys(updates).filter((field) => allowedUpdates.includes(field));

    if (updateFields.length === 0) {
      return res.status(400).json({ msg: "No valid fields to update" });
    }

    const filteredUpdates = {};
    updateFields.forEach((field) => {
      filteredUpdates[field] = updates[field];
    });

    console.log("Updating user with fields:", updateFields);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdates },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({
      msg: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ msg: "Internal Server Error: " + error.message });
  }
};

// Get all users with pagination
const getAllUser = async (req, res) => {
  try {
    console.log("getAllUser called with query:", req.query);
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const users = await User.find({ role: "client" })
      .skip(skip)
      .limit(Number(limit))
      .select("-password");
    const total = await User.countDocuments({ role: "client" });
    res.status(200).json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error("Get all users error:", error.message);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

module.exports = {
  Signup,
  Signin,
  userInfo,
  Updateuser,
  getAllUser,
};