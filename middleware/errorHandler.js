import logger from "./logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message || JSON.stringify(err));
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  const details = err.details || [];
  res.status(status).json({
    success: false,
    error: {
      message,
      details,
    },
  });
};
