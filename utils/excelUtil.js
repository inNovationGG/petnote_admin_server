const ExcelJS = require("exceljs");

// 递增Excel中的列字母，比如从A~Z，AA~AZ等等
const getNextColumnLetter = (column) => {
    let columnIndex = 0;
    let columnString = '';
    let length = column.length;
    for (let i = 0; i < length; i++) {
        const charCode = column.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
        columnIndex = columnIndex * 26 + charCode;
    }
    columnIndex++;
    do {
        columnIndex--;
        columnString = String.fromCharCode((columnIndex % 26) + 'A'.charCodeAt(0)) + columnString;
        columnIndex = Math.floor(columnIndex / 26);
    } while (columnIndex > 0);
    return columnString;
}
// 使用示例
// let titCol = 'A';
// titCol = getNextColumnLetter(titCol); // 现在 titCol 是 'B'

// 根据Excel列名获取对应索引，A-1，B-2，Z-26等等
const getColumnNumber = (columnLetter) => {
    let columnNumber = 0;
    const length = columnLetter.length;
    for (let i = 0; i < length; i++) {
        // 获取当前字母对应的 ASCII 码，并减去 65 转换为 1-26 的索引  
        let code = columnLetter.charCodeAt(i) - 64;
        // 将当前字母的值乘以 26 的相应次方（从 0 开始，即 26^0, 26^1, ...），并累加到 columnNumber 上  
        columnNumber += code * Math.pow(26, length - 1 - i);
    }
    return columnNumber;
}

// 示例  
// console.log(getColumnNumber('A')); // 输出 1  
// console.log(getColumnNumber('B')); // 输出 2  
// console.log(getColumnNumber('Z')); // 输出 26  
// console.log(getColumnNumber('AA')); // 输出 27  
// console.log(getColumnNumber('AB')); // 输出 28


// 辅助函数：将列索引转换为列字母  
const getColumnLetter = (column) => {
    let temp, letter = '';
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}

/**
 * 导出数据为Excel
 *
 * @param {Array} data
 * @param {Array} header
 * @param {string} filename
 * @return {object} 
 */
const exportExcel = async (data, header, filename) => {
    // 创建一个工作簿  
    const workbook = new ExcelJS.Workbook();
    // 添加一个工作表  
    const worksheet = workbook.addWorksheet('Sheet1');
    // 设置表头  
    worksheet.columns = header.map(col => ({
        header: col.header,
        key: col.key,
    }));
    // 添加行数据  
    data.forEach(row => {
        worksheet.addRow(row);
    });
    // 将工作簿写入到内存中  
    const buffer = await workbook.xlsx.writeBuffer();
    return {
        buffer: buffer,
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=${encodeURIComponent(filename)}`
        }
    };
}

module.exports = {
    getNextColumnLetter,
    getColumnNumber,
    getColumnLetter,
    exportExcel
}