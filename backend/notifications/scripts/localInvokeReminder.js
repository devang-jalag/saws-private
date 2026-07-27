// Runs the scheduled reminder job once, against whatever is in the local Appointments
// table (seedLocalDynamo.js writes one CONFIRMED appointment for tomorrow by default).
const { handler } = require("../notifications/reminder");

handler()
  .then((result) => console.log("reminder.handler result:", result))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
