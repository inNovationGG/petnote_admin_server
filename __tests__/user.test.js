const request = require("supertest");
const app = require("../app");
const { verifyToken } = require("../utils/jwt");
const moment = require("moment");
const { User, Pet } = require("../models");

jest.mock("../utils/jwt");

const mockVerifyToken = () => {
    verifyToken.mockReturnValue({ uid: 17, username: "testing" });
};

const mockUserListData = {
    uid: 20,
    nick_name: "普赛他爹蚊子不吃包尔萨克了",
    mini_nick_name: "蚊蚊子",
    gender: 2,
    birthday: 877104000,
    avatar_url: "https://static.petnote.top/images/2021-04-20/154784608.png",
    phone: "15201822095",
    city: "上海市",
    province: "",
    country: "China",
    region_first: "上海市",
    region_second: "静安区",
    region_third: "",
    ip_province: "重庆市",
    ip_city: "重庆市",
    ip_area: "",
    toJSON() {
        return this;
    },
};

const mockUserData = {
    uid: 20,
    nick_name: "普赛他爹蚊子不吃包尔萨克了",
    mini_nick_name: "蚊蚊子",
    gender: 2,
    birthday: 877104000,
    avatar_url: "https://static.petnote.top/images/2021-04-20/154784608.png",
    phone: "15201822095",
    city: "上海市",
    province: "",
    country: "China",
    region_first: "上海市",
    region_second: "静安区",
    region_third: "",
    ip_province: "重庆市",
    ip_city: "重庆市",
    ip_area: "",
    toJSON() {
        return this;
    },
};

describe("User Service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("POST /bi_opt/user/lists", () => {
        it("should return user lists", async () => {
            mockVerifyToken();
            const mockUsers = {
                docs: [mockUserListData],
                pages: 2,
                total: 11
            };
            jest.spyOn(User, "paginate").mockResolvedValue(mockUsers);

            const param = {
                uid: 20,
                mini_nick_name: "",
                phone: ""
            }

            const response = await request(app.callback())
                .post("/bi_opt/user/lists")
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
                uid: expect.any(Number),
                nick_name: expect.any(String),
                mini_nick_name: expect.any(String),
                gender: expect.any(Number),
                birthday: expect.any(Number),
                avatar_url: expect.any(String),
                phone: expect.any(String),
                city: expect.any(String),
                province: expect.any(String),
                country: expect.any(String),
                region_first: expect.any(String),
                region_second: expect.any(String),
                region_third: expect.any(String),
                ip_province: expect.any(String),
                ip_city: expect.any(String),
                ip_area: expect.any(String)
            });
        });
    });

    describe("POST /bi_opt/user/info", () => {
        it("should return pet info", async () => {
            mockVerifyToken();
            jest.spyOn(User, 'findOne').mockResolvedValue(mockUserData);
            const response = await request(app.callback())
                .post("/bi_opt/user/info")
                .set("token", "mockToken")
                .send({ uid: 20 });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');

            const returnedUser = response.body.data;
            expect(returnedUser).toMatchObject({
                uid: expect.any(Number),
                nick_name: expect.any(String),
                mini_nick_name: expect.any(String),
                gender: expect.any(Number),
                birthday: expect.any(Number),
                avatar_url: expect.any(String),
                phone: expect.any(String),
                city: expect.any(String),
                province: expect.any(String),
                country: expect.any(String),
                region_first: expect.any(String),
                region_second: expect.any(String),
                region_third: expect.any(String),
                ip_province: expect.any(String),
                ip_city: expect.any(String),
                ip_area: expect.any(String)
            });

            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({
                where: {
                    is_deleted: 0,
                    uid: 20
                },
                attributes: [
                    'uid',
                    'nick_name',
                    'mini_nick_name',
                    'gender',
                    'birthday',
                    'avatar_url',
                    'phone',
                    'city',
                    'province',
                    'country',
                    'region_first',
                    'region_second',
                    'region_third',
                    'ip_province',
                    'ip_city',
                    'ip_area'
                ]
            });
        });
    });

    describe("POST /bi_opt/user/edit", () => {
        it("should edit an existing user", async () => {
            mockVerifyToken();
            jest.spyOn(User, "update").mockImplementation(async (conditions, updates, options) => {
                return { nModified: 1 };
            });

            const updatedUserData = {
                ...mockUserData
            };

            const response = await request(app.callback())
                .post("/bi_opt/user/edit")
                .set("token", "mockToken")
                .send(updatedUserData);

            expect(response.status).toBe(200);
            expect(response.body.code).toBe(200);
            expect(response.body.msg).toBe("");

            expect(User.update).toHaveBeenCalledTimes(1);
            expect(User.update).toHaveBeenCalled();
        });
    });
});
