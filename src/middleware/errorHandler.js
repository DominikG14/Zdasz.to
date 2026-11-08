export default function errorHandler(error, _req, res, _next) {
  console.error(error);
  res.status(error.statusCode || 500).json({
    error: error.statusCode ? error.message : 'Wewnętrzny błąd serwera',
  });
}
