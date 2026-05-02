const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Multer errors (including file-type and size violations) → 400
  if (err.name === "MulterError") {
    return res.status(400).json({
      message: err.message,
    });
  }

  // Invalid Mongo ObjectId cast errors are common in route params.
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid resource identifier",
    });
  }

  return res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
