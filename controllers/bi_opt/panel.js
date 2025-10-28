/* eslint-disable no-unused-vars */
const {
    sequelize_pet,
    User,
    Note,
    sequelize_pet_log
} = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const utils = require("../../utils/commonUtil");
const moment = require("moment");
class PanelController {
    // 每日新增
    async getDailyNew(ctx) {
        try {
            // 每日新增(创建时间是今天的用户数量)查询user表
            // 每日新增建档(当天创建了宠物的用户数量)查询pet表
            // 每日新增共养(当天成为共养成员的用户数量)查询user_breeder表
            let { date } = ctx.request.body || {};
            let monthDays = utils.getMonthDayList(date);
            // 过滤出今天的日期之前的日期  
            monthDays = monthDays.filter(day => new Date() >= new Date(day));
            let _monthDays = JSON.parse(JSON.stringify(monthDays));
            _monthDays = _monthDays.map(day => utils.convertDateStringToNumber(day));
            if (!monthDays.length || !_monthDays.length) {
                return ctx.body = {
                    success: true,
                    data: []
                }
            }
            let newUserCount_sql = `
                SELECT 
                    created_ymd, 
                    COUNT(*) as count 
                FROM 
                    user 
                WHERE 
                    created_ymd BETWEEN :start AND :end 
                GROUP BY 
                    created_ymd 
                ORDER BY 
                    created_ymd;`
            let newUserCountResults = await sequelize_pet.query(newUserCount_sql, {
                replacements: { start: _monthDays[0], end: _monthDays[_monthDays.length - 1] },
                type: QueryTypes.SELECT
            });
            let userCountMap = new Map();
            if (newUserCountResults && newUserCountResults.length) {
                for (let item of newUserCountResults) {
                    userCountMap.set(utils.convertNumberToDateString(item.created_ymd), item.count);
                }
            }
            let newUserWithPetCount_sql = `
                SELECT 
                    FROM_UNIXTIME(created, '%Y-%m-%d') AS day,  
                    COUNT(DISTINCT uid) AS cnt  
                FROM   
                    pet  
                WHERE   
                    is_deleted = 0  
                    AND 
                    FROM_UNIXTIME(created, '%Y-%m-%d') BETWEEN STR_TO_DATE(:start, '%Y-%m-%d') AND STR_TO_DATE(:end, '%Y-%m-%d') 
                GROUP BY   
                    day  
                ORDER BY   
                    day;`
            let newUserWithPetCountResults = await sequelize_pet.query(newUserWithPetCount_sql, {
                replacements: { start: monthDays[0], end: monthDays[monthDays.length - 1] },
                type: QueryTypes.SELECT
            });
            let userWithPetCountMap = new Map();
            if (newUserWithPetCountResults && newUserWithPetCountResults.length) {
                for (let item of newUserWithPetCountResults) {
                    userWithPetCountMap.set(item.day, item.cnt);
                }
            }
            let newBreederCount_sql = `
                SELECT 
                    FROM_UNIXTIME(created, '%Y-%m-%d') AS day,  
                    COUNT(DISTINCT uid) AS cnt  
                FROM   
                    user_breeder 
                WHERE   
                    is_deleted = 0  
                    AND 
                    breeder_type = 1 
                    AND 
                    FROM_UNIXTIME(created, '%Y-%m-%d') BETWEEN STR_TO_DATE(:start, '%Y-%m-%d') and STR_TO_DATE(:end, '%Y-%m-%d')
                GROUP BY   
                    day  
                ORDER BY   
                    day;`
            let newBreederCountResults = await sequelize_pet.query(newBreederCount_sql, {
                replacements: { start: monthDays[0], end: monthDays[monthDays.length - 1] },
                type: QueryTypes.SELECT
            });
            let breederCountMap = new Map();
            if (newBreederCountResults && newBreederCountResults.length) {
                for (let item of newBreederCountResults) {
                    breederCountMap.set(item.day, item.cnt);
                }
            }
            let result = monthDays.map(day => {
                return {
                    day: day,
                    week: utils.getWeekdayNumber(day),
                    val1: userCountMap.get(day) || 0,
                    val2: userWithPetCountMap.get(day) || 0,
                    val3: breederCountMap.get(day) || 0
                };
            });
            ctx.body = { success: true, data: result };
        } catch (error) {
            console.log(error);
        }
    }
    // 活跃率
    // 周活/月活
    // 周活：
    // 1、选择某年第几周
    // 2、页面展示（日期2024-05-01，weekDay星期几，每日活跃用户量0，每日活跃率0%，周活跃用户量0，周活跃率0%）’
    // 月活：
    // 1、页面展示（月份、月活跃用户总量、月活跃新用户总量、月活跃老用户总量、月用户活跃率、月新用户活跃率，月老用户活跃率）
    async getActivity(ctx) {
        try {
            let { date, type } = ctx.request.body || {};
            if (!(date && type)) {
                return ctx.body = { success: false, msg: "参数缺失" }
            }
            //周活统计
            if (type == 1) {
                //参数结构
                // {
                //     "type": "1",
                //     "date": "2024-06-03T02:15:40.890Z"
                // }
                //返回结构
                // {
                //     "day_lists": [
                //         {
                //             "day": "2024-05-27",
                //             "week": "1",//星期一
                //             "val1": 0,//活跃用户量
                //             "val2": 0,//活跃率
                //         },
                //         ...
                //     ],
                //     "week_stat": {
                //         "val1": 0,//周活跃用户量
                //         "val2": 0,//周活跃率
                //     }
                // }
                let weeks = utils.getWeekOfYear(date);//获取星期
                let weekStartEnd = utils.getWeekStartEnd(date, weeks);
                let dayLists = utils.getDateRange(weekStartEnd.weekStart, weekStartEnd.weekEnd);
                let result = {
                    day_lists: [],
                    week_stat: []
                };
                let totalUserCount = await User.count({});
                let now = new Date();
                // SELECT 
                //     COUNT(DISTINCT ull.uid) AS cnt,ull.last_login_ymd 
                // FROM 
                //     pet_log.user_login_log ull
                // JOIN 
                //     pet.user u ON u.uid = ull.uid and u.created_ymd < ull.last_login_ymd
                // where 
                //     ull.last_login_ymd >= :startDay and ull.last_login_ymd <= :endDay
                // GROUP BY 
                //     uid,last_login_ymd;
                //一周内，每日活跃用户量和每日活跃率
                for (let day of dayLists) {
                    if (now < new Date(day)) {
                        break;
                    }
                    let numberDay = utils.convertDateStringToNumber(day);
                    let userDayCount_sql = `
                        SELECT 
                            COUNT(DISTINCT ull.uid) AS cnt 
                        FROM 
                            pet_log.user_login_log ull 
                        WHERE 
                            ull.last_login_ymd = :first 
                            AND 
                            ull.uid IN (SELECT u.uid FROM pet.user u WHERE u.created_ymd < :second);`
                    //需要通过sequelize_pet_log实例去执行SQL，这里暂时使用pet实例，待更改
                    let userDayCountResults = await sequelize_pet_log.query(userDayCount_sql, {
                        replacements: { first: numberDay, second: numberDay },
                        type: QueryTypes.SELECT
                    });
                    let userCount = userDayCountResults && userDayCountResults[0] && userDayCountResults[0].cnt ? userDayCountResults[0].cnt : 0;
                    result.day_lists.push({
                        day: day,
                        week: utils.getWeekdayNumber(day),
                        val1: userCount,
                        val2: (userCount == 0 || totalUserCount == 0) ? 0 : parseFloat((userCount / totalUserCount * 100).toFixed(2))
                    });
                }
                //周活跃用户量和周活跃率统计
                let beginDay = utils.convertDateStringToNumber(dayLists[0]);
                let endDay = utils.convertDateStringToNumber(dayLists[6]);
                let userWeekCount_sql = `
                    SELECT 
                        COUNT(DISTINCT ull.uid) as cnt 
                    FROM 
                        pet_log.user_login_log ull 
                    WHERE 
                        ull.last_login_ymd BETWEEN :first AND :second 
                        AND 
                        ull.uid in (SELECT uid FROM pet.user WHERE created_ymd < :third);`
                let userWeekCountResults = await sequelize_pet_log.query(userWeekCount_sql, {
                    replacements: { first: beginDay, second: endDay, third: beginDay },
                    type: QueryTypes.SELECT
                });
                let userWeekCount = userWeekCountResults && userWeekCountResults[0] && userWeekCountResults[0].cnt ? userWeekCountResults[0].cnt : 0;
                result.week_stat = {
                    val1: userWeekCount || 0,
                    val2: (userWeekCount == 0 || totalUserCount == 0) ? 0 : parseFloat((userWeekCount / totalUserCount * 100).toFixed(2))
                }
                ctx.body = { success: true, data: result };
            }
            //月活统计
            if (type == 2) {
                //参数结构
                // {
                //     "type": "2",
                //     "date": "2024-06-03T02:15:40.890Z"
                // }
                //返回结构
                // [
                //     {
                //         "month": "2024-01",//月份
                //         "val1": 3,//月活跃用户总量
                //         "val2": 0,//月活跃新用户总量
                //         "val3": 0,//月活跃老用户总量
                //         "val1_rate": "300.00",//月用户活跃率
                //         "val2_rate": "0.00",//月新用户活跃率
                //         "val3_rate": "0.00"//月老用户活跃率
                //     },
                //     ...
                // ]
                let dateTime = moment(date);//将"2024-06-03T02:15:40.890Z"字符串转为时间格式
                let year = dateTime.year();//获取年份
                let monthLists = [];//["2024-01","2024-02",...,"2024-12"]
                for (let i = 1; i <= 12; i++) {
                    let monthString = moment().year(year).month(i - 1).format('YYYY-MM');
                    monthLists.push(monthString);
                }
                let now = new Date();
                let totalUserCount = await User.count({});
                let result = [];
                for (let month of monthLists) {
                    if (now < new Date(month)) {
                        break;
                    }
                    let numberMonth = utils.convertDateStringToNumber(month);
                    let userMonthCount_sql = `
                        SELECT 
                            COUNT(DISTINCT ull.uid) as cnt 
                        FROM 
                            pet_log.user_login_log ull 
                        WHERE 
                            ull.last_login_ym = :first;`
                    let userMonthCountResults = await sequelize_pet_log.query(userMonthCount_sql, {
                        replacements: { first: numberMonth },
                        type: QueryTypes.SELECT
                    });
                    //月活跃用户总量
                    let userMonthCount = userMonthCountResults && userMonthCountResults[0] && userMonthCountResults[0].cnt ? userMonthCountResults[0].cnt : 0;
                    let newUserMonthCount_sql = `
                        SELECT 
                            COUNT(DISTINCT ull.uid) as cnt 
                        FROM 
                            pet_log.user_login_log ull 
                        WHERE 
                            ull.last_login_ym = :first 
                            AND 
                            ull.uid IN (SELECT uid FROM pet.user WHERE created_ym = :second);`;
                    let newUserMonthCountResults = await sequelize_pet_log.query(newUserMonthCount_sql, {
                        replacements: { first: numberMonth, second: numberMonth },
                        type: QueryTypes.SELECT
                    });
                    //月活跃新用户总量
                    let newUserMonthCount = newUserMonthCountResults && newUserMonthCountResults[0] && newUserMonthCountResults[0].cnt ? newUserMonthCountResults[0].cnt : 0;
                    let oldUserMonthCount_sql = `
                        SELECT 
                            COUNT(DISTINCT ull.uid) as cnt 
                        FROM 
                            pet_log.user_login_log ull 
                        WHERE 
                            ull.last_login_ym = :first 
                            AND 
                            ull.uid IN (SELECT uid FROM pet.user WHERE created_ym < :second);`;
                    let oldUserMonthCountResults = await sequelize_pet_log.query(oldUserMonthCount_sql, {
                        replacements: { first: numberMonth, second: numberMonth },
                        type: QueryTypes.SELECT
                    });
                    //月活跃老用户总量
                    let oldUserMonthCount = oldUserMonthCountResults && oldUserMonthCountResults[0] && oldUserMonthCountResults[0].cnt ? oldUserMonthCountResults[0].cnt : 0;
                    result.push({
                        month: month,
                        val1: userMonthCount || 0,
                        val2: newUserMonthCount || 0,
                        val3: oldUserMonthCount || 0,
                        val1_rate: parseFloat((userMonthCount / totalUserCount * 100).toFixed(2)),
                        val2_rate: parseFloat((newUserMonthCount / totalUserCount * 100).toFixed(2)),
                        val3_rate: parseFloat((oldUserMonthCount / totalUserCount * 100).toFixed(2))
                    });
                }
                ctx.body = { success: true, data: result }
            }
        } catch (error) {
            console.log(error);
        }
    }
    // 总计
    //总注册用户数量
    //总建档用户数量
    //总记录条数
    async getWholestat(ctx) {
        try {
            //查询user表总人数，所有的数据都是未删除状态
            let user_total_cnt_sql = `
                SELECT 
                    COUNT(*) as cnt 
                FROM 
                    user 
                WHERE 
                    is_deleted = 0`;
            //查询note表总数量，数据只有已删除和未删除状态
            let note_total_cnt_sql = `
                    SELECT 
                        COUNT(*) as cnt 
                    FROM 
                        note 
                    WHERE 
                        is_deleted = 0 
                        OR 
                        is_deleted = 1`;
            //查询拥有宠物的人总数
            let userWithPetCount_sql = `
                SELECT 
                    COUNT(DISTINCT uid) as cnt 
                FROM 
                    pet 
                WHERE 
                    is_deleted = 0`;
            let totalUserCount = 0;
            let totalNoteCount = 0;
            let userWithPetCount = 0;
            let [userTotalCountResults, noteTotalCountResults, userWithPetCountResults] = await Promise.all([
                sequelize_pet.query(user_total_cnt_sql, { type: QueryTypes.SELECT }),
                sequelize_pet.query(note_total_cnt_sql, { type: QueryTypes.SELECT }),
                sequelize_pet.query(userWithPetCount_sql, { type: QueryTypes.SELECT })
            ]);
            totalUserCount = userTotalCountResults && userTotalCountResults[0] && userTotalCountResults[0].cnt ? userTotalCountResults[0].cnt : 0;
            totalNoteCount = noteTotalCountResults && noteTotalCountResults[0] && noteTotalCountResults[0].cnt ? noteTotalCountResults[0].cnt : 0;
            userWithPetCount = userWithPetCountResults && userWithPetCountResults[0] && userWithPetCountResults[0].cnt ? userWithPetCountResults[0].cnt : 0;
            ctx.body = {
                success: true,
                data: {
                    total_reg_user: totalUserCount,
                    total_note: totalNoteCount,
                    total_profile_user: userWithPetCount
                }
            };
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = PanelController
