import express from "express";
import { body, param, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

const formatValidationError = (res, errors) =>
  res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });

// POST /api/tasks - create new task
router.post(
  "/",
  authMiddleware,
  body("title").isLength({ min: 1, max: 100 }).withMessage("Task title 1-100 chars"),
  body("projectId").isInt().withMessage("projectId required"),
  body("description").optional().isString(),
  async (req, res, next) => {
    try {
      const errs = validationResult(req);
      if (!errs.isEmpty()) return formatValidationError(res, errs.array().map(e => e.msg));

      const { title, description, projectId } = req.body;
      const project = await prisma.project.findUnique({ where: { id: projectId }});
      if (!project || project.userId !== req.user.id) return res.status(404).json({ success: false, error: { message: "Project not found", details: [] }});

      const task = await prisma.task.create({ data: { title, description, projectId }});
      res.status(201).json({ success: true, data: task });
    } catch (err) { next(err); }
  }
);

// PUT /api/tasks/:id - update (status/title/description)
router.put(
  "/:id",
  authMiddleware,
  param("id").isInt(),
  body("title").optional().isLength({ min: 1, max: 100 }),
  body("status").optional().isIn(["pending", "completed"]).withMessage("Status must be 'pending' or 'completed'"),
  body("description").optional().isString(),
  async (req, res, next) => {
    try {
      const errs = validationResult(req);
      if (!errs.isEmpty()) return formatValidationError(res, errs.array().map(e => e.msg));

      const id = parseInt(req.params.id);
      const task = await prisma.task.findUnique({ where: { id }, include: { project: true }});
      if (!task || task.project.userId !== req.user.id) return res.status(404).json({ success: false, error: { message: "Not found", details: [] }});

      const data = {};
      if (req.body.title !== undefined) data.title = req.body.title;
      if (req.body.description !== undefined) data.description = req.body.description;
      if (req.body.status !== undefined) data.status = req.body.status;

      const updated = await prisma.task.update({ where: { id }, data });
      res.json({ success: true, data: updated });
    } catch (err) { next(err); }
  }
);

// DELETE /api/tasks/:id
router.delete("/:id", authMiddleware, param("id").isInt(), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const task = await prisma.task.findUnique({ where: { id }, include: { project: true }});
    if (!task || task.project.userId !== req.user.id) return res.status(404).json({ success: false, error: { message: "Not found", details: [] }});
    await prisma.task.delete({ where: { id }});
    res.json({ success: true, message: "Deleted" });
  } catch (err) { next(err); }
});

export default router;

