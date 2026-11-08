import ValidationError from '../errors/ValidationError.js';
import { emptySchema } from '../schemas/common.schemas.js';

export function validate({ params = emptySchema, query = emptySchema, body = emptySchema } = {}) {
  return (req, _res, next) => {
    const results = {
      params: params.safeParse(req.params),
      query: query.safeParse(req.query),
      body: body.safeParse(req.body ?? {}),
    };
    const details = [];
    for (const [location, result] of Object.entries(results)) {
      if (!result.success) {
        for (const issue of result.error.issues) {
          if (issue.code === 'unrecognized_keys') {
            for (const key of issue.keys) details.push({ location, field: key, message: 'Nieznane pole' });
          } else {
            details.push({ location, field: issue.path.join('.') || '_root', message: issue.message });
          }
        }
      }
    }
    if (details.length) return next(new ValidationError(details));
    req.validated = {
      params: results.params.data,
      query: results.query.data,
      body: results.body.data,
    };
    next();
  };
}
