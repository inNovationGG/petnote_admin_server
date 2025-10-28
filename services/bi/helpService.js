/* eslint-disable no-unused-vars */
const {
    PetCate,
    NoteImage,
    NoteCate,
} = require("../../models");
const { Op } = require("sequelize");
const moment = require("moment");

/**
 * 获取记录类型
 *
 * @param {string} [f_ncid='']
 * @param {string} [s_ncid='']
 * @param {string} [t_ncid='']
 * @return {string} 
 */
const getNoteCate = async (noteCateMap = new Map(), f_ncid = '', s_ncid = '', t_ncid = '') => {
    let str = '';
    if (f_ncid) {
        let firstName = noteCateMap.get(f_ncid);
        if (firstName) {
            str += firstName;
        }
    }
    if (s_ncid) {
        let secondName = noteCateMap.get(s_ncid);
        if (secondName) {
            str += "->" + secondName;
        }
    }
    if (t_ncid) {
        let thirdName = noteCateMap.get(t_ncid);
        if (thirdName) {
            str += "->" + thirdName;
        }
    }
    return str;
}
/**
 * 获取记录类型Map
 *
 * @param {array} noteCateIds
 * @return {object} 
 */
const getNoteCateMap = async (noteCateIds) => {
    let noteCateMap = new Map();
    let noteCate = await NoteCate.findAll({
        where: {
            id: {
                [Op.in]: noteCateIds
            }
        },
        attributes: ['id', 'name']
    });
    for (let item of noteCate) {
        noteCateMap.set(item.id, item.name);
    }
    return noteCateMap;
}
/**
 * 根据记录id获取图片和视频信息
 *
 * @param {number} [id=0]
 * @return {string} 
 */
const getImgByNoteId = async (id = 0) => {
    let noteImages = await NoteImage.findAll({
        where: {
            nid: id
        }
    });
    if (!noteImages || noteImages.length === 0) {
        return '';
    }
    const lists = noteImages.reduce((acc, curr) => {
        acc[curr.id] = curr.url;
        return acc;
    }, {});
    const urls = Object.values(lists).join('\n');
    return urls;
}
/**
 * 获取宠物品种名称
 *
 * @param {number} [pet_cate_id=0]
 * @return {string} 
 */
const getPetCateName = async (pet_cate_id = 0) => {
    let petCateInfo = await PetCate.findOne({
        where: {
            id: pet_cate_id
        }
    });
    if (!petCateInfo) {
        return "";
    }
    return petCateInfo.name;
}

/**
 * 获取记录时的年龄（月）
 *
 * @param {number} [note_time=0]
 * @param {number} [pet_birthday=0]
 * @return {number} 
 */
const getPetAge = async (note_time = 0, pet_birthday = 0) => {
    if (!note_time || !pet_birthday) {
        return "";
    }
    if (pet_birthday > note_time) {
        return "";
    }
    const noteDate = moment(note_time * 1000);
    const petBirthDate = moment(pet_birthday * 1000);
    const diffInMonths = noteDate.diff(petBirthDate, 'months');
    const petAgeInMonths = Math.round(diffInMonths);
    return petAgeInMonths;
}

module.exports = {
    getNoteCate,
    getImgByNoteId,
    getPetCateName,
    getPetAge,
    getNoteCateMap
}