const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

// DYNAMODB_ENDPOINT lets this point at DynamoDB Local (docker) for local runs/tests
// instead of real AWS; unset in every deployed environment.
const client = new DynamoDBClient({
  ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT }),
});
const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// USERS and APPOINTMENTS are owned by the Auth and Appointments modules respectively;
// this module only reads them by name (coordinator lookup, reminder scheduling).
const TableNames = {
  USERS: process.env.USERS_TABLE || "saws-users",
  APPOINTMENTS: process.env.APPOINTMENTS_TABLE || "saws-appointments",
  NOTIFICATIONS: process.env.NOTIFICATIONS_TABLE || "saws-notifications",
};

module.exports = { doc, TableNames };
