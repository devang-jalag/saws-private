const { parseNotification } = require("./subscriber");

describe("parseNotification", () => {
  test("unwraps an SNS-to-SQS envelope", () => {
    const record = {
      body: JSON.stringify({
        Type: "Notification",
        Message: JSON.stringify({ type: "BOOKING", userId: "user_123", message: "Your appointment is confirmed." }),
      }),
    };
    expect(parseNotification(record)).toEqual({
      type: "BOOKING",
      userId: "user_123",
      message: "Your appointment is confirmed.",
    });
  });

  test("falls back to a raw JSON body when there is no SNS envelope", () => {
    const record = { body: JSON.stringify({ type: "LOGIN", userId: "user_1", message: "Logged in." }) };
    expect(parseNotification(record)).toEqual({ type: "LOGIN", userId: "user_1", message: "Logged in." });
  });
});
