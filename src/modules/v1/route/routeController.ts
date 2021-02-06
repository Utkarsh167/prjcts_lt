"use strict";

import * as _ from "lodash";

import { AdminDao } from "@modules/v1/admin/AdminDao";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as csv from "@lib/csv";
import { MailManager, RedisClient } from "@lib/index";
import * as tokenManager from "@lib/tokenManager";
import * as routeConstant from "@modules/v1/route/routeConstant";
import { CabRouteDao, routeMapper } from "@modules/v1/route/index";
import * as xlsx from "@lib/xlsx";
import { UserDao } from "../user";
import { BaseDao } from "@modules/v1/shared/BaseDao";
const distFrom = require('distance-from');
import { LoginHistoryDao } from "@modules/v1/loginHistory/LoginHistoryDao";
import * as pushNotification from '@utils/pushNotification';

let adminDao = new AdminDao();
let mailManager = new MailManager();
let redisClient = new RedisClient();
let cabRouteDao = new CabRouteDao();
let baseDao = new BaseDao();
let loginHistoryDao = new LoginHistoryDao();

/**
 * @function routeAdd
 * @description add cab and driver assign to cab,
 */
const routeAdd = async function (params: RouteAddRequest) {
	try {
		let randomenumber = "RO" + Math.floor(Math.random() * 100000) + 8;
		params.routeBadge = randomenumber;
		params.createdBy = params.userId;
		params.companyCode = params.companyCode;
		params.adminType = params.adminType;
		params.created = Date.now();
		let step2 = await cabRouteDao.routeAdd(params);
		return routeConstant.MESSAGES.SUCCESS.ROUTE_REGISTERED;
	} catch (error) {
		throw error;
	}
};

// Update route info
const routeUpdate = async function (params: RouteUpdateRequest) {
	try {
		let groupUpdate = await cabRouteDao.routeUpdate(params);
		return routeConstant.MESSAGES.SUCCESS.ROUTE_UPDATE;
	} catch (error) {
		throw error;
	}
};
/**
 * @function routeNameUpdate
 * @param params routeName
 */
const routeNameUpdate = async function (params: RouteUpdateRequest) {
	try {
		let groupUpdate = await cabRouteDao.routeNameUpdate(params);
		return routeConstant.MESSAGES.SUCCESS.ROUTE_UPDATE;
	} catch (error) {
		throw error;
	}
};

// routingAlgo
const routingAlgo = async function (params: RoutingAlgoRequest) {
	try {
		let algoReqObj: any = {};
		let officeLocation: any = {};
		let employees = [];
		let admin = await adminDao.findAdminById(params);
		let routes = await cabRouteDao.find("cab_routes", { "companyCode": params.companyCode }, {}, {});
		if (routes.length === 0) {
			let adminRouteConf = await adminDao.addRouteConf(params);
		}
		officeLocation.lat = admin.companyAddress.coordinates[1];
		officeLocation.long = admin.companyAddress.coordinates[0];
		algoReqObj.maxGroupSize = params.maxGroupSize;
		algoReqObj.waitTime = params.waitTime;
		algoReqObj.maxTripDuration = params.maxTripDuration;
		algoReqObj.officeLocation = officeLocation;
		let query: any = {
			userType: 1,
			groupFormed: false,
			status: config.CONSTANT.STATUS.UN_BLOCKED,
			companyCode: params.companyCode,
			isAddressChange: true
		};
		let projection: any = {
			_id: 1,
			shift: 1,
			shiftStartTime: 1,
			shiftEndTime: 1,
			weekOff: 1,
			"pickup.coordinates": 1,
			"pickup.address": 1,
			name: 1,
			countryCode: 1,
			mobileNo: 1,
			employeeId: 1,
	         // Added gender - Shivakumar A
			gender: 1
		};

		console.log();
		let emp = await baseDao.find("users", query, projection, {});
		if (emp.length === 0)
			return routeConstant.MESSAGES.ERROR.NO_EMPLOYEE_LEFT;
		for (let e of emp) {
			// Start of office to employee max distance check code ----------------------------------------------------------
			let distance = distFrom([officeLocation.lat, officeLocation.long]).to([e.pickup.coordinates[1], e.pickup.coordinates[0]]);
			if (distance.distance.v > admin.maxGroupRadius) {
				// console.log('skipped employee with distance: ', distance.distance.v);
				continue;
			}
			// End of office to employee max distance check code ------------------------------------------------------------------------------------------------
			if (!e.pickup)
				return routeConstant.MESSAGES.ERROR.PICKUP_NOT_FOUND(e);
			let b = e.pickup.address;
			let address: any = '';
			for (let addr in b) {
				if ((addr === "houseNo" || addr === "roadName" || addr === "city" || addr === "state" || addr === "landMark") && e.pickup.address[addr])
					address += e.pickup.address[addr] + ' ';
			}
			let obj = {
				"empId": e._id,
				"shift": e.shift,
				"shiftStartTime": e.shiftStartTime,
				"shiftEndTime": e.shiftEndTime,
				"weekOff": e.weekOff,
				"location": {
					"lat": e.pickup.coordinates[1],
					"long": e.pickup.coordinates[0]
				},
				"name": e.name,
				"employeeId": e.employeeId,
				"countryCode": e.countryCode,
				"mobileNo": e.mobileNo,
				"address": address.trim(),
	             // Added gender - Shivakumar A
				"gender": e.gender
			};
			employees.push(obj);
		}
		algoReqObj.employees = employees;
		if (algoReqObj.employees.length === 0)
			return routeConstant.MESSAGES.ERROR.NO_EMPLOYEE_FOUND_WITHIN_OFFICE_RANGE;
		let routingAlgo = await cabRouteDao.routingAlgo(algoReqObj, params);
		if (routingAlgo)
			return routeConstant.MESSAGES.SUCCESS.ROUTE_REGISTERED;
		else
			return routeConstant.MESSAGES.ERROR.INCOMPLETE_EMPLOYEE_DATA;
	} catch (error) {
		throw error;
	}
};

/**
 * Route list
 */
const routeList = async function (params: ListingRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("route") !== -1
		) {
			let step1 = await adminDao.findAdminById(params);
			if (
				step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
				step1.permission.indexOf("route") !== -1
			) {
				let response: any = {};
				let step2 = await cabRouteDao.routeList(params).then(function (result) {
					response.userList = result[0];
					response.totalCount = result[1] || 0;
					response.totalOccupancy = result[2][0].totalOccupancy || 0;
					// Added Employee Count, newUserList - Shivakumar A
					response.totalEmployee = result[3];
					response.newUserList = result[4];
					if (response.totalEmployee && response.totalEmployee.length) {
						let totalEmployeeCount = response.totalEmployee.map(count => count.empCount).reduce((sum, count) => count + sum);
						response.totalEmployee = totalEmployeeCount;
					} else {
						response.totalEmployee = 0;
					}
				});
				return routeConstant.MESSAGES.SUCCESS.ROUTE_LIST(response);
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
 * Processed Route list (Listing of routes with status approved or executed)
 */
const processedRouteList = async function (params: ListingRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("roster") !== -1
		) {
			let step1 = await adminDao.findAdminById(params);
			if (
				step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
				step1.permission.indexOf("roster") !== -1
			) {
				let response: any = {};
				let step2 = await cabRouteDao.processedRouteList(params).then(function (result) {
					response.userList = result[0];
					response.totalCount = result[1] || 0;
				});
				let step3 = await cabRouteDao.processedRouteListWithCabVendor(response.userList).then(function (result) {
					response.userList.forEach(elementUser => {
						result.forEach(elementCab => {
							if (elementCab) {
								if (elementUser.routeBadge === elementCab.route.routeBadge) {
									elementUser.cab = elementCab.cab;
								}
							}
						});
					});
				});
				return routeConstant.MESSAGES.SUCCESS.ROUTE_LIST(response);
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
 * @function routeDetails
 */
const routeDetails = async function (params: RouteId) {
	try {
		let step1 = await cabRouteDao.findRouteById(params);
		return routeConstant.MESSAGES.SUCCESS.ROUTE_DETAILS(step1);
	} catch (error) {
		throw error;
	}
};

// Update route info
const routeApprove = async function (params: RouteApproveRequest) {
	try {
		let query: any = {};
		let update = { $set: { "status": config.CONSTANT.STATUS.APPROVED } };
		let options: any = {};
		if (params.approveAll) {
			query.status = config.CONSTANT.STATUS.UN_APPROVED;
			let approve = await baseDao.updateMany("cab_routes", query, update, options);
			return routeConstant.MESSAGES.SUCCESS.ROUTE_APPROVE;
		}
		else if (params.approveLogin) {
			query.shiftType = "login";
			query.status = config.CONSTANT.STATUS.UN_APPROVED;
			let approve = await baseDao.updateMany("cab_routes", query, update, options);
			return routeConstant.MESSAGES.SUCCESS.ROUTE_APPROVE;
		}
		else if (params.approveLogout) {
			query.shiftType = "logout";
			query.status = config.CONSTANT.STATUS.UN_APPROVED;
			let approve = await baseDao.updateMany("cab_routes", query, update, options);
			return routeConstant.MESSAGES.SUCCESS.ROUTE_APPROVE;
		}
		else {
			query._id = { $in: params.groups };
			let approve = await baseDao.updateMany("cab_routes", query, update, options);
			return routeConstant.MESSAGES.SUCCESS.ROUTE_APPROVE;
		}
	} catch (error) {
		throw error;
	}
};

// Dissolve route
const routeDissolve = async function (params: RouteDissolveRequest) {
	try {
		let algoReqObj: any = {};
		let officeLocation: any = {};
		let query: any = { "_id": { "$in": params.groups } };
		let projection: any = {};
		let options: any = { ordered: false };
		let groupsArr = await baseDao.find("cab_routes", query, projection, options);
		algoReqObj.groups = [];

		// Converting groupsArr to valid Json - Shivakumar A
		groupsArr = JSON.stringify(groupsArr);
		groupsArr = JSON.parse(groupsArr);

		let admin = await adminDao.findAdminById(params);
		officeLocation.lat = admin.companyAddress.coordinates[1];
		officeLocation.long = admin.companyAddress.coordinates[0];
		algoReqObj.waitTime = groupsArr[0].waitTime;
		algoReqObj.officeLocation = officeLocation;
		algoReqObj.maxTripDuration = groupsArr[0].maxTripDuration;
		for (let grp of groupsArr) {
			for (let e of grp.employees) {
				let groupObj: any = {};
				groupObj.grpId = grp.grpId;
				// groupObj.grpCentre = {
				// 	"lat": 0,
				// 	"long": 0
				// };
				groupObj.grpCentre = e.empLocation;
				groupObj.shiftName = grp.shiftName;
				groupObj.shiftType = grp.shiftType;
				groupObj.shiftTime = grp.shiftTime;
				// groupObj.weekOff = grp.weekOff;
				groupObj.waitTime = grp.waitTime;
				groupObj.maxTripDuration = grp.maxTripDuration;
				groupObj.maxGroupSize = grp.maxGroupSize;
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
				let employees = [];
				employees.push(obj);
				groupObj.empCount = 1;
				groupObj.employees = employees;
				algoReqObj.groups.push(groupObj);
			}
		}
		let routeAlgoEta = await cabRouteDao.routingAlgoETA(algoReqObj, params);
		let mergedGroup = await adminDao.insertMany("cab_routes", routeAlgoEta, options);
		let deleteOldGroups = await baseDao.deleteMany("cab_routes", { _id: { $in: params.groups } });
		return routeConstant.MESSAGES.SUCCESS.ROUTE_DISSOLVE;
	} catch (error) {
		throw error;
	}
};

// Merge route
const routeMerge = async function (params: RouteMergeRequest) {
	try {
		let algoReqObj: any = {};
		let officeLocation: any = {};
		let employees = [];
		let query: any = { "_id": { "$in": params.groups } };
		let projection: any = {};
		let options: any = {};
		let groupsArr = await baseDao.find("cab_routes", query, projection, options);

		// Converting groupsArr to valid Json - Shivakumar A
		groupsArr = JSON.stringify(groupsArr);
		groupsArr = JSON.parse(groupsArr);

		// const allEqual = groupsArr.every((v) => v.waitTime === groupsArr[0].waitTime && v.shiftType === groupsArr[0].shiftType && v.shiftTime === groupsArr[0].shiftTime && v.weekOff.every(e => groupsArr[0].weekOff.includes(e)));
		const allEqual = groupsArr.every((v) => v.waitTime === groupsArr[0].waitTime && v.shiftName === groupsArr[0].shiftName && v.shiftType === groupsArr[0].shiftType && v.shiftTime === groupsArr[0].shiftTime);
		if (!allEqual)
			return routeConstant.MESSAGES.ERROR.GROUP_TYPE_MISMATCHED;
		else {
			let admin = await adminDao.findAdminById(params);
			officeLocation.lat = admin.companyAddress.coordinates[1];
			officeLocation.long = admin.companyAddress.coordinates[0];
			algoReqObj.waitTime = groupsArr[0].waitTime;
			algoReqObj.officeLocation = officeLocation;
			algoReqObj.maxTripDuration = groupsArr[0].maxTripDuration;
			algoReqObj.groups = [];
			let groupObj: any = {};
			groupObj.grpId = groupsArr[0].grpId;
			// groupObj.grpCentre = {
			// 	"lat": 0,
			// 	"long": 0
			// };
			groupObj.grpCentre = groupsArr[0].grpCentre;
			groupObj.shiftName = groupsArr[0].shiftName;
			groupObj.shiftType = groupsArr[0].shiftType;
			groupObj.shiftTime = groupsArr[0].shiftTime;
			// groupObj.weekOff = groupsArr[0].weekOff;
			for (let grp of groupsArr) {
				for (let e of grp.employees) {
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
			}
			groupObj.waitTime = groupsArr[0].waitTime;
			groupObj.maxTripDuration = groupsArr[0].maxTripDuration;
			groupObj.maxGroupSize = groupsArr[0].maxGroupSize;
			groupObj.empCount = employees.length;
			groupObj.employees = employees;
			// algoReqObj.groups.push(groupObj);
			// 	let routeAlgoEta = await cabRouteDao.routingAlgoETA(algoReqObj, params);
			// 	let mergedGroup = await adminDao.save("cab_routes", routeAlgoEta[0]);
			// 	let deleteOldGroups = await baseDao.deleteMany("cab_routes", { _id: { $in: params.groups } });
			// 	return routeConstant.MESSAGES.SUCCESS.ROUTE_MERGE;

			// check if employee count is more than the maximum groupsize - Shivakumar A
			if (groupObj.empCount > groupObj.maxGroupSize) {
				return routeConstant.MESSAGES.ERROR.EMPLOYEE_COUNT_EXCEEDED;
			} else {
				algoReqObj.groups.push(groupObj);
				let routeAlgoEta = await cabRouteDao.routingAlgoETA(algoReqObj, params);
				let mergedGroup = await adminDao.save("cab_routes", routeAlgoEta[0]);
				let deleteOldGroups = await baseDao.deleteMany("cab_routes", { _id: { $in: params.groups } });
				return routeConstant.MESSAGES.SUCCESS.ROUTE_MERGE;
			}
		}
	} catch (error) {
		throw error;
	}
};

// Regenerate route
const routeRegenerate = async function (params: RouteRegenerateRequest) {
	try {
		let algoReqObj: any = {};
		let officeLocation: any = {};
		let employees = [];
		let query: any = { "_id": { "$in": params.groups } };
		let projection: any = {};
		let options: any = {};
		let groupsArr = await baseDao.find("cab_routes", query, projection, options);
		 // Converting groupsArr to valid Json - Shivakumar A
          groupsArr = JSON.stringify(groupsArr);
		  groupsArr = JSON.parse(groupsArr);

		let admin = await adminDao.findAdminById(params);
		officeLocation.lat = admin.companyAddress.coordinates[1];
		officeLocation.long = admin.companyAddress.coordinates[0];
		algoReqObj.waitTime = groupsArr[0].waitTime;
		algoReqObj.officeLocation = officeLocation;
		algoReqObj.maxTripDuration = groupsArr[0].maxTripDuration;
		algoReqObj.maxGroupSize = groupsArr[0].maxGroupSize;
		algoReqObj.employees = [];
		for (let grp of groupsArr) {
			for (let e of grp.employees) {
				let obj = {
					"empId": e.empId,
					"name": e.name,
					"employeeId": e.employeeId,
					"countryCode": e.countryCode,
					"mobileNo": e.mobileNo,
					"address": e.address,
					"shiftName": grp.shiftName,
					"shiftTime": grp.shiftTime,
					"shiftType": grp.shiftType,
					"weekOff": e.weekOff,
					"location": { "lat": e.empLocation.lat, "long": e.empLocation.long },
					// Added gender - Shivakumar A
					"gender": e.gender
				};
				algoReqObj.employees.push(obj);
			}
		}

		let routeAlgoEta = await cabRouteDao.routingAlgoRegenerate(algoReqObj, params);
		return routeConstant.MESSAGES.SUCCESS.ROUTE_REGENERATE;
	} catch (error) {
		throw error;
	}
};

// New Employee Groups: adjust in old groups or create new groups
const newEmpRoute = async function (params: NewEmpRouteRequest) {
	try {
		let empLeft = [];
		let admin = await adminDao.findAdminById(params);
		let query: any = {
			userType: 1,
			groupFormed: false,
			status: config.CONSTANT.STATUS.UN_BLOCKED,
			companyCode: params.companyCode,
			isAddressChange: true
		};
		let projection: any = {
			_id: 1,
			shift: 1,
			shiftStartTime: 1,
			shiftEndTime: 1,
			weekOff: 1,
			"pickup.coordinates": 1,
			"pickup.address": 1,
			name: 1,
			countryCode: 1,
			mobileNo: 1,
			employeeId: 1,
			// Added gender - Shivakumar A
			gender: 1
		};

		let emp = await baseDao.find("users", query, projection, {});
		if (emp.length === 0)
			return routeConstant.MESSAGES.ERROR.NO_EMPLOYEE_LEFT;
		for (let e of emp) {
			// Start of office to employee max distance check code ----------------------------------------------------------
			let distance = distFrom([admin.companyAddress.coordinates[1], admin.companyAddress.coordinates[0]]).to([e.pickup.coordinates[1], e.pickup.coordinates[0]]);
			if (distance.distance.v > admin.maxGroupRadius) {
				// console.log('###skipped employee with distance: ', distance.distance.v);
				continue;
			}
			// End of office to employee max distance check code ------------------------------------------------------------------------------------------------
			if (!e.pickup)
				empLeft.push({ empId: e._id, employeeId: e.employeeId, email: e.email });
			let b = e.pickup.address;
			let address: any = '';
			for (let addr in b) {
				if ((addr === "houseNo" || addr === "roadName" || addr === "city" || addr === "state" || addr === "landMark") && e.pickup.address[addr])
					address += e.pickup.address[addr] + ' ';
			}
			let loc = {
				"lat": e.pickup.coordinates[1],
				"long": e.pickup.coordinates[0]
			};
			let shiftSlot = admin.shiftSlot;
			let shiftObj = await _.find(shiftSlot, (obj) => { return obj.shiftName === e.shift; });
			let matchedLogin: any = false;
			let matchedLogout: any = false;
			let potentialGroups = await baseDao.find("cab_routes", { "shiftName": shiftObj.shiftName, $where: 'this.empCount < this.maxGroupSize' }, {}, {});
			if (potentialGroups.length > 0) {
				for (let [i, pg] of potentialGroups.entries()) {
					let distance = distFrom([pg.grpCentre.lat, pg.grpCentre.long]).to([loc.lat, loc.long]);
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
						groupObj.grpCentre = pg.grpCentre;
						groupObj.shiftName = pg.shiftName;
						groupObj.shiftType = pg.shiftType;
						groupObj.shiftTime = pg.shiftTime;
						groupObj.waitTime = pg.waitTime;
						groupObj.maxTripDuration = pg.maxTripDuration;
						groupObj.maxGroupSize = pg.maxGroupSize;
						let employees = [];
						let newEmpObj = {
							"empId": e._id,
							"empLocation": loc,
							"weekOff": e.weekOff,
							"name": e.name,
							"employeeId": e.employeeId,
							"countryCode": e.countryCode,
							"mobileNo": e.mobileNo,
							"address": address,
							// Added gender - Shivakumar A
							"gender": e.gender
						};
						employees.push(newEmpObj);
						for (let em of pg.employees) {
							let obj = {
								"empId": em.empId,
								"empLocation": em.empLocation,
								"weekOff": em.weekOff,
								"name": em.name,
								"employeeId": em.employeeId,
								"countryCode": em.countryCode,
								"mobileNo": em.mobileNo,
								"address": em.address,
								// Added gender - Shivakumar A
							    "gender": em.gender
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
							let updatedRoute = await baseDao.findOneAndUpdate("cab_routes", query, update, { new: true });
							let updatedRoster = await baseDao.updateMany("roasters", { "route._id": pg._id, "rideStarted": false, "rideCompleted": false }, { "route": updatedRoute }, {});
							let employeeList = updatedRoute.employees;
							// let empIdArray = _.map(employeeList, 'empId');
							let empMessage;
							let empTitle;
							for (let emp of employeeList) {
								let userDevice = await loginHistoryDao.findChunkDevice(emp.empId);
								if (updatedRoute.shiftType === config.CONSTANT.SHIFT_TYPE.LOGIN) {
									empTitle = config.CONSTANT.NOTIFICATION_TITLE.PICKUP_TIME_CHANGE;
									empMessage = config.CONSTANT.NOTIFICATION_MESSAGE.PICKUP_TIME_CHANGE + "" + emp.empPickupTime;
								} else {
									empTitle = config.CONSTANT.NOTIFICATION_TITLE.DROP_TIME_CHANGE;
									empMessage = config.CONSTANT.NOTIFICATION_MESSAGE.DROP_TIME_CHANGE + "" + emp.empDropTime;
								}
								let notificationData = {
									title: empTitle,
									message: empMessage,
									senderId: params.userId,
									notificationType: config.CONSTANT.NOTIFICATION_TYPE.EMP_PICKUP_TIME_CHANGE
								};
								pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
							}
							let updatedEmp = await baseDao.findOneAndUpdate("users", { "_id": e._id }, { "groupFormed": true }, {});
						}
					}
					else {
						if (matchedLogin === true && matchedLogout === true)
							break;
					}
				}
			}
			if (matchedLogin === false) {
				let algoReqObj: any = {};
				let officeLocation: any = {};
				algoReqObj.groups = [];
				officeLocation.lat = admin.companyAddress.coordinates[1];
				officeLocation.long = admin.companyAddress.coordinates[0];
				algoReqObj.waitTime = admin.routeConf.waitTime;
				algoReqObj.officeLocation = officeLocation;
				algoReqObj.maxTripDuration = admin.routeConf.maxTripDuration;
				algoReqObj.groups = [];
				let groupObj: any = {};
				groupObj.grpId = 1;
				groupObj.grpCentre = loc;
				groupObj.shiftName = shiftObj.shiftName;
				groupObj.shiftType = "login";
				groupObj.shiftTime = shiftObj.startShift;
				groupObj.waitTime = admin.routeConf.waitTime;
				groupObj.maxTripDuration = admin.routeConf.maxTripDuration;
				groupObj.maxGroupSize = admin.routeConf.maxGroupSize;
				let employees = [];
				let newEmpObj = {
					"empId": e._id,
					"empLocation": loc,
					"weekOff": e.weekOff,
					"name": e.name,
					"employeeId": e.employeeId,
					"countryCode": e.countryCode,
					"mobileNo": e.mobileNo,
					"address": address,
					// Added gender - Shivakumar A
					"gender": e.gender
				};
				employees.push(newEmpObj);
				groupObj.empCount = employees.length;
				groupObj.employees = employees;
				algoReqObj.groups.push(groupObj);
				let routeAlgoEta1 = await cabRouteDao.routingAlgoETA(algoReqObj, admin);
				if (routeAlgoEta1.length > 0) {
					let newGroup = await adminDao.save("cab_routes", routeAlgoEta1[0]);
					let updatedEmp = await baseDao.findOneAndUpdate("users", { "_id": e._id }, { "groupFormed": true }, {});
				}
			}
			if (matchedLogout === false) {
				let algoReqObj: any = {};
				let officeLocation: any = {};
				algoReqObj.groups = [];
				officeLocation.lat = admin.companyAddress.coordinates[1];
				officeLocation.long = admin.companyAddress.coordinates[0];
				algoReqObj.waitTime = admin.routeConf.waitTime;
				algoReqObj.officeLocation = officeLocation;
				algoReqObj.maxTripDuration = admin.routeConf.maxTripDuration;
				algoReqObj.groups = [];
				let groupObj: any = {};
				groupObj.grpId = 1;
				groupObj.grpCentre = loc;
				groupObj.shiftName = shiftObj.shiftName;
				groupObj.shiftType = "logout";
				groupObj.shiftTime = shiftObj.endShift;
				groupObj.waitTime = admin.routeConf.waitTime;
				groupObj.maxTripDuration = admin.routeConf.maxTripDuration;
				groupObj.maxGroupSize = admin.routeConf.maxGroupSize;
				let employees = [];
				let newEmpObj = {
					"empId": e._id,
					"empLocation": loc,
					"weekOff": e.weekOff,
					"name": e.name,
					"employeeId": e.employeeId,
					"countryCode": e.countryCode,
					"mobileNo": e.mobileNo,
					"address": address,
					// Added gender - Shivakumar A
					"gender": e.gender
				};
				employees.push(newEmpObj);
				groupObj.empCount = employees.length;
				groupObj.employees = employees;
				algoReqObj.groups.push(groupObj);
				let routeAlgoEta1 = await cabRouteDao.routingAlgoETA(algoReqObj, admin);
				if (routeAlgoEta1.length > 0) {
					let newGroup = await adminDao.save("cab_routes", routeAlgoEta1[0]);
					let updatedEmp = await baseDao.findOneAndUpdate("users", { "_id": e._id }, { "groupFormed": true }, {});
				}
			}
		}
		return routeConstant.MESSAGES.SUCCESS.NEW_EMPLOYEES_GROUPS;
	} catch (error) {
		throw error;
	}
};

// Swap employee order in a route
const swapEmpOrder = async function (params: SwapEmpOrderRequest) {
	try {
		let admin = await adminDao.findAdminById(params);
		let group = await baseDao.findOne("cab_routes", { _id: params.routeId }, {}, {});
		let algoReqObj: any = {};
		let officeLocation: any = {};
		algoReqObj.groups = [];
		officeLocation.lat = admin.companyAddress.coordinates[1];
		officeLocation.long = admin.companyAddress.coordinates[0];
		algoReqObj.waitTime = group.waitTime;
		algoReqObj.officeLocation = officeLocation;
		algoReqObj.maxTripDuration = group.maxTripDuration;
		algoReqObj.groups = [];
		let groupObj: any = {};
		groupObj.grpDbId = group._id;
		groupObj.grpId = group.grpId;
		groupObj.grpCentre = group.grpCentre;
		groupObj.shiftName = group.shiftName;
		groupObj.shiftType = group.shiftType;
		groupObj.shiftTime = group.shiftTime;
		groupObj.waitTime = group.waitTime;
		groupObj.maxTripDuration = group.maxTripDuration;
		groupObj.maxGroupSize = group.maxGroupSize;
		let employees = [];
		for (let em of params.employees) {
			let obj = {
				"empId": em.empId,
				"empLocation": em.empLocation,
				"weekOff": em.weekOff,
				"name": em.name,
				"employeeId": em.employeeId,
				"countryCode": em.countryCode,
				"mobileNo": em.mobileNo,
				"address": em.address,
				// Added gender - Shivakumar A
				"gender": em.gender
			};
			employees.push(obj);
		}
		groupObj.empCount = employees.length;
		groupObj.employees = employees;
		groupObj.optimize = 'false';
		algoReqObj.groups.push(groupObj);
		let routeAlgoEta1 = await cabRouteDao.routingAlgoETA(algoReqObj, admin);
		if (routeAlgoEta1.length > 0) {
			let query: any = {};
			query._id = routeAlgoEta1[0].grpDbId;
			let update = {};
			update["$set"] = {
				"grpCentre": params.employees[0].empLocation,
				"empCount": routeAlgoEta1[0].empCount,
				"employees": routeAlgoEta1[0].employees,
				"route": routeAlgoEta1[0].route,
				"bounds": routeAlgoEta1[0].bounds,
				"startLocation": routeAlgoEta1[0].startLocation,
				"endLocation": routeAlgoEta1[0].endLocation,
				"totalTripTime": routeAlgoEta1[0].totalTripTime
			};
			let updatedRoute = await baseDao.findOneAndUpdate("cab_routes", query, update, { new: true });
			return routeConstant.MESSAGES.SUCCESS.EMP_SWAPPED;
		}
	} catch (error) {
		throw error;
	}
};

export let routeController = {
	routeAdd,
	routeUpdate,
	routingAlgo,
	routeList,
	processedRouteList,
	routeApprove,
	routeDissolve,
	routeMerge,
	routeRegenerate,
	routeDetails,
	newEmpRoute,
	swapEmpOrder,
	routeNameUpdate
};