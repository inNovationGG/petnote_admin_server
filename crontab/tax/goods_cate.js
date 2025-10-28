const {
    sequelize_shop_tk,
    GoodsCate
} = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const moment = require("moment");
const schedule = require('node-schedule');

//统计城市、分仓信息
async function addGoodsCateToDatabase() {
    console.log('Begin Run addGoodsCate Schedule Job');
    try {
        const nowTime = moment().format("YYYY-MM-DD HH:mm:ss");
        const list = [];
        let base_sql = `SELECT DISTINCT f_cate_id, f_cate_name, s_cate_id, s_cate_name, t_cate_id, t_cate_name FROM tax`;
        const result = await sequelize_shop_tk.query(base_sql, {
            type: QueryTypes.SELECT
        });
        if (result && result.length) {
            for (const item of result) {
                list.push({
                    created: nowTime, //日期
                    f_cate_id: item.f_cate_id, //一级品类id
                    f_cate_name: item.f_cate_name, //一级品类名称
                    s_cate_id: item.s_cate_id, //二级品类id
                    s_cate_name: item.s_cate_name, //二级品类名称
                    t_cate_id: item.t_cate_id, //三级品类id
                    t_cate_name: item.t_cate_name, //三级品类名称
                });
            }
            await GoodsCate.destroy({
                truncate: true
            });
            await GoodsCate.bulkCreate(list);
        }
    } catch (error) {
        console.log('addDataToDatabase Error ===>>>', error);
    }
    console.log('End Run addGoodsCate Schedule Job');
}

module.exports = () => {
    const time = "50 8 * * *";
    schedule.scheduleJob(time, function () {
        addGoodsCateToDatabase();
    });
}
