const bcrypt = require("bcryptjs");
const request = require("supertest");
const app = require("../app");
const { generateToken } = require("../utils/jwt");
const { PetAdminUser } = require("../models")

jest.mock("../utils/jwt");
jest.mock("../models");
jest.mock("bcryptjs");

const mockUser = {
  uid: 17,
  username: "testing",
  truename: "开发测试",
  password: "$2y$10$fJVenTzxT95QnJKLC9vb7enHGnb4C0DR3jRaLzSP2.ufNFw..b7Y2",
  role_id: 1,
  remark: "",
  expired_at: 1744253625,
  toJSON() {
    return this;
  },
};

describe("Auth Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /open/login", () => {
    it("should return 200 and token on valid login", async () => {
      const mockToken = "mockToken";

      PetAdminUser.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      generateToken.mockReturnValue(mockToken);

      const response = await request(app.callback())
        .post("/open/login")
        .send({ username: "testing", password: "Testing$1238#" });

      // 断言响应状态码和内容
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.msg).toBe("");

      // 断言响应数据
      expect(response.body.data).toHaveProperty("token", mockToken);
      expect(response.body.data).toHaveProperty("uid", mockUser.uid);
      expect(response.body.data).toHaveProperty("username", mockUser.username);
    });

    it("should return 400 on validation error", async () => {
      bcrypt.compare.mockResolvedValue(false);
      const response = await request(app.callback())
        .post("/open/login")
        .send({ username: "testing", password: "short" });

      // 断言响应状态码和内容
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);

      // 断言响应数据
      expect(response.body.data).toBe(null);
    });

    it("should return 400 if username does not exist", async () => {
      PetAdminUser.findOne.mockResolvedValue(null);
      const response = await request(app.callback())
        .post("/open/login")
        .send({ username: "nonexistent", password: "Testing$1238#" });
      // 断言响应状态码和内容
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);

      // 断言响应数据
      expect(response.body.data).toBe(null);
      expect(response.body.msg).toBe("用户名或密码错误");
    });

    it("should return 400 if password is incorrect", async () => {
      PetAdminUser.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app.callback())
        .post("/open/login")
        .send({ username: "testing", password: "wrongpassword" });

      // 断言响应状态码和内容
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);

      // 断言响应数据
      expect(response.body.data).toBe(null);
      expect(response.body.msg).toBe("用户名或密码错误");
    });

    it("should return 500 on service error", async () => {
      PetAdminUser.findOne.mockRejectedValue(new Error("Database error"));

      const response = await request(app.callback())
        .post("/open/login")
        .send({ username: "testing", password: "Testing$1238#" });

      // 断言响应状态码和内容
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
    });
  });
});
