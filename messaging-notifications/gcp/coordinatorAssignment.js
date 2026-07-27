/** Pure random-assignment logic, kept separate from Firestore/DynamoDB I/O so it's testable
 * with an injectable RNG instead of mocking a real random draw. */
function pickCoordinator(coordinators, rng = Math.random) {
  const active = coordinators.filter((c) => c.active);
  if (active.length === 0) return null;
  const index = Math.floor(rng() * active.length);
  return active[index];
}

module.exports = { pickCoordinator };
