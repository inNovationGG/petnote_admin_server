const request = require("supertest");
const app = require("../app");
const { verifyToken } = require("../utils/jwt");
const {
    Area,
    PetAdminActionLog
} = require("../models");
const moment = require("moment");
const { Op, QueryTypes } = require("sequelize");

jest.mock("../utils/jwt");

const mockVerifyToken = () => {
    verifyToken.mockReturnValue({ uid: 17, username: "testing" });
};

describe("Global Service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /globals/areas", () => {
        it("should return areas", async () => {
            mockVerifyToken();
            jest.spyOn(Area, 'findAll').mockResolvedValue([
                { areaId: 1, parentId: 0, name: 'root1' },
                { areaId: 2, parentId: 1, name: 'child1' },
                { areaId: 3, parentId: 1, name: 'child2' },
                { areaId: 4, parentId: 2, name: 'grandchild1' },
                { areaId: 5, parentId: 0, name: 'root2' }
            ]);
            const response = await request(app.callback())
                .post("/globals/areas")
                .set("token", "mockToken")
                .send();

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(Area.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe("POST /globals/actlog", () => {
        it("should add a new actlog", async () => {
            mockVerifyToken();
            jest.spyOn(PetAdminActionLog, "create").mockImplementation(async (data) => {
                return { ...data, id: 1 };
            });

            const newActlogData = {
                uid: 1,
                page: 1,
                action: "",
                remark: "",
                parameter: "",
                type: 0,
                ip: "10.0.0.1",
                created_y: 2024,
                created_ym: 202406,
                created_ymd: 20240601,
                created: 0
            };

            const response = await request(app.callback())
                .post("/globals/actlog")
                .set("token", "mockToken")
                .send(newActlogData);

            expect(response.status).toBe(200);
            expect(response.body.code).toBe(200);
            expect(response.body.msg).toBe("");
            expect(PetAdminActionLog.create).toHaveBeenCalledTimes(1);
        });
    });
});
