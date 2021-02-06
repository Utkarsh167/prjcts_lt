"use strict";

import * as _ from "lodash";

import { AdminDao } from "@modules/v1/admin/AdminDao";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as csv from "@lib/csv";
import { MailManager, RedisClient } from "@lib/index";
import * as tokenManager from "@lib/tokenManager";
import * as shiftRequestConstant from "@modules/v1/shiftRequest/shiftRequestConstant";
import { ShiftRequestDao } from "@modules/v1/shiftRequest/index";
import { LoginHistoryDao } from '@modules/v1/loginHistory/LoginHistoryDao';
import * as pushManager from "@lib/pushNotification/pushManager";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as bcrypt from "bcrypt";
import * as pushNotification from '@utils/pushNotification';
import * as moment from "moment";
import * as xlsx from "@lib/xlsx";
import { CabRouteDao, routeMapper } from "@modules/v1/route/index";
import { logger } from "@lib/logger";
const distFrom = require('distance-from');

let adminDao = new AdminDao();
let mailManager = new MailManager();
let redisClient = new RedisClient();
let shiftRequestDao = new ShiftRequestDao();
let loginHistoryDao = new LoginHistoryDao();
let baseDao = new BaseDao();
let cabRouteDao = new CabRouteDao();

/**
 * Adding new shift change request
 */
const addShiftRequest = async function (params: ShiftRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("shift") !== -1
		) {
			let shiftRequest = await shiftRequestDao.addShiftRequest(params);
			return shiftRequestConstant.MESSAGES.SUCCESS.SHIFT_REQUEST;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function bulkShiftRequest
 */
const bulkShiftRequest = async function (params: BulkShiftUpdateRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("shift") !== -1
		) {
			let shiftReqArr: any = [];
			let requestArr = [];
			// let json: any = await csv.readAndParseCSV(params.file); // for csv file
			let json: any = await xlsx.readAndParseXLSX(params.file);
			// console.log('json: ', json);
			let dbRequests = await baseDao.find("shift_request", {}, {}, {});
			let admin = await adminDao.findAdminById({ userId: params.userId });
			// console.log('dbRequests: ', dbRequests);
			for (let item of json) {
				let validFrom;
				let validTill;
				if (!item.employeeId || (!item.shiftName && !item.monday && !item.tuesday && !item.wednesday && !item.thursday && !item.friday && !item.saturday) || (item.shiftName && (!item.validFrom || !item.validTill))) {
					return Promise.reject(shiftRequestConstant.MESSAGES.ERROR.INVALID_REQUEST_DATA);
				}
				let employee = await baseDao.findOne("users", { "employeeId": item.employeeId.toString(), "isAddressChange":  true }, {}, {});
				if (!employee) {
					return Promise.reject(shiftRequestConstant.MESSAGES.ERROR.EMPLOYEE_NOT_FOUND);
				}
				let shiftSlot = admin.shiftSlot;
				let shiftObj = await _.find(shiftSlot, (obj) => { return obj.shiftName === item.shiftName; });
				if (!shiftObj) {
					return Promise.reject(shiftRequestConstant.MESSAGES.ERROR.SHIFT_NOT_FOUND);
				}
				// Start of office to employee max distance check code ----------------------------------------------------------
				let distance = distFrom([admin.companyAddress.coordinates[1], admin.companyAddress.coordinates[0]]).to([employee.pickup.coordinates[1], employee.pickup.coordinates[0]]);
				if (distance.distance.v > admin.maxGroupRadius) {
					// console.log('###skipped employee with distance: ', distance.distance.v);
					continue;
					// return Promise.reject(shiftRequestConstant.MESSAGES.ERROR.MAX_GROUP_RADIUS_EXCEEDS);
				}
				// End of office to employee max distance check code ------------------------------------------------------------------------------------------------
				// console.log('distance.distance.v: ', distance.distance.v);
				let shiftReqObj: any = {
					employeeId: item.employeeId.toString(),
					createdBy: params.userId,
					adminType: params.adminType,
					companyCode: params.companyCode,
					weekOff: [],
					status: config.CONSTANT.REQUEST_STATUS.REQUESTED,
					name: employee.name,
					email: employee.email,
					// Gender -- satyam
					gender: employee.gender
				};
				if (item.validFrom && item.validTill) {
					// let momentDate = parseInt(moment().add(3, 'days').startOf('day').subtract({ 'hours': 5, 'minutes': 30 }).format('x'));
					// validation 1 day -- satyam
					let momentDate = parseInt(moment().add(1, 'days').startOf('day').subtract({ 'hours': 5, 'minutes': 30 }).format('x'));
					// console.log('momentDate: ', momentDate);
					// validFrom - satyam
					validFrom = new Date(item.validFrom.toString().replace(/[^0-9/-]/g, '').replace(/-/g, '/')).getTime();
					// console.log('converted validFrom: ', validFrom);
					if (validFrom < momentDate) {
						return Promise.reject(shiftRequestConstant.MESSAGES.ERROR.INVALID_START_DATE);
					}
					validTill = new Date(item.validTill.toString().replace(/[^0-9/-]/g, '').replace(/-/g, '/')).getTime();
					// console.log('converted validTill: ', validFrom);
					let isExistInDb = await _.find(dbRequests, (obj) => { return (obj.employeeId === item.employeeId.toString() && obj.validTill >= validFrom && obj.status === config.CONSTANT.REQUEST_STATUS.REQUESTED); });
					if (isExistInDb)
						return Promise.reject(shiftRequestConstant.MESSAGES.ERROR.REQUEST_EXIST);
					let isExistInRequest = await _.find(shiftReqArr, (obj) => { return (obj.employeeId === item.employeeId && obj.validTill >= validFrom); });
					if (isExistInRequest)
						return Promise.reject(shiftRequestConstant.MESSAGES.ERROR.MULTIPLE_REQUEST);
					shiftReqObj.shiftName = item.shiftName;
					shiftReqObj.validFrom = validFrom;
					shiftReqObj.validTill = validTill;
				}
				else {
					return Promise.reject(shiftRequestConstant.MESSAGES.ERROR.INVALID_REQUEST_DATA);
				}
				if (item.monday)
					shiftReqObj.weekOff.push(config.CONSTANT.DAY_TYPE.MONDAY);
				if (item.tuesday)
					shiftReqObj.weekOff.push(config.CONSTANT.DAY_TYPE.TUESDAY);
				if (item.wednesday)
					shiftReqObj.weekOff.push(config.CONSTANT.DAY_TYPE.WEDNESDAY);
				if (item.thursday)
					shiftReqObj.weekOff.push(config.CONSTANT.DAY_TYPE.THURSDAY);
				if (item.friday)
					shiftReqObj.weekOff.push(config.CONSTANT.DAY_TYPE.FRIDAY);
				if (item.saturday)
					shiftReqObj.weekOff.push(config.CONSTANT.DAY_TYPE.SATURDAY);
				if (item.sunday)
					shiftReqObj.weekOff.push(config.CONSTANT.DAY_TYPE.SUNDAY);
				// console.log('shiftReqObj: ', shiftReqObj);
				shiftReqArr.push(shiftReqObj);
			}
			// console.log('shiftReqArr: ', shiftReqArr);
			let step2 = await shiftRequestDao.bulkShiftRequest(shiftReqArr);
			return shiftRequestConstant.MESSAGES.SUCCESS.IMPORT_SHIFT_REQUEST;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * ShiftRequest list
 */
const shiftRequestList = async function (params: ShiftRequestListing) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("shift") !== -1
		) {
			let step1 = await adminDao.findAdminById(params);
			if (
				step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
				step1.permission.indexOf("shift") !== -1
			) {
				let response: any = {};
				let step2 = await shiftRequestDao.shiftRequestList(params).then(function (result) {
					response.shiftRequestList = result[0];
					response.totalCount = result[1] || 0;
				});
				return shiftRequestConstant.MESSAGES.SUCCESS.SHIFT_REQUEST_LIST(response);
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
 * WeekOff change request
 */
const weekOffRequestList = async function () {
	try {
		let admins = await baseDao.find("admins", { "adminType": 'admin', "status": { "$ne": 'deleted' } }, {}, {});
		for (let admin of admins) {
			let nextDate = moment().utcOffset("+05:30").add(1, "days").format("DD-MM-YYYY");
			let requestQuery = { "shiftName": { "$exists": false }, "companyCode": admin.companyCode, "status": config.CONSTANT.REQUEST_STATUS.REQUESTED };
			// time- check -- satyam
			let requestToUpdate = await baseDao.find("shift_request", requestQuery, {}, {});
			let requestToUpdateNew =  [];
				requestToUpdate.map( r => {
					let from_date_str = moment(r.validFrom).utcOffset("+05:30").format("DD-MM-YYYY");
					if ( from_date_str === nextDate ){
							requestToUpdateNew.push(r);
					}
			});
			console.log("requestToUpdateNew" + requestToUpdateNew);
			requestToUpdate = requestToUpdateNew;
			for (let rtu of requestToUpdate) {
				let roster = await baseDao.updateMany("roasters", { "route.employees.employeeId": rtu.employeeId, "companyCode": admin.companyCode, "rideStarted": false, "rideCompleted": false },
					{ "$set": { "route.employees.$.weekOff": rtu.weekOff } }, { new: true });
				let route = await baseDao.updateMany("cab_routes", { "employees.employeeId": rtu.employeeId, "companyCode": admin.companyCode }, { "$set": { "employees.$.weekOff": rtu.weekOff } }, { new: true });
				let employee = await baseDao.update("users", { "employeeId": rtu.employeeId, "companyCode": admin.companyCode }, { "$set": { "weekOff": rtu.weekOff } }, { new: true });
				let shift_request = await baseDao.update("shift_request", { "_id": rtu._id }, { "$set": { "status": config.CONSTANT.REQUEST_STATUS.CURRENT } }, { new: true });
			}
		}
	} catch (error) {
		throw error;
	}
};

/**
 * checkShiftChange
 */
const checkShiftChange = async function () {
	try {
		let admins = await baseDao.find("admins", { "adminType": 'admin', "status": { "$ne": 'deleted' } }, {}, {});
		console.log('admins.length > 0: ', admins.length > 0);
		if (admins.length > 0) {
			for (let admin of admins) {
				let empForIndividalGroup: any = [];
				let empForAdjustment: any = [];
				let currentShiftRequest: any = [];
				let newShiftRequest: any = [];
				let grpToDlt: any = [];
				let updatedGroups: any = [];
				let nextDateString = moment().utcOffset("+05:30").add(1, "days").format("DD-MM-YYYY");
				let prevDateString = moment().utcOffset("+05:30").subtract(2, "days").format("DD-MM-YYYY");
				let requestToUpdate = await baseDao.find("shift_request", {}, {}, {});
				console.log('requestToUpdate: ', requestToUpdate);
				console.log('nextDate', nextDateString);
				console.log('prvDate', prevDateString);
				logger.info ("shift controller prevdateString" + prevDateString);
				logger.info ("shift controller nextDateString" + nextDateString);
				logger.info ("date time shift controller" + new Date().toLocaleDateString);
				let requestToUpdateNew =  [];
				requestToUpdate.map( r => {
					let from_date_str = moment(r.validFrom).utcOffset("+05:30").format("DD-MM-YYYY");
					let till_date_str = moment(r.validTill).utcOffset("+05:30").format("DD-MM-YYYY");
					logger.info ( "shift controller requestToUpdate from date to till date" + from_date_str + till_date_str);
					console.log("from_date_str:" + from_date_str);
					console.log("till_date_str:" + till_date_str);
					if ( from_date_str === nextDateString && r.status === config.CONSTANT.REQUEST_STATUS.REQUESTED){
							requestToUpdateNew.push(r);
					}else if ( till_date_str === prevDateString && r.status === config.CONSTANT.REQUEST_STATUS.CURRENT ) {
							requestToUpdateNew.push(r);
					}
			});
			console.log("requestToUpdateNew" + requestToUpdateNew);
			requestToUpdate = requestToUpdateNew;

				let empIdArr = requestToUpdate.map(r => { return r.employeeId; });
				if (requestToUpdate.length > 0) {
					for (let rtu of requestToUpdate) {
						if (rtu.status === config.CONSTANT.REQUEST_STATUS.REQUESTED)
							newShiftRequest.push(rtu._id);
						else if (rtu.status === config.CONSTANT.REQUEST_STATUS.CURRENT)
							currentShiftRequest.push(rtu._id);
						let empGroups = await baseDao.find("cab_routes", { "employees.employeeId": rtu.employeeId }, {}, {});
						// console.log('empGroups: ', empGroups);
						if (empGroups.length > 0) {
							for (let eg of empGroups) {
								let algoReqObj: any = {};
								let officeLocation: any = {};
								algoReqObj.groups = [];
								officeLocation.lat = admin.companyAddress.coordinates[1];
								officeLocation.long = admin.companyAddress.coordinates[0];
								algoReqObj.waitTime = eg.waitTime;
								algoReqObj.officeLocation = officeLocation;
								algoReqObj.maxTripDuration = eg.maxTripDuration;
								algoReqObj.groups = [];
								let groupObj: any = {};
								groupObj.grpDbId = eg._id;
								groupObj.grpId = eg.grpId;
								groupObj.grpCentre = eg.employees[0].empLocation;
								groupObj.shiftName = eg.shiftName;
								groupObj.shiftType = eg.shiftType;
								groupObj.shiftTime = eg.shiftTime;
								groupObj.waitTime = eg.waitTime;
								groupObj.maxTripDuration = eg.maxTripDuration;
								groupObj.maxGroupSize = eg.maxGroupSize;
								let employees = [];
								// console.log('4444444444444444 eg: ', eg);
								if (eg.employees.length > 0) {
									for (let e of eg.employees) {
										// console.log('0000000000000000000000');
										let obj = {
											"empId": e.empId,
											"empLocation": e.empLocation,
											"weekOff": e.weekOff,
											"name": e.name,
											"employeeId": e.employeeId,
											"countryCode": e.countryCode,
											"mobileNo": e.mobileNo,
											"address": e.address,
											// Added gender - Shivakumar A
											"gender": e.gender
										};
										if (rtu.employeeId === e.employeeId) {
											// console.log('111111111111111111111');
											if (rtu.status === config.CONSTANT.REQUEST_STATUS.CURRENT) {
												// console.log('22222222222222222222222222');
												let groupObj1: any = { ...groupObj };
												let employees1 = [];
												if (rtu.weekOff && rtu.weekOff.length > 0)
													obj.weekOff = rtu.weekOff;
												employees1.push(obj);
												groupObj1.empCount = employees1.length;
												groupObj1.employees = employees1;
												empForIndividalGroup.push(groupObj1);
												let algoReqObj: any = {};
												let officeLocation: any = {};
												algoReqObj.groups = [];
												officeLocation.lat = admin.companyAddress.coordinates[1];
												officeLocation.long = admin.companyAddress.coordinates[0];
												algoReqObj.waitTime = groupObj1.waitTime;
												algoReqObj.officeLocation = officeLocation;
												algoReqObj.maxTripDuration = groupObj1.maxTripDuration;
												algoReqObj.groups = [];
												let groupObj2: any = {};
												groupObj2.grpId = groupObj1.grpId;
												groupObj2.grpCentre = groupObj1.employees[0].empLocation;
												groupObj2.shiftName = groupObj1.shiftName;
												groupObj2.shiftType = groupObj1.shiftType;
												groupObj2.shiftTime = groupObj1.shiftTime;
												groupObj2.waitTime = groupObj1.waitTime;
												groupObj2.maxTripDuration = groupObj1.maxTripDuration;
												groupObj2.maxGroupSize = groupObj1.maxGroupSize;
												let employees = [];
												let newEmpObj = {
													"empId": groupObj1.employees[0].empId,
													"empLocation": groupObj1.employees[0].empLocation,
													"weekOff": groupObj1.employees[0].weekOff,
													"name": groupObj1.employees[0].name,
													"employeeId": groupObj1.employees[0].employeeId,
													"countryCode": groupObj1.employees[0].countryCode,
													"mobileNo": groupObj1.employees[0].mobileNo,
													"address": groupObj1.employees[0].address,
													// Added gender - Shivakumar A
													"gender": groupObj1.employees[0].gender
												};
												employees.push(newEmpObj);
												groupObj2.empCount = employees.length;
												groupObj2.employees = employees;
												algoReqObj.groups.push(groupObj2);
												let routeAlgoEta1 = await cabRouteDao.routingAlgoETA(algoReqObj, admin);
												if (routeAlgoEta1.length > 0) { let newGroup = await adminDao.save("cab_routes", routeAlgoEta1[0]); }
											}
											else if (rtu.status === config.CONSTANT.REQUEST_STATUS.REQUESTED) {
												let shiftTiming = admin.shiftSlot.filter(s => { return s.shiftName === rtu.shiftName; });
												let groupObj2: any = { ...groupObj };
												let employees2 = [];
												if (rtu.weekOff && rtu.weekOff.length > 0)
													obj.weekOff = rtu.weekOff;
												employees2.push(obj);
												groupObj2.empCount = employees2.length;
												groupObj2.employees = employees2;
												groupObj2.shiftName = shiftTiming[0].shiftName;
												if (eg.shiftType === "login") {
													groupObj2.shiftType = eg.shiftType;
													groupObj2.shiftTime = shiftTiming[0].startShift;
												}
												else if (eg.shiftType === "logout") {
													groupObj2.shiftType = eg.shiftType;
													groupObj2.shiftTime = shiftTiming[0].endShift;
												}
												let empAlreadyExist = empForAdjustment.some(emp => emp.employees[0].employeeId === e.employeeId);
												if (!empAlreadyExist)
													empForAdjustment.push(groupObj2);
											}
										}
										else {
											employees.push(obj);
										}
									}
									groupObj.empCount = employees.length;
									groupObj.employees = employees;
									if (groupObj.employees.length > 0)
										algoReqObj.groups.push(groupObj);
									else
										grpToDlt.push(groupObj.grpDbId);
									if (algoReqObj.groups.length > 0) {
										let routeAlgoEta1 = await cabRouteDao.routingAlgoETA(algoReqObj, admin);
										if (routeAlgoEta1.length > 0) {
											let query: any = {};
											query._id = routeAlgoEta1[0].grpDbId;
											let update = {};
											update["$set"] = {
												"grpCentre": routeAlgoEta1[0].grpCentre,
												"empCount": routeAlgoEta1[0].empCount,
												"employees": routeAlgoEta1[0].employees,
												"route": routeAlgoEta1[0].route,
												"bounds": routeAlgoEta1[0].bounds,
												"startLocation": routeAlgoEta1[0].startLocation,
												"endLocation": routeAlgoEta1[0].endLocation,
												"totalTripTime": routeAlgoEta1[0].totalTripTime
											};
											console.log(routeAlgoEta1[0]);
											// delete roasters -- satyam
											await baseDao.deleteMany("roasters", {'route.routeName': eg.routeName, 'rideStarted': false, 'rosterDate': {'$gt': moment().utcOffset("+05:30").format("x")}});
											 // let existingRosters = await baseDao.find("roasters", {'route.routeName': eg.routeName}, {}, {});
											// console.log("existingRoasters");
											// console.log(moment().utcOffset("+05:30").format("x"));
											// console.log(existingRosters.length);
											let updatedRoute = await baseDao.updateOne("cab_routes", query, update, {});
											updatedGroups.push(routeAlgoEta1[0].grpDbId);
										}
									}
								}
							}
						}
					}
				}
				if (grpToDlt.length > 0) {
					// delete roasters -- satyam
					let groupName = await baseDao.find("cab_routes", { "_id": { "$in": grpToDlt } }, { routeName: 1}, {});
					console.log(groupName);
					groupName.forEach(async element => {
						console.log(element.routeName);
						await baseDao.deleteMany("roasters", {'route.routeName': element.routeName , 'rideStarted': false, 'rosterDate': {'$gt': moment().utcOffset("+05:30").format("x")}});
					});
					await baseDao.deleteMany("cab_routes", { "_id": { "$in": grpToDlt } });
				}
				if (empForAdjustment.length > 0) {
					for (let [ii, efa] of empForAdjustment.entries()) {
						let matchedLogin: any = false;
						let matchedLogout: any = false;
						let potentialGroups = await baseDao.find("cab_routes", { "shiftName": efa.shiftName, $where: 'this.empCount < this.maxGroupSize' }, {}, {});
						if (potentialGroups.length > 0) {
							for (let [i, pg] of potentialGroups.entries()) {
								let distance = distFrom([pg.grpCentre.lat, pg.grpCentre.long]).to([efa.employees[0].empLocation.lat, efa.employees[0].empLocation.long]);
								if (distance.distance.v <= 3) {
									if ((pg.shiftType === 'login' && matchedLogin === true) || (pg.shiftType === 'logout' && matchedLogout === true))
										continue;
									if (matchedLogin === true && matchedLogout === true)
										break;
									if (pg.shiftType === 'login')
										matchedLogin = true;
									else if (pg.shiftType === 'logout')
										matchedLogout = true;
									let algoReqObj: any = {};
									let officeLocation: any = {};
									algoReqObj.groups = [];
									officeLocation.lat = admin.companyAddress.coordinates[1];
									officeLocation.long = admin.companyAddress.coordinates[0];
									algoReqObj.waitTime = pg.waitTime;
									algoReqObj.officeLocation = officeLocation;
									algoReqObj.maxTripDuration = pg.maxTripDuration;
									algoReqObj.groups = [];
									let groupObj: any = {};
									groupObj.grpDbId = pg._id;
									groupObj.grpId = pg.grpId;
									groupObj.grpCentre = pg.employees[0].empLocation;
									groupObj.shiftName = pg.shiftName;
									groupObj.shiftType = pg.shiftType;
									groupObj.shiftTime = pg.shiftTime;
									groupObj.waitTime = pg.waitTime;
									groupObj.maxTripDuration = pg.maxTripDuration;
									groupObj.maxGroupSize = pg.maxGroupSize;
									let employees = [];
									let newEmpObj = {
										"empId": efa.employees[0].empId,
										"empLocation": efa.employees[0].empLocation,
										"weekOff": efa.employees[0].weekOff,
										"name": efa.employees[0].name,
										"employeeId": efa.employees[0].employeeId,
										"countryCode": efa.employees[0].countryCode,
										"mobileNo": efa.employees[0].mobileNo,
										"address": efa.employees[0].address,
										// Added gender - Shivakumar A
										"gender": efa.employees[0].gender

									};
									employees.push(newEmpObj);
									for (let e of pg.employees) {
										let obj = {
											"empId": e.empId,
											"empLocation": e.empLocation,
											"weekOff": e.weekOff,
											"name": e.name,
											"employeeId": e.employeeId,
											"countryCode": e.countryCode,
											"mobileNo": e.mobileNo,
											"address": e.address,
											// Added gender - Shivakumar A
											"gender": e.gender
										};
										employees.push(obj);
									}
									groupObj.empCount = employees.length;
									groupObj.employees = employees;
									algoReqObj.groups.push(groupObj);
									let routeAlgoEta1 = await cabRouteDao.routingAlgoETA(algoReqObj, admin);
									if (routeAlgoEta1.length > 0) {
										let query: any = {};
										query._id = routeAlgoEta1[0].grpDbId;
										let update = {};
										update["$set"] = {
											"grpCentre": routeAlgoEta1[0].grpCentre,
											"empCount": routeAlgoEta1[0].empCount,
											"employees": routeAlgoEta1[0].employees,
											"route": routeAlgoEta1[0].route,
											"bounds": routeAlgoEta1[0].bounds,
											"startLocation": routeAlgoEta1[0].startLocation,
											"endLocation": routeAlgoEta1[0].endLocation,
											"totalTripTime": routeAlgoEta1[0].totalTripTime
										};
										// delete roasters -- satyam
										await baseDao.deleteMany("roasters", {'route.routeName': pg.routeName, 'rideStarted': false, 'rosterDate': {'$gt': moment().utcOffset("+05:30").format("x")}});
										let updatedRoute = await baseDao.updateOne("cab_routes", query, update, {});
										updatedGroups.push(routeAlgoEta1[0].grpDbId);
									}
								}
								else {
									if (matchedLogin === true && matchedLogout === true)
										break;
								}
							}
						}
						let shiftTime = admin.shiftSlot.filter(s => { return s.shiftName === efa.shiftName; });
						if (matchedLogin === false) {
							let algoReqObj: any = {};
							let officeLocation: any = {};
							algoReqObj.groups = [];
							officeLocation.lat = admin.companyAddress.coordinates[1];
							officeLocation.long = admin.companyAddress.coordinates[0];
							algoReqObj.waitTime = efa.waitTime;
							algoReqObj.officeLocation = officeLocation;
							algoReqObj.maxTripDuration = efa.maxTripDuration;
							algoReqObj.groups = [];
							let groupObj: any = {};
							groupObj.grpId = efa.grpId;
							groupObj.grpCentre = efa.employees[0].empLocation;
							groupObj.shiftName = efa.shiftName;
							groupObj.shiftType = "login";
							groupObj.shiftTime = shiftTime[0].startShift;
							groupObj.waitTime = efa.waitTime;
							groupObj.maxTripDuration = efa.maxTripDuration;
							groupObj.maxGroupSize = efa.maxGroupSize;
							let employees = [];
							let newEmpObj = {
								"empId": efa.employees[0].empId,
								"empLocation": efa.employees[0].empLocation,
								"weekOff": efa.employees[0].weekOff,
								"name": efa.employees[0].name,
								"employeeId": efa.employees[0].employeeId,
								"countryCode": efa.employees[0].countryCode,
								"mobileNo": efa.employees[0].mobileNo,
								"address": efa.employees[0].address,
								// Added gender - Shivakumar A
								"gender": efa.employees[0].gender

							};
							employees.push(newEmpObj);
							groupObj.empCount = employees.length;
							groupObj.employees = employees;
							algoReqObj.groups.push(groupObj);
							let routeAlgoEta1 = await cabRouteDao.routingAlgoETA(algoReqObj, admin);
							if (routeAlgoEta1.length > 0) { let newGroup = await adminDao.save("cab_routes", routeAlgoEta1[0]); }
						}
						if (matchedLogout === false) {
							let algoReqObj: any = {};
							let officeLocation: any = {};
							algoReqObj.groups = [];
							officeLocation.lat = admin.companyAddress.coordinates[1];
							officeLocation.long = admin.companyAddress.coordinates[0];
							algoReqObj.waitTime = efa.waitTime;
							algoReqObj.officeLocation = officeLocation;
							algoReqObj.maxTripDuration = efa.maxTripDuration;
							algoReqObj.groups = [];
							let groupObj: any = {};
							groupObj.grpId = efa.grpId;
							groupObj.grpCentre = efa.employees[0].empLocation;
							groupObj.shiftName = efa.shiftName;
							groupObj.shiftType = "logout";
							groupObj.shiftTime = shiftTime[0].endShift;
							groupObj.waitTime = efa.waitTime;
							groupObj.maxTripDuration = efa.maxTripDuration;
							groupObj.maxGroupSize = efa.maxGroupSize;
							let employees = [];
							let newEmpObj = {
								"empId": efa.employees[0].empId,
								"empLocation": efa.employees[0].empLocation,
								"weekOff": efa.employees[0].weekOff,
								"name": efa.employees[0].name,
								"employeeId": efa.employees[0].employeeId,
								"countryCode": efa.employees[0].countryCode,
								"mobileNo": efa.employees[0].mobileNo,
								"address": efa.employees[0].address,
								// Added gender - Shivakumar A
								"gender": efa.employees[0].gender

							};
							employees.push(newEmpObj);
							groupObj.empCount = employees.length;
							groupObj.employees = employees;
							algoReqObj.groups.push(groupObj);
							let routeAlgoEta1 = await cabRouteDao.routingAlgoETA(algoReqObj, admin);
							if (routeAlgoEta1.length > 0) { let newGroup = await adminDao.save("cab_routes", routeAlgoEta1[0]); }
						}
					}
				}
				if (updatedGroups.length > 0) {
					let arrToInsertupdtdGrps = await baseDao.find("cab_routes", { "_id": { "$in": updatedGroups } }, {}, {});
					let arrToInsert: any = [];
					for (let ug of arrToInsertupdtdGrps) {
						let newUpdatedRouteObj: any = {
							grpId: ug.grpId,
							grpDbId: ug._id,
							empCount: ug.empCount,
							shiftName: ug.shiftName,
							shiftTime: ug.shiftTime,
							shiftType: ug.shiftType,
							grpCentre: ug.grpCentre,
							route: ug.route,
							startLocation: ug.startLocation,
							endLocation: ug.endLocation,
							totalTripTime: ug.totalTripTime,
							createdBy: admin._id,
							adminType: config.CONSTANT.ADMIN_TYPE.ADMIN,
							created: Date.now(),
							companyCode: admin.companyCode,
							routeBadge: ug.routeBadge,
							// Added routeName - Shivakumar A
							routeName: ug.routeName,
							// employees schema -- satyam
							employees: ug.employees,
							maxGroupSize: ug.maxGroupSize,
							waitTime: ug.waitTime,
							maxTripDuration: ug.maxTripDuration,
							status: config.CONSTANT.STATUS.UN_EXECUTED
						};
						arrToInsert.push(newUpdatedRouteObj);
					}
					if (arrToInsert.length > 0) { let newUpdatedGroups = await baseDao.insertMany("updated_routes", arrToInsert, {}); }
					if (currentShiftRequest.length > 0) { let currentShiftUpdate = await baseDao.updateMany("shift_request", { "_id": { "$in": currentShiftRequest } }, { "$set": { "status": config.CONSTANT.REQUEST_STATUS.EXPIRED } }, { new: true }); }
					if (newShiftRequest.length > 0) {
						let newRequests = await baseDao.find("shift_request", { "_id": { "$in": newShiftRequest } }, {}, {});
						if (newRequests.length > 0) {
							for (let nr of newRequests) {
								let shiftTiming = admin.shiftSlot.filter(s => { return s.shiftName === nr.shiftName; });
								let queryEmp = { "employeeId": nr.employeeId };
								let updateEmp: any = {};
								updateEmp.shift = shiftTiming[0].shiftName;
								updateEmp.shiftStartTime = shiftTiming[0].startShift;
								updateEmp.shiftEndTime = shiftTiming[0].endShift;
								if (nr.weekOff.length > 0)
									updateEmp.weekOff = nr.weekOff;
								let empShiftUpdate = await baseDao.update("users", queryEmp, updateEmp, {});

								// Expiring other requests with status 'current' for this employee before making new request as current.
								let newShiftUpdate = await baseDao.updateMany("shift_request", { "employeeId": nr.employeeId, "status": config.CONSTANT.REQUEST_STATUS.CURRENT }, { "$set": { "status": config.CONSTANT.REQUEST_STATUS.EXPIRED } }, { new: true });
							}
						}
						let newShiftUpdate = await baseDao.updateMany("shift_request", { "_id": { "$in": newShiftRequest } }, { "$set": { "status": config.CONSTANT.REQUEST_STATUS.CURRENT } }, { new: true });
					}
				}
			}
		}
	} catch (error) {
		throw error;
	}
};

/**
 * Updated Group List
 */
const updatedGroupList = async function (params: UpdatedGroupListing) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			// Added SUB ADMIN ACCESS - Shivakumar A
			params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
			params.permission.indexOf("shiftRequest") !== -1
		) {
			let step1 = await adminDao.findAdminById(params);
			if (
				step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
				// Added SUB ADMIN ACCESS - Shivakumar A
			    step1.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
				step1.permission.indexOf("shiftRequest") !== -1
			) {
				let response: any = {};
				let step2 = await shiftRequestDao.updatedGroupList(params).then(function (result) {
					response.updatedGroupList = result[0];
					response.totalCount = result[1] || 0;
				});
				return shiftRequestConstant.MESSAGES.SUCCESS.UPDATED_GROUP_LIST(response);
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
 * Roster Update
 */
const rosterUpdate = async function (params: RosterUpdate) {
	try {
		let step1 = await shiftRequestDao.rosterUpdate(params);
		return shiftRequestConstant.MESSAGES.SUCCESS.ROSTER_UPDATE;
	} catch (error) {
		throw error;
	}
};

/**
 * Delete shift request
 */
const deleteShiftRequest = async function (params: ShiftRequestDelete) {
	try {
		let step1 = await shiftRequestDao.deleteShiftRequest(params);
		return shiftRequestConstant.MESSAGES.SUCCESS.ROSTER_UPDATE;
	} catch (error) {
		throw error;
	}
};

export let shiftRequestController = {
	addShiftRequest,
	bulkShiftRequest,
	weekOffRequestList,
	shiftRequestList,
	checkShiftChange,
	updatedGroupList,
	rosterUpdate,
	deleteShiftRequest
};