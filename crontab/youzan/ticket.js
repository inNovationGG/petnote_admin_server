const schedule = require('node-schedule');
const {
    YouzanTicket
} = require("../../models");
const { getYouzanTickets } = require("../../services/youzanService");

// 定时循环调用有赞优惠券批量查询接口，并将结果存入youzan_ticket表
async function saveYouzanTicket() {
    console.log('Begin Run Schedule Job Save youzanTicket');
    try {
        let pageno = 1;
        const pagesize = 20;
        let allTickets = [];
        let tickets = [];
        do {
            const result = await getYouzanTickets(pageno, pagesize);
            if (!result.success) break;
            tickets = result.data;
            if (!tickets || !tickets.length) break;
            allTickets = allTickets.concat(tickets.map(ticket => ({
                activity_id: String(ticket.activity_id),
                activity_name: ticket.activity_name,
                kdt_id: String(ticket.kdt_id),
                status: ticket.status,
                designated_shop_ids: '',
                statistics_content: '',
                extra_content: ''
            })));
            pageno++;
        } while (true);
        if (allTickets && allTickets.length) {
            await YouzanTicket.destroy({
                truncate: true
            });
            await YouzanTicket.bulkCreate(allTickets);
        }
    } catch (error) {
        console.log('saveYouzanTicket Error ===>>>', error);
    }
    console.log('End Run Schedule Job Save youzanTicket');
}

module.exports = () => {
    // 每个小时同步一次优惠券列表
    const time = "0 * * * *";
    schedule.scheduleJob(time, function () {
        console.log('ScheduleJob Save youzanTicket Executing!!!');
        saveYouzanTicket();
    });
}
