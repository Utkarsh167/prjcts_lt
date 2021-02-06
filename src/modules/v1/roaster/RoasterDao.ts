"use strict";

import * as _ from "lodash";
import * as promise from "bluebird";
import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/constant";
import * as roasterConstant from "@modules/v1/roaster/roasterConstant";
import { promises } from "fs";
import { pipeline } from "stream";
import * as mongoose from "mongoose";
import * as moment from "moment";
import { utils } from "cfb/types";
import { AdminDao } from "@modules/v1/admin/AdminDao";
import { LoginHistoryDao } from "@modules/v1/loginHistory/LoginHistoryDao";
import * as pushNotification from '@utils/pushNotification';
import { RescheduleDao } from "@modules/v1/rescheduleRide/RescheduleDao";

let adminDao = new AdminDao();
let rescheduleDao = new RescheduleDao();
let loginHistoryDao = new LoginHistoryDao();
export class RoasterDao extends BaseDao {

	/**
	 * @function findRoaster
	 * @description find available roaster
	 * @param params
	 */

	async findRoaster(params: any) {
		try {
			let query: any = {};
			query["route._id"] = params.val.routeId;
			query["rosterDate"] = { "$gte": params.validFrom };
			return await this.find('roasters', query, {}, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function findAllLastRosters
	 * @description find last available roster for each route
	 * @param params
	 */
	async findAllLastRosters(params: any) {
		try {
			let aggPipe = [{ "$group": { "_id": "$route._id", rosterDate: { $max: "$rosterDate" } } }];
			return await this.aggregate('roasters', aggPipe, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function Roasteradd
	 */
	async roasterAdd(params) {
		try {
			let admin = await adminDao.findAdminById(params);
			let rosterArr = [];
			let endMoment = moment(params.validTill);
			let currentMoment = moment(params.validFrom);
			let nextDate;
			let lastDate;
			let arrDlt = [];
			let dr;
			let from, to;
			let busySlotObj: any = {};
			let rosterObj: any = {
				validFrom: params.validFrom,
				validTill: params.validTill,
				roasterBadge: params.roasterBadge,
				createdBy: params.createdBy,
				companyCode: params.companyCode,
				rosterDate: currentMoment,
				officeLocation: {
					lat: admin.companyAddress.coordinates[1],
					long: admin.companyAddress.coordinates[0]
				},
				officeAddress: admin.companyAddress.address
			};
			// let query: any = {};
			let query2: any = {};
			// query["route._id"] = params.routeId;
			// let projection: any = {};
			// let options: any = {};
			// let roaster = await this.findOne('roasters', query, projection, options);
			// if (roaster) {
			// 	return Promise.reject(roasterConstant.MESSAGES.ERROR.CAB_OR_ROUTE_ALREADY_ASSIGN);
			// }
			params.createdAt = new Date().getTime();
			let route = await this.findOne("cab_routes", { "_id": params.routeId }, {}, {});
			if (route.shiftType === 'login') {
				from = moment(route.shiftTime, 'HH:mm').subtract(config.CONSTANT.CAB_BUFFER + route.totalTripTime, 'minutes').format('HH:mm');
				to = moment(route.shiftTime, 'HH:mm').add(config.CONSTANT.CAB_BUFFER, 'minutes').format('HH:mm');
				busySlotObj.from = from;
				busySlotObj.to = to;
			}
			else if (route.shiftType === 'logout') {
				from = moment(route.shiftTime, 'HH:mm').subtract(config.CONSTANT.CAB_BUFFER, 'minutes').format('HH:mm');
				to = moment(route.shiftTime, 'HH:mm').add(config.CONSTANT.CAB_BUFFER + route.totalTripTime, 'minutes').format('HH:mm');
				busySlotObj.from = from;
				busySlotObj.to = to;
			}
			rosterObj.route = route;
			let cab = await this.findOne("cabs", { "_id": params.cabId }, {}, {});
			rosterObj.cab = cab;
			for (let [i, driver] of rosterObj.cab.driverMapped.entries()) {
				// if (driver._id.toString() !== params.driverId.toString() || driver.shift.shiftTime !== route.shiftTime || driver.shift.shiftType !== route.shiftType)
				if (driver._id.toString() !== params.driverId.toString())
					arrDlt.push(i);
				else
					dr = i;
			}
			_.pullAt(rosterObj.cab.driverMapped, arrDlt);
			await this.save("roasters", rosterObj);
			while (currentMoment.isBefore(endMoment, 'day')) {
				nextDate = currentMoment.add(1, 'days');
				rosterObj['rosterDate'] = nextDate;
				// rosterArr.push(rosterObj);
				await this.save("roasters", rosterObj);
			}
			// let roster = await this.insertMany("roasters", rosterArr, { new: true });
			// let query1: any = { "$and": [{ "_id": params.cabId }, { "driverMapped._id": params.driverId }, { "driverMapped.shift.shiftType": rosterObj.route.shiftType }, { "driverMapped.shift.shiftTime": rosterObj.route.shiftTime }] };
			let query1: any = { "$and": [{ "_id": params.cabId }, { "driverMapped._id": params.driverId }] };
			let update1: any = {};
			let options1 = { new: true };
			update1["$push"] = {
				"busySlots": busySlotObj
			};
			await this.updateOne("cabs", query1, update1, options1);
			let update2: any = {};
			query2._id = params.routeId;
			update2["$set"] = {
				status: config.CONSTANT.STATUS.EXECUTED
			};
			await this.updateOne("cab_routes", query2, update2, options1);
			return true;
		} catch (error) {
			throw error;
		}
	}

	async rosterContinue(params) {
		try {
			let admin = await adminDao.findAdminById(params);
			let rosterToCopy = await this.findOne("roasters", { "route._id": params.routeId, "rosterDate": params.oldRosterDate }, {}, {});
			let endMoment = moment(params.validTill);
			let currentMoment = moment(params.validFrom);
			let nextDate;
			let arrDlt = [];
			let dr;
			let from, to;
			let rosterObj: any = {
				validFrom: params.validFrom,
				validTill: params.validTill,
				roasterBadge: params.roasterBadge,
				createdBy: params.createdBy,
				created: params.created,
				companyCode: params.companyCode,
				rosterDate: currentMoment,
				officeLocation: {
					lat: admin.companyAddress.coordinates[1],
					long: admin.companyAddress.coordinates[0]
				},
				officeAddress: admin.companyAddress.address,
			};
			params.createdAt = new Date().getTime();
			let route = await this.findOne("cab_routes", { "_id": rosterToCopy.route._id }, {}, {});
			rosterObj.route = route;
			let cab = await this.findOne("cabs", { "_id": rosterToCopy.cab._id }, {}, {});
			rosterObj.cab = cab;
			await this.save("roasters", rosterObj);
			while (currentMoment.isBefore(endMoment, 'day')) {
				nextDate = currentMoment.add(1, 'days');
				rosterObj['rosterDate'] = nextDate;
				// rosterArr.push(rosterObj);
				await this.save("roasters", rosterObj);
			}
		}
		catch (error) {
			throw error;
		}
	}

	/**
	 * @param params
	 */
	async roasterUpdate(params: RoasterUpdateRequest) {
		try {
			let rosterArr = [];
			let arrDlt = [];
			let dr;
			let rosterObj: any = {};
			let options = { new: true };
			let query: any = {};
			query._id = params.rosterId;
			let projection: any = {};
			let options1: any = {};
			let roaster = await this.findOne('roasters', query, projection, options1);
			if (!roaster) {
				return Promise.reject(roasterConstant.MESSAGES.ERROR.ROSTER_NOT_FOUND);
			}
			let route = await this.findOne("cab_routes", { "_id": roaster.route._id }, {}, {});
			rosterObj.route = route;
			let cab = await this.findOne("cabs", { "_id": params.cabId }, {}, {});
			let employeeList = roaster.route.employees;
			let empIdArray = _.map(employeeList, 'empId');
			rosterObj.cab = cab;
			for (let [i, driver] of rosterObj.cab.driverMapped.entries()) {
				// if (driver._id.toString() !== params.driverId.toString() || driver.shift.shiftTime !== route.shiftTime || driver.shift.shiftType !== route.shiftType)
				if (driver._id.toString() !== params.driverId.toString())
					arrDlt.push(i);
				else
					dr = i;
			}
			_.pullAt(rosterObj.cab.driverMapped, arrDlt);
			let update: any = {};
			update["$set"] = {
				"cab": rosterObj.cab,
			};
			await this.updateOne("roasters", query, update, options);
			// let query2: any = { "$and": [{ "_id": roaster.cab._id }, { "driverMapped._id": roaster.cab.driverMapped[0]._id }, { "driverMapped.shift.shiftType": rosterObj.route.shiftType }, { "driverMapped.shift.shiftTime": rosterObj.route.shiftTime }] };
			let query2: any = { "$and": [{ "_id": roaster.cab._id }, { "driverMapped._id": roaster.cab.driverMapped[0]._id }] };
			let update2: any = {};
			update2["$set"] = {
				"driverMapped.$.booked": false
			};
			await this.updateOne("cabs", query2, update2, options);
			// let query1: any = { "$and": [{ "_id": params.cabId }, { "driverMapped._id": params.driverId }, { "driverMapped.shift.shiftType": rosterObj.route.shiftType }, { "driverMapped.shift.shiftTime": rosterObj.route.shiftTime }] };
			let query1: any = { "$and": [{ "_id": params.cabId }, { "driverMapped._id": params.driverId }] };
			let update1: any = {};
			update1["$set"] = {
				"driverMapped.$.booked": true
			};
			await this.updateOne("cabs", query1, update1, options);
			let userDevice = await loginHistoryDao.findChunkDevice(empIdArray);
			let notificationData = {
				title: config.CONSTANT.NOTIFICATION_TITLE.CAB_CHANGE_OF_EMPLOYEE,
				message: config.CONSTANT.NOTIFICATION_MESSAGE.CAB_CHANGE_OF_EMPLOYEE + " " + cab.registrationNo,
				senderId: params.userId,
				notificationType: config.CONSTANT.NOTIFICATION_TYPE.CAB_CHANGED_OF_EMPLOYEE
			};
			pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
			return true;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function rosterListEmp
	 * @description employee get rosters of driver cab and emp list who rides with him
	 * @param params
	 */
	async rosterListEmp(params: ListingRequest) {
		try {
			let { pageNo, limit, fromDate, toDate } = params;
			let aggPipe = [];
			let match1: any = {};
			// const weekOffDay = moment("rosterDate").day;
			match1 = {
				$and: [{ status: { $ne: config.CONSTANT.STATUS.DELETED } }, { "route.employees.empId": { "$eq": params.userId } }, { companyCode: { $eq: params.companyCode } }]
			};
			aggPipe.push({ "$match": match1 });
			// aggPipe.push({ '$addFields': { rosterWeekDay: { $toInt: { '$dateToString': { format: '%u', date: { $toDate: '$rosterDate' } } } } } });

			// aggPipe.push({ '$match': { 'route.employees.weekOff': { '$ne': "rosterWeekDay" } } });
			let sort = {};
			sort = { "rosterDate": 1 };
			aggPipe.push({ "$sort": sort });
			let match4: any = {};
			if (fromDate && !toDate) {
				match4.rosterDate = { "$gte": fromDate };
				aggPipe.push({ "$match": match4 });
			}

			let match5: any = {};
			if (toDate && !fromDate) {
				match5.rosterDate = { "$lte": toDate };
				aggPipe.push({ "$match": match5 });
			}

			let match6: any = {};
			if (fromDate && toDate) {
				match6.rosterDate = { "$gte": fromDate, "$lte": toDate };
				aggPipe.push({ "$match": match6 });
			}

			if (pageNo && limit) {
				let skip = (pageNo - 1) * limit;
				aggPipe.push({ "$skip": skip });
				aggPipe.push({ "$limit": limit });

			}

			let project = {
				createdAt: 0, updatedAt: 0
			};
			aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let roster = await this.aggregate("roasters", aggPipe, {});
			// return roster;

			// Check and remove roster of weekOff from the resulting array
			let resultArr: any = [];
			for (let ros of roster) {
				let rosterDate = moment(ros.rosterDate);
				const dow = rosterDate.add({ 'days': 1 }).subtract({ 'hours': 5, 'minutes': 30 }).day();
				// console.log('rosterDate: ', ros.rosterDate, 'dow: ', dow);
				let rost = ros.route.employees.filter(s => { return s.empId === params.userId && s.weekOff.includes(dow); });
				if (rost.length === 0) {
					// console.log('finalRos: ', ros.rosterDate);
					resultArr.push(ros);
				}
			}
			let totalCount = await this.count('roasters', { ...match1, ...match4, ...match5, ...match6 });
			let isNext = pageNo * limit;
			let isNextPage;
			if (isNext < totalCount) {
				isNextPage = true;
			} else {
				isNextPage = false;
			}
			let response: any = {};
			response.isNextPage = isNextPage;
			response.roster = resultArr;
			return response;

		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function rosterRescheduleEmp
	 * @param params fromDate
	 */
	async rosterRescheduleEmp(params: ListingRequest) {
		try {
			let { fromDate, toDate } = params;
			let sdt = moment(fromDate).startOf('day').format('x');
			let edt = moment(fromDate).endOf('day').format('x');
			let startdate = parseInt(sdt);
			let enddate = parseInt(edt);
			toDate = fromDate;
			let aggPipe = [];
			let match1: any = {};
			match1 = { $and: [{ status: { $ne: config.CONSTANT.STATUS.DELETED } }, { "route.employees.empId": { "$eq": params.userId } }, { companyCode: { $eq: params.companyCode } }] };
			aggPipe.push({ "$match": match1 });
			let match2: any = {};
			match2.rosterDate = { "$gte": startdate, "$lte": enddate };
			aggPipe.push({ "$match": match2 });
			let project = {
				createdAt: 0, updatedAt: 0, cab: 0
			};
			aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let roster = await this.aggregate("roasters", aggPipe, {});
			// return roster;

			// Check and remove roster of weekOff from the resulting array
			let resultArr: any = [];
			for (let ros of roster) {
				let rosterDate = moment(ros.rosterDate);
				const dow = rosterDate.add({ 'days': 1 }).subtract({ 'hours': 5, 'minutes': 30 }).day();
				// const dow = moment(ros.rosterDate).day();
				let rost = ros.route.employees.filter(s => { return s.empId === params.userId && s.weekOff.includes(dow); });
				if (rost.length === 0)
					resultArr.push(ros);
			}
			return resultArr;

		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function rosterEmp
	 * @description employee get rosters of driver cab and emp list who rides with him
	 * @param params
	 */
	async rosterEmp(params: TokenData) {
		let sdt = moment().startOf('day').subtract({ 'hours': 5, 'minutes': 30 }).format('x');
		// let sdt = moment().startOf('day').format('x');
		let edt = moment().endOf('day').format('x');
		let startdate = parseInt(sdt);
		let enddate = parseInt(edt);
		let today = new Date();
		let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
		// let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		let time = today.getHours() + ":" + today.getMinutes();
		let timeBufer = (today.getHours() + 1) + ":" + today.getMinutes();
		let dateTime = date + ' ' + time;
		let aggPipe = [];
		let match1: any = {};
		match1 = { $and: [{ rideCompleted: { $eq: false } }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }, { "route.employees.empId": { "$eq": params.userId } }, { companyCode: { $eq: params.companyCode } }] };
		aggPipe.push({ "$match": match1 });
		let match2: any = {};
		match2.rosterDate = { "$eq": startdate };
		aggPipe.push({ "$match": match2 });
		let match3: any = {};
		match3 = {
			$or: [{ $and: [{ "route.shiftTime": { "$gte": time } }, { "route.shiftType": { "$eq": 'login' } }] },
			{ $and: [{ rideStarted: { "$eq": false } }, { "route.shiftTime": { "$gte": time } }, { "route.shiftType": { "$eq": 'logout' } }] },
			{ $and: [{ rideStarted: { "$eq": true } }, { "route.shiftTime": { "$lte": time } }, { "route.shiftType": { "$eq": 'logout' } }] },
			{ $and: [{ rideCompleted: { "$eq": false } }, { rideStarted: { "$eq": false } }, { "route.shiftTime": { "$lte": timeBufer } }, { "route.shiftType": { "$eq": 'logout' } }] }]
		};
		// match3 = {
		// 	$or: [{ $and: [{ "route.shiftTime": { "$gte": time } }, { "route.shiftType": { "$eq": 'login' } }] },
		// 	{ $and: [{ "route.rideStarted": { "$eq": false } }, { "route.shiftTime": { "$gte": time } }, { "route.shiftType": { "$eq": 'logout' } }] },
		// 	{ $and: [{ "route.rideStarted": { "$eq": true } }, { "route.shiftTime": { "$lte": time } }, { "route.shiftType": { "$eq": 'logout' } }] }]
		// };
		// aggPipe.push({ "$match": match3 });

		// aggPipe.push({ "$skip": 0 });
		let sort = {};
		sort = { "route.shiftTime": 1 };
		aggPipe.push({ "$sort": sort });
		aggPipe.push({ "$limit": 1 });
		let project = {
			createdAt: 0, updatedAt: 0
		};
		aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let roster = await this.aggregate("roasters", aggPipe, {});
		// return roster;
		// Check and remove roster of weekOff from the resulting array
		let resultArr: any = [];
		// const dow = moment().endOf('day').day();
		let rosterDate = moment().endOf('day');
		// const dow = rosterDate.add({ 'days': 1 }).subtract({ 'hours': 5, 'minutes': 30 }).day();
		const dow = rosterDate.day();
		for (let ros of roster) {
			let rost = ros.route.employees.filter(s => { return s.empId === params.userId && s.weekOff.includes(dow); });
			if (rost.length === 0)
				resultArr.push(ros);
		}
		return resultArr;
	}
	// crfTimings adminData -satyam
	async adminData(params: TokenData) {
		let query: any = {};
		// query["company_code"] = params.companyCode;
		// companyCode -- satyam
		query["companyCode"] = params.companyCode;
		query["adminType"] = config.CONSTANT.ADMIN_TYPE.ADMIN;
		let projection: any = {};
		let options: any = {};
		return await this.findOne('admins', query, projection, options);
	}

	/**
	 * @function rosterListDriver
	 * @description employee get rosters of driver cab and emp list who rides with him
	 * @param params
	 */
	async rosterListDriver(params: ListingRequest) {
		try {
			let sdt = moment().startOf('day').subtract({ 'hours': 5, 'minutes': 30 }).format('x');
			// let sdt = moment().startOf('day').format('x');
			let edt = moment().endOf('day').format('x');
			let crtdate = parseInt(sdt);
			let enddate = parseInt(edt);
			let { pageNo, limit, fromDate, toDate, tripStatus } = params;
			let today = new Date();
			let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
			let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
			let dateTime = date + ' ' + time;
			let aggPipe = [];
			let match1: any = {};
			if (params.tripStatus === config.CONSTANT.TRIP_STATUS.TRIP_COMPLETED) {
				match1 = {
					$and: [{ rideStarted: { "$eq": false } }, { rideCompleted: { "$eq": true } }, { rosterDate: { "$lte": crtdate } },
					{ status: { $ne: config.CONSTANT.STATUS.DELETED } }, { "cab.driverMapped._id": { "$eq": appUtils.toObjectId(params.userId) } }, { companyCode: { $eq: params.companyCode } }]
				};
			} else {
				match1 = {
					$and: [{ rideCompleted: { "$eq": false } }, { rosterDate: { "$gte": crtdate } }, { status: { $ne: config.CONSTANT.STATUS.DELETED } },
					{ "cab.driverMapped._id": { "$eq": appUtils.toObjectId(params.userId) } }, { companyCode: { $eq: params.companyCode } }]
				};
			}
			aggPipe.push({ "$match": match1 });
			let sort = {};
			// Added id & shiftTime - Shivakumar A
			sort = { "rosterDate": 1, "_id": 1, "shiftTime": 1};
			aggPipe.push({ "$sort": sort });
			let match4: any = {};
			if (fromDate) {
				match4.rosterDate = { "$eq": fromDate };
				aggPipe.push({ "$match": match4 });
			}

			if (pageNo && limit) {
				let skip = (pageNo - 1) * limit;
				aggPipe.push({ "$skip": skip });
				aggPipe.push({ "$limit": limit });

			}
			let project = {
				createdAt: 0, updatedAt: 0
			};
			aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let roster = await this.aggregate("roasters", aggPipe, {});
			// return roster;

			// Check and remove roster of weekOff from the resulting array
			let resultArr: any = [];
			for (let ros of roster) {
				let rosterDate = moment(ros.rosterDate);
				const dow = rosterDate.add({ 'days': 1 }).subtract({ 'hours': 5, 'minutes': 30 }).day();
				// console.log('rosterDate: ', ros.rosterDate, 'dow: ', dow);
				let rost = ros.route.employees.filter(s => { return s.weekOff.includes(dow); });
				if (rost.length !== ros.route.employees.length) {
					resultArr.push(ros);
				}
				// if (rost.length === 0) {
				// 	resultArr.push(ros);
				// }
			}
			let totalCount = await this.count('roasters', { ...match1, ...match4 });
			let isNext = pageNo * limit;
			let isNextPage;
			if (isNext < totalCount) {
				isNextPage = true;
			} else {
				isNextPage = false;
			}
			let response: any = {};
			response.isNextPage = isNextPage;
			response.roster = resultArr;
			return response;

		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function nextTripDriver
	 * @param driverId
	 * @description next trip if shift time not expired
	 */
	async nextTripDriver(params: TokenData) {
		let tripData: any = {};
		let rosterData: any = {};
		rosterData = await this.rosterDriver(params);
		if (rosterData.length > 0) {
			// Check and remove roster of weekOff from the resulting array
			let expiredRoster: any = [];
			for (let ros of rosterData) {
				let rosterDate = moment().endOf('day');
				const dow = rosterDate.day();
				// console.log('');
				console.log('rosterDate: ', ros.rosterDate, 'dow: ', dow, 'shiftTime: ', ros.route.shiftTime, 'shiftType: ', ros.route.shiftType);
				let rost = await ros.route.employees.filter(s => { return s.weekOff.includes(dow); });
				if (rost.length !== ros.route.employees.length) {
					// console.log('ros.route.shiftTime: ', ros.route.shiftTime);
					if (ros.route.shiftType === config.CONSTANT.SHIFT_TYPE.LOGIN) {
						let time = moment().add({ 'hours': 5, 'minutes': 30 }).format('HH:mm');
						// let time = moment().format('HH:mm');
						console.log(time + "==time" + ros.route.shiftTime + "==shiftTime" + ros.route.shiftType + "++++++++++++++++++++++++++++++++++++shiftType");
						if (ros.route.shiftTime < time && ros.rideStarted === false) {
							expiredRoster.push(ros._id);
						} else {
							// console.log('expiredRoster: ', expiredRoster);
							// Added rideMissed - Shivakumar A
							if (expiredRoster.length > 0)
								await this.updateMany("roasters", { "_id": { "$in": expiredRoster }, "rideStarted": false }, { rideCompleted: true, rideMissed: true }, { new: true });
							return [ros];
						}
					} else if (ros.route.shiftType === config.CONSTANT.SHIFT_TYPE.LOGOUT) {
						let time = moment().add({ 'hours': 5, 'minutes': 30 }).format('HH:mm');
						// let time = moment().format('HH:mm');
						let timeBuffer = moment(ros.route.shiftTime, 'HH:mm').add(config.CONSTANT.CAB_BUFFER, 'minutes').format('HH:mm');
						console.log(time + "==time" + ros.route.shiftTime + "==shiftTime" + ros.route.shiftType + "+shiftType" + timeBuffer + "==timeBuffer");
						if (time > timeBuffer && ros.rideStarted === false) {
							expiredRoster.push(ros._id);
						} else {
							// console.log('expiredRoster: ', expiredRoster);
							// Added rideMissed - Shivakumar A
							await this.updateMany("roasters", { "_id": { "$in": expiredRoster }, "rideStarted": false }, { rideCompleted: true, rideMissed: true }, { new: true });
							return [ros];
						}
					} else {
						return [ros];
					}
				}
				else {
					expiredRoster.push(ros._id);
				}
			}
		    // Added rideMissed - Shivakumar A
			await this.updateMany("roasters", { "_id": { "$in": expiredRoster }, "rideStarted": false }, { rideCompleted: true , rideMissed: true }, { new: true });
			return [];
		} else {
			return rosterData;
		}

		// tripData = rosterData[0];
		// // let today = new Date();
		// // let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
		// // // let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		// // let time = today.getHours() + ":" + today.getMinutes();
		// // let timeBufer = (today.getHours() + 1) + ":" + today.getMinutes();
		// // let dateTime = date + ' ' + time;
		// if (tripData) {
		// 	if (tripData.route.shiftType === config.CONSTANT.SHIFT_TYPE.LOGIN) {
		// 		let time = moment().add({ 'hours': 5, 'minutes': 30 }).format('HH:mm');
		// 		console.log(time + "==time" + tripData.route.shiftTime + "==shiftTime" + tripData.route.shiftType + "++++++++++++++++++++++++++++++++++++shiftType");
		// 		if (tripData.route.shiftTime < time && tripData.rideStarted === false) {
		// 			let query1: any = {};
		// 			query1._id = tripData._id;
		// 			query1.rideStarted = false;
		// 			let update1 = {};
		// 			update1["$set"] = {
		// 				"rideCompleted": true
		// 			};
		// 			let options = { new: true };
		// 			// await this.updateOne("roasters", query1, update1, options);
		// 			rosterData = await this.rosterDriver(params);
		// 			return rosterData;
		// 		} else {
		// 			return rosterData;
		// 		}
		// 	} else if (tripData.route.shiftType === config.CONSTANT.SHIFT_TYPE.LOGOUT) {
		// 		let time = moment().add({ 'hours': 5, 'minutes': 30 }).format('HH:mm');
		// 		let timeBuffer = moment(tripData.route.shiftTime, 'HH:mm').add(config.CONSTANT.CAB_BUFFER, 'minutes').format('HH:mm');
		// 		// let bufferTime = tripData.route.shiftTime + tripData.route.totalTripTime + 60;
		// 		console.log(time + "==time" + tripData.route.shiftTime + "==shiftTime" + tripData.route.shiftType + "+shiftType" + timeBuffer + "==timeBuffer");
		// 		if (time > timeBuffer && tripData.rideStarted === false) {
		// 			let query1: any = {};
		// 			query1._id = tripData._id;
		// 			query1.rideStarted = false;
		// 			let update1 = {};
		// 			update1["$set"] = {
		// 				"rideCompleted": true
		// 			};
		// 			let options = { new: true };
		// 			// await this.updateOne("roasters", query1, update1, options);
		// 			rosterData = await this.rosterDriver(params);
		// 			return rosterData;
		// 		} else {
		// 			return rosterData;
		// 		}
		// 	} else {
		// 		return rosterData;
		// 	}
		// } else {
		// 	return rosterData;
		// }
	}

	/**
	 * @function rosterDriver
	 * @description employee get rosters of driver cab and emp list who rides with him
	 * @param params
	 */
	async rosterDriver(params: TokenData) {
		try {
			let sdt = moment().startOf('day').subtract({ 'hours': 5, 'minutes': 30 }).format('x');
			// let sdt = moment().startOf('day').format('x');
			let edt = moment().endOf('day').format('x');
			let startdate = parseInt(sdt);
			let enddate = parseInt(edt);
			let today = new Date();
			let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
			// let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
			let time = today.getHours() + ":" + today.getMinutes();
			let timeBufer = (today.getHours() + 1) + ":" + today.getMinutes();
			let dateTime = date + ' ' + time;
			let aggPipe = [];
			let match1: any = {};
			match1 = { $and: [{ rideCompleted: { $eq: false } }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }, { "cab.driverMapped._id": { "$eq": appUtils.toObjectId(params.userId) } }, { companyCode: { $eq: params.companyCode } }] };
			aggPipe.push({ "$match": match1 });
			let match2: any = {};
			match2.rosterDate = { "$eq": startdate }; // { "$gte": startdate, "$lte": enddate };
			aggPipe.push({ "$match": match2 });
			let match3: any = {};
			// match3 = {
			// 	$or: [{ $and: [{ "route.shiftTime": { "$gte": time } }, { "route.shiftType": { "$eq": 'login' } }] },
			// 	{ $and: [{ rideStarted: { "$eq": false } }, { "route.shiftTime": { "$gte": time } }, { "route.shiftType": { "$eq": 'logout' } }] },
			// 	{ $and: [{ rideStarted: { "$eq": true } }, { "route.shiftTime": { "$lte": time } }, { "route.shiftType": { "$eq": 'logout' } }] },
			// 	{ $and: [{ rideCompleted: { "$eq": false } }, { rideStarted: { "$eq": false } }, { "route.shiftTime": { "$lte": timeBufer } }, { "route.shiftType": { "$eq": 'logout' } }] }]
			// };
			// match3 = {
			// 	$or: [{ $and: [{ "route.shiftTime": { "$gte": time } }, { "route.shiftType": { "$eq": 'login' } }] },
			// 	{ $and: [{ "route.rideStarted": { "$eq": false } }, { "route.shiftTime": { "$gte": time } }, { "route.shiftType": { "$eq": 'logout' } }] },
			// 	{ $and: [{ "route.rideStarted": { "$eq": true } }, { "route.shiftTime": { "$lte": time } }, { "route.shiftType": { "$eq": 'logout' } }] }]
			// };
			// aggPipe.push({ "$match": match3 });

			// aggPipe.push({ "$skip": 0 });
			let sort = {};
			sort = { "route.shiftTime": 1 };
			aggPipe.push({ "$sort": sort });
			// aggPipe.push({ "$limit": 1 });
			let project = {
				createdAt: 0, updatedAt: 0
			};
			aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let roster = this.aggregate("roasters", aggPipe, {});
			return roster;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function checkAllnextTripDriver
	 * @param driverId
	 * @description next trip if shift time not expired - Shivakumar A
	 */
	async checkAllnextTripDriver() {
		let tripData: any = {};
		let rosterData: any = {};
		rosterData = await this.checkAllrosterDriver();
		if (rosterData.length > 0) {
			// Check and remove roster of weekOff from the resulting array
			let expiredRoster: any = [];
			for (let ros of rosterData) {
				let rosterDate = moment().endOf('day');
				const dow = rosterDate.day();
				let rost = await ros.route.employees.filter(s => { return s.weekOff.includes(dow); });
				if (rost.length !== ros.route.employees.length) {
					if (ros.route.shiftType === config.CONSTANT.SHIFT_TYPE.LOGIN) {
						let time = moment().add({ 'hours': 5, 'minutes': 30 }).format('HH:mm');
						// let time = moment().format('HH:mm');
						if (ros.route.shiftTime < time && ros.rideStarted === false) {
							expiredRoster.push(ros._id);
						} else {
							if (expiredRoster.length > 0)
								// emppickUpstatus-- missed- satyam
								// await this.updateMany("roasters", { "_id": { "$in": expiredRoster }, "rideStarted": false }, { rideCompleted: true, rideMissed: true }, { new: true });
								await this.updateMany("roasters", { "_id": { "$in": expiredRoster }, "rideStarted": false }, { $set: {rideCompleted: true, rideMissed: true, 'route.employees.$[].pickupStatus' : 9} }, { new: true });
							return [ros];
						}
					} else if (ros.route.shiftType === config.CONSTANT.SHIFT_TYPE.LOGOUT) {
						let time = moment().add({ 'hours': 5, 'minutes': 30 }).format('HH:mm');
						// let time = moment().format('HH:mm');
						let timeBuffer = moment(ros.route.shiftTime, 'HH:mm').add(config.CONSTANT.CAB_BUFFER, 'minutes').format('HH:mm');
						if (time > timeBuffer && ros.rideStarted === false) {
							expiredRoster.push(ros._id);
						} else {
							// emppickUpstatus-- missed- satyam
							// await this.updateMany("roasters", { "_id": { "$in": expiredRoster }, "rideStarted": false }, { rideCompleted: true, rideMissed: true }, { new: true });
							await this.updateMany("roasters", { "_id": { "$in": expiredRoster }, "rideStarted": false }, { $set: {rideCompleted: true, rideMissed: true, 'route.employees.$[].pickupStatus' : 9} }, { new: true });
							return [ros];
						}
					} else {
						return [ros];
					}
				}
				else {
					expiredRoster.push(ros._id);
				}
			}
			// emppickUpstatus-- missed- satyam
			// await this.updateMany("roasters", { "_id": { "$in": expiredRoster }, "rideStarted": false }, { rideCompleted: true, rideMissed: true }, { new: true });
			await this.updateMany("roasters", { "_id": { "$in": expiredRoster }, "rideStarted": false }, { $set: {rideCompleted: true, rideMissed: true, 'route.employees.$[].pickupStatus' : 9} }, { new: true });
			return [];
		} else {
			return rosterData;
		}
	}

	/**
	 * @function rosterDriver
	 * @description employee get rosters of driver cab and emp list who rides with him
	 * @param params - Shivakumar A
	 */

	async checkAllrosterDriver() {
		try {
			let sdt = moment().startOf('day').subtract({ 'hours': 5, 'minutes': 30 }).format('x');
			// let sdt = moment().startOf('day').add( { 'day': 1}).format('x');
			let edt = moment().endOf('day').format('x');
			let startdate = parseInt(sdt);
			let enddate = parseInt(edt);
			let today = new Date();
			let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
			// let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
			let time = today.getHours() + ":" + today.getMinutes();
			let timeBufer = (today.getHours() + 1) + ":" + today.getMinutes();
			let dateTime = date + ' ' + time;
			let aggPipe = [];
			let match1: any = {};
			match1 = { $and: [{ rideCompleted: { $eq: false } }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }] };
			aggPipe.push({ "$match": match1 });
			let match2: any = {};
			match2.rosterDate = { "$eq": startdate }; // { "$gte": startdate, "$lte": enddate };
			aggPipe.push({ "$match": match2 });
			let match3: any = {};
			// match3 = {
			// 	$or: [{ $and: [{ "route.shiftTime": { "$gte": time } }, { "route.shiftType": { "$eq": 'login' } }] },
			// 	{ $and: [{ rideStarted: { "$eq": false } }, { "route.shiftTime": { "$gte": time } }, { "route.shiftType": { "$eq": 'logout' } }] },
			// 	{ $and: [{ rideStarted: { "$eq": true } }, { "route.shiftTime": { "$lte": time } }, { "route.shiftType": { "$eq": 'logout' } }] },
			// 	{ $and: [{ rideCompleted: { "$eq": false } }, { rideStarted: { "$eq": false } }, { "route.shiftTime": { "$lte": timeBufer } }, { "route.shiftType": { "$eq": 'logout' } }] }]
			// };
			// match3 = {
			// 	$or: [{ $and: [{ "route.shiftTime": { "$gte": time } }, { "route.shiftType": { "$eq": 'login' } }] },
			// 	{ $and: [{ "route.rideStarted": { "$eq": false } }, { "route.shiftTime": { "$gte": time } }, { "route.shiftType": { "$eq": 'logout' } }] },
			// 	{ $and: [{ "route.rideStarted": { "$eq": true } }, { "route.shiftTime": { "$lte": time } }, { "route.shiftType": { "$eq": 'logout' } }] }]
			// };
			// aggPipe.push({ "$match": match3 });

			// aggPipe.push({ "$skip": 0 });
			let sort = {};
			sort = { "route.shiftTime": 1 };
			aggPipe.push({ "$sort": sort });
			// aggPipe.push({ "$limit": 1 });
			let project = {
				createdAt: 0, updatedAt: 0
			};
			aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let roster = this.aggregate("roasters", aggPipe, {});
			return roster;
		} catch (error) {
			throw error;
		}
	}

	async compare(a, b) {
		if (a.last_nom < b.last_nom) {
			return -1;
		}
		if (a.last_nom > b.last_nom) {
			return 1;
		}
		return 0;
	}

	//   objs.sort( compare );
	/**
	 * @function cab  get route of employee
	 * @param params
	 */
	async cabRouteEmployee(params) {
		let query: any = {};
		query["employees.empId"] = params.userId;
		let projection: any = {};
		let options: any = {};
		return await this.findOne('cab_routes', query, projection, options);
	}

	/**
	* @function rosterAdmin
	*/
	async rosterAdmin(params: ListingRequest) {
		let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, shiftType, tripStatus, shiftName, employeeId } = params;
		let sdt = moment().startOf('day').subtract({ 'hours': 5, 'minutes': 30 }).format('x');
		// let sdt = moment().startOf('day').format('x');
		let startdate = parseInt(sdt);
		let aggPipe = [];
		let match1: any = {};
		let completed;
		// employeesDetailsRoster -satyam
		// if (tripStatus === config.CONSTANT.TRIP_STATUS.TRIP_COMPLETED) {
		// 	completed = true;
		// } else {
		// 	completed = false;
		// }
		if (tripStatus === config.CONSTANT.TRIP_STATUS.TRIP_COMPLETED) {
			completed = true;
			if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {

				match1 = { "$and": [{ "rideCompleted": { "$eq": completed } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
			} else {
				match1 = {
					"$and": [{ "rideCompleted": { "$eq": completed } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.SUB_ADMIN } },
					{ "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyCode": { "$eq": params.companyCode } }]
				};
			}
		} else if (tripStatus === config.CONSTANT.TRIP_STATUS.ALL_TRIP){
			if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {

				match1 = { "$and": [ { "$or": [{ "rideCompleted": { "$eq": true }}, { "rideCompleted": { "$eq": false }}] }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
			} else {

				match1 = {
					"$and": [{ "rideCompleted": { "$eq": completed } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.SUB_ADMIN } },
					{ "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyCode": { "$eq": params.companyCode } }]
				};
			}
		}else{
			completed = false;
			if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {

				match1 = { "$and": [{ "rideCompleted": { "$eq": completed } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
			} else {
				match1 = {
					"$and": [{ "rideCompleted": { "$eq": completed } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.SUB_ADMIN } },
					{ "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyCode": { "$eq": params.companyCode } }]
				};
			}
		}
		// if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN) {
		// Added Access for Subadmin - Shivakumar A
		// if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {

		// 	match1 = { "$and": [{ "rideCompleted": { "$eq": completed } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
		// } else {
		// 	match1 = {
		// 		"$and": [{ "rideCompleted": { "$eq": completed } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.SUB_ADMIN } },
		// 		{ "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyCode": { "$eq": params.companyCode } }]
		// 	};
		// }

		let match7 = {};
		if (searchKey) {
			match7["$or"] = [
				{ "route.employees.name": { "$regex": searchKey, "$options": "-i" } },
				{ "route.employees.employeeId": { "$regex": searchKey, "$options": "-i" } },
				{ "cab.driverMapped.name": { "$regex": searchKey, "$options": "-i" } },
				{ "cab.driverMapped.driverId": { "$regex": searchKey, "$options": "-i" } },
				{ "cab.cabBadge": { "$regex": searchKey, "$options": "-i" } },
				{ "route.shiftName": { "$regex": searchKey, "$options": "-i" } },
				// Added vendorname, routeName - Shivakumar A
				{ "cab.vendor.name": { "$regex": searchKey, "$options": "-i" } },
				{ "route.routeName": { "$regex": searchKey, "$options": "-i" } },

			];
			aggPipe.push({ "$match": match7 });
		}

		aggPipe.push({ "$match": match1 });
		let match2: any = {};
		if (shiftType) {
			match2["route.shiftType"] = { "$eq": shiftType };
			aggPipe.push({ "$match": match2 });
		}
		let match3: any = {};
		if (status) {
			match3.status = { "$eq": status };
			aggPipe.push({ "$match": match3 });
		}

		let match4: any = {};
		if (fromDate && !toDate) {
			match4.rosterDate = { "$gte": fromDate };
			aggPipe.push({ "$match": match4 });
		}

		let match5: any = {};
		if (toDate && !fromDate) {
			match5.rosterDate = { "$lte": toDate };
			aggPipe.push({ "$match": match5 });
		}

		let match6: any = {};
		if (fromDate && toDate && tripStatus === config.CONSTANT.TRIP_STATUS.TRIP_COMPLETED) {
			match6.rosterDate = { "$gte": fromDate, "$lte": toDate };
			aggPipe.push({ "$match": match6 });
		} else if (fromDate && toDate && tripStatus === config.CONSTANT.TRIP_STATUS.TRIP_ONGOING) {
			match6.rosterDate = { "$gte": fromDate, "$lte": toDate };
			aggPipe.push({ "$match": match6 });
			// employeeDetailsRoster -- satyam
		} else if (fromDate && toDate && tripStatus === config.CONSTANT.TRIP_STATUS.ALL_TRIP) {
			match6.rosterDate = { "$gte": fromDate, "$lte": toDate };
			aggPipe.push({ "$match": match6 });
			// rosterLOgic -- satyam
		} else if (fromDate && !toDate && tripStatus === config.CONSTANT.TRIP_STATUS.ALL_TRIP) {
			match6.rosterDate = { "$gte": fromDate};
			aggPipe.push({ "$match": match6 });
		} else if (!fromDate && toDate && tripStatus === config.CONSTANT.TRIP_STATUS.ALL_TRIP) {
			match6.rosterDate = { "$lte": toDate };
			aggPipe.push({ "$match": match6 });
		} else {
			match6.rosterDate = { "$eq": startdate };
			// match6.rosterDate = { "$gte": startdate, "$lte": startdate };
			aggPipe.push({ "$match": match6 });
		}

		let match8: any = {};
		if (shiftName) {
			match8["route.shiftName"] = { "$eq": shiftName };
			aggPipe.push({ "$match": match8 });
		}
		// employeeDetails roster -- satyam
		let match9: any = {};
		if (employeeId) {
			match9["route.employees.employeeId"] = { "$eq": employeeId };
			aggPipe.push({ "$match": match9 });
		}

		let sort = {};
		if (sortBy && sortOrder) {
			sort = { "created": sortOrder };
		} else {
			// sort = { "rosterDate": 1 };
			// sort by shiftTime -- satyam
			if (tripStatus === 1){
				sort = { "rosterDate": 1 };
				// sequence -- satyam
			} else if (tripStatus === 5){
				sort = {"rosterDate": 1};
			}
			else {
				sort = { "route.shiftTime": 1 };
			}
		}
		aggPipe.push({ "$sort": sort });
		if (pageNo && limit) {
			let skip = (pageNo - 1) * limit;
			aggPipe.push({ "$skip": skip });
			aggPipe.push({ "$limit": limit });
		}
		let project = {
			createdAt: 0, updatedAt: 0
		};
		aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let rosterList = this.aggregate("roasters", aggPipe, {});
		let totalCount = this.count('roasters', { ...match1, ...match2, ...match3, ...match4, ...match5, ...match6, ...match7, ...match8, ...match9 });
		response = Promise.all([rosterList, totalCount]);
		return response;
	}

	/**
	 * @function rosterEndNotified
	 * @param params rosterEndDate
	 * @description before 5 day roster expired notified to admin using scheduler
	 */
	async rosterEndNotified() {
		let afterFiveDay = moment().startOf('day').subtract({ 'hours': 5, 'minutes': 30 }).add(5, 'days').format('x');
		let startdate = parseInt(afterFiveDay);
		let aggPipe = [];
		let match1: any = {};
		match1.validTill = { "$eq": startdate };
		aggPipe.push({ "$match": match1 });
		let group1: any = {};
		group1 = { "$group": { "_id": "$route._id", "createdBy": { "$first": "$createdBy" }, "routeBadge": { "$first": "$route.routeBadge" }, } };
		aggPipe.push(group1);
		let project = {
			routeBadge: 1, createdBy: 1
		};
		aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let rosterList = this.aggregate("roasters", aggPipe, {});
		return rosterList;
	}

	/**
	 * @function resolveSos
	 */
	async driverStartRide(params) {
		let query: any = {};
		query._id = params._id;
		let update = {};
		update["$set"] = {
			rideStarted: params.rideStarted,
			startLat: params.latitude,
			startLong: params.longitude,
		};
		let options = { new: true };
		return await this.findOneAndUpdate("roasters", query, update, options);
	}

	async driverAllOffborded(params) {
		let onTime;
		let query: any = {};
		query._id = params.rosterId;
		let update = {};
		let offboardTime = moment().subtract({ 'hours': 5, 'minutes': 30 }).format('HH:mm');
		if (moment(params.shiftTime, 'HH:mm').isBefore(moment().subtract({ 'hours': 5, 'minutes': 30 })))
			onTime = false;
		else
			onTime = true;

		update["$set"] = {
			rideStarted: params.rideStarted,
			rideCompleted: params.rideCompleted,
			onTime: onTime,
			offboardedAt: offboardTime
		};
		let options = { new: true };
		return await this.findOneAndUpdate("roasters", query, update, options);
	}

	async freeCabIfNoMoreRoster(params) {
		let busySlotObj: any = {};
		let from, to;
		let roster = await this.findOne("roasters", { "_id": params._id }, {}, {});
		let rosterDate = moment(roster.rosterDate);
		let nextRosterDate = rosterDate.add(1, 'days').format('x');
		let route = roster.route;
		let query: any = {};
		query["route._id"] = roster.route._id;
		query["cab._id"] = roster.cab._id;
		query.rosterDate = nextRosterDate;
		let isExist = await this.find("roasters", query, {}, {});
		if (isExist.length > 0) {
			// console.log("Next day's roster exist!");
		}
		else {

			if (route.shiftType === 'login') {
				from = moment(route.shiftTime, 'HH:mm').subtract(config.CONSTANT.CAB_BUFFER + route.totalTripTime, 'minutes').format('HH:mm');
				to = moment(route.shiftTime, 'HH:mm').add(config.CONSTANT.CAB_BUFFER, 'minutes').format('HH:mm');
				busySlotObj.from = from;
				busySlotObj.to = to;
			}
			else if (route.shiftType === 'logout') {
				from = moment(route.shiftTime, 'HH:mm').subtract(config.CONSTANT.CAB_BUFFER, 'minutes').format('HH:mm');
				to = moment(route.shiftTime, 'HH:mm').add(config.CONSTANT.CAB_BUFFER + route.totalTripTime, 'minutes').format('HH:mm');
				busySlotObj.from = from;
				busySlotObj.to = to;
			}
			// console.log('busySlot: ', busySlotObj);
			let query1: any = { "_id": roster.cab._id };
			let update1: any = {};
			let options1 = { new: true };
			update1["$pull"] = {
				"busySlots": busySlotObj
			};
			await this.updateOne("cabs", query1, update1, options1);
			console.log('');
		}
		// let update = {};
		// update["$set"] = {
		// 	rideStarted: params.rideStarted,
		// 	rideCompleted: params.rideCompleted,
		// };
		// let options = { new: true };
		// return await this.findOneAndUpdate("roasters", query, update, options);
	}

	async otpUpdateEmpRoster(empId, otp, rosterId, shiftType) {
		let query: any = {};
		query._id = rosterId;
		query["route.employees.empId"] = empId;
		let update = {};
		if (shiftType === config.CONSTANT.SHIFT_TYPE.LOGOUT) {
			update["$set"] = {
				"route.employees.$.pickupStatus": config.CONSTANT.EMP_PICKUP_STATUS.STARTRIDE,
				"route.employees.$.otp": otp,
				"route.employees.$.reachedTime": Date.now()
			};
		}
		else {
			update["$set"] = {
				"route.employees.$.pickupStatus": config.CONSTANT.EMP_PICKUP_STATUS.STARTRIDE,
				"route.employees.$.otp": otp
			};
		}
		let options = { new: true };
		return await this.updateMany("roasters", query, update, options);
	}
	async empStatusUpdate(param) {
		let query: any = {};
		let query1: any = {};
		query1._id = param.rosterId;
		query._id = param.rosterId;
		query["route.employees.empId"] = param.empId;
		let update = {};
		let update1 = {};
		let flag = 0;
		if (param.noShowReason || param.reason) {
			flag = 1;
			update["$set"] = {
				"route.employees.$.pickupStatus": param.pickupStatus,
				"route.employees.$.noShowReason": param.noShowReason,
				// Added seen, noshowedAt field - Shivakumar A
				"route.employees.$.seen": param.seen,
				"route.employees.$.noshowedAt": Date.now(),
			};
		} else if (param.sosGenerated) {
			update["$set"] = {
				"route.employees.$.sosGenerated": param.sosGenerated,
				"route.employees.$.sosLatitude": param.sosLatitude,
				"route.employees.$.sosLongitude": param.sosLongitude,
				"route.employees.$.sosLocation": param.sosLocation,

			};
			update1["$set"] = {
				isSosGenerated: true,
			};
			let options = { new: true };
			await this.findOneAndUpdate("roasters", query1, update1, options);
			return await this.findOneAndUpdate("roasters", query, update, options);
		} else if (param.isDriverNotified) {
			update["$set"] = {
				"route.employees.$.isDriverNotified": param.isDriverNotified,
			};
		} else {
			update["$set"] = {
				"route.employees.$.pickupStatus": param.pickupStatus,
				"route.employees.$.reachedTime": param.reachedTime ? param.reachedTime : Date.now(),
			};
		}

		let options = { new: true };
		let updaterosterData = await this.updateMany("roasters", query, update, options);
		if (flag === 1) {
			let rosterData = await this.findOne('roasters', { _id: param.rosterId }, {}, {});
			let employeeList = rosterData.route.employees;
			let empArray: any = [];
			for (let item of employeeList) {
				if (item.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED) {
					empArray.push(item);
				}
			}
			if (empArray.length === 0) {
				let query1: any = {};
				query1._id = param.rosterId;
				query1.rideStarted = false;
				let update1 = {};
				update1["$set"] = {
					"rideCompleted": true
				};
				let options = { new: true };

				return await this.updateOne("roasters", query1, update1, options);
			} else {
				return updaterosterData;
			}
		} else {
			return updaterosterData;
		}
	}
	async driverStatusUpdate(param) {
		let query: any = {};
		query._id = param.rosterId;
		query["cab.driverMapped._id"] = param.driverId;
		let update = {};
		update["$set"] = {
			"cab.driverMapped.$.sosGenerated": param.sosGenerated,
			"cab.driverMapped.$.sosLatitude": param.sosLatitude,
			"cab.driverMapped.$.sosLongitude": param.sosLongitude,
			"cab.driverMapped.$.sosLocation": param.sosLocation,
		};

		let options = { new: true };
		return await this.updateMany("roasters", query, update, options);
	}

	/**
	 * @function resolveSos
	 */
	async roasterTripType(params, employeeList) {
		let query: any = {};
		query._id = params._id;
		let update = {};
		update["$set"] = {
			tripType: params.driverTripType ? params.driverTripType : config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE,
		};

		let options = { new: true };
		return await this.findOneAndUpdate("roasters", query, update, options);
	}

	/**
	 * @param roasterData
	 */
	async roasterData(rosterId) {
		let query: any = {};
		query._id = rosterId;
		let projection: any = {};
		let options: any = {};
		let response = await this.findOne('roasters', query, projection, options);
		return response;
	}

	/**
	 * @param params trip data history
	 */
	async roasterHistoryAdd(rideHistoryData, data) {
		let params: any = {};
		let employeeList = rideHistoryData.employeeList;
		let options: any = {};
		if (employeeList.length && employeeList.length > 0) {
			let arrayData = [];
			await employeeList.forEach(element => {
				let rideObj: any = {};
				rideObj.empId = element.empId._id;
				rideObj.created = Date.now();
				rideObj.driverId = data.userId;
				rideObj.cabId = rideHistoryData.cabDriver._id;
				rideObj.pickupStatus = element.empId.pickupStatus;
				rideObj.noShowReason = element.empId.noShowReason ? element.empId.noShowReason : "";
				rideObj.tripType = rideHistoryData.roasters.tripType;
				rideObj.roasterId = rideHistoryData.roasters._id;

				arrayData.push(rideObj);
			});
			await this.insertMany('roaster_histories', arrayData, options);
		}
	}
	/**
	 * ratingEmpRoster rating update for driver
	 */
	async ratingEmpRoster(params: RoasterUpdateRequest) {
		let query: any = {};
		query._id = params.rosterId;
		query["route.employees.empId"] = params.userId;
		let update = {};
		update["$set"] = {
			"route.employees.$.rating": params.rating,
		};
		let options = { new: true };
		return await this.updateMany("roasters", query, update, options);
	}
	/**
	 * @function ratingRoster
	 * @param params rosterId
	 */
	async ratingRoster(params: RoasterUpdateRequest) {
		let query: any = {};
		query._id = params.rosterId;
		let update = {};
		update["$set"] = {
			"avgRating": params.avgRating,
			"totalRating": params.totalRating,
		};
		let options = { new: true };
		return await this.updateMany("roasters", query, update, options);
	}
	/**
	 * @function tripCancel
	 * Trip cancel by roster id
	 */
	async tripCancel(param: RoasterTripCancelRequest) {
		let query: any = {};
		query._id = param.rosterId;
		query["route.employees.empId"] = param.userId;
		let update = {};
		update["$set"] = {
			"route.employees.$.pickupStatus": config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED,
			"route.employees.$.noShowReason": param.noShowReason
		};
		let options = { new: true };
		// return await this.updateMany("roasters", query, update, options);
		await this.updateMany("roasters", query, update, options);
		let emp = await this.findOne('users', { _id: param.userId }, {}, {});
		let rosterData = await this.findOne('roasters', { _id: param.rosterId }, {}, {});
		let employeeList = rosterData.route.employees;
		let empArray: any = [];
		for (let item of employeeList) {
			if (item.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED) {
				empArray.push(item);
			}
		}
		if (empArray.length === 0) {
			let query1: any = {};
			query1._id = param.rosterId;
			query1.rideStarted = false;
			let update1 = {};
			update1["$set"] = {
				"rideCompleted": true
			};
			let options = { new: true };

			await this.updateOne("roasters", query1, update1, options);
		}
		let data: any = {};
		// Added newCabBadgeId field to data - Shivakumar A
		data.newCabBadgeId = rosterData.cab.routeNo;
		// Added cancelledAt  - Shivakumar A
		data.cancelledAt = Date.now();
		data.userId = param.userId;
		data.companyCode = emp.companyCode;
		data.email = emp.email;
		data.name = emp.name;
		data.employeeId = emp.employeeId;
		// Added gender - Shivakumar A
		data.gender = emp.gender;
		data.mobileNo = emp.mobileNo;
		data.roster = rosterData;
		data.rosterId = rosterData._id;
		data.reason = param.noShowReason;
		data.scheduleTime = rosterData.rosterDate;
		data.shiftTime = rosterData.route.shiftTime;
		data.shiftName = rosterData.route.shiftName;
		data.shiftType = rosterData.route.shiftType;
		data.requestType = config.CONSTANT.TRIP_RESCHEDULE.CANCELLED;
		data.pickUpLocation = emp.pickup.address.fullAddress;
		return await rescheduleDao.rescheduleTrip(data);
	}
}