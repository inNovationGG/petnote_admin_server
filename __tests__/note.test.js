const request = require("supertest");
const app = require("../app");
const { verifyToken } = require("../utils/jwt");
const {
    Note,
    NotePet,
    User,
    NoteImage,
    Messages,
    PetAdminUser,
    sequelize_pet
} = require("../models");
const moment = require("moment");
const { Op, QueryTypes } = require("sequelize");

jest.mock("../utils/jwt");

const mockVerifyToken = () => {
    verifyToken.mockReturnValue({ uid: 17, username: "testing" });
};

const mockNoteListData = {
    id: 26,
    uid: 7,
    note_time: 1353859200,
    created: 1603959624,
    status: 12,
    updated: 1603959624,
    desc_audit_ext: null,
    from_source: 0,
    from_uid: 0,
    admin_user: "",
    user: {
        uid: 7,
        nick_name: "肖棣",
        mini_nick_name: "大美妈"
    },
    audit_reason: [
        {
            flag: 1,
            name: "文本"
        }
    ],
    toJSON() {
        return this;
    },
};

const mockNoteData = {
    id: 26,
    uid: 7,
    note_time: 1353859200,
    created: 1603959624,
    status: 12,
    updated: 1603959624,
    desc_audit_ext: null,
    from_source: 0,
    from_uid: 0,
    admin_user: "",
    user: {
        uid: 7,
        nick_name: "肖棣",
        mini_nick_name: "大美妈"
    },
    audit_reason: [
        {
            flag: 1,
            name: "文本"
        }
    ],
    toJSON() {
        return this;
    },
};

describe("Note Service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("POST /bi_opt/note/auditlists", () => {
        it("should return audit lists", async () => {
            mockVerifyToken();
            const mockNotes = {
                docs: [mockNoteListData],
                pages: 2,
                total: 11
            };
            jest.spyOn(Note, "paginate").mockResolvedValue(mockNotes);

            const param = {
                search_name: "",
                start_time: "2023-11-03 12:00:00",
                end_time: "2023-11-15 12:00:00"
            }

            const response = await request(app.callback())
                .post("/bi_opt/note/auditlists")
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
                uid: expect.any(Number),
                note_time: expect.any(Number),
                created: expect.any(Number),
                status: expect.any(Number),
                updated: expect.any(Number),
                desc_audit_ext: expect.any(Object),
                from_source: expect.any(Number),
                from_uid: expect.any(Number),
                admin_user: expect.any(String),
                user: expect.any(Object),
                audit_reason: expect.any(Array)
            });
        });
    });

    describe("POST /bi_opt/note/reviewlists", () => {
        it("should return audit review lists", async () => {
            mockVerifyToken();
            const mockNotes = {
                docs: [mockNoteListData],
                pages: 2,
                total: 11
            };
            jest.spyOn(Note, "paginate").mockResolvedValue(mockNotes);

            const param = {
                search_name: "",
                start_time: "2023-11-03 12:00:00",
                end_time: "2023-11-15 12:00:00"
            }

            const response = await request(app.callback())
                .post("/bi_opt/note/reviewlists")
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
                uid: expect.any(Number),
                note_time: expect.any(Number),
                created: expect.any(Number),
                status: expect.any(Number),
                updated: expect.any(Number),
                desc_audit_ext: expect.any(Object),
                from_source: expect.any(Number),
                from_uid: expect.any(Number),
                admin_user: expect.any(String),
                user: expect.any(Object),
                audit_reason: expect.any(Array)
            });
        });
    });

    describe("POST /bi_opt/note/auditstatus", () => {
        it("should edit an existing Note", async () => {
            mockVerifyToken();
            jest.spyOn(Note, "findOne").mockResolvedValue(mockNoteData);
            jest.spyOn(Note, "update").mockImplementation(async (conditions, updates, options) => {
                return [1];
            });
            jest.spyOn(NotePet, "update").mockImplementation(async (conditions, updates, options) => {
                return [1];
            });

            const updatedNoteData = {
                id: 26,
                status: 0,
                mark: ""
            };

            const response = await request(app.callback())
                .post("/bi_opt/note/auditstatus")
                .set("token", "mockToken")
                .send(updatedNoteData);

            expect(response.status).toBe(200);
            expect(response.body.code).toBe(200);
            expect(response.body.msg).toBe("");

            expect(Note.update).toHaveBeenCalledTimes(1);
            expect(Note.update).toHaveBeenCalled();
        });
    });

    describe("POST /bi_opt/note/auditnext", () => {
        it("should return audit note next", async () => {
            mockVerifyToken();
            jest.spyOn(Note, 'findAll').mockResolvedValue([
                { id: 1, status: 12 },
                { id: 2, status: 12 },
                { id: 3, status: 12 }
            ]);
            const param = {
                id: 1,
                start_time: "2024-06-01 00:00:00",
                end_time: "2024-06-30 23:59:59"
            };
            const response = await request(app.callback())
                .post("/bi_opt/note/auditnext")
                .set("token", "mockToken")
                .send(param);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');

            const returnedNote = response.body.data;
            expect(returnedNote).toMatchObject({
                id: expect.any(Number),
                status: expect.any(Number)
            });

            expect(Note.findAll).toHaveBeenCalledTimes(1);
            expect(Note.findAll).toHaveBeenCalledWith({
                where: {
                    status: 12,
                    is_deleted: 0,
                    updated_at: {
                        [Op.between]: ["2024-06-01 00:00:00", "2024-06-30 23:59:59"]
                    }
                },
                attributes: ["id", "status"],
                order: [['updated', 'DESC']],
            });
        });

        it("should return error when id or start_time or end_time is missing", async () => {
            mockVerifyToken();

            const response = await request(app.callback())
                .post("/bi_opt/note/auditnext")
                .set("token", "mockToken")
                .send({});

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data', null);
            expect(response.body.msg).toBe("参数缺失");
        });
    });

    describe("POST /bi_opt/note/reviewstatus", () => {
        it("should edit an existing Note", async () => {
            mockVerifyToken();
            jest.spyOn(Note, "findOne").mockResolvedValue({
                id: 26,
                uid: 17,
                status: 10
            });
            jest.spyOn(Note, "update").mockImplementation(async (conditions, updates, options) => {
                return [1];
            });
            jest.spyOn(NotePet, "update").mockImplementation(async (conditions, updates, options) => {
                return [1];
            });

            const updatedNoteData = {
                id: 26,
                status: 1,
                mark: ""
            };

            const response = await request(app.callback())
                .post("/bi_opt/note/reviewstatus")
                .set("token", "mockToken")
                .send(updatedNoteData);

            expect(response.status).toBe(200);
            expect(response.body.code).toBe(200);
            expect(response.body.msg).toBe("");

            expect(Note.update).toHaveBeenCalledTimes(1);
            expect(Note.update).toHaveBeenCalled();
            expect(NotePet.update).toHaveBeenCalledTimes(1);
            expect(NotePet.update).toHaveBeenCalled();
        });
    });
});
