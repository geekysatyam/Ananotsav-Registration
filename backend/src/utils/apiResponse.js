export function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

export function error(res, code, message, statusCode = 400, extra = {}) {
  const body = {
    success: false,
    error: { code, message },
    ...extra,
  };
  return res.status(statusCode).json(body);
}
