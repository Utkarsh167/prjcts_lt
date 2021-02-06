"use strict";

import * as _ from "lodash";

import {AdminDao} from "@modules/v1/admin/AdminDao";
import * as appUtils from "@utils/appUtils";
import * as bcrypt from "bcrypt";
import * as config from "@config/index";
import * as csv from "@lib/csv";
import {LoginHistoryDao} from "@modules/v1/loginHistory/LoginHistoryDao";
import {MailManager, RedisClient} from "@lib/index";
import * as mimeType from "../../../json/mime-type.json";
import * as tokenManager from "@lib/tokenManager";
import * as GoogleDistance from "@lib/distanceMatrix";
import * as empVehicleConstant from "@modules/v1/empVehicle/empVehicleConstant";
// import * as EmpVehicleDao from "@modules/v1/empVehicle/EmpVehicleDao";
// import * as empVehicleMapper from "@modules/v1/empVehicle/empVehicleMapper";

import {EmpVehicleDao, empVehicleMapper} from "@modules/v1/empVehicle/index";
import * as xlsx from "@lib/xlsx";
import {BaseDao} from "@modules/v1/shared/BaseDao";
import * as promise from "bluebird";
// const distance = require('../../../lib/distanceMatrix.ts');
// import { CabRouteDao } from "@modules/v1/route/RouteDao";
import {AuditLogDao} from "@modules/v1/auditLog/AuditLogDao";
import {join} from "path";

let baseDao = new BaseDao();
let adminDao = new AdminDao();
let loginHistoryDao = new LoginHistoryDao();
let mailManager = new MailManager();
let redisClient = new RedisClient();
// let empVehicleDao = new EmpVehicleDao();
let empVehicleDao = new EmpVehicleDao();
// let cabRouteDao = new CabRouteDao();
let auditLogDao = new AuditLogDao();

// let options = {
// 	origin: '28.6060756,77.3597253',
// 	destination: '28.668002,77.3808467',
// };

// GoogleDistance.distancematrix.get(options, function (err, data) {
// 	try {
// 		return data;
// 		console.log("result");
// 		console.log(err, data);
// 	} catch{f
// 		throw err;
// 	}
// });

/**
 * @function signup
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.storeList() function saves value in redis.
 */
// const driverSignup = async function (params: DriverSignupRequest, tokenData: TokenData) {
// 	try {
// 		if (
// 			params.type === config.CONSTANT.ADMIN_TYPE.ADMIN ||
// 			params.permission.indexOf("driver") !== -1
// 		) {
// 			if (!params.email) {
// 				return Promise.reject(empVehicleConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
// 			} else {
// 				let step1 = await empVehicleDao.isEmailAlreadyExists(params);
// 				let adminCompany = await adminDao.findAdminById(params);
// 				let password = await appUtils.generatePassword();
// 				let randomenumber = "D" + Math.floor(Math.random() * 100000) + 8;
// 				params.driverId = randomenumber;
// 				params.password = password;
// 				params.createdBy = params.userId;
// 				params.companyCode = params.companyCode;
// 				params.userType = config.CONSTANT.USER_TYPE.DRIVER;
// 				params.type = params.type;
// 				params.dropoff = adminCompany.companyAddress;
// 				params.created = Date.now();
// 				let step2 = await empVehicleDao.driverSignup(params);
// 				step2.moduleName = config.CONSTANT.MODULE_KEY.DRIVER;
// 				step2.message = "New driver" + " " + params.name + " " + "is added";
// 				let step4 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
// 				let step3 = mailManager.sendSignupPasswordEmail(params);
// 				return empVehicleConstant.MESSAGES.SUCCESS.SIGNUP_PASSWORD_ON_EMAIL;
// 			}
// 		} else {
// 			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
// 		}
// 	} catch (error) {
// 		throw error;
// 	}
// };

/**
 * EmployeeVehicle signup
 * @author Utkarsh Patil 09/07/2020
 */
const empVehicleSignup = async function (params: EmpSignupRequest, tokenData: TokenData) {
    try {
        if (
            tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || params.permission.indexOf("emp_vehicle") !== -1
        ) {
            if (!params.email) {
                return Promise.reject(empVehicleConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
            } else {
                let step1 = await empVehicleDao.isEmpEmailAlreadyExists(params);
                let isExist = await empVehicleDao.isEmployeeIdAlreadyExists(params);
                // Added RegNo unique check for vehicles Aashiq - 20/08/2020
                let isRegNoExist, regNoArr = [];
                if (params.vehicles && params.vehicles.length > 0) {
                    let regNoArr = params.vehicles.map(a => a.regNo);
                    for (let i = 0; i < regNoArr.length; i++){
                        regNoArr[i] = regNoArr[i].toUpperCase();
                    }
                    isRegNoExist = await empVehicleDao.isVehicleRegistrationNoUnique(regNoArr);
                    // Added check for regNo Aashiq - 31/08/2020
                    for (let i = 0; i < regNoArr.length; i++) {
                        if (!config.CONSTANT.REGEX.REGNO.test(regNoArr[i])) {
                            console.log("true that we come here");
                            return Promise.reject(config.CONSTANT.VALIDATION_MESSAGE.regNo["pattern"]);
                        }
                        if (params.vehicles[i].vehicleType !== config.CONSTANT.VEHICLE_TYPE.CAR && params.vehicles[i].vehicleType !== config.CONSTANT.VEHICLE_TYPE.BIKE) {
                            console.log("true that we come there");
                            console.log(params.vehicles[i].vehicleType);
                            return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_VEHICLE);
                        }
                    }
                    if (isRegNoExist === 0) {
                        let password = await appUtils.generatePassword();
                        params.password = password;
                        params.createdBy = params.userId;
                        params.type = config.CONSTANT.ADMIN_TYPE.EMPLOYEE;
                        params.created = Date.now();
                        // Provided vehicle permission by default for employees Aashiq - 24/08/2020
                        params.permission = ["emp_vehicle"];
                        let step2 = await empVehicleDao.empSignup(params);
                        if (params.vehicles && params.vehicles.length > 0) {
                            params.vehicles.forEach(async element => {
                                // if (element.vehicleType !== config.CONSTANT.VEHICLE_TYPE.CAR && element.vehicleType !== config.CONSTANT.VEHICLE_TYPE.BIKE) {
                                //     console.log("true that we come there");
                                //     return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_VEHICLE);
                                // }
                                element.userId = step2._id;
                                element.createdBy = params.createdBy;
                                element.companyId = params.companyId;
                                element.regNo = element.regNo.toUpperCase();
                                element.created = Date.now();
                                let step3 = await empVehicleDao.createVehicleData(element);
                                step3.moduleName = config.CONSTANT.MODULE_KEY.VEHICLE;
                                step3.message = "New vehicle" + " " + element.regNo.toUpperCase() + " " + "is added";
                                let step4 = await auditLogDao.addLog(step3, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
                            });
                        }
                        step2.moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;
                        step2.message = "New employee" + " " + params.name + " " + "is added";
                        let step5 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
                        let step6 = mailManager.sendSignupPasswordEmail(params);
                        return empVehicleConstant.MESSAGES.SUCCESS.SIGNUP_PASSWORD_ON_EMAIL;
                    } else {
                        return Promise.reject(empVehicleConstant.MESSAGES.ERROR.REGISTRATION_NO_EXIST);
                    }
                }
                // edited by satyam -- no vehicles added for employee
                // if (isRegNoExist === 0) {
                //     let password = await appUtils.generatePassword();
                //     params.password = password;
                //     params.createdBy = params.userId;
                //     params.type = config.CONSTANT.ADMIN_TYPE.EMPLOYEE;
                //     params.created = Date.now();
                //     // Provided vehicle permission by default for employees Aashiq - 24/08/2020
                //     params.permission = ["emp_vehicle"];
                //     let step2 = await empVehicleDao.empSignup(params);
                //     if (params.vehicles && params.vehicles.length > 0) {
                //         params.vehicles.forEach(async element => {
                //             if (element.vehicleType !== config.CONSTANT.VEHICLE_TYPE.CAR && element.vehicleType !== config.CONSTANT.VEHICLE_TYPE.BIKE) {
                //                 return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_VEHICLE);
                //             }
                //             element.userId = step2._id;
                //             element.createdBy = params.createdBy;
                //             element.companyId = params.companyId;
                //             let step3 = await empVehicleDao.createVehicleData(element);
                //             step3.moduleName = config.CONSTANT.MODULE_KEY.VEHICLE;
                //             step3.message = "New vehicle" + " " + element.regNo + " " + "is added";
                //             let step4 = await auditLogDao.addLog(step3, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
                //         });
                //     }
                //     step2.moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;
                //     step2.message = "New employee" + " " + params.name + " " + "is added";
                //     let step5 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
                //     let step6 = mailManager.sendSignupPasswordEmail(params);
                //     return empVehicleConstant.MESSAGES.SUCCESS.SIGNUP_PASSWORD_ON_EMAIL;
                // } else {
                //     return Promise.reject(empVehicleConstant.MESSAGES.ERROR.REGISTRATION_NO_EXIST);
                // }
                let password = await appUtils.generatePassword();
                params.password = password;
                params.createdBy = params.userId;
                params.type = config.CONSTANT.ADMIN_TYPE.EMPLOYEE;
                params.created = Date.now();
                // Provided vehicle permission by default for employees Aashiq - 24/08/2020
                params.permission = ["emp_vehicle"];
                let step2 = await empVehicleDao.empSignup(params);
                step2.moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;
                step2.message = "New employee" + " " + params.name + " " + "is added";
                let step5 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
                let step6 = mailManager.sendSignupPasswordEmail(params);
                return empVehicleConstant.MESSAGES.SUCCESS.SIGNUP_PASSWORD_ON_EMAIL;
            }
        } else {
            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        }
    } catch (error) {
        throw error;
    }
};

/**
 * Employee signup
 * @author Utkarsh Patil 09/07/2020
 */
const vehicleSignup = async function (params: EmpSignupRequest, tokenData: TokenData) {
    try {
        if (
            tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || params.permission.indexOf("emp_vehicle") !== -1
        ) {
            if (!params.employeeId) {
                return Promise.reject(empVehicleConstant.MESSAGES.ERROR.EMPLOYEE_ID_NOT_PRESENT);
            } else {
                // let step1 = await empVehicleDao.isEmpEmailAlreadyExists(params);
                let employee = await empVehicleDao.isEmployeeIdAlreadyExistsForVehicle(params);
                // if(!employee)
                // 	return Promise.reject(empVehicleConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
                // console.log(employee);
                // let password = await appUtils.generatePassword();
                // params.password = password;
                // Added RegNo unique check for vehicles Aashiq - 20/08/2020
                let isRegNoExist;
                if (params.vehicles && params.vehicles.length > 0) {
                    let regNoArr = params.vehicles.map(a => a.regNo);
                    // console.log(regNoArr);
                    isRegNoExist = await empVehicleDao.isVehicleRegistrationNoUnique(regNoArr);
                    // Added check cond for regNo Aashiq - 31/08/2020
                    for (let i = 0; i < regNoArr.length; i++) {
                        if (!config.CONSTANT.REGEX.REGNO.test(regNoArr[i])) {
                            return Promise.reject(config.CONSTANT.VALIDATION_MESSAGE.regNo["pattern"]);
                        }
                    }
                }
                // console.log(isRegNoExist);
                if (isRegNoExist === 0) {
                    params.createdBy = tokenData.userId;
                    params.companyId = tokenData.companyId;
                    // params.type = config.CONSTANT.ADMIN_TYPE.EMPLOYEE;
                    params.created = Date.now();
                    // let step2 = await empVehicleDao.empSignup(params);
                    // console.log(params.vehicles);
                    if (params.vehicles.length > 0) {
                        params.vehicles.forEach(async element => {
                            if (element.vehicleType !== config.CONSTANT.VEHICLE_TYPE.CAR && element.vehicleType !== config.CONSTANT.VEHICLE_TYPE.BIKE) {
                                return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_VEHICLE);
                            }
                            element.userId = employee._id;
                            element.createdBy = params.createdBy;
                            element.companyId = params.companyId;
                            // Added companyLocationName Author - Aashiq 12/08/2020
                            // element.companyLocationName = params.companyLocationName;
                            let step3 = await empVehicleDao.createVehicleData(element);
                            step3.moduleName = config.CONSTANT.MODULE_KEY.VEHICLE;
                            step3.message = "New vehicle" + " " + element.regNo + " " + "is added";
                            let step4 = await auditLogDao.addLog(step3, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
                        });
                    }
                    // step2.moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;
                    // step2.message = "New employee" + " " + params.name + " " + "is added";
                    // let step5 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
                    // let step6 = mailManager.sendSignupPasswordEmail(params);
                    return empVehicleConstant.MESSAGES.SUCCESS.SIGNUP_VEHICLE;
                } else {
                    return Promise.reject(empVehicleConstant.MESSAGES.ERROR.REGISTRATION_NO_EXIST);
                }
            }
        } else {
            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @function bulkEmpSignup
 * @author Utkarsh Patil 09/07/2020
 */
const bulkEmpVehicleSignup = async function (params: EmpBulkSignupRequest, tokenData: TokenData) {
    try {
        let empArr = [];
        let mailArr = [];
        let vehcileArr = [];
        let json: any = await xlsx.readAndParseXLSX(params.file);
        console.log(json);
        // let admin_data = await adminDao.findAdminById(params);
        await Promise.all(json.map(async (item: any) => {
            // Removed mobile number Aashiq - 18/08/2020 change - 1
            // if (!item.email || !item.employeeId || !item.mobileNo || !item.companyLocationName) {
            if (!item.email || !item.employeeId || !item.companyLocationName) {
                return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_DATA);
            }
            item.employeeId = item.employeeId.toString().toUpperCase();
            let step1 = await empVehicleDao.isEmailAlreadyExists(item);
            let isExist = await empVehicleDao.isEmployeeIdAlreadyExists(item);
            // Removed mobile number Aashiq - 18/08/2020 change - 2
            // let isMobileExist = await empVehicleDao.isMobileNoUnique({ 'mobileNo': item.mobileNo.toString() });
            // if (isMobileExist) {
            // 	return Promise.reject(empVehicleConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
            // }
            let isLocationName = await empVehicleDao.isLocationNameAlreadyExists(item);
            let password = await appUtils.generatePassword();
            // let adminCompany = await adminDao.findAdminById(params);
            let salt = bcrypt.genSaltSync(config.SERVER.SALT_ROUNDS);
            // let salt = this.salt = appUtils.genRandomString(config.SERVER.SALT_ROUNDS);
            let hash = appUtils.encryptHashPassword(password, salt);
            // item.gender = item.gender.toLowerCase();
            // if (item.gender !== config.CONSTANT.GENDER.MALE && item.gender !== config.CONSTANT.GENDER.FEMALE) {
            // 	return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_GENDER);
            // }
            if (!config.CONSTANT.REGEX.EMAIL.test(item.email)) {
                return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_EMAIL);
            }
            // if (!item.email || !item.shift || (!item.lat && !item.long && !item.houseNo && !item.roadName && !item.city && !item.state)) {
            // 	return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_DATA);
            // }
            let empIdvalidate = item.employeeId;
            if (empIdvalidate.toString().length < 3) {
                return Promise.reject(empVehicleConstant.MESSAGES.ERROR.EMPLOYEEID_LENGETH);
            }
            /*if (! /^[a-z][a-z\s]*$/.test(item.name)) {
                return Promise.reject(empVehicleConstant.MESSAGES.ERROR.CAHRACTER_ALLOWED);
            }*/

            // new validation
            if (!/^[a-zA-Z ]+$/.test(item.name)) {
                return Promise.reject(empVehicleConstant.MESSAGES.ERROR.CAHRACTER_ALLOWED);
            }
            // Removed mobile number Aashiq - 18/08/2020 change - 3
            // if (_.isNumber(item.mobileNo) === false) {
            // 	return Promise.reject(empVehicleConstant.MESSAGES.ERROR.NUMBER_ALLOWED);
            // }

            // if (! /^[0-9]{10}$/.test(item.mobileNo)) {
            // 	return Promise.reject(empVehicleConstant.MESSAGES.ERROR.MOBILE_NUMBER_LENGETH);
            // }
            // Check if Mobile number is 10 digits - Shivakumar A
            // Removed mobile number Aashiq - 18/08/2020 change - 4
            // if (! /^[0-9]{10}$/.test(parseInt(item.mobileNo).toString())) {
            // 	// console.log(item.mobileNo);
            // 	return Promise.reject(empVehicleConstant.MESSAGES.ERROR.MOBILE_NUMBER_LENGETH);
            // }

            // if (item.gender === 'male')
            // item.gender = config.CONSTANT.GENDER.MALE;
            // else if (item.gender === 'female')
            // item.gender = config.CONSTANT.GENDER.FEMALE;
            // else
            // config.CONSTANT.GENDER.OTHER;
            let obj = {
                salt: salt,
                hash: hash,
                employeeId: item.employeeId.toString().toUpperCase(),
                email: item.email.toLowerCase(),
                name: item.name,
                // shiftStartTime: shiftObj.startShift,
                // shiftEndTime: shiftObj.endShift,
                // shift: item.shift,
                // weekOff: shiftObj.weekOff,
                // countryCode: item.countryCode,
                // Removed mobile number Aashiq - 18/08/2020 change - 5
                // contactNo: item.mobileNo.toString(),
                // gender: item.gender,
                // pickup: {},
                // pickup: pickup ,
                // password: password,
                createdBy: appUtils.toObjectId(params.userId),
                companyId: appUtils.toObjectId(params.companyId),
                companyLocationName: item.companyLocationName.toString(),
                // userType: config.CONSTANT.USER_TYPE.EMPLOYEE,
                type: config.CONSTANT.ADMIN_TYPE.EMPLOYEE,
                created: Date.now(),
                // groupFormed: false,
                // dropoff: shift.companyAddress,
                status: config.CONSTANT.STATUS.UN_BLOCKED,
                // isAddressChange: false
            };
            // Removed mobile number Aashiq - 18/08/2020 change - 6
            // let isExistInRequest = await _.find(empArr, (obj) => { return (obj.employeeId === item.employeeId.toString() || obj.email === item.email || obj.contactNo === item.mobileNo.toString()); });
            let isExistInRequest = await _.find(empArr, (obj) => {
                return (obj.employeeId === item.employeeId.toString().toUpperCase() || obj.email === item.email);
            });
            if (isExistInRequest) {
                return Promise.reject(empVehicleConstant.MESSAGES.ERROR.DUPLICATE_DATA);
            } else {
                empArr.push(obj);
                mailArr.push({name: obj.name, email: obj.email, password: password, companyId: params.companyId});
            }

            // vehicle - added vehicle related checks in this condition - Aashiq - 19/08/2020
            if (item.registrationNo1 || item.registrationNo2) {
                let param: any = {};
                let regNo = [];
                // Changing registrationNo to registrationNo1 in item Aashiq - 18/08/2020 change - 7
                if (item.registrationNo1) {
                    if (!config.CONSTANT.REGEX.REGNO.test(item.registrationNo1)) {
                        return Promise.reject(config.CONSTANT.VALIDATION_MESSAGE.regNo["pattern"]);
                    }
                    param.registrationNo = item.registrationNo1;
                    regNo.push(param.registrationNo.toUpperCase());
                }
                if (item.registrationNo2) {
                    if (!config.CONSTANT.REGEX.REGNO.test(item.registrationNo2)) {
                        return Promise.reject(config.CONSTANT.VALIDATION_MESSAGE.regNo["pattern"]);
                    }
                    param.registrationNo2 = item.registrationNo2;
                    regNo.push(param.registrationNo2.toUpperCase());
                }
                let registrationNoExist = await empVehicleDao.isVehicleRegistrationNoUnique(regNo);
                if (registrationNoExist > 0) {
                    return Promise.reject(empVehicleConstant.MESSAGES.ERROR.REGISTRATION_NO_EXIST);
                }
                // Type changed to type1 and added condition to check for vehicle Aashiq - 18/08/2020
                // Added condition for type1 existence
                if (item.type1) {
                    item.type1 = item.type1.toLowerCase();
                    if (item.type1 !== config.CONSTANT.VEHICLE_TYPE.CAR && item.type1 !== config.CONSTANT.VEHICLE_TYPE.BIKE) {
                        return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_VEHICLE);
                    }
                }
                // item.type1 = item.type1.toLowerCase();
                if (item.type2) {
                    item.type2 = item.type2.toLowerCase();
                    if (item.type2 !== config.CONSTANT.VEHICLE_TYPE.CAR && item.type2 !== config.CONSTANT.VEHICLE_TYPE.BIKE) {
                        return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_VEHICLE);
                    }
                }

                // if (item.type1 !== config.CONSTANT.VEHICLE_TYPE.CAR && item.type1 !== config.CONSTANT.VEHICLE_TYPE.BIKE) {
                //     return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_VEHICLE);
                // }

                let vehicle_obj = {};
                // Added check for item.registrationNo1 also Aashiq - 25/08/2020
                if ((!item.registrationNo1 && item.modal1 && item.type1) || (item.registrationNo1 && !item.modal1 && item.type1) || (item.registrationNo1 && item.modal1 && !item.type1)
                    || (item.registrationNo1 && !item.modal1 && !item.type1) || (!item.registrationNo1 && item.modal1 && !item.type1) || (!item.registrationNo1 && !item.modal1 && item.type1)) {
                    return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_DATA);
                } else if ((!item.registrationNo2 && item.modal2 && item.type2) || (item.registrationNo2 && !item.modal2 && item.type2) || (item.registrationNo2 && item.modal2 && !item.type2)
                    || (item.registrationNo2 && !item.modal2 && !item.type2) || (!item.registrationNo2 && item.modal2 && !item.type2) || (!item.registrationNo2 && !item.modal2 && item.type2)) {
                    return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_DATA);
                } else if (item.registrationNo2 && item.modal2 && item.type2) {
                    for (let i = 0; i < 2; i++) {

                        if (i === 1) {
                            vehicle_obj = {
                                companyId: appUtils.toObjectId(params.companyId),
                                vehicleType: item.type2,
                                regNo: item.registrationNo2.toString().toUpperCase(),
                                userId: null,
                                modal: item.modal2,
                                created: Date.now(),
                                employeeId: item.employeeId.toString(),
                                status: config.CONSTANT.STATUS.UN_BLOCKED,
                                createdBy: appUtils.toObjectId(params.userId),
                            };
                            let isExistInRequestVeh = await _.find(vehcileArr, (obj) => {
                                return (obj.regNo === item.registrationNo2);
                            });
                            if (isExistInRequestVeh) {
                                return Promise.reject(empVehicleConstant.MESSAGES.ERROR.DUPLICATE_DATA);
                            } else {
                                vehcileArr.push(vehicle_obj);
                            }

                        } else {
                            // check cond is required as
                            if (item.registrationNo1) {
                                vehicle_obj = {
                                    companyId: appUtils.toObjectId(params.companyId),
                                    vehicleType: item.type1,
                                    regNo: item.registrationNo1.toString().toUpperCase(),
                                    userId: null,
                                    // Changing modal to modal1 in item Aashiq - 18/08/2020 change - 8
                                    modal: item.modal1,
                                    created: Date.now(),
                                    employeeId: item.employeeId.toString(),
                                    status: config.CONSTANT.STATUS.UN_BLOCKED,
                                    createdBy: appUtils.toObjectId(params.userId),
                                };
                                let isExistInRequestVeh = await _.find(vehcileArr, (obj) => {
                                    return (obj.regNo === item.registrationNo1);
                                });
                                if (isExistInRequestVeh) {
                                    return Promise.reject(empVehicleConstant.MESSAGES.ERROR.DUPLICATE_DATA);
                                } else {
                                    vehcileArr.push(vehicle_obj);
                                }
                            }
                        }
                    }

                } else {
                    // if (item.registrationNo1) {
                    vehicle_obj = {
                        companyId: appUtils.toObjectId(params.companyId),
                        vehicleType: item.type1,
                        // Changing registrationNo to registrationNo1 in item Aashiq - 18/08/2020 change - 9
                        regNo: item.registrationNo1.toString().toUpperCase(),
                        userId: null,
                        modal: item.modal1,
                        created: Date.now(),
                        employeeId: item.employeeId.toString(),
                        status: config.CONSTANT.STATUS.UN_BLOCKED,
                        createdBy: appUtils.toObjectId(params.userId),
                    };
                    let isExistInRequestVeh = await _.find(vehcileArr, (obj) => {
                        return (obj.regNo === item.registrationNo1);
                    });
                    if (isExistInRequestVeh) {
                        return Promise.reject(empVehicleConstant.MESSAGES.ERROR.DUPLICATE_DATA);
                    } else {
                        vehcileArr.push(vehicle_obj);
                    }
                }

                // }
            }
        }));
        // Added check cond for emp existence - Aashiq 19/08/2020
        if (empArr.length > 0) {
            let step2 = await empVehicleDao.bulkEmpSignup(empArr);
            await vehcileArr.forEach(elementVeh => {
                // json.forEach((elementJson) => {
                step2.ops.forEach((elementEmp) => {
                    if (elementEmp.employeeId.toString() === elementVeh.employeeId.toString()) {
                        elementVeh.userId = elementEmp._id;
                        elementEmp.employeeId = elementEmp.employeeId.toString();
                        elementVeh.employeeId = elementVeh.employeeId.toString();
                    }
                });
                // });
                delete elementVeh.employeeId;
            });
        }
        // Added check cond for vehicle existence - Aashiq 19/08/2020
        if (vehcileArr.length > 0) {
            let step3 = await empVehicleDao.bulkVehicleSignup(vehcileArr);
        }

        for (let mail of mailArr) {
            let step4 = mailManager.sendSignupPasswordEmail(mail);
        }
        return empVehicleConstant.MESSAGES.SUCCESS.IMPORT_USER;
    } catch (error) {
        throw error;
    }
};

/**
 * @function bulkVehicleSignup
 * @author Utkarsh Patil 10/07/2020
 */
const bulkVehicleSignup = async function (params: VehicleSignUpRequest) {
    try {
        let vehcileArr = [];
        // let json: any = await xlsx.readAndParseXLSX(params.file);
        let data: any = params;
        await Promise.all(data.map(async (item: any) => {
            if (!item.employeeId && (!item.registrationNo || !item.modal || !item.type)) {
                return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_DATA);
            }
            let employee = await empVehicleDao.isEmployeeIdAlreadyExistsForVehicle(item);

            if (item.registrationNo) {
                if (!config.CONSTANT.REGEX.REGNO.test(item.registrationNo)) {
                    return Promise.reject(config.CONSTANT.VALIDATION_MESSAGE.regNo["pattern"]);
                }
                let param: any = {};
                param.registrationNo = item.registrationNo;
                if (item.registrationNo2) {
                    if (!config.CONSTANT.REGEX.REGNO.test(item.registrationNo2)) {
                        return Promise.reject(config.CONSTANT.VALIDATION_MESSAGE.regNo["pattern"]);
                    }
                    param.registrationNo2 = item.registrationNo2;
                }
                let registrationNoExist = await empVehicleDao.isRegistrationNoUnique(param);
                if (registrationNoExist) {
                    return Promise.reject(empVehicleConstant.MESSAGES.ERROR.REGISTRATION_NO_EXIST);
                }
            }

            item.type = item.type.toLowerCase();
            if (item.type2) {
                item.type2 = item.type2.toLowerCase();
                if (item.type2 !== config.CONSTANT.VEHICLE_TYPE.CAR && item.type2 !== config.CONSTANT.VEHICLE_TYPE.BIKE) {
                    return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_VEHICLE);
                }
            }

            if (item.type !== config.CONSTANT.VEHICLE_TYPE.CAR && item.type !== config.CONSTANT.VEHICLE_TYPE.BIKE) {
                return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_VEHICLE);
            }

            // console.log()
            // if (!/^[A-Z]{2}\s[0-9]{2}\s[A-Z]{2}\s[0-9]{4}$/.test(item.reg_no.toString())) {
            // 		return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_REG_NUMBER);
            // 	}
            let obj = {};
            if (item.registrationNo2 && item.modal2 && item.type2) {
                for (let i = 0; i < 2; i++) {

                    if (i === 1) {
                        obj = {
                            companyId: params.companyId,
                            vehicleType: item.type2,
                            regNo: item.registrationNo2.toUpperCase(),
                            userId: employee._id,
                            modal: item.modal2,
                            created: Date.now(),
                            status: config.CONSTANT.STATUS.UN_BLOCKED,
                            createdBy: params.createdBy,
                        };
                        vehcileArr.push(obj);
                    } else {
                        obj = {
                            companyId: params.companyId,
                            vehicleType: item.type,
                            regNo: item.registrationNo.toUpperCase(),
                            userId: employee._id,
                            modal: item.modal,
                            created: Date.now(),
                            status: config.CONSTANT.STATUS.UN_BLOCKED,
                            createdBy: params.createdBy,
                        };
                        vehcileArr.push(obj);

                    }
                }

            } else {
                obj = {
                    companyId: params.companyId,
                    vehicleType: item.type,
                    regNo: item.registrationNo.toUpperCase(),
                    userId: employee._id,
                    created: Date.now(),
                    status: config.CONSTANT.STATUS.UN_BLOCKED,
                    createdBy: params.createdBy,
                };
                vehcileArr.push(obj);

            }
            let isExistInRequest = await _.find(vehcileArr, (obj) => {
                return (obj.regNo === item.registrationNo.toString() || obj.employeeId === item.employeeId);
            });
            if (isExistInRequest) {
                return Promise.reject(empVehicleConstant.MESSAGES.ERROR.DUPLICATE_DATA);
            }
        }));
        let step2 = await empVehicleDao.bulkVehicleSignup(vehcileArr);
        return empVehicleConstant.MESSAGES.SUCCESS.IMPORT_USER;
    } catch (error) {
        throw error;
    }
};
/**
 * Employee signup
 */
// const empSignup = async function (params: EmpSignupRequest, tokenData: TokenData) {
// 	try {
// 		if (
// 			params.type === config.CONSTANT.ADMIN_TYPE.ADMIN ||
// 			params.permission.indexOf("employee") !== -1
// 		) {
// 			if (!params.email) {
// 				return Promise.reject(empVehicleConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
// 			} else {
// 				let coordinate, type;
// 				let homeAddress: any = {};
// 				let step1 = await empVehicleDao.isEmpEmailAlreadyExists(params);
// 				let isExist = await empVehicleDao.isEmployeeIdAlreadyExists(params);
// 				let password = await appUtils.generatePassword();
// 				let shift = await adminDao.findAdminById(params);
// 				let shiftSlot = shift.shiftSlot;
// 				let shiftObj = await _.find(shiftSlot, (obj) => { return obj.shiftName === params.shift; });
// 				let homeObj: any = {};
// 				if (params.houseNo)
// 					homeObj.houseNo = params.houseNo;
// 				if (params.roadName)
// 					homeObj.roadName = params.roadName;
// 				if (params.city)
// 					homeObj.city = params.city;
// 				if (params.state)
// 					homeObj.state = params.state;
// 				if (params.landMark)
// 					homeObj.landMark = params.landMark;
// 				if (params.fullAddress)
// 					homeObj.fullAddress = params.fullAddress;
// 				if (params.latitude && params.longitude) {
// 					coordinate = [params.longitude, params.latitude];
// 					type = "Point";
// 					homeAddress = { address: homeObj, coordinates: coordinate, type: type };
// 				}
// 				// if (homeObj && params.fullAddress) {
// 				// 	let address = '';
// 				// 	_.forIn(homeObj, function (value, key) { address = address.concat(value, ','); });
// 				// 	let latLong = await empVehicleDao.addrToLatLong(address);
// 				// 	coordinate = [latLong.lng, latLong.lat];
// 				// 	type = "Point";
// 				// 	homeAddress = { address: homeObj, coordinates: coordinate, type: type };
// 				// }
// 				params.password = password;
// 				params.createdBy = params.userId;
// 				params.companyCode = params.companyCode;
// 				params.userType = config.CONSTANT.USER_TYPE.EMPLOYEE;
// 				params.type = params.type;
// 				params.created = Date.now();
// 				params.dropoff = shift.companyAddress;
// 				params.shiftStartTime = shiftObj.startShift;
// 				params.shiftEndTime = shiftObj.endShift;
// 				params.shift = params.shift;
// 				params.weekOff = shiftObj.weekOff;
// 				params.pickup = homeAddress;
// 				let step2 = await empVehicleDao.empSignup(params);
// 				step2.moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;
// 				step2.message = "New employee" + " " + params.name + " " + "is added";
// 				let step4 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
// 				// let routes = await baseDao.find("cab_routes", {"companyCode": params.companyCode}, {}, {});
// 				// console.log('routes: ', routes);
// 				// if (routes.length > 0) {
// 				// Creating routing group for this new employee
// 				// let algoReqObj: any = {};
// 				// let officeLocation: any = {};
// 				// let employees = [];
// 				// officeLocation.lat = shift.companyBranch.coordinates[1];
// 				// officeLocation.long = shift.companyBranch.coordinates[0];
// 				// // algoReqObj.maxGroupSize = config.CONSTANT.ROUTE_DATA.MAX_GROUP_SIZE;
// 				// algoReqObj.maxGroupSize = shift.routeConf.maxGroupSize;
// 				// // algoReqObj.waitTime = config.CONSTANT.ROUTE_DATA.WAIT_TIME;
// 				// algoReqObj.waitTime = shift.routeConf.waitTime;
// 				// // algoReqObj.maxTripDuration = config.CONSTANT.ROUTE_DATA.MAX_TRIP_DURATION;
// 				// algoReqObj.maxTripDuration = shift.routeConf.maxTripDuration;
// 				// algoReqObj.officeLocation = officeLocation;
// 				// let b = step2.pickup.address;
// 				// let address: any = '';
// 				// for (let addr in b) {
// 				// 	if ((addr === "houseNo" || addr === "roadName" || addr === "city" || addr === "state" || addr === "landMark") && step2.pickup.address[addr])
// 				// 		address += step2.pickup.address[addr] + ' ';
// 				// }
// 				// let obj = {
// 				// 	"empId": step2._id,
// 				// 	"shift": step2.shift,
// 				// 	"shiftStartTime": step2.shiftStartTime,
// 				// 	"shiftEndTime": step2.shiftEndTime,
// 				// 	"weekOff": step2.weekOff,
// 				// 	"location": {
// 				// 		"lat": step2.pickup.coordinates[1],
// 				// 		"long": step2.pickup.coordinates[0]
// 				// 	},
// 				// 	"name": step2.name,
// 				// 	"employeeId": step2.employeeId,
// 				// 	"countryCode": step2.countryCode,
// 				// 	"mobileNo": step2.mobileNo,
// 				// 	"address": address.trim()
// 				// };
// 				// employees.push(obj);
// 				// algoReqObj.employees = employees;
// 				// 	 let routingAlgo = await cabRouteDao.routingAlgo(algoReqObj, params);
// 				// 	}

// 				let step3 = mailManager.sendSignupPasswordEmail(params);
// 				return empVehicleConstant.MESSAGES.SUCCESS.SIGNUP_PASSWORD_ON_EMAIL;
// 			}
// 		} else {
// 			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
// 		}
// 	} catch (error) {
// 		throw error;
// 	}
// };

/**
 * @function login
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.storeList() function saves value in redis.
 */
const login = async function (params: LoginRequest) {
    console.log("$$$$$$$$$$$$$$$$$$$$$", params);
    try {
        if (!params.email) {
            return Promise.reject(empVehicleConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
        } else {
            let step1 = await empVehicleDao.findUserByEmailCompanyCode(params);
            if (!step1) {
                if (params.email) {
                    return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
                } else {
                    return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);
                }
            } else {
                let step2 = await empVehicleDao.getUserCompany(step1);
                console.log("step2", step2);
                if (step1.status === config.CONSTANT.STATUS.BLOCKED) {
                    return Promise.reject(config.CONSTANT.MESSAGES.ERROR.BLOCKED);
                } else {
                    let salt, accessToken;
                    if (!step1.hash) {
                        return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);
                    } else {
                        params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
                        if (step1.hash !== params.hash) {
                            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);
                        } else {
                            console.log(step1);
                            salt = await appUtils.CryptDataMD5(step1._id + "." + new Date().getTime() + "." + params.deviceId);
                            let tokenData = _.extend(params, {
                                "userId": step1._id,
                                "name": step1.name,
                                "email": step1.email,
                                "countryCode": step1.countryCode,
                                // "mobileNo": step1.mobileNo,
                                "userType": step1.userType,
                                "status": step1.status,
                                "employeeId": step1.employeeId,
                                // "driverId": step1.driverId,
                                "companyLocationName": step1.companyLocationName,
                                "companyId": step1.companyId,
                                "salt": salt,
                                // "accountLevel": config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER,
                                "createdBy": step1.createdBy,
                            });
                            let userObject = appUtils.buildToken(tokenData);
                            accessToken = await tokenManager.generateUserToken({"type": "USER_LOGIN", "object": userObject, "salt": salt});
                        }
                    }
                    let paramsReq = {
                        "userId": step1._id,
                        "deviceId": params.deviceId
                    };
                    if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
                        let step2 = await loginHistoryDao.removeDeviceByUserId(paramsReq);
                    } else {
                        let step2 = await loginHistoryDao.removeUserDeviceById(paramsReq);
                    }
                    let refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
                    params = _.extend(params, {"salt": salt, "refreshToken": refreshToken});
                    let step3 = await loginHistoryDao.createUserLoginHistory(params);
                    if (config.SERVER.IS_REDIS_ENABLE) {
                        let step4 = await redisClient.deleteKey(step1._id + "." + params.deviceId);
                        // store _id.deviceId as a key and {deviceId, salt} as a value (redis list)
                        let step5 = await redisClient.storeList(step1._id + "." + params.deviceId, [JSON.stringify({"deviceId": params.deviceId, "salt": salt})]);
                    }
                    step1.socketPort = config.SERVER.SOCKET_PORT;
                    step1.socketUrl = config.SERVER.SOCKET_URL;
                    delete step1.salt, delete step1.hash, delete step1.createdAt, delete step1.createdBy;
                    step1.socketPort = config.SERVER.SOCKET_PORT;
                    step1.socketUrl = config.SERVER.SOCKET_URL;
                    return empVehicleConstant.MESSAGES.SUCCESS.LOGIN({"accessToken": accessToken, "refreshToken": refreshToken, "data": step1, "companyCoordinates": {lat: step2.locations[0].address.lat, long: step2.locations[0].address.lng }});
                }
            }
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @function forgotPassword
 */
const forgotPassword = async function (params: ForgotPasswordRequest) {
    try {
        if (!params.email) {
            return Promise.reject(empVehicleConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
        } else {
            let step1 = await empVehicleDao.findUserByEmailCompanyCode(params);
            console.log(step1);
            if (!step1) {
                if (params.email) {
                    return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
                } else {
                    return Promise.reject(empVehicleConstant.MESSAGES.ERROR.MOBILE_NO_NOT_REGISTERED);
                }
            } else {
                let tokenData = _.extend(params, {
                    "userId": step1._id,
                    "name": step1.name,
                    "email": step1.email,
                    // "accountLevel": config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER,
                    "userType": step1.type,
                    "companyId": step1.companyId,
                });
                let userObject = appUtils.buildToken(tokenData);
                let accessToken = await tokenManager.generateUserToken({type: "FORGOT_PASSWORD", object: userObject});
                let step3 = await empVehicleDao.updateForgetPassword(tokenData, accessToken);
                let redirectUrl = config.SERVER.APP_URL + config.SERVER.API_BASE_URL + "/user/reset-password?accessToken=" + accessToken;
                if (params.email) {
                    let step2 = mailManager.sendForgotPasswordEmail({"email": params.email, "accessToken": accessToken, "name": step1.name, "url": redirectUrl});
                    return empVehicleConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD_ON_EMAIL;
                } else {
                    return empVehicleConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD_ON_PHONE;
                }
            }
        }
    } catch (error) {
        throw error;
    }
};

// change-password of users_new
const changePassword = async function (params: ChangeUserPasswordRequest) {
    try {
        let step1 = await empVehicleDao.findUserById(params);
        let oldHash = appUtils.encryptHashPassword(params.oldPassword, step1.salt);
        params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
        params.salt = step1.salt;
        if (oldHash === step1.hash) {
            let step2 = await empVehicleDao.changePassword(params);
        } else {
            return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_OLD_PASSWORD);
        }
        return empVehicleConstant.MESSAGES.SUCCESS.CHANGE_PASSWORD;
    } catch (error) {
        throw error;
    }
};

/**
 * @function changeForgotPassword
 */
const changeForgotPassword = async function (params: ChangeForgotPasswordRequest) {
    try {
        let step1 = await empVehicleDao.findUserByCompanyCode(params);
        if (!step1) {
            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
        } else {
            params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
            let step2 = await empVehicleDao.changeForgotPassword(params);
            return empVehicleConstant.MESSAGES.SUCCESS.CHANGE_FORGOT_PASSWORD;
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @function refreshToken
 */
const refreshToken = async function (params: RefreshTokenRequest) {
    try {
        if (!params.refreshToken) {
            return Promise.reject(empVehicleConstant.MESSAGES.ERROR.REFRESH_TOKEN_REQUIRED);
        } else {
            let step1 = await loginHistoryDao.findDeviceById(params);
            if (step1.refreshToken !== params.refreshToken) {
                return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_REFRESH_TOKEN);
            } else {
                delete params.refreshToken;
                let accessToken = await tokenManager.refreshTokenOfUser({"object": params, "salt": step1 ? step1.salt : config.SERVER.JWT_CERT_KEY});
                let refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
                let step2 = await loginHistoryDao.updateRefreshToken({
                    "deviceId": params.deviceId,
                    "userId": params.userId,
                    "deviceToken": step1.deviceToken,
                    "refreshToken": refreshToken
                });
                return config.CONSTANT.MESSAGES.SUCCESS.REFRESH_TOKEN({"accessToken": accessToken, "refreshToken": refreshToken});
            }
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @function logout
 */
const logout = async function (params: TokenData) {
    try {
        if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
            let step1 = await loginHistoryDao.removeDeviceByUserId(params);
        } else {
            let step1 = await loginHistoryDao.removeUserDeviceById(params);
        }
        if (config.SERVER.IS_REDIS_ENABLE) {
            let step2 = await redisClient.deleteKey(params.userId + "." + params.deviceId);
        }
        return empVehicleConstant.MESSAGES.SUCCESS.LOGOUT;
    } catch (error) {
        throw error;
    }
};

/**
 * @function userList
 * @author Utkarsh Patil 15/07/2020
 */
const userList = async function (params: ListingRequest) {
    try {
        // if (
        // 	params.type === config.CONSTANT.ADMIN_TYPE.ADMIN ||
        // 	params.permission.indexOf("employee") !== -1 || params.permission.indexOf("driver") !== -1
        // ) {
        // Added Access for Subadmin - Shivakumar A
        if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
            params.permission.indexOf("emp_vehicle") !== -1) {
            let response: any = {};
            let step2 = await empVehicleDao.userList(params).then(function (result) {
                response.userList = result[0];
                response.totalCount = result[1] || 0;
            });
            return empVehicleConstant.MESSAGES.SUCCESS.USER_LIST(response);
        } else {
            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @function vehicleList
 * @author Utkarsh Patil 16/07/2020
 */
const vehicleList = async function (params: ListingRequest) {
    try {
        // if (
        // 	params.type === config.CONSTANT.ADMIN_TYPE.ADMIN ||
        // 	params.permission.indexOf("employee") !== -1 || params.permission.indexOf("driver") !== -1
        // ) {
        // Added Access for Subadmin - Shivakumar A
        if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
            params.permission.indexOf("emp_vehicle") !== -1) {
            let totalCount = 0;
            let response: any = {};
            let step2 = await empVehicleDao.vehicleList(params).then(function (result) {
                response.vehicleList = result[0];
                // response.totalCount = result[1] || 0;
                if (result.length > 1) {
                    if (result[1][0] && result[1][0].count) {
                        totalCount = result[1][0].count;
                    }
                }
                // response.totalCount = result[1][0].count === null ? 0 : result[1][0].count;
                response.totalCount = totalCount;
            });
            return empVehicleConstant.MESSAGES.SUCCESS.VEHICLE_LIST(response);
        } else {
            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        }
    } catch (error) {
        throw error;
    }
};
// userlist with approved address - satyam
const userListCurrent = async function (params: ListingRequest) {
    try {
        if (params.type === config.CONSTANT.ADMIN_TYPE.ADMIN || params.type === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
            params.permission.indexOf("emp_vehicle") !== -1 || params.permission.indexOf("driver") !== -1) {
            let step1 = await adminDao.findAdminById(params);
            if (step1.type === config.CONSTANT.ADMIN_TYPE.ADMIN || params.type === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
                step1.permission.indexOf("emp_vehicle") !== -1 || step1.permission.indexOf("driver") !== -1) {
                let response: any = {};
                let step2 = await empVehicleDao.userListCurrent(params).then(function (result) {
                    response.userList = result[0];
                    response.totalCount = result[1] || 0;
                });
                return empVehicleConstant.MESSAGES.SUCCESS.USER_LIST(response);
            } else {
                return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
            }
        } else {
            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @function exportUser
 */
const exportUser = async function (params: ListingRequest) {
    try {
        let step1 = await empVehicleDao.exportUser(params);
        let step2 = await empVehicleMapper.exportUserResponseMapping(step1);
        let step3 = config.CONSTANT.EXPORT_SHEET.USER_LIST;
        const sheetName = "";
        let step4 = await appUtils.createStream(step2, step3, sheetName);
        return empVehicleConstant.MESSAGES.SUCCESS.EXPORT_USER(step4);
    } catch (error) {
        throw error;
    }
};

/**
 * @function _blockUser
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.storeSet() function saves value in redis.
 * @author Utkarsh Patil 14/07/2020
 */
const _unblockEmpVehicle = async function (params: BlockRequest, tokenData: TokenData) {
    try {
        let step1 = await empVehicleDao.blockUnblockEmployee(params);
        let step2 = await empVehicleDao.blockUnblockEmpVehicle(params);
        step1.userId = step1._id;
        // Removed block Unblock feature of vehicles Aashiq - 24/08/2020
        // let step2 = await empVehicleDao.isVehicleExistForUserId(params.status, step1);
        // // console.log(step2);
        // if (step2.length > 0) {
        //     await step2.forEach(async (vehicle) => {
        //         let step3 = await empVehicleDao.blockUnblockVehicle(vehicle._id, params);
        //         // console.log(step3);
        //         let step4 = await promise.join(step1);
        //         step4[0].message = "Vehicle has been unblocked with registration No " + " " + step3.regNo;
        //         step4[0].moduleName = config.CONSTANT.MODULE_KEY.VEHICLE;
        //         step4[0].regNo = step3.regNo;
        //         // console.log(step4);
        //         let step5 = await auditLogDao.addLog(step4[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.UNBLOCK);
        //     });
        // }
        let step6 = await promise.join(step1);
        step6[0].moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;
        step6[0].message = "Account has been unblocked of" + " " + step1.name;
        let step7 = await auditLogDao.addLog(step6[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.UNBLOCK);

        // remove userId from blocked_set (redis SET)
        // let step2;
        // if (config.SERVER.IS_REDIS_ENABLE) {
        // 	step2 = await redisClient.removeFromSet("blocked_set", params.userId);
        // }
        // let step3 = await promise.join(step1, step2);
        // if (step1.userType === config.CONSTANT.USER_TYPE.DRIVER) {
        // 	step3[0].moduleName = config.CONSTANT.MODULE_KEY.DRIVER;
        // } else {
        // 	step3[0].moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;
        // }
        // step3[0].message = "Account has been unblocked of" + " " + step1.name;
        // let step4 = await auditLogDao.addLog(step3[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.BLOCK);
        return empVehicleConstant.MESSAGES.SUCCESS.UNBLOCK_USER;
    } catch (error) {
        throw error;
    }
};

/**
 * @function _unblockVehicle
 * @author Utkarsh Patil 14/07/2020
 */
const _blockEmpVehicle = async function (params: BlockRequest, tokenData: TokenData) {
    try {
        let step1 = await empVehicleDao.blockUnblockEmployee(params);
        let step2 = await empVehicleDao.blockUnblockEmpVehicle(params);
        step1.userId = step1._id;
        // Removed block Unblock feature of vehicles Aashiq - 24/08/2020
        // let step2 = await empVehicleDao.isVehicleExistForUserId(params.status, step1);
        // // console.log(step2);
        // if (step2.length > 0) {
        //     await step2.forEach(async (vehicle) => {
        //         let step3 = await empVehicleDao.blockUnblockVehicle(vehicle._id, params);
        //         let step4 = await promise.join(step1, step3);
        //         // console.log(step3.regNo);
        //         step4[0].message = "Vehicle has been blocked with registration No " + " " + step3.regNo;
        //         step4[0].moduleName = config.CONSTANT.MODULE_KEY.VEHICLE;
        //         step4[0].regNo = step3.regNo;
        //         // console.log(step4);
        //         let step5 = await auditLogDao.addLog(step4[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.BLOCK);
        //     });
        // }
        let step6 = await promise.join(step1);
        step6[0].moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;
        step6[0].message = "Account has been blocked of" + " " + step1.name;
        let step7 = await auditLogDao.addLog(step6[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.BLOCK);
        return empVehicleConstant.MESSAGES.SUCCESS.BLOCK_USER;
    } catch (error) {
        throw error;
    }
};

/**
 * @function _unblockVehicle
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.storeSet() function saves value in redis.
 * @author Utkarsh Patil 15/07/2020
 */
const _unblockVehicle = async function (params: BlockRequest) {
    try {
        let step1 = await empVehicleDao.blockUnblockVehicle(params.vehicleId, params);
        let step2 = await promise.join(step1);
        step2[0].message = "Vehicle has been unblocked with registration No " + " " + step1.regNo;
        step2[0].moduleName = config.CONSTANT.MODULE_KEY.VEHICLE;
        step2[0].regNo = step1.regNo;
        // let step3 = await auditLogDao.addLog(step2[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.BLOCK);

        return empVehicleConstant.MESSAGES.SUCCESS.UNBLOCK_VEHICLE;
    } catch (error) {
        throw error;
    }
};

/**
 * @function _blockVehicle
 * @author Utkarsh Patil 15/07/2020
 */
const _blockVehicle = async function (params: BlockRequest) {
    try {
        let step1 = await empVehicleDao.blockUnblockVehicle(params.vehicleId, params);
        let step2 = await promise.join(step1);
        step2[0].message = "Vehicle has been unblcoked with registration No " + " " + step1.regNo;
        step2[0].moduleName = config.CONSTANT.MODULE_KEY.VEHICLE;
        step2[0].regNo = step1.regNo;
        // let step3 = await auditLogDao.addLog(step2[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.BLOCK);
        return empVehicleConstant.MESSAGES.SUCCESS.BLOCK_VEHICLE;
    } catch (error) {
        throw error;
    }
};

/**
 * @function blockUnblockEmployee
 * @description Blockunbloack employee and vehicle linked to them.
 * @author Utkarsh Patil 14/07/2020
 */
const blockUnblockEmployee = async function (params: BlockRequest, tokenData: TokenData) {
    try {
        if (
            tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || tokenData.permission.indexOf("emp_vehicle") !== -1) {
            switch (params.status) {
                case config.CONSTANT.STATUS.BLOCKED:
                    return _blockEmpVehicle(params, tokenData);
                case config.CONSTANT.STATUS.UN_BLOCKED:
                    return _unblockEmpVehicle(params, tokenData);
            }
        } else {
            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @function blockUnblockVehicle
 * @description Blockunbloack employee and vehicle linked to them.
 * @author Utkarsh Patil 15/07/2020
 */
const blockUnblockVehicle = async function (params: BlockRequest) {
    try {
        // if (
        //     tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || tokenData.permission.indexOf("emp_vehicle") !== -1) {
        //     console.log(params);
        //     switch (params.status) {
        //         case config.CONSTANT.STATUS.BLOCKED:
        //             return _blockVehicle(params, tokenData);
        //         case config.CONSTANT.STATUS.UN_BLOCKED:
        //             return _unblockVehicle(params, tokenData);
        //     }
        // } else {
        //     return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        // }
        switch (params.status) {
            case config.CONSTANT.STATUS.BLOCKED:
                return _blockVehicle(params);
            case config.CONSTANT.STATUS.UN_BLOCKED:
                return _unblockVehicle(params);
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @function _multiBlockUser
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.storeSet() function saves value in redis.
 */
const _multiBlockUser = async function (params: MultiBlockRequest) {
    try {
        let userIds: any = params.userIds;
        // block users_new one by one
        await userIds.forEach(async (userId) => {
            params.userId = userId;
            let step1 = await empVehicleDao.multiBlockUnblock(params);
        });
        // store blocked_set as a key and userId as a value (redis SET)
        if (config.SERVER.IS_REDIS_ENABLE) {
            let step2 = await redisClient.storeSet("blocked_set", params.userIds);
        }
        return empVehicleConstant.MESSAGES.SUCCESS.MULTI_BLOCK_USER;
    } catch (error) {
        throw error;
    }
};

/**
 * @function _multiUnblockUser
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.removeFromSet() function removes value in redis.
 */
const _multiUnblockUser = async function (params: MultiBlockRequest) {
    try {
        let userIds: any = params.userIds;
        // un-block users_new one by one
        await userIds.forEach(async (userId) => {
            params.userId = userId;
            let step1 = await empVehicleDao.multiBlockUnblock(params);
        });
        // remove userId from blocked_set (redis SET)
        if (config.SERVER.IS_REDIS_ENABLE) {
            let step2 = await redisClient.removeFromSet("blocked_set", params.userIds);
        }
        return empVehicleConstant.MESSAGES.SUCCESS.MULTI_UNBLOCK_USER;
    } catch (error) {
        throw error;
    }
};

/**
 * @function multiBlockUnblock
 */
const multiBlockUnblock = async function (params: MultiBlockRequest) {
    try {
        if (
            params.type === config.CONSTANT.ADMIN_TYPE.ADMIN ||
            params.permission.indexOf("block_user") !== -1
        ) {
            switch (params.status) {
                case config.CONSTANT.STATUS.BLOCKED:
                    return _multiBlockUser(params);
                case config.CONSTANT.STATUS.UN_BLOCKED:
                    return _multiUnblockUser(params);
            }
        } else {
            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @function deleteUser
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.storeSet() function saves value in redis.
 */
// const deleteUser = async function (params: DeleteRequest, tokenData: TokenData) {
// 	try {
// 		if (
// 			tokenData.type === config.CONSTANT.ADMIN_TYPE.ADMIN ||
// 			tokenData.permission.indexOf("employee") !== -1 || tokenData.permission.indexOf("driver") !== -1
// 		) {
// 			let step1 = await empVehicleDao.deleteUser(params);
// 			// store deleted_set as a key and userId as a value (redis SET)
// 			let step2;
// 			if (config.SERVER.IS_REDIS_ENABLE) {
// 				step2 = await redisClient.storeSet("deleted_set", [params.userId]);
// 			}
// 			let step3 = loginHistoryDao.removeDeviceById({ "userId": params.userId });
// 			let step4 = await promise.join(step1, step2, step3);
// 			if (step1.userType === config.CONSTANT.USER_TYPE.DRIVER) {
// 				step4[0].moduleName = config.CONSTANT.MODULE_KEY.DRIVER;
// 			} else {
// 				step4[0].moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;
// 			}
// 			step4[0].message = "Account has been archived of" + " " + step1.name;
// 			let step6 = await auditLogDao.addLog(step4[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ARCHIVE);
// 			return empVehicleConstant.MESSAGES.SUCCESS.DELETE_USER;
// 		} else {
// 			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
// 		}
// 	} catch (error) {
// 		throw error;
// 	}
// };

/**
 * @function userDetails
 * @author Utkarsh Patil 16/07/2020
 */
const userDetails = async function (params: UserId) {
    try {
        let step1 = await empVehicleDao.findUserById(params);
        let step2 = await empVehicleDao.findVehicleByUserId(step1._id);
        return empVehicleConstant.MESSAGES.SUCCESS.USER_VEHICLE_DETAILS(step1, step2);
    } catch (error) {
        throw error;
    }
};
/**
 * @function vehicleDetails
 * @author Utkarsh Patil 16/07/2020
 */
const vehicleDetails = async function (params: UserId) {
    try {
        let step1 = await empVehicleDao.findVehicleByVehicleId(params);
        let step2 = await empVehicleDao.findUserById(step1);
        return empVehicleConstant.MESSAGES.SUCCESS.VEHICLE_DETAILS(step1, step2);
    } catch (error) {
        throw error;
    }
};
/**
 * @function employeeById
 * @param params Chect employee exist
 */
const employeeById = async function (params: IsEmployee) {
    try {
        let response: any = {};
        let step = await empVehicleDao.employeeById(params);
        if (step) {
            return empVehicleConstant.MESSAGES.SUCCESS.PROFILE(step);
        } else {
            return empVehicleConstant.MESSAGES.ERROR.EMPLOYEE_DATA;
        }

    } catch (error) {
        throw error;
    }
};
// satyam -- employee for group
const empForGroup = async function (params: EmployeeForGroupRequest) {
    try {
        let response: any = {};
        let step = await empVehicleDao.empForGroup(params);
        if (step) {
            return empVehicleConstant.MESSAGES.SUCCESS.PROFILE(step);
        } else {
            return empVehicleConstant.MESSAGES.ERROR.EMPLOYEE_DATA;
        }

    } catch (error) {
        throw error;
    }
};
/**
 * @function employeeListing
 */
const emmloyeeListing = async function (params: ListingRequest) {
    try {
        // let searchKeyNo = params.searchKey ? params.searchKey.length : 0;
        // if (searchKeyNo >= 3) {
        let response: any = {};
        response = await empVehicleDao.employeeListing(params);
        return empVehicleConstant.MESSAGES.SUCCESS.USER_LIST(response);
        // } else {
        // 	return Promise.reject(empVehicleConstant.MESSAGES.ERROR.SEARCH_KEY_LENGTH);
        // }

    } catch (error) {
        throw error;
    }
};

/**
 * @param params
 * Employee list for dummy testing purpose
 */
const empList = async function (params: TokenData) {
    try {
        let response: any = {};
        response = await empVehicleDao.empList(params);
        return empVehicleConstant.MESSAGES.SUCCESS.EMP_LIST(response);
    } catch (error) {
        throw error;
    }
};

/**
 * @function profile
 */
const profile = async function (params: TokenData) {
    try {
        // if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || params.permission.indexOf("profile") !== -1) {
        //     let step1 = await empVehicleDao.findUserProfile(params);
        //     return empVehicleConstant.MESSAGES.SUCCESS.PROFILE(step1);
        // } else {
        //     return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        // }
        let step1 = await empVehicleDao.findUserProfile(params);
        return empVehicleConstant.MESSAGES.SUCCESS.PROFILE(step1);
    } catch (error) {
        throw error;
    }
};

/**
 * @function _addUserOnImport
 */
const _addUserOnImport = async function (params) {
    let step1 = await empVehicleDao.findUserByEmailOrMobileNo(params);
    if (!step1) {
        return await empVehicleDao.addUser(params);
    } else {
        return await empVehicleDao.updateUser(params);
    }
};

/**
 * @function _importXLSXFile
 */
const _importXLSXFile = async function (file) {
    let json = await xlsx.readAndParseXLSX(file);
    let parseJson = appUtils.readAndParseJSON(json);
    await parseJson.forEach(async (data) => {
        let step1 = await _addUserOnImport(data);
    });
    return empVehicleConstant.MESSAGES.SUCCESS.IMPORT_USER;
};

/**
 * @function _importCSVFile
 */
const _importCSVFile = async function (file) {
    let json = await csv.readAndParseCSV(file);
    let parseJson = appUtils.readAndParseJSON(json);
    await parseJson.forEach(async (data) => {
        let step1 = await _addUserOnImport(data);
    });
    return empVehicleConstant.MESSAGES.SUCCESS.IMPORT_USER;
};

// redirect to reset password page
const redirectToResetPassword = async function (params: ResetPasswordRequest) {
    try {
        let result = await tokenManager.verifyToken(params);
        let step1 = await empVehicleDao.checkExistingToken(result, params.accessToken);
        if (step1) {
            let userData = await empVehicleDao.isTokenExist(result);
            if (userData.forgetToken) {
                // EMPTY THE TOKEN
                let step1 = await empVehicleDao.emptyForgetToken(userData);
                return result;
            } else {
                result.response = config.CONSTANT.MESSAGES.ERROR.TOKEN_EXPIRED;
                return result;
            }
        } else {
            result.response = config.CONSTANT.MESSAGES.ERROR.TOKEN_EXPIRED;
            return result;
        }
    } catch (error) {
        return error;
    }
};

/**
 * @function importUsers
 */
const importUsers = async function (params: ImportUsersRequest) {
    try {
        if (
            params.type === config.CONSTANT.ADMIN_TYPE.ADMIN ||
            params.permission.indexOf("import_user") !== -1
        ) {
            let excelMime = mimeType.excel;
            switch (params.file.hapi.headers["content-type"]) {
                case config.CONSTANT.MIME_TYPE.XLSX:
                case excelMime[0].mimetype:
                    return _importXLSXFile(params.file);
                case config.CONSTANT.MIME_TYPE.XLS:
                case excelMime[1].mimetype:
                    return _importXLSXFile(params.file);
                case config.CONSTANT.MIME_TYPE.CSV1:
                case config.CONSTANT.MIME_TYPE.CSV2:
                case excelMime[2].mimetype:
                case excelMime[3].mimetype:
                    return _importCSVFile(params.file);
            }
        } else {
            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        }
    } catch (error) {
        throw error;
    }
};

// Update home address of employee
const updateHomeAddress = async function (params: HomeAddressRequest) {
    try {
        // let source: any = {};
        // let destination: any = {};
        // let step1 = await empVehicleDao.findUserById(params);
        // source = step1.dropoff.coordinates;
        // await empVehicleDao.checkAlreadyRequest(params);
        // await appUtils.getDistanceTime(source, params).then(function (data) {
        // 	console.log("data Home locatipon update =========" + JSON.stringify(data));
        // 	let distance = data['distance'];
        // 	let duration = data['duration'];
        // 	let fdistance = distance.split(" ", 1);
        // 	let fduration = duration.split(" ", 1);
        // 	params.distance = data['distanceValue'];
        // 	params.estimatedTime = data['durationValue'];
        // 	params.durationMinute = data['duration'];
        // 	params.distKm = data['distance'];
        // 	let step = empVehicleDao.updateHomeAddress(params);
        // });
        let step = await empVehicleDao.updateHomeAddress(params);
        let step2 = await empVehicleDao.findUserById(params);
        return empVehicleConstant.MESSAGES.SUCCESS.EMP_HOME_ADDRESS({"data": step2});
    } catch (error) {
        throw error;
    }
};
// Update driver info
// const updateDriver = async function (params: DriverUpdateRequest, tokenData: TokenData) {
// 	try {
// 		if (
// 			tokenData.type === config.CONSTANT.ADMIN_TYPE.ADMIN ||
// 			tokenData.permission.indexOf("driver") !== -1
// 		) {
// 			let step1 = await empVehicleDao.updateDriver(params);
// 			step1.moduleName = config.CONSTANT.MODULE_KEY.DRIVER;
// 			step1.message = "Personal information of" + " " + step1.name + " " + "is updated";
// 			let step2 = await auditLogDao.addLog(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.EDIT);
// 			return empVehicleConstant.MESSAGES.SUCCESS.DRIVER_UPDATE;
// 		} else {
// 			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
// 		}
// 	} catch (error) {
// 		throw error;
// 	}
// };
// Update employee info

/**
 * @author Utkarsh Patil 17/07/2020
 * @description Update employee data
 */
const updateEmp = async function (params: EmpUpdateRequest, tokenData: TokenData) {
    try {
        if (
            tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
            tokenData.permission.indexOf("emp_vehicle") !== -1
        ) {
            // params.userId = params.empId;
            // console.log(tokenData);
            let emailExistCheck = await empVehicleDao.isEmpEmailByIdExists(params);
            // Made employeeId check possible only when employeeId is given  Aashiq - 24/08/2020
            // let isExist = await empVehicleDao.isEmployeeIdAlreadyExistsUpdate(params);
            if (params.employeeId) {
                let isExist = await empVehicleDao.isEmployeeIdAlreadyExistsUpdate(params);
            }
            let step1 = await empVehicleDao.updateEmp(params);
            // Added cond for  vehicles key check Aashiq - 24/08/2020
            // if (params.vehicles.length > 0) {
            if (params.vehicles && params.vehicles.length > 0) {
                let regNoArr = params.vehicles.map(a => a.regNo);
                // let isRegNoExist = await empVehicleDao.isRegistrationNoUniqueForUpdate(regNoArr);
                // Added check for regNo Aashiq - 31/08/2020
                for (let i = 0; i < params.vehicles.length; i++){
                    if (params.vehicles[i].vehicleId){
                        let obj: VehicleUpdateRequest = {
                           regNo: params.vehicles[i].regNo,
                            vehicleId: params.vehicles[i].vehicleId
                        };
                        let isRegNoExist = await empVehicleDao.isRegistrationNoUniqueForUpdate(obj);
                    }else{
                        let regNoA: IsRegistrationNoUnique = {
                            registrationNo: params.vehicles[i].regNo
                        };
                        let isExists = await empVehicleDao.isRegistrationNoUnique(regNoA);
                        if (isExists){
                            return Promise.reject(empVehicleConstant.MESSAGES.ERROR.REGISTRATION_NO_EXIST);
                        }
                    }
                }
                for (let i = 0; i < regNoArr.length; i++) {
                    if (!config.CONSTANT.REGEX.REGNO.test(regNoArr[i])) {
                        return Promise.reject(config.CONSTANT.VALIDATION_MESSAGE.regNo["pattern"]);
                    }
                }
                params.vehicles.forEach(async element => {
                    if (element.vehicleType !== config.CONSTANT.VEHICLE_TYPE.CAR && element.vehicleType !== config.CONSTANT.VEHICLE_TYPE.BIKE) {
                        return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_VEHICLE);
                    }
                    if (element.vehicleId) {
                        element.userId = step1._id;
                        // element.createdBy = params.createdBy;
                        // element.companyId = params.companyId;
                        let step3 = await empVehicleDao.updateVehicle(element);
                        step3.moduleName = config.CONSTANT.MODULE_KEY.VEHICLE;
                        step3.message = "Vehicle" + " " + element.regNo + " " + "is updated";
                        let step4 = await auditLogDao.addLog(step3, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.EDIT);
                    } else {
                        element.userId = step1._id;
                        element.createdBy = tokenData.userId;
                        element.companyId = tokenData.companyId;
                        element.regNo = element.regNo.toUpperCase();
                        let step3 = await empVehicleDao.createVehicleData(element);
                        step3.moduleName = config.CONSTANT.MODULE_KEY.VEHICLE;
                        step3.message = "New vehicle" + " " + element.regNo + " " + "is added";
                        let step4 = await auditLogDao.addLog(step3, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
                    }
                });
            }
            let step5 = await promise.join(params, step1);
            step5[0].moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;
            step5[0].message = "Personal information of" + " " + step1.name + " " + "is updated";
            let step4 = await auditLogDao.addLog(step5[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.EDIT);
            return empVehicleConstant.MESSAGES.SUCCESS.EMP_UPDATE;
        } else {
            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @author Utkarsh Patil 17/07/2020
 * @description Update vehicle data
 */
const updateVehicle = async function (params: VehicleUpdateRequest, tokenData: TokenData) {
    try {
        if (
            tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
            tokenData.permission.indexOf("emp_vehicle") !== -1
        ) {
            // params.userId = params.empId;
            // console.log(tokenData);
            let registrationNoExist = await empVehicleDao.isRegistrationNoUniqueForUpdate(params);
            let vehicleIdExist = await empVehicleDao.isVehicleIdExist(params);
            let step1 = await empVehicleDao.updateVehicle(params);
            let step5 = await promise.join(params, step1);
            step5[0].moduleName = config.CONSTANT.MODULE_KEY.VEHICLE;
            step5[0].message = "New vehicle" + " " + step1.regNo + " " + "is added";
            let step4 = await auditLogDao.addLog(step5[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.EDIT);
            // let finalData =  await promise.join(step1, data);
            return empVehicleConstant.MESSAGES.SUCCESS.VEHICLE_UPDATE;
        } else {
            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @author Utkarsh Patil 20/07/2020
 * @description Update vehicle data
 */
const showcaseDemoApi = async function (params: VehicleUpdateRequest, tokenData: TokenData) {
    try {
        if (
            tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
            tokenData.permission.indexOf("emp_vehicle") !== -1
        ) {
            let showcaseData: any = await empVehicleDao.demoShowcaseApi();
            return empVehicleConstant.MESSAGES.SUCCESS.VEHICLE_UPDATE_DEMO({"data": JSON.parse(showcaseData)});
        } else {
            return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
        }
    } catch (error) {
        throw error;
    }
};

/**
 * Contact to admin any query
 */
const contactAdmin = async function (params: UserQueryRequest) {
    try {
        params.created = Date.now();
        let step2 = await empVehicleDao.contactAdmin(params);
        return empVehicleConstant.MESSAGES.SUCCESS.CONTACT_ADMIN;
    } catch (error) {
        throw error;
    }
};

/**
 * @function bulkDriverSignup
 */
// const bulkDriverSignup = async function (params: DriverSignupRequest) {
// 	try {
// 		let driverArr = [];
// 		let mailArr = [];
// 		let coordinate, type;
// 		let adminCompany = await adminDao.findAdminById(params);
// 		// let json: any = await csv.readAndParseCSV(params.file); // for csv file
// 		let json: any = await xlsx.readAndParseXLSX(params.file);
// 		for (let item of json) {
// 			let step1 = await empVehicleDao.isEmailAlreadyExists(item);
// 			let isMobileExist = await empVehicleDao.isMobileNoUnique({ 'mobileNo': item.mobileNo.toString() });
// 			if (isMobileExist)
// 				return Promise.reject(empVehicleConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
// 			let password = await appUtils.generatePassword();
// 			// if (!/[^a-z]/i.test(item.name) === false) {
// 			// 	return Promise.reject(empVehicleConstant.MESSAGES.ERROR.CAHRACTER_ALLOWED);
// 			// }
// 			if (! /^[a-zA-Z ]+$/.test(item.name)) {
// 				return Promise.reject(empVehicleConstant.MESSAGES.ERROR.CAHRACTER_ALLOWED);
// 			}
// 			if (_.isNumber(item.mobileNo) === false) {
// 				return Promise.reject(empVehicleConstant.MESSAGES.ERROR.NUMBER_ALLOWED);
// 			}
// 			if (_.isNumber(item.emergencyNo) === false) {
// 				return Promise.reject(empVehicleConstant.MESSAGES.ERROR.NUMBER_ALLOWED);
// 			}
// 			if (! /^[0-9]{10}$/.test(item.mobileNo)) {
// 				return Promise.reject(empVehicleConstant.MESSAGES.ERROR.MOBILE_NUMBER_LENGETH);
// 			}
// 			if (! /^[0-9]{10}$/.test(item.emergencyNo)) {
// 				return Promise.reject(empVehicleConstant.MESSAGES.ERROR.MOBILE_NUMBER_LENGETH);
// 			}
// 			if (!item.email || !item.DlBadgeNO || !item.dlRenewalDate || !item.mobileNo || !item.countryCode || !item.name) {
// 				return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_DATA);
// 			}

// 			let randomenumber = "D" + Math.floor(Math.random() * 100000) + 8;
// 			let salt = bcrypt.genSaltSync(config.SERVER.SALT_ROUNDS);
// 			// let salt = this.salt = appUtils.genRandomString(config.SERVER.SALT_ROUNDS);
// 			let hash = appUtils.encryptHashPassword(password, salt);
// 			if (item.dlRenewalDate)
// 				item.dlRenewalDate = new Date(item.dlRenewalDate).getTime();
// 			let obj = {
// 				salt: salt,
// 				hash: hash,
// 				dropoff: adminCompany.companyAddress,
// 				driverId: randomenumber,
// 				dlRenewalDate: item.dlRenewalDate,
// 				DlBadgeNO: item.DlBadgeNO,
// 				backgroundVarified: item.backgroundVarified,
// 				email: item.email,
// 				name: item.name,
// 				countryCode: item.countryCode,
// 				mobileNo: item.mobileNo.toString(),
// 				emergencyNo: item.emergencyNo.toString(),
// 				// emergencyNo:item.emergencyNo.toString(),
// 				// password: password,
// 				createdBy: params.userId,
// 				companyCode: params.companyCode,
// 				userType: config.CONSTANT.USER_TYPE.DRIVER,
// 				type: params.type,
// 				created: Date.now(),
// 				status: config.CONSTANT.STATUS.UN_BLOCKED
// 			};
// 			let isExistInRequest = await _.find(driverArr, (obj) => { return (obj.email === item.email || obj.mobileNo === item.mobileNo.toString()); });
// 			if (isExistInRequest) {
// 				return Promise.reject(empVehicleConstant.MESSAGES.ERROR.DUPLICATE_DRIVER_DATA);
// 			}
// 			else {
// 				driverArr.push(obj);
// 				mailArr.push({ name: obj.name, email: obj.email, password: password, companyCode: obj.companyCode });
// 			}
// 		}
// 		let step2 = await empVehicleDao.bulkEmpSignup(driverArr);
// 		for (let mail of mailArr) {
// 			let step3 = mailManager.sendSignupPasswordEmail(mail);
// 		}
// 		return empVehicleConstant.MESSAGES.SUCCESS.IMPORT_USER;
// 	} catch (error) {
// 		throw error;
// 	}
// };

/**
 * Employee Shift Listing
 */
// const empShiftList = async function (params: EmpShiftListing) {
// 	try {
// 		let response: any = {};
// 		response = await empVehicleDao.empShiftList(params);
// 		return empVehicleConstant.MESSAGES.SUCCESS.EMP_WEEKOFF_LIST(response);
// 	} catch (error) {
// 		throw error;
// 	}
// };
// Update employee shift
// const updateEmpShift = async function (params: EmpShiftUpdateRequest) {
// 	try {
// 		console.log('params: ', params);
// 		let empProfileObj: any = {};
// 		empProfileObj.userId = params.employeeId;
// 		if (params.weekOff)
// 			empProfileObj.weekOff = params.weekOff;
// 		if (params.shiftName) {
// 			let adminCompany = await adminDao.findAdminById(params);
// 			for (let shiftItem of adminCompany.shiftSlot) {
// 				if (shiftItem.shiftName === params.shiftName)
// 					console.log('shiftItem: ', shiftItem);
// 				empProfileObj.shift = params.shiftName;
// 				empProfileObj.shiftStartTime = shiftItem.startShift;
// 				empProfileObj.shiftEndTime = shiftItem.endShift;
// 			}
// 		}
// 		console.log('empProfileObj: ', empProfileObj);
// 		let empUpdate = await empVehicleDao.updateEmpShift(params);
// 		return empVehicleConstant.MESSAGES.SUCCESS.EMP_SHIFT_UPDATE;
// 	} catch (error) {
// 		throw error;
// 	}
// };

/**
 * @function addressChangeRequest
 */
// const addressChangeRequest = async function (params: IsAddressChangeRequest) {
// 	try {
// 		if (
// 			params.type === config.CONSTANT.ADMIN_TYPE.ADMIN ||
// 			params.permission.indexOf("employee") !== -1
// 		) {
// 			let result = await empVehicleDao.addressChangeRequest(params);
// 			return result;
// 		} else {
// 			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
// 		}
// 	} catch (error) {
// 		throw error;
// 	}
// };
/**
 * @function isMobileNoUnique
 * @param params mobileNo
 */
const isMobileNoUnique = async function (params: IsMobileNoUnique) {
    try {
        let response: any = {};
        let step = await empVehicleDao.isMobileNoUnique(params);
        if (step) {
            return empVehicleConstant.MESSAGES.ERROR.MOBILE_NO_EXIST;
        } else {
            return empVehicleConstant.MESSAGES.SUCCESS.IS_MOBILE_NO;
        }

    } catch (error) {
        throw error;
    }
};
const userVehicleList = async function (params: VehicleListForUser){
    try {
        let response: any = {};
        let step = await empVehicleDao.userVehicleList(params);
        return empVehicleConstant.MESSAGES.SUCCESS.VEHICLE_LIST(step);
        // if (step) {
        //     // return empVehicleConstant.MESSAGES.ERROR.MOBILE_NO_EXIST;
        // } else {
        //     // return empVehicleConstant.MESSAGES.SUCCESS.IS_MOBILE_NO;
        // }

    } catch (error) {
        throw error;
    }
};
const userAddVehicle = async function (params: Vehicle){
    console.log(params);
    try {
        let response: any = {};
        let isRegNoExist = await empVehicleDao.isVehicleRegistrationNoUnique(params.regNo.toUpperCase());
        // let step = await empVehicleDao.userAddVehicle(params);
        console.log(isRegNoExist);
        console.log(config.CONSTANT.REGEX.REGNO.test(params.regNo));
        if (isRegNoExist === 0){
            if (config.CONSTANT.REGEX.REGNO.test(params.regNo)){
                if (params.vehicleType !== config.CONSTANT.VEHICLE_TYPE.CAR && params.vehicleType !== config.CONSTANT.VEHICLE_TYPE.BIKE) {
                    return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_VEHICLE);
                }
                let vehicleData = {
                    regNo: params.regNo.toUpperCase(),
                    modal: params.modal,
                    vehicleType: params.vehicleType,
                    userId: params.userId,
                    companyId: params.companyId,
                    createdBy: params.userId
                };
                let step = await empVehicleDao.createVehicleData(vehicleData);
                if (step){
                    return empVehicleConstant.MESSAGES.SUCCESS.SIGNUP_VEHICLE;
                }
            } else {
                return Promise.reject(config.CONSTANT.VALIDATION_MESSAGE.regNo["pattern"]);
            }
        } else {
            return Promise.reject(empVehicleConstant.MESSAGES.ERROR.REGISTRATION_NO_EXIST);
        }
    } catch (error) {
        throw error;
    }
};
const userUpdateVehicle = async function (params: VehicleUpdateRequest) {
    try {
        // params.userId = params.empId;
        // console.log(tokenData);
        // let registrationNoExist = await empVehicleDao.isRegistrationNoUniqueForUpdate(params);
        // let vehicleIdExist = await empVehicleDao.isVehicleIdExist(params);
        // let step1 = await empVehicleDao.updateVehicle(params);
        // let step5 = await promise.join(params, step1);
        // step5[0].moduleName = config.CONSTANT.MODULE_KEY.VEHICLE;
        // step5[0].message = "New vehicle" + " " + step1.regNo + " " + "is added";
        // let step4 = await auditLogDao.addLog(step5[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.EDIT);
        // let finalData =  await promise.join(step1, data);
        // return empVehicleConstant.MESSAGES.SUCCESS.VEHICLE_UPDATE;
        let vehicleIdExist = await empVehicleDao.isVehicleIdExist(params);
        let isRegNoExist = await empVehicleDao.isRegistrationNoUniqueForUpdate(params);
        let step1 = await empVehicleDao.updateVehicle(params);
        console.log(step1);
        if (step1){
            console.log("true");
            return empVehicleConstant.MESSAGES.SUCCESS.VEHICLE_UPDATE;
        }
    } catch (error) {
        throw error;
    }
};

const getBookedSpots = async function (params: TokenData) {
    try {
        let response: any = {};
        response = await empVehicleDao.bookedSpots(params);
        return empVehicleConstant.MESSAGES.SUCCESS.BOOKED_SPOTS(response);
    } catch (error) {
        throw error;
    }
};

export let empVehicleController = {
    login,
    forgotPassword,
    changeForgotPassword,
    refreshToken,
    logout,
    userList,
    empVehicleSignup,
    vehicleSignup,
    emmloyeeListing,
    // userlist with approved address - satyam
    userListCurrent,
    exportUser,
    blockUnblockEmployee,
    blockUnblockVehicle,
    multiBlockUnblock,
    userDetails,
    profile,
    importUsers,
    changePassword,
    redirectToResetPassword,
    updateHomeAddress,
    updateEmp,
    contactAdmin,
    empList,
    bulkEmpVehicleSignup,
    bulkVehicleSignup,
    employeeById,
    isMobileNoUnique,
    empForGroup,
    vehicleList,
    vehicleDetails,
    updateVehicle,
    showcaseDemoApi,
    // vehicle list -- satyam
    userVehicleList,
    userAddVehicle,
    userUpdateVehicle,
    getBookedSpots
};
