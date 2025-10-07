import express from "express";
import { body, param, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

const formatValidationError = (res, errors) =>
  res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });

// GET /api/projects - list for authenticated user
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, data: projects });
  } catch (err) { next(err); }
});

// POST /api/projects - create
router.post(
  "/",
  authMiddleware,
  body("title").isLength({ min: 1, max: 50 }).withMessage("Project title 1-50 chars"),
  body("description").optional().isString(),
  async (req, res, next) => {
    try {
      const errs = validationResult(req);
      if (!errs.isEmpty()) return formatValidationError(res, errs.array().map(e => e.msg));

      const { title, description } = req.body;
      const project = await prisma.project.create({
        data: { title, description, userId: req.user.id }
      });
      res.status(201).json({ success: true, data: project });
    } catch (err) { next(err); }
  }
);

// GET /api/projects/:id/tasks - tasks for a project
router.get("/:id/tasks", authMiddleware, param("id").isInt(), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const project = await prisma.project.findUnique({ where: { id }});
    if (!project || project.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: { message: "Not found", details: [] }});
    }
    const tasks = await prisma.task.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" }});
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
});

export default router;
