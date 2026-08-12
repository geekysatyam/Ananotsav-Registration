import { success, error } from '../utils/apiResponse.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const messages = result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return error(res, 'VALIDATION_ERROR', 'Validation failed', 400, { data: { errors: messages } });
    }
    req.validated = result.data;
    next();
  };
}
