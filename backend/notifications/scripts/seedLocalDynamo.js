// One-time setup against DynamoDB Local: creates this module's own Notifications table,
// plus lightweight stand-ins for the Users/Appointments tables this module reads
// cross-module (the real ones belong to the Auth/Appointments teammates - these are just
// enough shape to exercise the reminder job and coordinator lookup locally).
const { DynamoDBClient, CreateTableCommand, ResourceInUseException } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { TableNames } = require("../shared/dynamo");

const client = new DynamoDBClient({ endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000" });
const doc = DynamoDBDocumentClient.from(client);

async function createTable(params) {
  try {
    await client.send(new CreateTableCommand(params));
    console.log(`Created table ${params.TableName}`);
  } catch (err) {
    if (err instanceof ResourceInUseException) {
      console.log(`Table ${params.TableName} already exists, skipping.`);
    } else {
      throw err;
    }
  }
}

async function main() {
  await createTable({
    TableName: TableNames.NOTIFICATIONS,
    BillingMode: "PAY_PER_REQUEST",
    KeySchema: [
      { AttributeName: "notificationId", KeyType: "HASH" },
    ],
    AttributeDefinitions: [
      { AttributeName: "notificationId", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "userId-createdAt-index",
        KeySchema: [
          { AttributeName: "userId", KeyType: "HASH" },
          { AttributeName: "createdAt", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  });

  await createTable({
    TableName: TableNames.USERS,
    BillingMode: "PAY_PER_REQUEST",
    KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" }],
  });

  await createTable({
    TableName: TableNames.APPOINTMENTS,
    BillingMode: "PAY_PER_REQUEST",
    KeySchema: [{ AttributeName: "appointmentId", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "appointmentId", AttributeType: "S" }],
  });

  await doc.send(
    new PutCommand({
      TableName: TableNames.USERS,
      Item: { userId: "coord_1", role: "COORDINATOR", status: "ACTIVE", fullName: "Sample Coordinator" },
    })
  );

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  await doc.send(
    new PutCommand({
      TableName: TableNames.APPOINTMENTS,
      Item: {
        appointmentId: "apt_local_1",
        patientId: "user_patient_1",
        status: "CONFIRMED",
        appointmentDate: tomorrow,
        appointmentTime: "14:00",
      },
    })
  );

  console.log("Seed data written. Notifications table is empty until you run the subscriber.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
