import { Request, Response, NextFunction } from "express";
import { UserSchema } from "../model/userModel";
import bcrypt, { hashSync, genSaltSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { currentUserDataHelper } from "../helper/commonHelper";
import {
  sendEmailForAccountCretaionForUserbyAdmin,
  sendEmailForAdminAccountCretaionByAdmin,
  sendRecoveryPasswordEmailForAdmin,
} from "../helper/emailHelper";
import path from "path";

dotenv.config();

const TOKEN_SECRET_KEY:any = process.env.TOKEN_SECRET_KEY ;
const TOKEN_EXPIRE_TIME :any = process.env.TOKEN_EXPIRE_TIME ;

export const getAdminById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.UserData?.user_id;
    if (!userId) {
      return res.json({
        status: 400,
        success: false,
        message: "Unauthorized access - missing user ID",
      });
    }
    const user: any = await currentUserDataHelper(userId);
    if (!user) {
      return res.json({
        status: 400,
        success: false,
        message: "Admin not found",
      });
    }
    return res.json({
      status: 200,
      success: true,
      message: "Admin data fetched successfully",
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
export const getUserByIdByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.UserData?.user_id;
    const userDetails:any= req.query.user_id
    const user: any = await currentUserDataHelper(userDetails);
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

export const createUserByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    user_name,
    designation,
    email,
    temp_password,
    employee_code,
    name_of_site,
    role,
  } = req.body;

  try {
    const userExists = await UserSchema.findOne({ email });
    if (userExists) {
      return res.json({
        status: 400,
        success: false,
        message: "User already exists",
      });
    }

    const salt = genSaltSync(12);
    const hashedPassword = hashSync(temp_password, salt);

    const user = new UserSchema({
      user_name,
      designation,
      email,
      temp_password: hashedPassword,
      employee_code,
      name_of_site,
      role,
      created_by: req.UserData?.user_id,
    });
    const createdUser = await user.save();
    const token = jwt.sign(
      {
        user_id: user._id,
        email: user.email,
        role: user.role,
        employee_code:user.employee_code
      },
      process.env.TOKEN_SECRET_KEY as string,
      { expiresIn: TOKEN_EXPIRE_TIME  }
    );
    
    sendEmailForAccountCretaionForUserbyAdmin(token,user_name, email,employee_code, temp_password);
   return res.json({
      status: 200,
      success: true,
      message: "User created successfully",
      data: createdUser,
    });

  } catch (err) {
    console.error(err);
    next(err);
   return res.json({
      status: 500,
      success: false,
      message: "Internal Server error",
    });
  }
};

export const updateUserByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.UserData?.user_id;
    const { user_id } = req.params;
    const { designation, role, name_of_site,status } = req.body;

    const existingUser: any = await currentUserDataHelper(user_id);
    if (!existingUser) {
      return res.json({
        status: 404,
        success: false,
        message: "User not found",
      });
    }
    const updates: any = {
      updated_at: Date.now(),
      update_by: userId,
    };

    if (designation !== undefined) updates.designation = designation;
    if (role !== undefined) updates.role = role;
    if (name_of_site !== undefined) updates.name_of_site = name_of_site;
    if (status !== undefined) updates.status = status;

    const updatedUser = await UserSchema.findByIdAndUpdate(user_id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      status:200,
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    next(error);
    return res.json({
      status:500,
      success: false,
      message: "Internal server error",
    });
  }
};


export const deleteUserByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.UserData?.user_id;
    const { user_id } = req.params;
    if (!user_id) {
      return res.json({
        status: 400,
        success: false,
        message: "id must be provided",
      });
    }
    const existingUser: any = await currentUserDataHelper(user_id);
    if (!existingUser) {
      return res.json({
        status: 400,
        success: false,
        message: "User not found",
      });
    }
    const deletedUser = await UserSchema.findByIdAndDelete(user_id);
    return res.json({
      status: 200,
      success: true,
      message: "User deleted successfully",
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

export const changePasswordByAdminProfile = async (
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
      message: "Password updated successfully of Admin",
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

export const recoveryEmailPasswordByAdmin = async (
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

    if (user.status === "inactive") {
      return res.json({
        status: 400,
        type: "email",
        success: false,
        message: "Your email is inactive, please contact admin",
      });
    }
    // if (user.role! === "admin") {
    //   return res.json({
    //     status: 400,
    //     success: false,
    //     message:
    //       "Unauthorized: Only admin can click forget password via this email",
    //   });
    // }
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

    await sendRecoveryPasswordEmailForAdmin(user.email, token, user.user_name);

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

export const setnewForgetPasswordBylinkByAdmin = async (
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

    if (!decodedToken.role || decodedToken.role !== "admin") {
      return res.json({
        status: 400,
        success: false,
        message: "Unauthorized: Only admin can reset password via this link",
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

export const getAllUsersByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.UserData?.user_id;
 
    if (!userId) {
      return res.json({
        status: 400,
        success: false,
        message: "Unauthorized access - missing user ID",
      });
    }
 
    const currentUser = await currentUserDataHelper(userId);
 
    if (!currentUser) {
      return res.json({
        status: 400,
        success: false,
        message: "User not found",
      });
    }

    const users = await UserSchema
     .find({ role: { $in: ["manager", "reviewer", "analyst"] } })
     .select("-password");

    if (!users || users.length === 0) {
      return res.json({
        status: 400,
        success: false,
        message: "No user accounts found",
      });
    }
 
    return res.json({
      status: 200,
      success: true,
      data: users,
    });
 
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.json({
      status: 500,
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateUserStatusByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.UserData?.user_id;
 
    if (!userId) {
      return res.json({
        status: 400,
        success: false,
        message: "User ID is required",
      });
    }
 
    const adminData = await currentUserDataHelper(userId);
 
    if (!adminData) {
      return res.json({
        status: 400,
        success: false,
        message: "User not found",
      });
    }
 
    if (adminData.role !== "admin") {
      return res.json({
        status: 400,
        success: false,
        message: "Access denied. Only admins can perform this action.",
      });
    }
 
    const { status } = req.body;
 
    if (!status || !["active", "inactive"].includes(status)) {
      return res.json({
        status: 400,
        success: false,
        message: "Invalid status. Must be 'active' or 'inactive'",
      });
    }
 
    const userData = await UserSchema.findById(req.params.user_id);
 
    if (!userData) {
      return res.json({
        status: 400,
        success: false,
        message: "User not found",
      });
    }
 
   const allowedTargetRoles = ["manager", "reviewer", "analyst"];

    if (!userData.role || !allowedTargetRoles.includes(userData.role)) {
      return res.json({
        status: 400,
        success: false,
        message: `Only users with roles ${allowedTargetRoles.join(", ")} can have their status updated.`,
      });
    }
 
    await UserSchema.findByIdAndUpdate(
      req.params.user_id,
      { status },
      { new: true }
    );
 
    return res.json({
      status: 200,
      success: true,
      message: "User status updated successfully",
    });
 
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.json({
      status: 500,
      success: false,
      message: "Internal server error",
    });
  }
};

export const changePasswordUsingToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.query;
  const { temp_password, new_password, confirm_password } = req.body;
  try {
    if (!token || typeof token !== "string") {
      return res.json({
        status:400,
         success: false, 
         message: "Token is required" 
        });
    }
 
    if (!temp_password || !new_password || !confirm_password) {
      return res.json({
        status:400,
        success: false,
        message: "All fields (temp_password, new_password, confirm_password) are required",
      });
    }
 
    if (new_password !== confirm_password) {
      return res.json({
        status:400,
         success: false, 
         message: "Passwords do not match"
         });
    }
 
    // Verify token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY!) as { user_id: string };
    const user = await UserSchema.findById(decoded.user_id);
    if (!user) {
      return res.json({ 
        status:400,
        success: false, 
        message: "User not found" 
      });
    }
    if (!user.temp_password || typeof user.temp_password !== "string") {
      return res.json({
        status: 400,
        success: false,
        message: "You all ready set your password please login",
      });
    }
 
    const isTempPasswordValid = compareSync(temp_password, user.temp_password);
    if (!isTempPasswordValid) {
      return res.json({
        status: 400,
        success: false,
        message: "Invalid temporary password",
      });
    }
    // Hash new password
    const salt = genSaltSync(12);
    const hashedPassword = hashSync(new_password, salt);
 
    // Update user record
    user.password = hashedPassword;
    user.status = "active";
    user.temp_password = null as unknown as string;

    await user.save();
 
    return res.json({
      status:200,
      success: true,
      message: "Password changed successfully. Your account is now active. please login",
    });
  } catch (err) {
    console.error(err);
    return res.json({
      status:500,
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const getStatusAndTemp_passwordByToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.json({
        status:400,
         success: false, 
         message: "Token is required" 
        });
    }
   // Verify token
   const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY!) as { user_id: string };
   const user = await UserSchema.findById(decoded.user_id);
   if (!user) {
     return res.json({ 
       status:400,
       success: false, 
       message: "User not found" 
     });
   }
    return res.json({
      status: 200,
      success: true,
      message: "data fetched successfully",
      data: {
        status: user.status,
        temp_password: user.temp_password,
      }
    });
  } catch (error) {
    console.error("Error fetching super admin:", error);
    return res.json({
      status: 500,
      success: false,
      message: "Internal server error",
    });
  }
};

export const createAdminByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  const {
    email,
    employee_code,
    temp_password
  } = req.body;
    const userId = req.UserData?.user_id;
    const adminExists = await UserSchema.findOne({ email });
    if (adminExists) {
      return res.json({
        status: 400,
        success: false,
        message: "Admin already exists",
      });
    }
    const salt = genSaltSync(12);
    const decryptedPassword = hashSync(temp_password, salt);
    const admin = new UserSchema({
      email,
      temp_password: decryptedPassword,
      employee_code,
      role:"admin",
      created_by: userId,
    });

    const createdAdmin = await admin.save();
    const token = jwt.sign(
      {
        user_id: admin._id,
        email: admin.email,
        role: admin.role,
        employee_code:admin.employee_code
      },
      process.env.TOKEN_SECRET_KEY as string,
      { expiresIn: TOKEN_EXPIRE_TIME  }
    );
    sendEmailForAdminAccountCretaionByAdmin(token,temp_password,employee_code,email);
     res.json({
      status: 200,
      success: true,
      message: "Admin Created successfully and link has been sent to email",
      data: createdAdmin,
    });
  } catch (err) {
    console.error(err);
    next(err);
    res.json({
      status: 500,
      success: false,
      message: "Server error",
    });
  }
};