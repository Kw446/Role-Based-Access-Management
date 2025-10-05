import { Request, Response, NextFunction } from "express";
import { UserSchema } from "../model/userModel";
import bcrypt, { hashSync, genSaltSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { currentUserDataHelper } from "../helper/commonHelper";
import { sendEmailForAccountCretaionBySuperAdmin } from "../helper/emailHelper";
dotenv.config();

const TOKEN_SECRET_KEY:any = process.env.TOKEN_SECRET_KEY ;
const TOKEN_EXPIRE_TIME :any = process.env.TOKEN_EXPIRE_TIME ;

export const createAdminBySuperAdmin = async (
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
    sendEmailForAccountCretaionBySuperAdmin(token,temp_password,employee_code,email);
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

export const updateAdminBySuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.params.user_id;
    const userId = req.UserData?.user_id;

    const adminData: any = await currentUserDataHelper(userId);

    if (adminData == null) {
      return res.json({
        status: 400,
        success: false,
        message: "User not found",
      });
    }
    if (adminData.role !== "super") {
      return res.json({
        status: 400,
        success: false,
        message: "You have no right to access the data",
      });
    }

    const {status } = req.body;

    if (!user_id) {
      return res.json({
        status: 400,
        success: false,
        message: "User ID is required",
      });
    }
    if (user_id === "undefined" || user_id === "null") {
      return res.json({
        status: 400,
        success: false,
        message: "Please provide correct user_id",
      });
    }

    const admin = await UserSchema.findById(user_id);
    if (!admin) {
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
    if (status) {
      updates.status = status.trim();
    } else {
      updates.status = admin.status;
    }

    const updatedUser = await UserSchema.findByIdAndUpdate(user_id, updates, {
      new: true,
    });

    return res.json({
      status: 200,
      success: true,
      message: "Admin updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.json({
      status:500,
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteAdminBySuperAdmin = async (
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
    // const user = await UserSchema.findByIdAndUpdate(
    //   user_id,
    //   { status: "inactive", updated_at: Date.now(), update_by: userId },
    //   { new: true }
    // );
    return res.json({
      status: 200,
      success: true,
      message: "Admin deleted successfully",
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

export const getAllAdminsBySuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.UserData?.user_id;
    const currentUser = await currentUserDataHelper(userId);
    if (!currentUser) {
      return res.json({
        status: 404,
        success: false,
        message: "User not found",
      });
    }
    if (currentUser.role !== "super") {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Forbidden - You dont have permissions to access data",
      });
    }
 
    const admins = await UserSchema.find({ role: "admin" }).select("-password");
 
    if (!admins || admins.length === 0) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "No admin found",
      });
    }
 
   return res.json({
      status: 200,
      success: true,
      data: admins,
    });
 
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return res.json({
      status: 500,
      success: false,
      message: "Internal server error",
    });
  }
};

export const getSuperAdminById = async (
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
    if (user.role !== "super") {
      return res.json({
        status: 400,
        success: false,
        message: "Access denied - not a super admin",
      });
    }
    return res.json({
      status: 200,
      success: true,
      message: "Super admin data fetched successfully",
      data: user,
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
export const getAdminIdBySuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.UserData?.user_id;
    const userDetails:any = req.query.user_id;
    const user: any = await currentUserDataHelper(userDetails);
    if (!user) {
      return res.json({
        status: 400,
        success: false,
        message: "User not found",
      });
    }
    if (user.role !== "super") {
      return res.json({
        status: 400,
        success: false,
        message: "Access denied - not a super admin",
      });
    }
    return res.json({
      status: 200,
      success: true,
      message: "Super admin data fetched successfully",
      data: user,
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
export const updateAdminStatusBySuperAdmin = async (
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
 
    const superAdminData = await currentUserDataHelper(userId);
 
    if (!superAdminData) {
      return res.json({
        status: 400,
        success: false,
        message: "User not found",
      });
    }
 
    if (superAdminData.role !== "super") {
      return res.json({
        status: 400,
        success: false,
        message: "Access denied. Only super admin can perform this action.",
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
 
    const adminData = await UserSchema.findById(req.params.user_id);
 
    if (!adminData) {
      return res.json({
        status: 400,
        success: false,
        message: "Admin not found",
      });
    }
 
    if (adminData.role !== "super") {
      return res.json({
        status: 400,
        success: false,
        message: "Only admins can have their status updated by a super admin.",
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
      message: "Admin status updated successfully",
    });
 
  } catch (error) {
    console.error("Error updating admin status:", error);
    return res.json({
      status: 500,
      success: false,
      message: "Internal server error",
    });
  }
};