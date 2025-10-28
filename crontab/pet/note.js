const schedule = require('node-schedule');
const {
    sequelize_pet,
    NoteNumEveryday
} = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const moment = require("moment");
const utils = require("../../utils/commonUtil");
const { synchroCustomersData } = require("../../services/wechatWorkService");
const { inventoryTimedTask } = require("../../services/warehousesService");

//统计昨天的note数量，并添加到note_num_everyday表中
async function addDataToDatabase() {
    console.log('Begin Run Schedule Job');
    try {
        const previousDate = moment().subtract(1, 'days').format("YYYY-MM-DD");//昨天的日期
        const previousDateYmd = utils.convertDateStringToNumber(previousDate);//20240531
        let note_cnt_sql = `
            SELECT
                count(*) as cnt, count(DISTINCT uid) as user_cnt
            FROM
                note
            WHERE
                is_deleted = 0
                AND
                created_ymd = :date`;
        let noteCount_result = await sequelize_pet.query(note_cnt_sql, {
            replacements: { date: previousDateYmd },
            type: QueryTypes.SELECT
        });
        let count = noteCount_result && noteCount_result[0] ? noteCount_result[0] : {};
        let result = {
            created_ymd: previousDateYmd,
            note_num: count.cnt || 0,
            user_num: count.user_cnt || 0
        }
        let allUserWithNote_cnt_sql = `
            SELECT
                count(DISTINCT uid) as cnt
            FROM
                note
            WHERE
                created_ymd <= :date
                AND
                is_deleted = 0;`
        let allUserWithNoteCount_result = await sequelize_pet.query(allUserWithNote_cnt_sql, {
            replacements: { date: previousDateYmd },
            type: QueryTypes.SELECT
        });
        let allUserWithNoteCount = allUserWithNoteCount_result && allUserWithNoteCount_result[0] && allUserWithNoteCount_result[0].cnt ? allUserWithNoteCount_result[0].cnt : 0;
        result["user_all_num"] = allUserWithNoteCount;
        let note = await NoteNumEveryday.findOne({
            where: { created_ymd: previousDateYmd }
        });
        if (!note) {
            await NoteNumEveryday.create(result);
        }
    } catch (error) {
        console.log('addDataToDatabase Error ===>>>', error);
    }
    console.log('End Run Schedule Job');
}

// module.exports = () => {
//     //每天凌晨1点0分执行
//     const time = "0 1 * * *";
//     schedule.scheduleJob(time, function () {
//         addDataToDatabase();
//         console.log('ScheduleJob Success!!!');
//     });

//     const time2 = "0 2 * * *";
//     schedule.scheduleJob(time2, function () {
//         synchroCustomersData();
//         console.log('ScheduleJob Success!!!');
//     });

//     // 同步库存与 sku，每两小时运行一次
//     schedule.scheduleJob("0 */2 * * *", function () {
//       console.log("scheduleJob: ", "inventoryTimedTask");
//       inventoryTimedTask();
//       console.log("ScheduleJob inventoryTimedTask Success!!!");
//     });
// }

module.exports = {
    addDataToDatabase, //每天凌晨1点0分执行
    synchroCustomersData, //每天凌晨2点0分执行
    inventoryTimedTask, //每2小时运行一次
}
