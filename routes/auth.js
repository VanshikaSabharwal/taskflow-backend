import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

const formatValidationError = (res, errors) =>
  res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });

// POST /api/auth/register
router.post(
  "/register",
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("name").optional().isString(),
  async (req, res, next) => {
    try {
      const errs = validationResult(req);
      if (!errs.isEmpty()) return formatValidationError(res, errs.array().map(e => e.msg));

      const { email, password, name } = req.body;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ success: false, error: { message: "Validation failed", details: ["Email already in use"] }});

      const hashed = await bcrypt.hash(password, 10);
      await prisma.user.create({ data: { email, password: hashed, name }});
      return res.json({ success: true, message: "User created" });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  body("email").isEmail().withMessage("Valid email required"),
  body("password").exists().withMessage("Password required"),
  async (req, res, next) => {
    try {
      const errs = validationResult(req);
      if (!errs.isEmpty()) return formatValidationError(res, errs.array().map(e => e.msg));

      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email }});
      if (!user) return res.status(400).json({ success: false, error: { message: "Invalid credentials", details: [] }});

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(400).json({ success: false, error: { message: "Invalid credentials", details: [] }});

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ success: true, token });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
