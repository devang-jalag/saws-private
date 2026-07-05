function ok(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function error(statusCode, code, message) {
  return ok(statusCode, { error: { code, message } });
}

class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function handle(fn) {
  return async (event) => {
    try {
      return await fn(event);
    } catch (err) {
      if (err instanceof ApiError) {
        return error(err.statusCode, err.code, err.message);
      }
      console.error(err);
      return error(500, "INTERNAL_ERROR", "Something went wrong.");
    }
  };
}

module.exports = { ok, error, ApiError, handle };
