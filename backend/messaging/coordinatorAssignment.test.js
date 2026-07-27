const { pickCoordinator } = require("./coordinatorAssignment");

describe("pickCoordinator", () => {
  const coordinators = [
    { userId: "c1", active: true },
    { userId: "c2", active: false },
    { userId: "c3", active: true },
  ];

  test("only ever picks an active coordinator", () => {
    for (let i = 0; i < 20; i += 1) {
      const rng = () => i / 20;
      const picked = pickCoordinator(coordinators, rng);
      expect(picked.active).toBe(true);
    }
  });

  test("is deterministic for a given rng value", () => {
    expect(pickCoordinator(coordinators, () => 0).userId).toBe("c1");
    expect(pickCoordinator(coordinators, () => 0.99).userId).toBe("c3");
  });

  test("returns null when nobody is active", () => {
    expect(pickCoordinator([{ userId: "c1", active: false }])).toBeNull();
    expect(pickCoordinator([])).toBeNull();
  });
});
