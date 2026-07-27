const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { doc, TableNames } = require("../shared/dynamo");
const { handle, ok } = require("../shared/response");
const { getAuthContext } = require("../shared/authContext");

exports.handler = handle(async (event) => {
  const ctx = getAuthContext(event);
  const { Items } = await doc.send(
    new QueryCommand({
      TableName: TableNames.NOTIFICATIONS,
      IndexName: "userId-createdAt-index",
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: { ":u": ctx.userId },
      ScanIndexForward: false,
    })
  );
  return ok(200, { items: Items || [] });
});
