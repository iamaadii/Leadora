export function notFoundMiddleware(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
      requestId: req.id || null,
      timestamp: new Date().toISOString(),
    },
  });
}

