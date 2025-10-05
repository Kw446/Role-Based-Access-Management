import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { currentUserDataHelper } from "../helper/commonHelper";

declare global {
  namespace Express {
    interface Request {
      UserData?: any;
      adminData?: any;
    }
  }
}

export const superAdminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.get("Authorization")?.split(" ")[1];
  if (!token) {
    return res.json({
      status: 400,
      success: "false",
      message: "Provide token in Authorization",
    });
  }
  try {
    let decodedToken: any = jwt.verify(
      token,
      process.env.TOKEN_SECRET_KEY as string
    );
    if (!decodedToken) {
      return res.json({
        status: 400,
        success: "false",
        message: "Invalid token",
      });
    }

    const id = decodedToken.user_id;
    const userDetails = await currentUserDataHelper(id);
    if (!userDetails) {
      return res.json({
        status: 400,
        success: false,
        message: "User not found",
      });
    }

    if (!userDetails?.role?.includes('super')) {
      return res.json({
        status: 400,
        success: false,
        message: "You don't have super admin access.",
      });
    }

    req.UserData = decodedToken;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({
      status: 401,
      success: false,
      message: "Token expired, please login again.",
    });
  }
};

export const adminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.get("Authorization")?.split(" ")[1];
  if (!token) {
    return res.json({
      status: 400,
      success: "false",
      message: "Provide token in Authorization",
    });
  }
  try {
    let decodedToken: any = jwt.verify(
      token,
      process.env.TOKEN_SECRET_KEY as string
    );
    if (!decodedToken) {
      return res.json({
        status: 400,
        success: "false",
        message: "Invalid token",
      });
    }

    const id = decodedToken.user_id;
    const userDetails = await currentUserDataHelper(id);
    if (!userDetails) {
      return res.json({
        status: 400,
        success: false,
        message: "User not found",
      });
    }

    const allowedRoles = ["admin", "super"];
    if (!allowedRoles.includes(userDetails.role as string)) {
        return res.json({
          status: 400,
          success: false,
          message: "You don't have permission to access this resource.",
        });
      }

    req.UserData = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({
      status: 401,
      success: false,
      message: "Token expired, please login again.",
    });
  }
};
export const userAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.get("Authorization")?.split(" ")[1];
  if (!token) {
    return res.json({
      status: 400,
      success: false,
      message: "Provide token in Authorization",
    });
  }
  try {
    const decodedToken = jwt.verify(
      token,
      process.env.TOKEN_SECRET_KEY as string
    ) as { user_id: string; role: string };

    const id = decodedToken.user_id;
    const userDetails = await currentUserDataHelper(id);
    if (!userDetails) {
      return res.json({
        status: 400,
        success: false,
        message: "User not found",
      });
    }

    const allowedRoles = ["manager", "reviewer", "analyst"];
  if (!allowedRoles.includes(userDetails.role as string)) {
      return res.json({
        status: 400,
        success: false,
        message: "You don't have permission to access this resource.",
      });
    }

    req.UserData = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({
      status: 401,
      success: false,
      message: "Token expired or invalid, please login again.",
    });
  }
};
export const commonAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.get("Authorization")?.split(" ")[1];
  if (!token) {
    return res.json({
      status: 400,
      success: false,
      message: "Provide token in Authorization",
    });
  }
  try {
    const decodedToken = jwt.verify(
      token,
      process.env.TOKEN_SECRET_KEY as string
    ) as { user_id: string; role: string };

    const id = decodedToken.user_id;
    const userDetails = await currentUserDataHelper(id);
    if (!userDetails) {
      return res.json({
        status: 400,
        success: false,
        message: "User not found",
      });
    }

    const allowedRoles = ["manager", "reviewer", "analyst", "admin","super"];
  if (!allowedRoles.includes(userDetails.role as string)) {
      return res.json({
        status: 400,
        success: false,
        message: "You don't have permission to access this resource.",
      });
    }

    req.UserData = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({
      status: 401,
      success: false,
      message: "Token expired or invalid, please login again.",
    });
  }
};
