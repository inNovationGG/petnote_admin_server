const moment = require("moment");
require('moment/locale/zh-cn')
moment.locale('zh-cn', {//设置一周的第一天为星期一
    week: {
        dow: 1,
    }
});
/**
 * 将id/parentId结构的数组数据转为带有childrens数组的树形结构数据
 *
 * @param {Array} [data=[]] 待处理的数据
 * @param {string} [fid='areaId'] 关联字段的属性名
 * @param {string} [fparent='parentId'] 关联父级的属性名
 * @param {number} [parentId=0] 根节点的parentId默认为0
 * @return {Array} 
 */
function buildTreeData(data = [], fid = 'areaId', fparent = 'parentId', parentId = 0) {
    const tree = [];
    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        if (node[fparent] == parentId) {
            const children = buildTreeData(data, fid, fparent, node[fid])
            if (children.length) {
                tree.push({ ...node, childrens: children })
            } else {
                tree.push({ ...node })
            }
        }
    }
    return tree
}

// 构建以ID为键，子节点数组为值的映射  
function buildNodeIdMap(nodes) {
    const nodeMap = new Map();
    nodes.forEach(node => {
        let arr = nodeMap.get(node.id) || [];
        nodeMap.set(node.id, arr);
        arr.push(node.id);
        if (node.pid) {
            let _arr = nodeMap.get(node.pid) || [];
            nodeMap.set(node.pid, _arr);
            _arr.push(node.id);
        }
    });
    return nodeMap;
}

// 构建以ID为键，子节点数组为值的映射  
function buildNodeMap(nodes) {
    const nodeMap = {};
    nodes.forEach(node => {
        nodeMap[node.id] = nodeMap[node.id] || [];
        nodeMap[node.id].push(node);
        if (node.pid) {
            nodeMap[node.pid] = nodeMap[node.pid] || [];
            nodeMap[node.pid].push(node);
        }
    });
    return nodeMap;
}
// 递归函数来收集所有后代节点的ID  
function collectDescendantIds(inputIds, nodeMap, result = []) {
    inputIds.forEach(id => {
        const node = nodeMap[id];
        if (node) {
            // 如果当前节点有子节点，则递归收集  
            node.forEach(n => {
                if (n.id !== id && !result.includes(n.id)) { // 避免重复添加和添加自己  
                    result.push(n.id);
                    collectDescendantIds([n.id], nodeMap, result); // 递归调用  
                }
            });
        }
    });
    return result;
}
/**
 * 转换数据和收集后代节点ID
 * 
 * @param {Array} data 
 * @param {Array} inputIds 
 * @return {Array} 
 */
function getDescendantIds(data, inputIds) {
    const nodeMap = buildNodeMap(data);
    const descendantIds = collectDescendantIds(inputIds, nodeMap);
    return descendantIds;
}
// // 使用示例
// const data = [  //原始数据结构，通过id和parentId关联父子关系
//     { id: 1, pid: null, name: 'Node1' },
//     { id: 2, pid: 1, name: 'Node1.1' },
//     { id: 3, pid: 1, name: 'Node1.2' },
//     { id: 4, pid: 2, name: 'Node1.1.1' },
//     { id: 5, pid: 2, name: 'Node1.1.2' },
//     // ... 其他节点  
// ];
// // 假设这是输入的ID数组  
// const inputIds = [1, 2, 3, 4, 5];
// // 获取指定节点ID的所有后代节点ID
// let descendantIds = getDescendantIds(data,inputIds);
// console.log(descendantIds);


/**
 *
 * 获取指定月份的每一天列表
 * @param {string} [dateString='']
 * @param {string} [format='Y-m-d']
 * @return {Array} 
 */
function getMonthDayList(dateString = '', format = 'Y-m-d') {
    // 如果dateString为空，则默认为当前日期  
    const date = new Date(dateString || new Date().toISOString().split('T')[0]);
    // 设置为当月的第一天  
    date.setDate(1);
    // 获取本月的最后一天（下一个月的第一天减一）  
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    // 创建一个数组来存储当月的每一天  
    const daysInMonth = [];
    // 循环遍历当月的每一天  
    for (let i = 1; i <= lastDayOfMonth; i++) {
        // 设置日期  
        date.setDate(i);
        // 将日期添加到数组中，并格式化为指定的格式  
        const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, format.includes('-') ? '-' : '/');
        daysInMonth.push(formattedDate);
    }
    return daysInMonth;
}
// 使用示例  
// const monthDays = getMonthDayList();  
// console.log(monthDays); // 输出类似 ["2023-09-01", "2023-09-02", ..., "2023-09-30"]（取决于当前月份的天数）

/**
 *
 * 根据日期返回星期几
 * @param {string} dateString
 * @return {string} 
 */
function getWeekdayNumber(dateString) {
    // 创建一个新的Date对象，使用传入的日期字符串  
    const date = new Date(dateString);
    // 验证日期是否有效  
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
    }
    // getDay() 方法返回一周中的第几天（0代表周日，1代表周一，... 6代表周六）  
    const weekdayNumber = date.getDay();
    return weekdayNumber.toString();
}

/**
 * 将'-'分隔的时间字符串转为数字
 *
 * @param {string} dateString
 * @return {number} 
 */
function convertDateStringToNumber(dateString) {
    const numberString = dateString.replace(/-/g, '');
    const number = parseInt(numberString, 10);
    return number;
}

/**
 * 将数字转为用'-'分隔的时间字符串
 *
 * @param {number} dateNumber
 * @return {string} 
 */
function convertNumberToDateString(dateNumber) {
    let dateString = `${dateNumber.toString().slice(0, 4)}-${dateNumber.toString().slice(4, 6)}-${dateNumber.toString().slice(6, 8)}`;
    return dateString;
}

/**
 * 获取指定日期字符串属于当年的第几个星期
 *
 * @param {string} dateString
 * @return {number} 
 */
function getWeekOfYear(dateString) {
    let momentDate = moment(dateString);
    let startOfYear = momentDate.clone().startOf('year');
    let firstWeekday = startOfYear.day(); // 获取当年第一天的星期几（0表示星期天，1表示星期一，依此类推）  
    // 如果第一天不是星期一，则找到当年的第一个星期一  
    if (firstWeekday !== 1) {
        startOfYear.add(1 - firstWeekday, 'days');
    }
    // 计算两个日期之间的周数差异  
    let weeksDiff = momentDate.diff(startOfYear, 'weeks');
    return weeksDiff + 1; // 加1是因为要求是得到"第几周"，而不是"从第几周开始"
}
// 使用示例
// let dateString = "2024-06-03T02:15:40.890Z";
// let weekOfYear = getWeekOfYear(dateString);
// console.log(weekOfYear);

/**
 * 获取指定日期字符串所在年份第n个星期的起始日期和结束日期
 *
 * @param {string} dateString
 * @param {number} weekNumber
 * @return {object} 
 */
function getWeekStartEnd(dateString, weekNumber) {
    let momentDate = moment(dateString);
    let year = momentDate.year();
    // 找出该年第一个周一的日期  
    let firstMondayOfYear = moment(`${year}-01-01`, 'YYYY-MM-DD').startOf('week');
    // 添加周数以找到目标周一  
    // let targetMonday = firstMondayOfYear.add(weekNumber - 1, 'weeks');
    let targetMonday = firstMondayOfYear.add(weekNumber - 2, 'weeks');
    // 获取该周的起始日期（周一）和结束日期（周日）  
    let weekStart = targetMonday.clone();
    let weekEnd = targetMonday.clone().endOf('week');
    return {
        weekStart: weekStart.format('YYYY-MM-DD'),
        weekEnd: weekEnd.format('YYYY-MM-DD')
    };
}
// 使用示例
// let dateString = "2024-06-03T02:15:40.890Z";
// let weekNumber = 20;
// let weekDates = getWeekStartEnd(dateString, weekNumber);
// console.log('Week Start:', weekDates.weekStart); // 输出：第20周的起始日期  
// console.log('Week End:', weekDates.weekEnd); // 输出：第20周的结束日期


/**
 * 获取两个日期之间的每一天日期，格式YYYY-MM-DD
 *
 * @param {string} startDateStr
 * @param {string} endDateStr
 * @return {Array} 
 */
function getDateRange(startDateStr, endDateStr) {
    const startDate = moment(startDateStr);
    const endDate = moment(endDateStr);
    const dates = [];
    let currentDate = startDate.clone();
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
        dates.push(currentDate.format('YYYY-MM-DD'));
        currentDate.add(1, 'days');
    }
    return dates;
}
// 使用示例  
// const startDate = "2024-06-03";
// const endDate = "2024-06-09";
// const dateRangeWithMoment = getDateRange(startDate, endDate);
// console.log(dateRangeWithMoment);

/**
 * 获取两个日期之间所有的月份，格式YYYY-MM
 *
 * @param {string} startDateStr
 * @param {string} endDateStr
 * @return {Array} 
 */
function getMonthRange(startDateStr, endDateStr) {
    const startDate = moment(startDateStr, 'YYYY-MM');
    const endDate = moment(endDateStr, 'YYYY-MM');
    let months = [];
    let currentDate = startDate.clone();
    while (currentDate.isSameOrBefore(endDate)) {
        // 格式化当前日期并添加到结果数组中  
        months.push(currentDate.format('YYYY-MM'));
        currentDate.add(1, 'months');
    }
    return months;
}
// 使用示例
// console.log(getMonthRange("2024-01", "2024-03")); // 输出: ["2024-01", "2024-02", "2024-03"]

/**
 * 去除字符串中的所有HTML标签
 * @param {string} str
 * @return {string} 
 */
function stripHtmlTags(str) {
    // 使用正则表达式匹配所有的HTML标签，并替换为空字符串  
    return str.replace(/<[^>]*>?/gm, '');
}

// 示例使用  
// const htmlContent = '<p><strong>近两周，猫咪的皮肤有以下症状吗？</strong></p><ol><li>是的</li><li>阿的江拉萨</li><li>算了卡杜拉撒</li><li>算了看的江拉萨</li><li>可是大家来上课</li><li>算了的快乐</li></ol><p><em>注意：阿克苏的江拉萨家 </em></p>';
// const textContent = stripHtmlTags(htmlContent);
// console.log(textContent);

/**
 * 验证时间参数是否合规
 *
 * @param {string} dateString
 * @return {boolean} 
 */
function isValidDateFormat(dateString) {
    // ^ 表示字符串开始  
    // \d{4} 表示四位数字（年份）  
    // - 表示字面量的短横线  
    // \d{2} 表示两位数字（月份或日期）  
    // $ 表示字符串结束  
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (regex.test(dateString)) {
        // 进一步验证月份和日期的有效性
        const [year, month, day] = dateString.split('-').map(Number);
        // 检查月份是否在1到12之间  
        if (month < 1 || month > 12) {
            return false;
        }
        // 检查天数是否在该月的有效范围内 
        const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (day < 1 || day > daysInMonth[month - 1]) {
            return false;
        }
        return true;
    }
    return false;
}

// 测试  
// console.log(isValidDateFormat("2024-01-01")); // true  
// console.log(isValidDateFormat("2024-02-30")); // false，因为2月没有30日  
// console.log(isValidDateFormat("2024-13-01")); // false，因为月份不存在  
// console.log(isValidDateFormat("20240101")); // false，因为格式不匹配

/**
 * 验证时间参数是否合规
 *
 * @param {string} dateString
 * @return {boolean} 
 */
function isValidTimeFormat(timeStr) {
    // 正则表达式匹配 HH:mm 格式  
    // ^ 表示字符串的开始
    // (?:[01]\d|2[0-3]) 是一个非捕获组，用于匹配小时部分：[01]\d 匹配00到19之间的小时，2[0-3] 匹配20到23之间的小时
    // : 匹配冒号
    // [0-5]\d 匹配00到59之间的分钟
    // $ 表示字符串的结束
    const regex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    return regex.test(timeStr);
}

// 测试
// console.log(isValidTimeFormat("23:59"));  // true  
// console.log(isValidTimeFormat("00:00"));  // true  
// console.log(isValidTimeFormat("24:00"));  // false  
// console.log(isValidTimeFormat("12:60"));  // false  
// console.log(isValidTimeFormat("11:5"));   // false  
// console.log(isValidTimeFormat("abc:def")); // false

module.exports = {
    buildTreeData,
    buildNodeIdMap,
    buildNodeMap,
    getDescendantIds,
    getMonthDayList,
    getWeekdayNumber,
    convertDateStringToNumber,
    convertNumberToDateString,
    getWeekOfYear,
    getWeekStartEnd,
    getDateRange,
    getMonthRange,
    stripHtmlTags,
    isValidDateFormat,
    isValidTimeFormat
}
