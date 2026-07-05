const { ApiError } = require("./response");

/**
 * API Gateway with a Cognito authorizer puts verified claims on
 * event.requestContext.authorizer.jwt.claims (HTTP API) or
 * event.requestContext.authorizer.claims (REST API). Support both shapes.
 */
function getAuthContext(event) {
  const authorizer = event.requestContext && event.requestContext.authorizer;
  const claims = (authorizer && (authorizer.jwt ? authorizer.jwt.claims : authorizer.claims)) || null;
  if (!claims) {
    throw new ApiError(401, "UNAUTHORIZED", "Missing or invalid auth token.");
  }
  const groups = claims["cognito:groups"] || "";
  const role = groups.includes("coordinator") ? "COORDINATOR" : "PATIENT";
  return { userId: claims.sub, email: claims.email, role };
}

function requireRole(context, role) {
  if (context.role !== role) {
    throw new ApiError(403, "FORBIDDEN", `This action requires the ${role} role.`);
  }
}

/** For endpoints Guests may also call: returns null instead of throwing when unauthenticated. */
function getOptionalAuthContext(event) {
  try {
    return getAuthContext(event);
  } catch (err) {
    return null;
  }
}

module.exports = { getAuthContext, requireRole, getOptionalAuthContext };
