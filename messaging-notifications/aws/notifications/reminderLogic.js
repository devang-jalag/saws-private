function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function appointmentsNeedingReminders(appointments, now) {
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowDate = toDateOnly(tomorrow);
  return appointments.filter((a) => a.status === "CONFIRMED" && a.appointmentDate === tomorrowDate);
}

module.exports = { appointmentsNeedingReminders };
