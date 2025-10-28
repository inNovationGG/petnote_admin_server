const { generateToken, verifyToken } = require("../utils/jwt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

jest.mock("jsonwebtoken");

const mockPayload = { uid: 1, username: "testing" };
const mockToken = "mockToken";

test("generateToken should return a token", () => {
  jwt.sign.mockReturnValue(mockToken);
  const token = generateToken(mockPayload);
  expect(token).toBe(mockToken);
});

test("verifyToken should return payload if token is valid", () => {
  jwt.verify.mockReturnValue(mockPayload);
  const payload = verifyToken(mockToken);
  expect(payload).toEqual(mockPayload);
});

test("verifyToken should return false if token is invalid", () => {
  jwt.verify.mockImplementation(() => {
    throw new Error("Invalid token");
  });
  const payload = verifyToken(mockToken);
  expect(payload).toBe(false);
});
