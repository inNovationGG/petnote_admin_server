//城市分类
const CITY_TYPE = [
    {
        id: 1,
        description: '毛利优先，增长次之',
        city: ['北京','上海','广州','深圳','成都']
    },
    {
        id: 2,
        description: '增长优先，毛利次之',
        city: ['杭州','天津','重庆','苏州','南京','武汉']
    },
];

const CITY_TYPE_MAP = new Map([
    [1, { description: '毛利优先，增长次之', city: ['北京','上海','广州','深圳','成都'] }],
    [2, { description: '增长优先，毛利次之', city: ['杭州','天津','重庆','苏州','南京','武汉'] }],
]);

const PROFIT_COMES_FIRST = ['北京','上海','广州','深圳','成都'];

const PROFIT_COMES_FIRST_DESCRIPTION = '毛利优先，增长次之';

const GROW_COMES_FIRST = ['杭州','天津','重庆','苏州','南京','武汉'];

const GROW_COMES_FIRST_DESCRIPTION = '增长优先，毛利次之';

module.exports = {
    CITY_TYPE,
    CITY_TYPE_MAP,
    PROFIT_COMES_FIRST,
    GROW_COMES_FIRST,
    PROFIT_COMES_FIRST_DESCRIPTION,
    GROW_COMES_FIRST_DESCRIPTION
};