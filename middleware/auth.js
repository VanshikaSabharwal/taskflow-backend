import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export const authMiddleware = async (req, res, next) => {
  try {
    const auth = req.headers["authorization"] || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: "Unauthorized", details: [] },
      });
    }
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized", details: [] }});
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: { message: "Invalid token", details: [] }});
  }
};
