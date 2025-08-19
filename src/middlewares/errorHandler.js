export function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err?.message);
  if (res.headersSent) return next(err);
  res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
}
