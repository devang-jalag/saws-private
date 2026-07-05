// Messaging runs on GCP but is still gated behind AWS Cognito identity, so every HTTP
// Cloud Function verifies the same Cognito-issued JWT the AWS side uses (cross-cloud auth,
// no separate GCP identity system for patients/coordinators).
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.USER_POOL_ID}/.well-known/jwks.json`,
});

function getSigningKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

function verifyCognitoToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getSigningKey, { algorithms: ["RS256"] }, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

async function requireUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    const error = new Error("Missing bearer token.");
    error.statusCode = 401;
    throw error;
  }

  // LOCAL_DEV skips real Cognito JWKS verification so this can be exercised with
  // functions-framework + curl without standing up a user pool. Never set in deployed
  // environments - accepts `Bearer {"userId":"user_1","role":"PATIENT"}` as the token.
  if (process.env.LOCAL_DEV === "true") {
    return JSON.parse(token);
  }

  const claims = await verifyCognitoToken(token);
  const groups = claims["cognito:groups"] || "";
  const role = groups.includes("coordinator") ? "COORDINATOR" : "PATIENT";
  return { userId: claims.sub, role };
}

module.exports = { verifyCognitoToken, requireUser };
