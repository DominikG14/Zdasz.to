import { randomUUID } from 'node:crypto';

export default function requestContext(req, res, next) {
  const suppliedId = req.get('X-Request-Id');
  req.requestId = suppliedId && /^[\w.-]{1,128}$/.test(suppliedId) ? suppliedId : randomUUID();
  res.set('X-Request-Id', req.requestId);
  const startedAt = Date.now();
  res.on('finish', () => {
    console.info(JSON.stringify({
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    }));
  });
  next();
}
