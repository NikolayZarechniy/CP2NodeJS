function notFound(req, res, next) {
  const err = new Error(`Маршрут ${req.method} ${req.originalUrl} не найден`);
  err.status = 404;
  next(err);
}

function errorHandler(err, req, res, next) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Файл слишком большой, максимум 2 МБ' });
  }

  const status = err.status || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  console.error(`[ERROR] ${status} ${message}`);

  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
