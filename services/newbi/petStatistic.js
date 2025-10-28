/* eslint-disable no-unused-vars */
const {
    sequelize_pet,
    sequelize_pet_log,
} = require("../../models");
const { Op, QueryTypes } = require("sequelize");
const utils = require("../../utils/commonUtil");
const moment = require("moment");
const { formatPagination } = require("../../utils/pagination");

class PetStatisticService {
    //宠本本运营数据
    async operationStatistic(param) {
        try {
            let { begin, end, page = 1, pagesize = 10, exportFlag = false } = param;//exportFlag为导出标识，true代表查询所有数据，false代表分页查询
            let singleDayData = [];//单日数据集合
            let allNewUserWithPet = 0;//周期合计，新增用户首次建档数
            let allNewPetCount = 0;//周期合计，新创建的宠物档案数量
            let date = utils.getDateRange(begin, end);
            const totalLength = date.length;
            const totalPages = Math.ceil(totalLength / pagesize);
            const startIndex = (page - 1) * pagesize;
            if (!exportFlag) {
                date = date.slice(startIndex, startIndex + pagesize);//只处理页内的数据
            }
            for (let i = 0; i < date.length; i++) {
                const beginDateTimeStamp = Math.floor(new Date(date[i]).getTime() / 1000);
                const endDateTimeStamp = Math.floor(new Date(date[i] + " 23:59:59").getTime() / 1000);
                const dateYmd = utils.convertDateStringToNumber(date[i]);//20240601
                const formatDate = moment(date[i], "YYYY-MM-DD").format("YYYY/MM/DD");//"2024/06/01"
                let userLoginCount = 0;//总活跃用户：当天进入小程序的用户数量
                let userLoginCount_sql = `
                    SELECT 
                        COUNT(DISTINCT uid) AS cnt 
                    FROM 
                        user_login_log 
                    WHERE 
                        last_login_ymd = :dateYmd`;
                let userLoginCountResults = await sequelize_pet_log.query(userLoginCount_sql, {
                    replacements: { dateYmd: dateYmd },
                    type: QueryTypes.SELECT
                });
                userLoginCount = userLoginCountResults && userLoginCountResults[0] && userLoginCountResults[0].cnt ? userLoginCountResults[0].cnt : 0;
                let userWithNoteCount = 0;//记录用户人数，当天有记录行为的用户人数
                let userWithNoteCount_sql = `
                    SELECT 
                        COUNT(DISTINCT uid) AS cnt 
                    FROM 
                        note 
                    WHERE 
                        created_ymd = :dateYmd`;
                let userWithNoteCountResults = await sequelize_pet.query(userWithNoteCount_sql, {
                    replacements: { dateYmd: dateYmd },
                    type: QueryTypes.SELECT
                });
                userWithNoteCount = userWithNoteCountResults && userWithNoteCountResults[0] && userWithNoteCountResults[0].cnt ? userWithNoteCountResults[0].cnt : 0;
                //新建记录率：记录用户人数/总活跃用户
                let rateOfUserWithNoteByUserLogin = userWithNoteCount && userLoginCount ? (userWithNoteCount / userLoginCount * 100).toFixed(2) + "%" : "0.00%";
                let noteCount = 0;//当天新发布的所有类型的记录
                let noteCount_sql = `
                    SELECT 
                        COUNT(*) AS cnt 
                    FROM 
                        note 
                    WHERE 
                        created_ymd = :dateYmd`;
                let noteCountResults = await sequelize_pet.query(noteCount_sql, {
                    replacements: { dateYmd: dateYmd },
                    type: QueryTypes.SELECT
                });
                noteCount = noteCountResults && noteCountResults[0] && noteCountResults[0].cnt ? noteCountResults[0].cnt : 0;
                let newUserCount = 0;//新增用户活跃人数：当天的新增用户数量
                let newUserCount_sql = `
                    SELECT   
                        COUNT(DISTINCT uid) AS cnt  
                    FROM   
                        user 
                    WHERE 
                        is_deleted = 0 
                        AND 
                        created_ymd = :dateYmd`;
                let newUserCountResults = await sequelize_pet.query(newUserCount_sql, {
                    replacements: { dateYmd: dateYmd },
                    type: QueryTypes.SELECT
                });
                newUserCount = newUserCountResults && newUserCountResults[0] && newUserCountResults[0].cnt ? newUserCountResults[0].cnt : 0;
                let oldUserCount = userLoginCount - newUserCount;//老用户活跃人数：总活跃用户-新增用户
                oldUserCount = oldUserCount < 0 ? 0 : oldUserCount;
                let newUserWithPet = 0;//新增用户首次建档数：当天新增用户完成建档的人数
                let newUserWithPet_sql = `
                    SELECT 
                        COUNT(*) AS cnt 
                    FROM 
                        user 
                    WHERE 
                        created BETWEEN :beginDateOne AND :endDateOne 
                        AND 
                        uid IN (SELECT DISTINCT uid FROM pet WHERE created BETWEEN :beginDateTwo AND :endDateTwo)`;
                let newUserWithPetResults = await sequelize_pet.query(newUserWithPet_sql, {
                    replacements: {
                        beginDateOne: beginDateTimeStamp,
                        endDateOne: endDateTimeStamp,
                        beginDateTwo: beginDateTimeStamp,
                        endDateTwo: endDateTimeStamp
                    },
                    type: QueryTypes.SELECT
                });
                newUserWithPet = newUserWithPetResults && newUserWithPetResults[0] && newUserWithPetResults[0].cnt ? newUserWithPetResults[0].cnt : 0;
                let newUserYesterdayCount = 0;//前一天注册的人数
                let newUserYesterdayAndLoginTodayCount = 0;//前一天注册的用户，今天仍然登录的人数
                const previousDate = moment(date[i]).subtract(1, 'days').format("YYYY-MM-DD");//昨天的日期
                const previousDateYmd = utils.convertDateStringToNumber(previousDate);//20240531
                let newUserYesterdayCount_sql = `
                    SELECT   
                        COUNT(DISTINCT uid) AS cnt  
                    FROM   
                        user 
                    WHERE 
                        is_deleted = 0 
                        AND 
                        created_ymd = :dateYmd`;
                let newUserYesterdayCountResults = await sequelize_pet.query(newUserYesterdayCount_sql, {
                    replacements: { dateYmd: previousDateYmd },
                    type: QueryTypes.SELECT
                });
                newUserYesterdayCount = newUserYesterdayCountResults && newUserYesterdayCountResults[0] && newUserYesterdayCountResults[0].cnt ? newUserYesterdayCountResults[0].cnt : 0;
                let newUserYesterdayAndLoginTodayCount_sql = `
                    SELECT   
                        COUNT(DISTINCT uid) AS cnt  
                    FROM   
                        pet.user 
                    WHERE 
                        is_deleted = 0 
                        AND 
                        created_ymd = :dateYmdOne 
                        AND 
                        uid IN (SELECT DISTINCT uid FROM pet_log.user_login_log WHERE last_login_ymd = :dateYmdTwo)`;
                let newUserYesterdayAndLoginTodayCountResults = await sequelize_pet.query(newUserYesterdayAndLoginTodayCount_sql, {
                    replacements: { dateYmdOne: previousDateYmd, dateYmdTwo: dateYmd },
                    type: QueryTypes.SELECT
                });
                newUserYesterdayAndLoginTodayCount = newUserYesterdayAndLoginTodayCountResults && newUserYesterdayAndLoginTodayCountResults[0] && newUserYesterdayAndLoginTodayCountResults[0].cnt ? newUserYesterdayAndLoginTodayCountResults[0].cnt : 0;
                //新增用户次日留存率：前一天注册的用户，今天仍然登录的人数/前一天注册的人数
                let rateOfnewUserAlive = newUserYesterdayCount && newUserYesterdayAndLoginTodayCount ? (newUserYesterdayAndLoginTodayCount / newUserYesterdayCount * 100).toFixed(2) + "%" : "0.00%";
                let newPetCount = 0;//新增建档数：当天创建的宠物档案数量
                let newPetCount_sql = `
                    SELECT   
                        COUNT(*) AS cnt  
                    FROM   
                        pet 
                    WHERE 
                        created BETWEEN :beginDate AND :endDate`;
                let newPetCountResults = await sequelize_pet.query(newPetCount_sql, {
                    replacements: { beginDate: beginDateTimeStamp, endDate: endDateTimeStamp },
                    type: QueryTypes.SELECT
                });
                newPetCount = newPetCountResults && newPetCountResults[0] && newPetCountResults[0].cnt ? newPetCountResults[0].cnt : 0;
                singleDayData.push({
                    date: formatDate,
                    userLoginCount,
                    newUserCount,
                    oldUserCount,
                    newUserWithPet,
                    rateOfnewUserAlive,
                    newPetCount,
                    userWithNoteCount,
                    rateOfUserWithNoteByUserLogin,
                    noteCount
                })
            }
            let allDayData = {};//周期合计
            const beginDateTimeStamp = Math.floor(new Date(begin).getTime() / 1000);
            const endDateTimeStamp = Math.floor(new Date(end + " 23:59:59").getTime() / 1000);
            const beginDateYmd = utils.convertDateStringToNumber(begin);//20240601
            const endDateYmd = utils.convertDateStringToNumber(end);//20240630
            let allUserLoginCount = 0;//周期合计总活跃用户：合计进入小程序的用户数量，需去重
            let allUserLoginCount_sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS cnt 
                FROM 
                    user_login_log 
                WHERE 
                    last_login_ymd BETWEEN :begin AND :end`;
            let allUserLoginCountResults = await sequelize_pet_log.query(allUserLoginCount_sql, {
                replacements: { begin: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            allUserLoginCount = allUserLoginCountResults && allUserLoginCountResults[0] && allUserLoginCountResults[0].cnt ? allUserLoginCountResults[0].cnt : 0;
            let allUserWithNoteCount = 0;//记录用户人数，周期内有记录行为的用户人数
            let allUserWithNoteCount_sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS cnt 
                FROM 
                    note 
                WHERE 
                    created_ymd BETWEEN :start AND :end`;
            let allUserWithNoteCountResults = await sequelize_pet.query(allUserWithNoteCount_sql, {
                replacements: { start: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            allUserWithNoteCount = allUserWithNoteCountResults && allUserWithNoteCountResults[0] && allUserWithNoteCountResults[0].cnt ? allUserWithNoteCountResults[0].cnt : 0;
            //新建记录率：记录用户人数/总活跃用户
            let rateOfUserWithNoteByUserLogin = allUserWithNoteCount && allUserLoginCount ? (allUserWithNoteCount / allUserLoginCount * 100).toFixed(2) + "%" : "0.00%";
            let allNoteCount = 0;//周期内新发布的所有类型的记录
            let allNoteCount_sql = `
                SELECT 
                    COUNT(*) AS cnt 
                FROM 
                    note 
                WHERE 
                    created_ymd BETWEEN :start AND :end`;
            let allNoteCountResults = await sequelize_pet.query(allNoteCount_sql, {
                replacements: { start: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            allNoteCount = allNoteCountResults && allNoteCountResults[0] && allNoteCountResults[0].cnt ? allNoteCountResults[0].cnt : 0;
            let allNewUserCount = 0;//新增用户活跃人数：合计的新增用户数量，需去重
            let allNewUserCount_sql = `
                SELECT   
                    COUNT(DISTINCT uid) AS cnt  
                FROM   
                    user 
                WHERE 
                    is_deleted = 0 
                    AND 
                    created_ymd BETWEEN :begin AND :end`;
            let allNewUserCountResults = await sequelize_pet.query(allNewUserCount_sql, {
                replacements: { begin: beginDateYmd, end: endDateYmd },
                type: QueryTypes.SELECT
            });
            allNewUserCount = allNewUserCountResults && allNewUserCountResults[0] && allNewUserCountResults[0].cnt ? allNewUserCountResults[0].cnt : 0;
            let allOldUserCount = allUserLoginCount - allNewUserCount;//老用户活跃人数：总活跃用户-新增用户
            let allNewUserWithPet_sql = `
                SELECT 
                    COUNT(*) AS cnt 
                FROM 
                    user 
                WHERE 
                    created BETWEEN :beginDateOne AND :endDateOne 
                    AND 
                    uid IN (SELECT DISTINCT uid FROM pet WHERE created BETWEEN :beginDateTwo AND :endDateTwo)`;
            let allNewUserWithPetResults = await sequelize_pet.query(allNewUserWithPet_sql, {
                replacements: {
                    beginDateOne: beginDateTimeStamp,
                    endDateOne: endDateTimeStamp,
                    beginDateTwo: beginDateTimeStamp,
                    endDateTwo: endDateTimeStamp
                },
                type: QueryTypes.SELECT
            });
            allNewUserWithPet = allNewUserWithPetResults && allNewUserWithPetResults[0] && allNewUserWithPetResults[0].cnt ? allNewUserWithPetResults[0].cnt : 0;
            let newUserBeforeCount = 0;//前n天注册的人数，n的值由begin和end间的间隔天数决定
            let newUserBeforeAndLoginNowCount = 0;//前n天注册的用户，现在所选时间段内仍然登录的人数
            const allDate = utils.getDateRange(begin, end);
            const previousBeginDate = moment(begin).subtract(allDate.length, 'days').format("YYYY-MM-DD");
            const previousBeginDateYmd = utils.convertDateStringToNumber(previousBeginDate);//20240531
            let newUserBeforeCount_sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS cnt 
                FROM 
                    user 
                WHERE 
                    is_deleted = 0 
                    AND 
                    created_ymd >= :begin AND created_ymd < :end`;
            let newUserBeforeCountResults = await sequelize_pet.query(newUserBeforeCount_sql, {
                replacements: { begin: previousBeginDateYmd, end: beginDateYmd },
                type: QueryTypes.SELECT
            });
            newUserBeforeCount = newUserBeforeCountResults && newUserBeforeCountResults[0] && newUserBeforeCountResults[0].cnt ? newUserBeforeCountResults[0].cnt : 0;
            let newUserBeforeAndLoginNowCount_sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS cnt 
                FROM 
                    pet.user 
                WHERE 
                    is_deleted = 0 
                    AND 
                    created_ymd >= :beginOne AND created_ymd < :endOne 
                    AND 
                    uid IN (SELECT DISTINCT uid FROM pet_log.user_login_log WHERE last_login_ymd BETWEEN :beginTwo AND :endTwo)`;
            let newUserBeforeAndLoginNowCountResults = await sequelize_pet.query(newUserBeforeAndLoginNowCount_sql, {
                replacements: {
                    beginOne: previousBeginDateYmd,
                    endOne: beginDateYmd,
                    beginTwo: beginDateYmd,
                    endTwo: endDateYmd
                },
                type: QueryTypes.SELECT
            });
            newUserBeforeAndLoginNowCount = newUserBeforeAndLoginNowCountResults && newUserBeforeAndLoginNowCountResults[0] && newUserBeforeAndLoginNowCountResults[0].cnt ? newUserBeforeAndLoginNowCountResults[0].cnt : 0;
            //新增用户留存率：前n天注册的用户，现在n天内仍然登录的人数/前n天注册的人数
            let rateOfnewUserAlive = newUserBeforeCount && newUserBeforeAndLoginNowCount ? (newUserBeforeAndLoginNowCount / newUserBeforeCount * 100).toFixed(2) + "%" : "0.00%";
            let allNewPetCount_sql = `
                SELECT 
                    COUNT(*) AS cnt 
                FROM 
                    pet 
                WHERE 
                    created BETWEEN :beginDate AND :endDate`;
            let allNewPetCountResults = await sequelize_pet.query(allNewPetCount_sql, {
                replacements: { beginDate: beginDateTimeStamp, endDate: endDateTimeStamp },
                type: QueryTypes.SELECT
            });
            allNewPetCount = allNewPetCountResults && allNewPetCountResults[0] && allNewPetCountResults[0].cnt ? allNewPetCountResults[0].cnt : 0;
            allDayData = {
                userLoginCount: allUserLoginCount,
                newUserCount: allNewUserCount,
                oldUserCount: allOldUserCount,
                newUserWithPet: allNewUserWithPet,
                rateOfnewUserAlive: rateOfnewUserAlive,
                newPetCount: allNewPetCount,
                noteCount: allNoteCount,
                rateOfUserWithNoteByUserLogin: rateOfUserWithNoteByUserLogin,
                userWithNoteCount: allUserWithNoteCount
            }
            return {
                success: true,
                data: {
                    singleDayData: singleDayData,//单日数据集合
                    allDayData: allDayData,//周期合计
                    ...formatPagination({ total: totalLength, page: page, limit: pagesize, pages: totalPages })
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    //宠本本用户留存
    async userAlive(param) {
        try {
            let { begin, end, page = 1, pagesize = 10, exportFlag = false } = param;//exportFlag为导出标识，true代表查询所有数据，false代表分页查询
            let results = [];//存储返回结果
            let date = utils.getMonthRange(begin, end);
            const totalLength = date.length;
            const totalPages = Math.ceil(totalLength / pagesize);
            const startIndex = (page - 1) * pagesize;
            if (!exportFlag) {
                date = date.slice(startIndex, startIndex + pagesize);//只处理页内的数据
            }
            for (let i = 0; i < date.length; i++) {
                const dateYm = utils.convertDateStringToNumber(date[i]);//202406
                const formatDate = moment(date[i], "YYYY-MM").format("YYYY/MM");//"2024/06"
                let newUserCount = 0;//当月新注册用户人数
                let newUserCount_sql = `
                    SELECT 
                        COUNT(DISTINCT uid) AS cnt 
                    FROM   
                        user 
                    WHERE 
                        is_deleted = 0 
                        AND 
                        created_ym = :dateYm`;
                let newUserCountResults = await sequelize_pet.query(newUserCount_sql, {
                    replacements: { dateYm: dateYm },
                    type: QueryTypes.SELECT
                });
                newUserCount = newUserCountResults && newUserCountResults[0] && newUserCountResults[0].cnt ? newUserCountResults[0].cnt : 0;
                let userLoginCount = 0;//总活跃用户：当月进入小程序的用户数量
                let userLoginCount_sql = `
                    SELECT   
                        COUNT(DISTINCT uid) AS cnt  
                    FROM 
                        user_login_log 
                    WHERE 
                        last_login_ym = :dateYm`;
                let userLoginCountResults = await sequelize_pet_log.query(userLoginCount_sql, {
                    replacements: { dateYm: dateYm },
                    type: QueryTypes.SELECT
                });
                userLoginCount = userLoginCountResults && userLoginCountResults[0] && userLoginCountResults[0].cnt ? userLoginCountResults[0].cnt : 0;
                let oldUserCount = userLoginCount - newUserCount;//当月活跃老用户人数
                oldUserCount = oldUserCount < 0 ? 0 : oldUserCount;
                let { newUserAliveCount: newUserAliveAfterOneMonth, oldUserAliveCount: oldUserAliveAfterOneMonth } = await this.getUserAliveResult(date[i], dateYm, 1);
                let { newUserAliveCount: newUserAliveAfterTwoMonth, oldUserAliveCount: oldUserAliveAfterTwoMonth } = await this.getUserAliveResult(date[i], dateYm, 2);
                let { newUserAliveCount: newUserAliveAfterThreeMonth, oldUserAliveCount: oldUserAliveAfterThreeMonth } = await this.getUserAliveResult(date[i], dateYm, 3);
                let { newUserAliveCount: newUserAliveAfterFourMonth, oldUserAliveCount: oldUserAliveAfterFourMonth } = await this.getUserAliveResult(date[i], dateYm, 4);
                let { newUserAliveCount: newUserAliveAfterFiveMonth, oldUserAliveCount: oldUserAliveAfterFiveMonth } = await this.getUserAliveResult(date[i], dateYm, 5);
                let { newUserAliveCount: newUserAliveAfterSixMonth, oldUserAliveCount: oldUserAliveAfterSixMonth } = await this.getUserAliveResult(date[i], dateYm, 6);
                let { newUserAliveCount: newUserAliveAfterSevenMonth, oldUserAliveCount: oldUserAliveAfterSevenMonth } = await this.getUserAliveResult(date[i], dateYm, 7);
                let { newUserAliveCount: newUserAliveAfterEightMonth, oldUserAliveCount: oldUserAliveAfterEightMonth } = await this.getUserAliveResult(date[i], dateYm, 8);
                let { newUserAliveCount: newUserAliveAfterNineMonth, oldUserAliveCount: oldUserAliveAfterNineMonth } = await this.getUserAliveResult(date[i], dateYm, 9);
                let { newUserAliveCount: newUserAliveAfterTenMonth, oldUserAliveCount: oldUserAliveAfterTenMonth } = await this.getUserAliveResult(date[i], dateYm, 10);
                let { newUserAliveCount: newUserAliveAfterElevenMonth, oldUserAliveCount: oldUserAliveAfterElevenMonth } = await this.getUserAliveResult(date[i], dateYm, 11);
                let { newUserAliveCount: newUserAliveAfterTwelveMonth, oldUserAliveCount: oldUserAliveAfterTwelveMonth } = await this.getUserAliveResult(date[i], dateYm, 12);
                if (exportFlag) {//导出全部
                    results.push({
                        date: formatDate,
                        newUserCount,
                        oldUserCount,
                        newUserAliveAfterOneMonth,
                        oldUserAliveAfterOneMonth,
                        newUserAliveAfterTwoMonth,
                        oldUserAliveAfterTwoMonth,
                        newUserAliveAfterThreeMonth,
                        oldUserAliveAfterThreeMonth,
                        newUserAliveAfterFourMonth,
                        oldUserAliveAfterFourMonth,
                        newUserAliveAfterFiveMonth,
                        oldUserAliveAfterFiveMonth,
                        newUserAliveAfterSixMonth,
                        oldUserAliveAfterSixMonth,
                        newUserAliveAfterSevenMonth,
                        oldUserAliveAfterSevenMonth,
                        newUserAliveAfterEightMonth,
                        oldUserAliveAfterEightMonth,
                        newUserAliveAfterNineMonth,
                        oldUserAliveAfterNineMonth,
                        newUserAliveAfterTenMonth,
                        oldUserAliveAfterTenMonth,
                        newUserAliveAfterElevenMonth,
                        oldUserAliveAfterElevenMonth,
                        newUserAliveAfterTwelveMonth,
                        oldUserAliveAfterTwelveMonth
                    })
                } else {//分页查询
                    results.push({
                        date: formatDate,
                        newUser: {
                            newUserCount,
                            newUserAliveAfterOneMonth,
                            newUserAliveAfterTwoMonth,
                            newUserAliveAfterThreeMonth,
                            newUserAliveAfterFourMonth,
                            newUserAliveAfterFiveMonth,
                            newUserAliveAfterSixMonth,
                            newUserAliveAfterSevenMonth,
                            newUserAliveAfterEightMonth,
                            newUserAliveAfterNineMonth,
                            newUserAliveAfterTenMonth,
                            newUserAliveAfterElevenMonth,
                            newUserAliveAfterTwelveMonth,
                        },
                        oldUser: {
                            oldUserCount,
                            oldUserAliveAfterOneMonth,
                            oldUserAliveAfterTwoMonth,
                            oldUserAliveAfterThreeMonth,
                            oldUserAliveAfterFourMonth,
                            oldUserAliveAfterFiveMonth,
                            oldUserAliveAfterSixMonth,
                            oldUserAliveAfterSevenMonth,
                            oldUserAliveAfterEightMonth,
                            oldUserAliveAfterNineMonth,
                            oldUserAliveAfterTenMonth,
                            oldUserAliveAfterElevenMonth,
                            oldUserAliveAfterTwelveMonth
                        }
                    })
                }
            }
            if (exportFlag) {//导出全部
                return {
                    success: true,
                    data: results
                }
            } else {//分页查询
                return {
                    success: true,
                    data: {
                        data: results,
                        ...formatPagination({ total: totalLength, page: page, limit: pagesize, pages: totalPages })
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * 计算n个月后仍然登录的新/老用户数量
     *
     * @param {string} startDate: 日期格式YYYY-MM
     * @param {number} startDateYm: 日期格式YYYYMM
     * @param {number} gap: 下一个月，即为1，第12个月后，即为12
     * @return {object} 
     * @memberof PetStatisticService
     */
    async getUserAliveResult(startDate, startDateYm, gap) {
        try {
            const nextDateYm = utils.convertDateStringToNumber(moment(startDate, 'YYYY-MM').add(gap, 'months').format('YYYY-MM'));
            let newUserAliveCount = 0;//新用户留存数量
            let newUserAlive_sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS cnt 
                FROM 
                    pet_log.user_login_log 
                WHERE 
                    last_login_ym = :nextDate 
                    AND 
                    uid IN (SELECT DISTINCT uid FROM pet.user WHERE is_deleted = 0 AND created_ym = :startDate)`;
            let newUserAliveResults = await sequelize_pet_log.query(newUserAlive_sql, {
                replacements: { nextDate: nextDateYm, startDate: startDateYm },
                type: QueryTypes.SELECT
            });
            newUserAliveCount = newUserAliveResults && newUserAliveResults[0] && newUserAliveResults[0].cnt ? newUserAliveResults[0].cnt : 0;
            let oldUserAliveCount = 0;//老用户留存数量
            let oldUserAlive_sql = `
                SELECT 
                    COUNT(DISTINCT uid) AS cnt 
                FROM 
                    pet_log.user_login_log 
                WHERE 
                    last_login_ym = :nextDate 
                    AND 
                    uid IN (SELECT DISTINCT uid FROM pet.user WHERE is_deleted = 0 AND created_ym < :startDate)`;
            let oldUserAliveResults = await sequelize_pet_log.query(oldUserAlive_sql, {
                replacements: { nextDate: nextDateYm, startDate: startDateYm },
                type: QueryTypes.SELECT
            });
            oldUserAliveCount = oldUserAliveResults && oldUserAliveResults[0] && oldUserAliveResults[0].cnt ? oldUserAliveResults[0].cnt : 0;
            return {
                newUserAliveCount,
                oldUserAliveCount
            }
        } catch (error) {
            console.log(error);
        }
    }

    //工厂方法，用于创建中间件
    createMiddleware(methodName) {
        if (!this[methodName]) {
            throw new Error(`Method ${methodName} does not exist.`);
        }
        //返回一个中间件函数
        return async (ctx, next) => {
            //直接调用类方法，并将ctx作为参数传递
            await this[methodName].call(this, ctx);
            //继续执行下一个中间件
            await next();
        };
    }
}

module.exports = new PetStatisticService();
