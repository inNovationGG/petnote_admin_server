const errorCodes = {
    //global
    LOGIN_EXPIRED: 100000,
    VALIDATE_PARAMETERS_ERROR: 100001,   //验证input的总类型错误
    RPC_ERROR: 100002,
    OSS_FILE_TYPE_ERROR: 100003,
    OSS_UPLOAD_ERROR: 100004,
    //audit
    NOTE_NOT_EXIST: 200211,
    NOTE_AUDIT_FAIL: 200218,
    NOTE_AUDIT_STATUS_ERROR: 200219,
    NOTE_AUDITING_ERROR: 200220,
    NOTE_NOT_AUDIT_ERROR: 200221,
    //admin user
    ACCOUNT_ERROR: 300001,
    USER_ID_ERROR: 300002,
    ACCOUNT_LOCK_ERROR: 3000003,
    ACCOUNT_EXPIRED_ERROR: 3000004,
    ACCOUNT_PASSWORD_ERROR: 3000005,
    //bi
    DATE_SELECTION_ERROR: 400001,
    //audit
    EDIT_STATUS_ERROR: 500001,
    //plan admin
    SUBJECT_TYPE_ERROR: 600001,
    SUBJECT_NOT_EXIST: 600002,
    SUBJECT_ID_IS_EXIST: 600003,
    //bi opt
    PET_CATE_NAME_IS_EXIST: 700001,
    PET_EDIT_ERROR: 700002,
    PET_DELETED_RECOVER_ERROR: 700003,
    PET_DELETED_ERROR: 700004,
}

const errorMessages = {
    // global  
    [errorCodes.LOGIN_EXPIRED]: '登录过期,请重新登录',
    [errorCodes.VALIDATE_PARAMETERS_ERROR]: '输入参数有误',
    [errorCodes.RPC_ERROR]: 'rpc调用失败',
    [errorCodes.OSS_FILE_TYPE_ERROR]: '上传文件类型出错',
    [errorCodes.OSS_UPLOAD_ERROR]: 'oss上传失败',
    //audit
    [errorCodes.NOTE_NOT_EXIST]: '该记录不存在',
    [errorCodes.NOTE_AUDIT_FAIL]: '记录审核失败',
    [errorCodes.NOTE_AUDIT_STATUS_ERROR]: '记录审核状态错误',
    [errorCodes.NOTE_AUDITING_ERROR]: '记录内容审核中，无法编辑',
    [errorCodes.NOTE_NOT_AUDIT_ERROR]: '记录审核错误，状态异常',
    // admin user
    [errorCodes.ACCOUNT_ERROR]: '用户名或者密码错误',
    [errorCodes.USER_ID_ERROR]: '错误的用户id',
    [errorCodes.ACCOUNT_LOCK_ERROR]: '账户锁定20分钟',
    [errorCodes.ACCOUNT_EXPIRED_ERROR]: '账户已过期',
    [errorCodes.ACCOUNT_PASSWORD_ERROR]: '账户密码不符合规范',
    // bi
    [errorCodes.DATE_SELECTION_ERROR]: '日期选择有误',
    // audit 
    [errorCodes.EDIT_STATUS_ERROR]: '错误的审核id',
    // plan admin
    [errorCodes.SUBJECT_TYPE_ERROR]: '题目类型错误',
    [errorCodes.SUBJECT_NOT_EXIST]: '该题目不存在',
    [errorCodes.SUBJECT_ID_IS_EXIST]: '该题目id已存在',
    // bi opt
    [errorCodes.PET_CATE_NAME_IS_EXIST]: '宠物分类名称已存在',
    [errorCodes.PET_EDIT_ERROR]: '宠物编辑错误',
    [errorCodes.PET_DELETED_RECOVER_ERROR]: '宠物删档恢复错误',
    [errorCodes.PET_DELETED_ERROR]: '宠物删除错误',
}

module.exports = {
    errorCodes,
    errorMessages
}
