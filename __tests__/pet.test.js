const request = require("supertest");
const app = require("../app");
const { verifyToken } = require("../utils/jwt");
const {
    Pet,
    PetCate,
    PetAdminUser,
    UserBreeder,
    NotePet,
    SchedulePet
} = require("../models");
const { Op, QueryTypes } = require("sequelize");

jest.mock("../utils/jwt");

const mockVerifyToken = () => {
    verifyToken.mockReturnValue({ uid: 17, username: "testing" });
};

const mockPetListData = {
    id: 623934,
    uid: 10099898,
    top_cate_id: 2,
    cate_id: 552,
    cate_data: {
        id: 552,
        name: "中华田园犬"
    },
    gender: 0,
    birthday: 1688140800,
    homeday: 1693497600,
    weight: 8880,
    weight_unit_id: 17,
    kc_status: 0,
    is_die: 0,
    die_time: 0,
    head_img: "https://static.petnote.top/miniapp/static/defaultAvatar_pet.png",
    toJSON() {
        return this;
    },
};

const mockPetData = {
    id: 623934,
    uid: 10099898,
    top_cate_id: 2,
    cate_id: 552,
    cate_data: {
        id: 552,
        name: "中华田园犬"
    },
    gender: 0,
    birthday: 1688140800,
    homeday: 1693497600,
    weight: 8880,
    weight_unit_id: 17,
    kc_status: 0,
    is_die: 0,
    die_time: 0,
    head_img: "https://static.petnote.top/miniapp/static/defaultAvatar_pet.png",
    toJSON() {
        return this;
    },
};

const mockPetCateData = {
    id: 1,
    pid: 0,
    name: "猫咪",
    is_hot: 0,
    f_letter: "H",
    size: 0,
    updated_at: "2024-03-04 10:20:28",
    updated_by: 1,
    toJSON() {
        return this;
    },
};

const mockPetCateListData = {
    id: 1,
    pid: 0,
    name: "猫咪",
    is_hot: 0,
    f_letter: "H",
    size: 0,
    updated_at: "2024-03-04 10:20:28",
    updated_by: 1,
    toJSON() {
        return this;
    },
};

describe("Pet Service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("POST /bi_opt/pet/lists", () => {
        it("should return pet lists", async () => {
            mockVerifyToken();
            const mockPets = {
                docs: [mockPetListData],
                pages: 2,
                total: 11
            };
            jest.spyOn(Pet, "paginate").mockResolvedValue(mockPets);

            const param = {
                id: "",
                nick_name: "",
                page: 1,
                pagesize: 10
            }

            const response = await request(app.callback())
                .post("/bi_opt/pet/lists")
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
        });
    });

    describe("POST /bi_opt/pet/del", () => {
        it("should delete a pet", async () => {
            mockVerifyToken();

            jest.spyOn(Pet, "findOne").mockResolvedValue(mockPetData);

            const response = await request(app.callback())
                .post("/bi_opt/pet/del")
                .set("token", "mockToken")
                .send({ pet_id: 623934 });

            expect(response.status).toBe(200);
            expect(response.body.code).toBe(200);
            expect(response.body.msg).toBe("");
            expect(response.body.data).toBe(true);
        });
        it("should return an error when pet is not found", async () => {
            mockVerifyToken();

            jest.spyOn(Pet, "findOne").mockResolvedValue(null);

            const response = await request(app.callback())
                .post("/bi_opt/pet/del")
                .set("token", "mockToken")
                .send({ pet_id: 6239340000 });

            expect(response.status).toBe(200);
            expect(response.body.code).toBe(700004);
            expect(response.body.data).toBe(null);
        });
    });

    describe("POST /bi_opt/pet/delrecover", () => {
        it("should recover a pet from delete status", async () => {
            jest.spyOn(Pet, 'update').mockResolvedValue(1);
            const response = await request(app.callback())
                .post("/bi_opt/pet/delrecover")
                .set("token", "mockToken")
                .send({ pet_id: 623934 });

            expect(response.status).toBe(200);
        });

        it("should return error when parameters are missing", async () => {
            const response = await request(app.callback())
                .post("/bi_opt/pet/delrecover")
                .set("token", "mockToken")
                .send({});

            expect(response.status).toBe(200);
            expect(response.body.data).toBe(null);
        });
    });

    describe("POST /bi_opt/pet/edit", () => {
        it("should edit an existing pet", async () => {
            mockVerifyToken();
            jest.spyOn(Pet, "findOne").mockResolvedValue(mockPetData);
            jest.spyOn(Pet, "update").mockImplementation(async (conditions, updates, options) => {
                return { nModified: 1 };
            });

            const updatedPetData = {
                ...mockPetData
            };

            const response = await request(app.callback())
                .post("/bi_opt/pet/edit")
                .set("token", "mockToken")
                .send(updatedPetData);

            expect(response.status).toBe(200);
            expect(response.body.code).toBe(200);
            expect(response.body.msg).toBe("");

            expect(Pet.update).toHaveBeenCalledTimes(1);
            expect(Pet.update).toHaveBeenCalled();
        });
    });

    describe("POST /bi_opt/pet/info", () => {
        it("should return pet info", async () => {
            mockVerifyToken();
            jest.spyOn(Pet, 'findOne').mockResolvedValue(mockPetData);
            const response = await request(app.callback())
                .post("/bi_opt/pet/info")
                .set("token", "mockToken")
                .send({ id: 623934 });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');

            const returnedPet = response.body.data;
            expect(returnedPet).toMatchObject({
                id: expect.any(Number),
                uid: expect.any(Number),
                top_cate_id: expect.any(Number),
                cate_id: expect.any(Number),
                gender: expect.any(Number),
                birthday: expect.any(Number),
                homeday: expect.any(Number),
                weight: expect.any(Number),
                weight_unit_id: expect.any(Number),
                kc_status: expect.any(Number),
                is_die: expect.any(Number),
                die_time: expect.any(Number),
                head_img: expect.any(String),
            });

            expect(Pet.findOne).toHaveBeenCalledTimes(1);
            expect(Pet.findOne).toHaveBeenCalledWith({
                where: {
                    id: 623934
                },
                attributes: [
                    'id',
                    'nick_name',
                    'uid',
                    'top_cate_id',
                    'cate_id',
                    'gender',
                    'birthday',
                    'homeday',
                    'weight',
                    'weight_unit_id',
                    'kc_status',
                    'is_die',
                    'die_time',
                    'head_img',
                    'is_deleted'
                ]
            });
        });

        it("should return error when id is missing", async () => {
            mockVerifyToken();

            const response = await request(app.callback())
                .post("/bi_opt/pet/info")
                .set("token", "mockToken")
                .send({});

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data', null);
            expect(response.body.msg).toBe("参数缺失");
        });
    });

    describe("POST /bi_opt/pet/recover", () => {
        it("should recover an existing pet from die status", async () => {
            mockVerifyToken();
            jest.spyOn(Pet, "update").mockImplementation(async (conditions, updates, options) => {
                return { nModified: 1 };
            });

            const response = await request(app.callback())
                .post("/bi_opt/pet/recover")
                .set("token", "mockToken")
                .send({ pet_id: 623934 });

            expect(response.status).toBe(200);
            expect(response.body.code).toBe(200);
            expect(response.body.msg).toBe("");

            expect(Pet.update).toHaveBeenCalledTimes(1);
            expect(Pet.update).toHaveBeenCalled();
        });
    });

    describe("POST /bi_opt/pet/cate/add AND edit", () => {
        it("should add a new PetCate", async () => {
            mockVerifyToken();
            jest.spyOn(PetCate, "create").mockImplementation(async (data) => {
                return { ...data, id: 1 };
            });

            const newPetCateData = {
                pid: 1,
                is_hot: 1,
                name: "测试毛",
                f_letter: "C",
                size: 1
            };

            const response = await request(app.callback())
                .post("/bi_opt/pet/cate/add")
                .set("token", "mockToken")
                .send(newPetCateData);

            expect(response.status).toBe(200);
            expect(response.body.code).toBe(200);
            expect(response.body.msg).toBe("");

            expect(PetCate.create).toHaveBeenCalledTimes(1);
        });
        it("should edit an existing PetCate", async () => {
            mockVerifyToken();
            jest.spyOn(PetCate, "update").mockImplementation(async (conditions, updates, options) => {
                return { nModified: 1 };
            });

            const updatedPetCateData = {
                id: 714,
                pid: 1,
                is_hot: 1,
                name: "测试啊",
                f_letter: "H",
                size: 1
            };

            const response = await request(app.callback())
                .post("/bi_opt/pet/cate/edit")
                .set("token", "mockToken")
                .send(updatedPetCateData);

            expect(response.status).toBe(200);
            expect(response.body.code).toBe(200);
            expect(response.body.msg).toBe("");

            expect(PetCate.update).toHaveBeenCalledTimes(1);
            expect(PetCate.update).toHaveBeenCalled();
        });
    });

    describe("POST /bi_opt/pet/cate/info", () => {
        it("should return PetCate info", async () => {
            mockVerifyToken();
            jest.spyOn(PetCate, 'findOne').mockResolvedValue(mockPetCateData);
            const response = await request(app.callback())
                .post("/bi_opt/pet/cate/info")
                .set("token", "mockToken")
                .send({ id: 1 });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');

            const returnedPetCate = response.body.data;
            expect(returnedPetCate).toMatchObject({
                id: expect.any(Number),
                pid: expect.any(Number),
                name: expect.any(String),
                is_hot: expect.any(Number),
                f_letter: expect.any(String),
                size: expect.any(Number),
                updated_at: expect.any(String),
                updated_by: expect.any(Number),
            });

            expect(PetCate.findOne).toHaveBeenCalledTimes(1);
            expect(PetCate.findOne).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    pid: { [Op.ne]: 0 }
                },
                attributes: ['id', 'pid', 'name', 'is_hot', 'f_letter', 'size', 'updated_at', 'updated_by']
            });
        });

        it("should return error when id is missing", async () => {
            mockVerifyToken();

            const response = await request(app.callback())
                .post("/bi_opt/pet/cate/info")
                .set("token", "mockToken")
                .send({});

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data', null);
            expect(response.body.msg).toBe("参数缺失");
        });
    });

    describe("POST /bi_opt/pet/cate/lists", () => {
        it("should return PetCate lists", async () => {
            mockVerifyToken();
            const mockPetCates = {
                docs: [mockPetCateListData],
                pages: 2,
                total: 11
            };
            jest.spyOn(PetCate, "paginate").mockResolvedValue(mockPetCates);

            const param = {
                pid: "",
                is_hot: "",
                name: "",
                page: 1,
                pagesize: 10
            }

            const response = await request(app.callback())
                .post("/bi_opt/pet/cate/lists")
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
        });
    });

    describe("POST /bi_opt/pet/friend/remove", () => {
        it("should edit an existing pet", async () => {
            mockVerifyToken();
            jest.spyOn(UserBreeder, "update").mockImplementation(async (conditions, updates, options) => {
                return { nModified: 1 };
            });

            const response = await request(app.callback())
                .post("/bi_opt/pet/friend/remove")
                .set("token", "mockToken")
                .send({ id: 1 });

            expect(response.status).toBe(200);
            expect(response.body.code).toBe(200);
            expect(response.body.msg).toBe("");

            expect(UserBreeder.update).toHaveBeenCalledTimes(1);
            expect(UserBreeder.update).toHaveBeenCalled();
        });
    });
});
