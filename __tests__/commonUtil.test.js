const {
    buildTreeData,
    getMonthDayList,
    getWeekdayNumber,
    convertDateStringToNumber
} = require("../utils/commonUtil");

describe('buildTreeData', () => {
    // 模拟的数据  
    const mockData = [
        { areaId: 1, parentId: 0, name: 'root1' },
        { areaId: 2, parentId: 1, name: 'child1' },
        { areaId: 3, parentId: 1, name: 'child2' },
        { areaId: 4, parentId: 2, name: 'grandchild1' },
        { areaId: 5, parentId: 0, name: 'root2' },
        { areaId: 6, name: 'orphan' },//孤儿节点不处理
    ];
    // 预期的树形结构  
    const expectedTree = [
        {
            areaId: 1,
            parentId: 0,
            name: 'root1',
            childrens: [
                {
                    areaId: 2,
                    parentId: 1,
                    name: 'child1',
                    childrens: [
                        {
                            areaId: 4,
                            parentId: 2,
                            name: 'grandchild1'
                        }
                    ]
                },
                {
                    areaId: 3,
                    parentId: 1,
                    name: 'child2'
                },
            ],
        },
        {
            areaId: 5,
            parentId: 0,
            name: 'root2'
        }
    ];

    test('should convert flat data to tree structure correctly', () => {
        const tree = buildTreeData(mockData);
        expect(tree).toEqual(expectedTree);
    });

    // 额外的测试，检查是否处理了无父节点的数据  
    test('should ignore nodes without a parent', () => {
        const treeWithOrphans = buildTreeData(mockData.concat({ areaId: 7, name: 'anotherOrphan' }));
        expect(treeWithOrphans).toEqual(expectedTree); // 预期中不包含孤儿节点  
    });
});

describe('getMonthDayList', () => {
    it('should return the list of days in current month by default', () => {
        const currentMonthDays = getMonthDayList();
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        expect(currentMonthDays.length).toBe(lastDayOfMonth);
        expect(currentMonthDays[0]).toBe(`${firstDayOfMonth.getFullYear()}-${formatMonth(firstDayOfMonth.getMonth())}-${formatDay(1)}`);
        expect(currentMonthDays[lastDayOfMonth - 1]).toBe(`${currentDate.getFullYear()}-${formatMonth(currentDate.getMonth())}-${formatDay(lastDayOfMonth)}`);
    });

    it('should return the list of days in a specified month', () => {
        const targetDate = new Date('2023-02-01'); // 2023年2月，一个非闰年的2月  
        const februaryDays = getMonthDayList(targetDate.toISOString().split('T')[0]);
        expect(februaryDays.length).toBe(28); // 2月通常有28天  
        expect(februaryDays[0]).toBe('2023-02-01');
        expect(februaryDays[27]).toBe('2023-02-28');
    });

    it('should handle leap year correctly', () => {
        const targetDate = new Date('2020-02-01'); // 2020年是闰年  
        const februaryDays = getMonthDayList(targetDate.toISOString().split('T')[0]);
        expect(februaryDays.length).toBe(29); // 闰年的2月有29天  
        expect(februaryDays[28]).toBe('2020-02-29');
    });

    it('should respect the specified format', () => {
        const targetDate = new Date('2023-09-15');
        const septemberDays = getMonthDayList(targetDate.toISOString().split('T')[0], 'd/m/Y');
        expect(septemberDays[0]).toBe('2023/09/01');
        expect(septemberDays[14]).toBe('2023/09/15');
    });

    function formatMonth(month) {
        return String(month + 1).padStart(2, '0');
    }

    function formatDay(day) {
        return String(day).padStart(2, '0');
    }
});

describe('getWeekdayNumber', () => {
    it('should return the correct weekday number for a valid date', () => {
        // 测试一个周一的日期  
        const dateString = '2023-09-18'; // 例如，这是一个周一的日期  
        const expectedWeekdayNumber = 1; // JavaScript的getDay()方法中周一的值为1  
        const result = getWeekdayNumber(dateString);
        expect(result).toBe(expectedWeekdayNumber.toString());
    });

    it('should throw an error for an invalid date string', () => {
        // 测试一个无效的日期字符串  
        const invalidDateString = 'not-a-date';
        expect(() => getWeekdayNumber(invalidDateString)).toThrow('Invalid date string');
    });

    // 还可以添加更多测试用例，比如测试其他星期几的日期  
    it('should return the correct weekday number for Sunday', () => {
        const dateString = '2023-09-17'; // 例如，这是一个周日的日期  
        const expectedWeekdayNumber = 0; // JavaScript的getDay()方法中周日的值为0  
        const result = getWeekdayNumber(dateString);
        expect(result).toBe(expectedWeekdayNumber.toString());
    });
});

describe('convertDateStringToNumber', () => {
    it('should convert a date string with hyphens to a number', () => {
        const dateString = '2023-09-18';
        const expectedNumber = 20230918;
        const result = convertDateStringToNumber(dateString);
        expect(result).toBe(expectedNumber);
    });

    it('should handle multiple hyphens in the date string', () => {
        const dateString = '2023-09--18--';
        const expectedNumber = 20230918;
        const result = convertDateStringToNumber(dateString);
        expect(result).toBe(expectedNumber);
    });

    it('should handle a date string with no hyphens', () => {
        const dateString = '20230918';
        const expectedNumber = 20230918;
        const result = convertDateStringToNumber(dateString);
        expect(result).toBe(expectedNumber);
    });

    it('should handle empty string and return NaN', () => {
        const dateString = '';
        const result = convertDateStringToNumber(dateString);
        expect(isNaN(result)).toBe(true);
    });
});
