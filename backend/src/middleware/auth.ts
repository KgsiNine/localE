import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { IUser } from "../types";

interface JwtPayload {
  userId: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "No token, authorization denied" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ message: "JWT_SECRET is not configured" });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    // Get user from token
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      res.status(401).json({ message: "Token is not valid" });
      return;
    }

    req.user = user as IUser;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Optional auth middleware - doesn't fail if no token
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token && process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      const user = await User.findById(decoded.userId).select("-password");
      if (user) {
        req.user = user as IUser;
      }
    }
    next();
  } catch (error) {
    // Continue without auth if token is invalid
    next();
  }
};

