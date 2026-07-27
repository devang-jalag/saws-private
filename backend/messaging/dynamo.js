const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

// Deliberately not shared with ../aws/shared/dynamo.js: this package is deployed to GCP
// independently of the aws/ folder, so it can only ever see files uploaded as part of its
// own Cloud Function source - a relative import reaching into aws/ works locally (they're
// sibling folders on disk) but doesn't exist at all once deployed.
const client = new DynamoDBClient({
  ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT }),
});
const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const TableNames = {
  USERS: process.env.USERS_TABLE || "saws-users",
};

module.exports = { doc, TableNames };
