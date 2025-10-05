import mongoose from "mongoose";

const User = new mongoose.Schema({
  user_name: {
    type: String,
    trim: true,
    default: null,
  },
  designation: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    trim: true,
    default: null,
  },
  temp_password: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    default: null,
  },
  employee_code: {
    type: String,
  },
  name_of_site: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ["super", "admin", "analyst","reviewer","manager"]
  },
  isPasswordSet: {
    type: Boolean,
    default: false,
  },
  resetPasswordOtp: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
  },
  otpVerified: {
    type: Boolean,
    default: false,
  },
  password_reset_token: {
     type: String,
     default: null,
     },
  password_reset_token_expires: { 
    type: Date,
    default: null,
   },
  status: {
    type: String,
    default: "inactive",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: null,
  },
  created_by: {
    type: String,
    default: null,
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
});

export const UserSchema = mongoose.model("User", User);
