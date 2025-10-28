const schedule = require('node-schedule');
const {
    Score,
    UserExt
} = require("../../models");
const { Op } = require("sequelize");
const moment = require("moment");

//将user_ext中的balance数据按照5:1的比例转换为积分存到score表中
async function addDataToDatabase() {
    console.log('Begin Run Schedule Job');
    try {
        const inTime = Number(moment().format("YYYYMM")); //积分获取年月
        const outTime = Number(moment().add(1, 'years').format('YYYYMM')); //积分到期年月
        const addBaseField = {
            score_id: '',
            uid: '',
            score: 0,
            in_time: inTime,
            out_time: outTime,
            reason: '',
            create_by: '',
            update_by: '',
            created: Math.floor(Date.now() / 1000),
            updated: Math.floor(Date.now() / 1000),
            created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            created_y: Number(moment().format("YYYY")),
            created_ym: Number(moment().format("YYYYMM")),
            created_ymd: Number(moment().format("YYYYMMDD")),
        };
        const scoreCount = await Score.count({});
        if (scoreCount != 0) {
            return;
        }
        const balanceInfo = await UserExt.findAll({
            where: {
                balance: {
                    [Op.gt]: 0
                }
            },
            order: [
                ['uid', 'ASC'],
            ],
            attributes: ['uid', 'balance']
        });
        const batchSize = 1000; // 设定每批次的记录数
        let scoreList = [];
        for (const item of balanceInfo) {
            const { uid, balance } = item;
            scoreList.push({
                ...addBaseField,
                score_id: `${uid}:${inTime}`,
                uid: uid,
                score: Math.ceil(balance / 5),
                create_by: uid,
                update_by: uid
            });
            if (scoreList.length >= batchSize) {
                await Score.bulkCreate(scoreList);
                scoreList = []; // 重置列表以准备下一批  
            }
        }
        if (scoreList.length) {
            await Score.bulkCreate(scoreList);
        }
    } catch (error) {
        console.log('addDataToDatabase Error ===>>>', error);
    }
    console.log('End Run Schedule Job');
}

module.exports = () => {
    const time = "0 11 * * *";
    schedule.scheduleJob(time, function () {
        addDataToDatabase();
        console.log('ScheduleJob Success!!!');
    });
}
