// Simulates the API Gateway v2 (HTTP API) + Cognito JWT authorizer event shape, so
// getMine.handler can be exercised without deploying API Gateway or a real user pool.
const { handler } = require("../notifications/getMine");

const userId = process.argv[2] || "user_patient_1";

const event = {
  requestContext: {
    authorizer: {
      jwt: {
        claims: { sub: userId, email: "patient@example.com" },
      },
    },
  },
};

handler(event).then((result) => {
  console.log("status:", result.statusCode);
  console.log("body:", JSON.parse(result.body));
});
