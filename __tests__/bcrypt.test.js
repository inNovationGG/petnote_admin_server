const { encryptPassword, checkPassword } = require("../utils/bcrypt");

test("encryptPassword should hash the password", async () => {
  const password = "test123";
  const hashedPassword = await encryptPassword(password);
  expect(hashedPassword).not.toBe(password);
});

test("checkPassword should return true for matching passwords", async () => {
  const password = "test123";
  const hashedPassword = await encryptPassword(password);
  const result = await checkPassword(password, hashedPassword);
  expect(result).toBe(true);
});

test("checkPassword should return false for non-matching passwords", async () => {
  const password = "test123";
  const hashedPassword = await encryptPassword(password);
  const result = await checkPassword("wrongpassword", hashedPassword);
  expect(result).toBe(false);
});
