const { appointmentsNeedingReminders } = require("./reminderLogic");

describe("appointmentsNeedingReminders", () => {
  const now = new Date("2026-06-14T09:00:00Z");

  test("selects only CONFIRMED appointments happening tomorrow", () => {
    const appointments = [
      { appointmentId: "a1", status: "CONFIRMED", appointmentDate: "2026-06-15", patientId: "u1" },
      { appointmentId: "a2", status: "PENDING", appointmentDate: "2026-06-15", patientId: "u2" },
      { appointmentId: "a3", status: "CONFIRMED", appointmentDate: "2026-06-16", patientId: "u3" },
      { appointmentId: "a4", status: "CONFIRMED", appointmentDate: "2026-06-14", patientId: "u4" },
    ];

    const result = appointmentsNeedingReminders(appointments, now);

    expect(result.map((a) => a.appointmentId)).toEqual(["a1"]);
  });

  test("returns an empty list when nothing is due", () => {
    expect(appointmentsNeedingReminders([], now)).toEqual([]);
  });
});
