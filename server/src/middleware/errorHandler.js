export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${status} — ${message}`);
    console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    message,
  });
};
