"use strict";

import {BookingSlotDao} from "@modules/v1/bookingSlot/bookingSlotDao";
import * as bookingSlotConstant from "@modules/v1/bookingSlot/bookingSlotConstant";
import * as config from "@config/constant";
// import {EmpVehicleDao} from "@modules/v1/empVehicle/EmpVehicleDao";
import * as EventEmitter from 'events';
import {executer} from "@lib/socketManager";
import * as appUtils from "@utils/appUtils";

let bookingSlotDao = new BookingSlotDao();
// let empVehicleDao = new EmpVehicleDao();
let Stream = new EventEmitter();
/**
 * @function getvehicledetails checks if vehicle is registered in the database
 */
const getCompanyFloors = async function (params) {
    // try {
    //     params.regNo = params.license;
    //     let tokenData = await entryLogDao.getSuperAdmin();
    //     tokenData.userId = tokenData._id;
    //     let initCheck = await entryLogDao.isEntryLogged(params);
    //     if (initCheck.length !== 0) {
    //         let response = initCheck[0];
    //         if (response.userData && response.userData.name) {
    //             params.name = response.userData.name;
    //         } else if (response.vehicleInfo && response.vehicleInfo.name) {
    //             params.name = response.userData.name;
    //         }
    //         console.log([tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.LOG_EXISTS(params)]);
    //         return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.LOG_EXISTS(params)]);
    //     } else {
    //         let step1: any = {};
    //         step1 = await entryLogDao.getVehicleDetails(params);
    //         if (step1) {

    //             // step1.cameraName = params.cameraName;
    //             // step1.anprTimeStamp = params.timeStamp;
    //             // step1.eventImageURL = params.eventImageURL;
    //             // step1.ocrImageURL = params.ocrImageURL;
    //             // step1.category = params.category;
    //             params.name = step1.name;
    //             if (step1.vehBooicleStatus === config.CONSTANT.STATUS.BLOCKED) {

    //                 step1.status = config.CONSTANT.ENTRY_LOG.STATUS.BLACKLISTED;
    //                 let step2 = await saveEntryLog(step1);
    //                 console.log([tokenData.userId, entryLogConstant.MESSAGES.ERROR.VEHICLE_STATUS(params)]);
    //                 return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.ERROR.VEHICLE_STATUS(params)]);
    //             }
    //             if (step1.userStatus === config.CONSTANT.STATUS.BLOCKED) {
    //                 step1.status = config.CONSTANT.ENTRY_LOG.STATUS.BLOCKED;
    //                 let step2 = await saveEntryLog(step1);
    //                 console.log([tokenData.userId, entryLogConstant.MESSAGES.ERROR.USER_BLOCKED(params)], step2);
    //                 return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.ERROR.USER_BLOCKED(params)]);
    //             }

    //             if (step1.userType === "guest") {
    //                 // Guest validity check
    //                 if (step1.guestValidity && step1.guestValidity >= Date.now()) {
    //                     // Check guest vehicle is not blocked
    //                     step1.status = config.CONSTANT.ENTRY_LOG.STATUS.WHITELISTED;
    //                     let step2 = await saveEntryLog(step1);
    //                     console.log([tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.VEHICLE_DETAILS(params), step2]);
    //                     return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.VEHICLE_DETAILS(params)]);
    //                 } else {
    //                     console.log([tokenData.userId, entryLogConstant.MESSAGES.ERROR.VALIDITY_EXPIRED(params)]);
    //                     return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.ERROR.VALIDITY_EXPIRED(params)]);
    //                 }
    //             } else if (step1.userType === "employee") {
    //                 // Employee check
    //                 step1.status = config.CONSTANT.ENTRY_LOG.STATUS.WHITELISTED;
    //                 let step2 = await saveEntryLog(step1);
    //                 console.log([tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.VEHICLE_DETAILS(params), step2]);
    //                 return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.SUCCESS.VEHICLE_DETAILS(params)]);
    //             }
    //         } else {
    //             // Here step1 will hold null
    //             console.log([tokenData.userId, entryLogConstant.MESSAGES.ERROR.VEHICLE_DETAILS(params)]);
    //             return await executer('serviceRequest', 'testFunc', [tokenData.userId, entryLogConstant.MESSAGES.ERROR.VEHICLE_DETAILS(params)]);
    //         }
    //     }
    // } catch (error) {
    //     throw error;
    // }
};
const bookSlot = async function (params: BookingSlotRequest) {
    try{
        let step1 = await bookingSlotDao.bookSlot(params);
        if (step1){
            return bookingSlotConstant.MESSAGES.SUCCESS.BOOKED;
        }
    } catch (error) {
        throw error;
    }
};
const checkTimerForBookingSpot = async function (){
    try {
        let step1 = await bookingSlotDao.checkTimerForBookingSpot();
    }catch (error) {
        throw error;
    }
};

export let bookingSlotController = {
    getCompanyFloors,
    bookSlot,
    checkTimerForBookingSpot
};
