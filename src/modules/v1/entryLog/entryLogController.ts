"use strict";

import {EntryLogDao} from "@modules/v1/entryLog/EntryLogDao";
import * as entryLogConstant from "@modules/v1/entryLog/entryLogConstant";
import * as config from "@config/constant";
import {EmpVehicleDao} from "@modules/v1/empVehicle/EmpVehicleDao";
import * as EventEmitter from 'events';
import {executer} from "@lib/socketManager";
import * as appUtils from "@utils/appUtils";

let entryLogDao = new EntryLogDao();
let empVehicleDao = new EmpVehicleDao();
let Stream = new EventEmitter();
/**
 * @function getvehicledetails checks if vehicle is registered in the database
 */
const getvehicledetails = async function (params) {
    try {
        params.regNo = params.license.toUpperCase();
        if (!config.CONSTANT.REGEX.REGNO.test(params.regNo)) {
           return;
        }
        let tokenData = await entryLogDao.getSuperAdmin();
        tokenData.userId = tokenData._id;
        let initCheck = await entryLogDao.isEntryLogged(params);
        if (initCheck.length !== 0) {
            let response = initCheck[0];
            if (response.status === 'blocked' || response.status === 'blacklisted') {
                console.log([tokenData.userId, entryLogConstant.MESSAGES.ERROR.LOG_EXISTS_BLOCKED_BLACKLISTED(params)]);
                return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.ERROR.LOG_EXISTS_BLOCKED_BLACKLISTED(params)]);
            }else{
            if (response.userData && response.userData.name) {
                params.name = response.userData.name;
            } else if (response.vehicleInfo && response.vehicleInfo.name) {
                params.name = response.userData.name;
            }
            console.log([tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.LOG_EXISTS(params)]);
            await entryLogDao.openBoomBarrierApi();
            await entryLogDao.closeBoomBarrierApi(); // added for now will remove in future
            return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.LOG_EXISTS(params)]);
         }
        } else {
            let step1: any = {};
            step1 = await entryLogDao.getVehicleDetails(params);
            console.log(step1);
            if (step1) {

                step1.cameraName = params.cameraName;
                step1.anprTimeStamp = params.timeStamp;
                step1.eventImageURL = params.eventImageURL;
                step1.ocrImageURL = params.ocrImageURL;
                step1.category = params.category;
                params.name = step1.name;
                if (step1.vehicleStatus === config.CONSTANT.STATUS.BLOCKED) {

                    step1.status = config.CONSTANT.ENTRY_LOG.STATUS.BLACKLISTED;
                    let step2 = await saveEntryLog(step1);
                    console.log([tokenData.userId, entryLogConstant.MESSAGES.ERROR.VEHICLE_STATUS(params)]);
                    return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.ERROR.VEHICLE_STATUS(params)]);
                }
                if (step1.userStatus === config.CONSTANT.STATUS.BLOCKED) {
                    step1.status = config.CONSTANT.ENTRY_LOG.STATUS.BLOCKED;
                    let step2 = await saveEntryLog(step1);
                    console.log([tokenData.userId, entryLogConstant.MESSAGES.ERROR.USER_BLOCKED(params)], step2);
                    return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.ERROR.USER_BLOCKED(params)]);
                }

                if (step1.userType === "guest") {
                    // Guest validity check
                    if (step1.guestValidity && step1.guestValidity >= Date.now()) {
                        // Check guest vehicle is not blocked
                        step1.status = config.CONSTANT.ENTRY_LOG.STATUS.WHITELISTED;
                        let step2 = await saveEntryLog(step1);
                        console.log([tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.VEHICLE_DETAILS(params), step2]);
                        await entryLogDao.openBoomBarrierApi();
                        // added for now will remove in future
                        await entryLogDao.closeBoomBarrierApi();
                        return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.VEHICLE_DETAILS(params)]);
                    } else {
                        console.log([tokenData.userId, entryLogConstant.MESSAGES.ERROR.VALIDITY_EXPIRED(params)]);
                        return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.ERROR.VALIDITY_EXPIRED(params)]);
                    }
                } else if (step1.userType === "employee") {
                    // Employee check
                    step1.status = config.CONSTANT.ENTRY_LOG.STATUS.WHITELISTED;
                    let step2 = await saveEntryLog(step1);
                    console.log([tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.VEHICLE_DETAILS(params), step2]);
                    await entryLogDao.openBoomBarrierApi();
                    // added for now will remove in future
                    await entryLogDao.closeBoomBarrierApi();
                    return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.VEHICLE_DETAILS(params)]);
                }
            } else {
                // Here step1 will hold null
                console.log([tokenData.userId, entryLogConstant.MESSAGES.ERROR.VEHICLE_DETAILS(params)]);
                return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.ERROR.VEHICLE_DETAILS(params)]);
            }
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @function getvehicledetails checks if vehicle is registered in the database
 */
const saveEntryLog = async function (params) {
    try {
        let step1 = await entryLogDao.saveEntryLog(params);
        return entryLogConstant.MESSAGES.SUCCESS.LOG_CREATED(step1);
    } catch (error) {
        throw error;
    }
};
/**
 * @function manualEntry creates manual entry for user, vehicle and entry_log is registered in the database
 */
const manualEntry = async function (payload, tokenData) {
    try {
        // if (tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || tokenData.permission.indexOf("entryLog") !== -1) {
            let vehData: any = {};
            let params = {...payload};
            params.createdBy = tokenData.userId;
            params.companyId = tokenData.companyId;
            params.entryType = config.CONSTANT.ENTRY_LOG.ENTRY_TYPE.MANUAL;
            if ((payload.userId && payload.userId.length !== 0) || (payload.validity && payload.validity.length !== 0)) {
                if (payload.validity) {
                    params.type = config.CONSTANT.USER_TYPE.GUEST;
                    params.guestValidity = payload.validity;
                    params.permission = [];
                    let userData = await empVehicleDao.addUser(params);
                    params.userId = userData._id;
                    // payload.createdBy = userData.createdBy;
                }
                // params.createdBy = payload.createdBy;
                vehData = await empVehicleDao.createVehicleData(params);
                params.vehicleId = vehData._id;
            } else {
                params.vehicleInfo = {
                    regNo: payload.regNo,
                    name: payload.name,
                    purposeOfVisit: payload.purposeOfVisit,
                    estimatedParkingDuration: payload.estimatedParkingDuration,
                    visitorId: payload.visitorId,
                    visitorIdType: payload.visitorIdType,
                    contactNo: payload.contactNo,
                    vehicleType: payload.vehicleType,
                    modal: payload.modal,
                    companyLocationName: payload.companyLocationName
                };
            }
            let step2 = await entryLogDao.saveEntryLog(params);
            await entryLogDao.openBoomBarrierApi();
            // added for now will remove in future
            await entryLogDao.closeBoomBarrierApi();
            return entryLogConstant.MESSAGES.SUCCESS.LOG_CREATED(step2);
         // } else {
        //     return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        // }
    } catch (error) {
        throw error;
    }
};
/**
 * @function vehicleOut enters the out Time of the vehicle
 */
const vehicleOut = async function (params) {
    try {
        params.regNo = params.license.toUpperCase();
        let tokenData = await entryLogDao.getSuperAdmin();
        tokenData.userId = tokenData._id;
        let initCheck = await entryLogDao.isEntryLogged(params);
        if (initCheck.length !== 0) {
            let response = initCheck[0];
            if (response.userData && response.userData.name) {
                params.name = response.userData.name;
            } else if (response.vehicleInfo && response.vehicleInfo.name) {
                params.name = response.userData.name;
            }
            console.log([tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.LOG_EXISTS(params)]);
            return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.LOG_EXISTS(params)]);
        } else {
            let step1 = await entryLogDao.vehicleOut(params);
            if (step1) {
                if (step1.vehicleInfo){
                   params.name = step1.vehicleInfo.name;
                } else if (step1.userId) {
                    let userName: any = await empVehicleDao.findUserById(step1);
                    params.name = userName.name;
                }
                console.log([tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.OUT_UPDATED(params)]);
                return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.OUT_UPDATED(params)]);
            } else {
                console.log([tokenData.userId, entryLogConstant.MESSAGES.ERROR.ENTRY_LOG_NOT_FOUND(params)]);
                return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.ERROR.ENTRY_LOG_NOT_FOUND(params)]);
            }
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @function updateEntryLog updates the vehicle related data either in vehicle collection or in entry_logs - vehicleInfo
 */
const updateEntryLog = async function (params, tokenData) {
    try {
        if (tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || tokenData.permission.indexOf("entryLog") !== -1) {
            if (!params.entryLogId) {
                return entryLogConstant.MESSAGES.ERROR.ENTRY_LOG_DETAILS;
            } else {
                let response: any = {};
                // Added a check to ensure vehicleInfo's existence Aashiq - 3/09/2020
                if (params.vehicleInfo && params.vehicleInfo.guestValidity && params.vehicleInfo.guestValidity !== null) {
                    let step1 = await entryLogDao.findEntryLogById(params);
                    step1 = step1[0];
                    let payload: any = {};
                    payload = {
                        name: params.vehicleInfo.name || step1.vehicleInfo.name,
                        email: params.vehicleInfo.email || step1.vehicleInfo.email,
                        type: "guest",
                        contactNo: params.vehicleInfo.contactNo || step1.vehicleInfo.contactNo,
                        purposeOfVisit: params.vehicleInfo.purposeOfVisit || step1.vehicleInfo.purposeOfVisit,
                        companyLocationName: params.vehicleInfo.companyLocationName || step1.vehicleInfo.companyLocationName || tokenData.companyLocationName,
                        regNo: params.vehicleInfo.regNo || step1.vehicleInfo.regNo,
                        vehicleType: params.vehicleInfo.vehicleType || step1.vehicleInfo.vehicleType,
                        modal: params.vehicleInfo.modal || step1.vehicleInfo.modal,
                        companyId: tokenData.companyId,
                        createdBy: tokenData.userId,
                        guestValidity: params.vehicleInfo.guestValidity,
                        entryLogId: params.entryLogId
                    };
                    let userData = await empVehicleDao.addUser(payload);
                    payload.userId = userData._id;
                    let vehData = await empVehicleDao.createVehicleData(payload);
                    payload.vehicleId = vehData._id;
                    payload.vehicleInfo = null;
                    response = await entryLogDao.updateEntryLogData({_id: appUtils.toObjectId(params.entryLogId)}, payload);
                } else{
                    response = await entryLogDao.updateEntryLog(params, tokenData);
                }
                return entryLogConstant.MESSAGES.SUCCESS.UPDATED(response);
            }
        } else {
            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        }
    } catch (error) {
        throw error;
    }
};
/**
 * @function entryLogList lists all the entrylogs by paginated method
 */
const entryLogList = async function (params: ListingRequest) {
    try {
        // Removed permission check Aashiq - 26/08/2020
        // if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || params.permission.indexOf("entryLog") !== -1) {
        let totalCount = 0;
        // console.log(params);
        let response: any = {};
        let step2 = await entryLogDao.entryLogList(params).then(function (result) {
            response.entryLogList = result[0];
            if (result.length > 1) {
                if (result[1][0] && result[1][0].count) {
                    totalCount = result[1][0].count;
                }
            }
            // response.totalCount = result[1][0].count === null ? 0 : result[1][0].count;
            response.totalCount = totalCount;
        });
        return entryLogConstant.MESSAGES.SUCCESS.LOG_LISTED(response);
        // } else {
        //     return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        // }
    } catch (error) {
        throw error;
    }
};
/**
 * @function getUsersCount returns the count of different type of users
 */
const getUsersCount = async function (params: ListingRequest, tokenData) {
    try {
        // Removed permission check Aashiq - 26/08/2020
        // if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || params.permission.indexOf("entryLog") !== -1) {
        let step1 = await entryLogDao.userList(params, tokenData);
        Stream.emit('push', 'Displaysomething', {msg: 'sent from get UsersCount!'});
        return entryLogConstant.MESSAGES.SUCCESS.USER_LISTED(step1);
        // } else {
        //     return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        // }
    } catch (error) {
        throw error;
    }
};
const entryLogDetails = async function (params) {
    try {
        if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || params.permission.indexOf("entryLog") !== -1) {
            let step1 = await entryLogDao.findEntryLogById(params);
            return entryLogConstant.MESSAGES.SUCCESS.LOG_LISTED(step1);
        } else {
            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        }
    } catch (error) {
        throw error;
    }
};

const testEventApi = async function (data) {
    try {
        console.log(data);
        return entryLogConstant.MESSAGES.SUCCESS.LOG_LISTED(data);

        // if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || params.permission.indexOf("entryLog") !== -1) {
        // Stream.on('push', async function(event , data){
        //     data = await promise.join(data, event);
        //     console.log(data);
        //     return entryLogConstant.MESSAGES.SUCCESS.LOG_LISTED(data);
        // });
        // setInterval(function(){
        //     Stream.emit('push' , 'message' , {msg: 'it works!'});
        // }, 10000);
        //   } else {
        //       return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        //             }
    } catch (error) {
        throw error;
    }
};
/**
 * @function getUsersCount returns the count of different type of users
 */
const getInOutCount = async function (params: ListingRequest, tokenData) {
    try {
        let step1 = await entryLogDao.inOutCount(params, tokenData);
        return entryLogConstant.MESSAGES.SUCCESS.USER_LISTED(step1);
    } catch (error) {
        throw error;
    }
};
const userEntryLogHistory = async function (params){
    console.log(params);
    try {
        let step1 = await entryLogDao.userEntryLogHistory(params);
        return entryLogConstant.MESSAGES.SUCCESS.LOG_LISTED(step1);
    } catch (error) {
        throw error;
    }
};
const getReportsEntryData = async function(params, tokenData){
    console.log(params);
    console.log(tokenData);
    try{
        let response: any = {};
        let step1 = await entryLogDao.inOutCount(params, tokenData);
        response["inoutGraphData"] = step1;
        let params1 = { fromDate: params.fromDate,
                        toDate: params.toDate,
                        compLocationName: params.compLocationName,
                        requestedPage: config.CONSTANT.ENTRY_LOG.ENTRY_TYPE.AUTOMATIC,
                        companyId: tokenData.companyId
                    };
        let step2 = await entryLogDao.entryLogList(params1);
        if (step2[0].length !== 0){
            response["automaticEntries"] = step2[1][0].count;
        } else {
            response["automaticEntries"] = 0;
        }
        params1.requestedPage = config.CONSTANT.ENTRY_LOG.ENTRY_TYPE.MANUAL;
        let step3 = await entryLogDao.entryLogList(params1);
        if (step3[0].length !== 0){
            response["manualEntries"] = step3[1][0].count;
        }else {
            response["manualEntries"] = 0;
        }
        params1.requestedPage = null;
        let step7 = await entryLogDao.entryLogList(params1);
        if (step7[0].length !== 0){
            response["totalEntries"] = step7[1][0].count;
        }else {
            response["totalEntries"] = 0;
        }
        let params2 = { fromDate: params.fromDate,
            toDate: params.toDate,
            compLocationName: params.compLocationName,
            companyId: tokenData.companyId,
            userType: "2"
        };
        let step4 = await entryLogDao.entryLogList(params2);
        if (step4[0].length !== 0){
            response["employee"] = step4[1][0].count;
        }else {
            response["employee"] = 0;
        }
        params2.userType = "1";
        let step5 = await entryLogDao.entryLogList(params2);
        if (step5[0].length !== 0){
            response["guest"] = step5[1][0].count;
        }else {
            response["guest"] = 0;
        }
        let params3 = { fromDate: params.fromDate,
                        toDate: params.toDate,
                        compLocationName: params.compLocationName,
                        companyId: tokenData.companyId,
                        flag: "in"
        };
        let step6 = await entryLogDao.entryLogList(params3);
        if (step6[0].length !== 0){
            response["inCount"] = step6[1][0].count;
        }else {
            response["inCount"] = 0;
        }
        params3.flag = "out";
        let step8 = await entryLogDao.entryLogList(params3);
        if (step8[0].length !== 0){
            response["outCount"] = step8[1][0].count;
        }else {
            response["outCount"] = 0;
        }
        return response;
    } catch (error){
        throw error;
    }
};
export let entryLogController = {
    getvehicledetails,
    saveEntryLog,
    manualEntry,
    vehicleOut,
    entryLogList,
    getUsersCount,
    updateEntryLog,
    entryLogDetails,
    testEventApi,
    getInOutCount,
    userEntryLogHistory,
    getReportsEntryData

};
