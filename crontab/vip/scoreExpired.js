const schedule = require('node-schedule');
const {
    Score,
    ScoreExpired,
    ScoreLog,
    sequelize_pet
} = require("../../models");
const { Op } = require("sequelize");
const moment = require("moment");
const { SCORE_LOG_TYPE, SCORE_LOG_CHILD_TYPE } = require("../../constants/scoreLog");

// 每个月第一天将score表中已经过期的积分记录删除（out_time < nowYearMonth）
async function expireScore() {
    console.log('Begin Run Schedule Job expireScore');
    try {
        const nowYearMonth = Number(moment().format("YYYYMM"));
        //积分日志表通用属性
        const scoreLogField = {
            uid: 0,
            task_id: "",
            goods_id: "",
            type: SCORE_LOG_TYPE.DECREMENT, // 1-减少
            child_type: SCORE_LOG_CHILD_TYPE.DECRE_EXPIRED, // 8-积分到期扣减
            score: 0, // 到期的积分数量
            create_by: 0,
            created: Math.floor(Date.now() / 1000),
            created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            created_y: Number(moment().format("YYYY")),
            created_ym: Number(moment().format("YYYYMM")),
            created_ymd: Number(moment().format("YYYYMMDD")),
        }
        const batchSize = 1000;
        let offset = 0;
        let moreData = true; // 用来标记是否还有更多数据  
        while (moreData) {
            try {
                const scores = await Score.findAll({
                    where: {
                        out_time: {
                            [Op.lt]: nowYearMonth
                        }
                    },
                    attributes: { exclude: ['id'] },
                    limit: batchSize,
                    offset: offset,
                    order: [['out_time', 'ASC']]
                });
                if (scores.length === 0) {
                    moreData = false;
                    continue;
                }
                // 2. 准备要归档和日志的数据
                const scoreExpiredData = scores.map(score => ({ ...score }));
                const scoreExpiredLog = scores.map(score => ({
                    ...scoreLogField,
                    uid: score.uid,
                    score: score.score,
                    create_by: score.uid
                }));
                // 3. 开启事务
                await sequelize_pet.transaction(async (t) => {
                    // 归档数据
                    await ScoreExpired.bulkCreate(scoreExpiredData, { transaction: t });
                    // 删除原数据
                    await Score.destroy({
                        where: {
                            score_id: {
                                [Op.in]: scores.map(s => s.score_id)
                            },
                            out_time: {
                                [Op.lt]: nowYearMonth
                            }
                        }
                    }, { transaction: t });
                    // 记录日志
                    await ScoreLog.bulkCreate(scoreExpiredLog, { transaction: t });
                });
                offset += batchSize;
            } catch (error) {
                console.error('ExpireScore process batch error:', error);
                moreData = false;
            }
        }
    } catch (error) {
        console.log('expireScore error ===>>>', error);
    }
    console.log('End Run Schedule Job expireScore');
}

module.exports = () => {
    const time = "1 0 1 * *";
    schedule.scheduleJob(time, function () {
        expireScore();
        console.log('ScheduleJob Success!!!');
    });
}
