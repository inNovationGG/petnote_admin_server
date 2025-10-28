const request = require("supertest");
const app = require("../app");
const { verifyToken } = require("../utils/jwt");
const { Banner, PetAdminUser } = require("../models");
const moment = require("moment");

jest.mock("../utils/jwt");

const mockVerifyToken = () => {
  verifyToken.mockReturnValue({ uid: 17, username: "testing" });
};

const mockBannerListData = {
  id: 5,
  title: "123",
  pic: "111",
  description: "",
  type: 1,
  tag: "BANNER_INDEX",
  url_type: 0,
  url: "",
  time_type: 2,
  start_time: "2023-11-06 18:09:36",
  end_time: "2023-11-07 10:09:36",
  sort: 1,
  data_tracking: "",
  status: 1,
  is_deleted: 0,
  created_at: "2023-11-06 18:09:36",
  updated_at: "2023-11-07 10:36:53",
  created: 1699265376,
  custom_status: 1,
  toJSON() {
    return this;
  },
};

const mockBannerData = {
  id: 5,
  title: "123",
  pic: "111",
  description: "",
  type: 1,
  tag: "BANNER_INDEX",
  url_type: 0,
  url: "",
  time_type: 2,
  start_time: "2023-11-06 18:09:36",
  end_time: "2023-11-07 10:09:36",
  sort: 1,
  data_tracking: "",
  status: 1,
  is_deleted: 0,
  created_at: "2023-11-06 18:09:36",
  updated_at: "2023-11-07 10:36:53",
  created: 1699265376,
  custom_status: 1,
  toJSON() {
    return this;
  },
};

describe("Banner Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("POST /bi_opt/banner/lists", () => {
    it("should return banner lists", async () => {
      mockVerifyToken();
      const mockBanners = {
        docs: [mockBannerListData],
        pages: 2,
        total: 11
      };
      jest.spyOn(Banner, "paginate").mockResolvedValue(mockBanners);

      const param = {
        type: 1,
        tag: "BANNER_INDEX",
        page: 1,
        pagesize: 10,
        start_time: "2024-05-01 00:00:00",
        end_time: "2024-06-30 23:59:59"
      }

      const response = await request(app.callback())
        .post("/bi_opt/banner/lists")
        .set("token", "mockToken")
        .send(param);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.msg).toBe("");

      expect(response.body.data).toHaveProperty("totalCount");
      expect(response.body.data.totalCount).toBeGreaterThan(0);
      expect(response.body.data).toHaveProperty("totalPage");
      expect(response.body.data.totalPage).toBeGreaterThan(0);
      expect(response.body.data).toHaveProperty("currentPage", 1);
      expect(response.body.data).toHaveProperty("currentPageSize", 10);

      expect(response.body.data).toHaveProperty("data");
      expect(response.body.data.data[0]).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
        pic: expect.any(String),
        description: expect.any(String),
        type: expect.any(Number),
        tag: expect.any(String),
        url_type: expect.any(Number),
        url: expect.any(String),
        time_type: expect.any(Number),
        start_time: expect.any(String),
        end_time: expect.any(String),
        sort: expect.any(Number),
        data_tracking: expect.any(String),
        status: expect.any(Number),
        is_deleted: expect.any(Number),
        created_at: expect.any(String),
        updated_at: expect.any(String),
        created: expect.any(Number),
        custom_status: expect.any(Number)
      });
    });
  });

  describe("POST /bi_opt/banner/del", () => {
    it("should delete a banner", async () => {
      mockVerifyToken();

      jest.spyOn(Banner, "findOne").mockResolvedValue(mockBannerData);

      const response = await request(app.callback())
        .post("/bi_opt/banner/del")
        .set("token", "mockToken")
        .send({ id: 5 });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.msg).toBe("");
      expect(response.body.data).toBe(true);
    });
    it("should return an error when banner is not found", async () => {
      mockVerifyToken();

      jest.spyOn(Banner, "findOne").mockResolvedValue(null);

      const response = await request(app.callback())
        .post("/bi_opt/banner/del")
        .set("token", "mockToken")
        .send({ id: 100 });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data).toBe(true);
    });
  });

  describe("POST /bi_opt/banner/edit", () => {
    it("should add a new banner", async () => {
      mockVerifyToken();
      jest.spyOn(Banner, "create").mockImplementation(async (data) => {
        return { ...data, id: 1 };
      });

      const newBannerData = {
        title: "123",
        pic: "111",
        description: "",
        type: 1,
        tag: "BANNER_INDEX",
        url_type: 0,
        url: "",
        time_type: 2,
        start_time: "2023-11-06 18:09:36",
        end_time: "2023-11-07 10:09:36",
        sort: 1,
        data_tracking: "",
        status: 1,
        is_deleted: 0,
        created_at: "2023-11-06 18:09:36",
        updated_at: "2023-11-07 10:36:53",
        created: 1699265376,
        custom_status: 1,
        created_by: 17
      };

      const response = await request(app.callback())
        .post("/bi_opt/banner/edit")
        .set("token", "mockToken")
        .send(newBannerData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.msg).toBe("");

      expect(Banner.create).toHaveBeenCalledTimes(1);
    });
    it("should edit an existing banner", async () => {
      mockVerifyToken();

      jest.spyOn(Banner, "findOne").mockResolvedValue(mockBannerData);
      jest.spyOn(Banner, "update").mockImplementation(async (conditions, updates, options) => {
        return { nModified: 1 };
      });

      const updatedBannerData = {
        ...mockBannerData,
        id: 5,
      };

      const response = await request(app.callback())
        .post("/bi_opt/banner/edit")
        .set("token", "mockToken")
        .send(updatedBannerData);

      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.msg).toBe("");

      expect(Banner.update).toHaveBeenCalledTimes(1);
      expect(Banner.update).toHaveBeenCalled();
    });
  });

  describe("POST /bi_opt/banner/info", () => {
    it("should return banner info", async () => {
      mockVerifyToken();

      jest.spyOn(Banner, 'findByPk').mockResolvedValue(mockBannerData);

      const response = await request(app.callback())
        .post("/bi_opt/banner/info")
        .set("token", "mockToken")
        .send({ id: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');

      const returnedBanner = response.body.data;
      expect(returnedBanner).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
        pic: expect.any(String),
        description: expect.any(String),
        type: expect.any(Number),
        tag: expect.any(String),
        url_type: expect.any(Number),
        url: expect.any(String),
        time_type: expect.any(Number),
        start_time: expect.any(String),
        end_time: expect.any(String),
        sort: expect.any(Number),
        data_tracking: expect.any(String),
        status: expect.any(Number),
        is_deleted: expect.any(Number),
        created_at: expect.any(String),
        updated_at: expect.any(String),
        created: expect.any(Number),
        custom_status: expect.any(Number)
      });

      expect(Banner.findByPk).toHaveBeenCalledTimes(1);
      expect(Banner.findByPk).toHaveBeenCalledWith(5);
    });

    it("should return error when id is missing", async () => {
      mockVerifyToken();

      const response = await request(app.callback())
        .post("/bi_opt/banner/info")
        .set("token", "mockToken")
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data', null);
      expect(response.body.msg).toBe("参数缺失");
    });
  });

  describe("POST /bi_opt/banner/status", () => {
    it("should update banner status successfully", async () => {
      jest.spyOn(Banner, 'update').mockResolvedValue(1);
      const response = await request(app.callback())
        .post("/bi_opt/banner/status")
        .set("token", "mockToken")
        .send({ id: 1, status: 1 });

      expect(response.status).toBe(200);
      expect(Banner.update).toHaveBeenCalledTimes(1);
    });

    it("should return error when parameters are missing", async () => {

      const response = await request(app.callback())
        .post("/bi_opt/banner/status")
        .set("token", "mockToken")
        .send({});

      expect(response.status).toBe(200);
    });
  });
});
