const { getTimestamp, getCurrentDate, getCurrentDateYMD } = require("../utils/helpers");

test("getTimestamp should return current timestamp", () => {
  const timestamp = getTimestamp();
  expect(timestamp).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
});

test("getCurrentDate should return current date in YYYY-MM-DD format", () => {
  const date = getCurrentDate();
  expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

test("getCurrentDateYMD should return current date in YYYYMMDD format", () => {
  const date = getCurrentDateYMD();
  expect(date).toMatch(/^\d{8}$/);
});
