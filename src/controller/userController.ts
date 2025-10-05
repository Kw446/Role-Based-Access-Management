import { Request, Response, NextFunction } from "express";
import { UserSchema } from "../model/userModel";
import bcrypt, { hashSync, genSaltSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { currentUserDataHelper } from "../helper/commonHelper";
import { sendRecoveryPasswordEmailForUser } from "../helper/emailHelper";
import path from "path";
import fs from "fs";
import pdfParse from 'pdf-parse'

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { employee_code, password } = req.body;

    if (!employee_code) {
      return res.json({
        status: 400,
        success: false,
        type: "employee_code",
        message: "Please enter employee_code ",
      });
    }

    if (typeof employee_code !== "string") {
      return res.json({
        status: 400,
        success: false,
        type: "employee_code",
        message: "Please enter valid employee code",
      });
    }
    const userData = await UserSchema.findOne({ employee_code }).sort({
      created_at: -1,
    });
    if (!userData) {
      return res.json({
        status: 400,
        success: false,
        type: "employee_code",
        isNewUser: true,
        message: "You are not registered",
      });
    }

    if (userData.status !== "active") {
      return res.json({
        status: 403,
        success: false,
        message: "Your account is inactive. Please contact the administrator.",
      });
    }
    // Check password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      String(userData.password)
    );
    if (!isPasswordCorrect) {
      return res.json({
        status: 400,
        success: false,
        message: "Incorrect email or password",
      });
    }
    const token = jwt.sign(
      { user_id: userData._id, email:userData.email,employee_code: userData.employee_code, role: userData.role },
      process.env.TOKEN_SECRET_KEY as string,
      { expiresIn: "1d" }
    );
    return res.json({
      status: 200,
      success: true,
      message: "Login successfully",
      token,
      role: userData.role,
      data: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.json({
      status: 500,
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.UserData?.user_id;
    const user: any = await currentUserDataHelper(userId);
    if (!user) {
      return res.json({
        status: 400,
        success: false,
        message: "User not found",
      });
    }
    return res.json({
      status: 200,
      success: true,
      message: "User data fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      status: 500,
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.UserData?.user_id;
    const { user_name, designation, employee_code, name_of_site } = req.body;

    const user: any = await currentUserDataHelper(userId);
    if (!user) {
      return res.json({
        status: 404,
        success: false,
        message: "User not found",
      });
    }
    const updates: any = {};

    if (user_name) {
      updates.user_name = user_name.trim();
    } else {
      updates.user_name = user.user_name;
    }

    if (designation) {
      updates.designation = designation.trim();
    } else {
      updates.designation = user.designation;
    }

    if (employee_code) {
      updates.employee_code = employee_code.trim();
    } else {
      updates.employee_code = user.employee_code;
    }

    if (name_of_site) {
      updates.name_of_site = name_of_site.trim();
    } else {
      updates.name_of_site = user.name_of_site;
    }

    updates.updated_at = Date.now();

    const updatedUser = await UserSchema.findByIdAndUpdate(userId, updates, {
      new: true,
    });
    return res.json({
      status: 200,
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      success: false,
      message: "Internal server error",
    });
  }
};

export const changePasswordByUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.UserData?.user_id;
    const { old_password, new_password, confirm_password } = req.body;

    if (!userId) {
      return res.json({
        status: 400,
        success: false,
        message: "User ID is required",
      });
    }
    const existingUser: any = await currentUserDataHelper(userId);
    if (!existingUser) {
      return res.json({
        status: 400,
        success: false,
        message: "User not found",
      });
    }
    if (!old_password) {
      return res.json({
        status: 400,
        success: false,
        type: "old_password",
        message: "Please enter current password",
      });
    }
    const match = await bcrypt.compare(
      old_password,
      String(existingUser.password)
    );
    if (!match) {
      return res.json({
        status: 400,
        success: false,
        type: "old_password",
        message: "Current password is incorrect",
      });
    }
    if (!new_password) {
      return res.json({
        status: 400,
        success: false,
        type: "new_password",
        message: "Please enter new password",
      });
    }
    if (!confirm_password) {
      return res.json({
        status: 400,
        success: false,
        type: "confirm_password",
        message: "Please enter confirm password",
      });
    }
    if (new_password !== confirm_password) {
      return res.json({
        status: 400,
        success: false,
        message: "New password and confirm password do not match",
      });
    }
    if (old_password === new_password && confirm_password) {
      return res.json({
        status: 400,
        success: false,
        message: "New password cannot be the same as the current password",
      });
    }
    if (new_password.length < 6) {
      return res.json({
        status: 400,
        success: false,
        message: "Password should be at least 6 characters long",
      });
    }
    if (new_password.length > 15) {
      return res.json({
        status: 400,
        success: false,
        message: "New password should not be greater than 15 characters long",
      });
    }
    const salt = await bcrypt.genSalt(12);
    const hashedNewPassword = await bcrypt.hash(new_password, salt);

    (existingUser.password = hashedNewPassword),
      (existingUser.updated_at = Date.now()),
      (existingUser.updated_by = userId);
    await existingUser.save();
    return res.json({
      status: 200,
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      success: false,
      message: "Internal server error",
    });
  }
};

export const recoveryEmailPasswordByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { email } = req.body;
    if (email) {
      email = email.toLowerCase().trim();
    }
    if (!email || email.trim() === "") {
      return res.json({
        status: 400,
        success: false,
        type: "email",
        message: "Please enter an email address",
      });
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      return res.json({
        status: 400,
        success: false,
        type: "email",
        message: "Please enter a valid email address",
      });
    }

    const checkEmail = await UserSchema.find({ email });

    if (checkEmail.length === 0) {
      return res.json({
        status: 400,
        type: "email",
        success: false,
        message: "Your email is not registered",
      });
    }

    const user = checkEmail[0];
    const allowedTargetRoles = ["manager", "reviewer", "analyst" , "admin"];

    if (!user.role || !allowedTargetRoles.includes(user.role)) {
      return res.json({
        status: 400,
        success: false,
        message: `Only users with roles ${allowedTargetRoles.join(", ")} can have their status updated.`,
      });
    }

    if (user.status === "inactive") {
      return res.json({
        status: 400,
        type: "email",
        success: false,
        message: "Your email is inactive, please contact admin",
      });
    }

    const token = jwt.sign(
      {
        user_id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.TOKEN_SECRET_KEY as string,
      { expiresIn: "10m" }
    );

    user.password_reset_token = token;
    user.password_reset_token_expires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendRecoveryPasswordEmailForUser(user.email, token, user.user_name);

    return res.json({
      status: 200,
      success: true,
      email: user.email,
      message: "Email has been sent to your email address",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      success: false,
      message: "Internal server error",
    });
  }
};

export const setnewForgetPasswordBylinkByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.query;
    const { new_password, confirm_password } = req.body;

    if (!token) {
      return res.json({
        status: 400,
        success: false,
        message: "Token is required",
      });
    }

    let decodedToken: any;
    decodedToken = jwt.verify(
      token as string,
      process.env.TOKEN_SECRET_KEY as string
    );
    if (!decodedToken) {
      return res.json({
        status: 400,
        success: "false",
        message: "Invalid token",
      });
    }
    const user_id = decodedToken.user_id;
    const user = await UserSchema.findOne({ _id: user_id });

    if (!user) {
      return res.json({
        status: 400,
        success: false,
        message: "User not found",
      });
    }

    if (
      !user.password_reset_token_expires ||
      user.password_reset_token_expires < new Date()
    ) {
      return res.json({
        status: 400,
        success: false,
        message: "Token has expired. Please request a new password reset.",
      });
    }
    if (!new_password || new_password.trim() === "") {
      return res.json({
        status: 400,
        type: "password",
        success: false,
        message: "Please enter new password",
      });
    }
    if (!confirm_password || confirm_password.trim() === "") {
      return res.json({
        status: 400,
        type: "password",
        success: false,
        message: "Please enter confirm password",
      });
    }
    if (new_password !== confirm_password) {
      return res.json({
        status: 400,
        type: "password",
        success: false,
        message: "New password and confirm password do not match",
      });
    }
    if (new_password.length < 6) {
      return res.json({
        status: 400,
        type: "password",
        success: false,
        message: "Password should be at least 6 characters long",
      });
    }
    if (new_password.length > 15) {
      return res.json({
        status: 400,
        success: false,
        message: "Password should not be greater than 15 characters",
      });
    }
    const salt = genSaltSync(12);
    const hashedPassword = hashSync(new_password, salt);

    await UserSchema.findByIdAndUpdate(user._id, {
      $set: {
        password: hashedPassword,
        password_reset_token: null,
        password_reset_token_expires: null,
      },
    });

    return res.json({
      status: 200,
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      success: false,
      message: "Internal server error",
    });
  }
};

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.json({
        status: 400,
        success: false,
        message: "No file uploaded. Please upload at least one file.",
      });
    }
    let uploadedFiles = [];
    if (
      Array.isArray((req.files as any).uploadGallery) &&
      (req.files as any).uploadGallery.length > 0
    ) {
      uploadedFiles = await Promise.all(
        (req.files as any).uploadGallery.map(async (file: any) => {
          let filePath = path.join( file.filename);

          const fileInfo: any = {
            fileType: file.mimetype,
            src: filePath,
            fileName: file.originalname,
          };

          return fileInfo;
        })
      );
    } else {
      return res.json({
        status: 400,
        success: false,
        message: "Upload at least one file.",
      });
    }
    return res.json({
      status: 200,
      success: true,
      file_data: uploadedFiles,
      message: "Files uploaded successfully.",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
