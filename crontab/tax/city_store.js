const {
    sequelize_shop_tk,
    CityStore
} = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const moment = require("moment");
const schedule = require('node-schedule');

//统计城市、分仓信息
async function addCityStoreToDatabase() {
    console.log('Begin Run addCityStore Schedule Job');
    try {
        const nowTime = moment().format("YYYY-MM-DD HH:mm:ss");
        const list = [];
        let base_sql = `SELECT DISTINCT city, store_id, store_name FROM tax`;
        const result = await sequelize_shop_tk.query(base_sql, {
            type: QueryTypes.SELECT
        });
        if (result && result.length) {
            for (const item of result) {
                const { city, store_id, store_name } = item;
                list.push({
                    created: nowTime, //日期
                    city: city, //城市
                    store_id: store_id, //分仓id
                    store_name: store_name, //分仓名
                });
            }
            await CityStore.destroy({
                truncate: true
            });
            await CityStore.bulkCreate(list);
        }
    } catch (error) {
        console.log('addDataToDatabase Error ===>>>', error);
    }
    console.log('End Run addCityStore Schedule Job');
}

module.exports = () => {
    const time = "45 8 * * *";
    schedule.scheduleJob(time, function () {
        addCityStoreToDatabase();
    });
}
