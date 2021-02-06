"use strict";

import * as _ from "lodash";
import * as promise from "bluebird";
import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/constant";
import * as rescheduleConstant from "@modules/v1/rescheduleRide/rescheduleConstant";
import { promises } from "fs";
import { constants } from "zlib";
import { AdminDao } from "@modules/v1/admin/AdminDao";
import { LoginHistoryDao } from "@modules/v1/loginHistory/LoginHistoryDao";
import * as pushNotification from '@utils/pushNotification';
import * as moment from "moment";

let adminDao = new AdminDao();
let loginHistoryDao = new LoginHistoryDao();
export class RescheduleDao extends BaseDao {

	/**
	 * @function rescheduleList
	 */
	async rescheduleList(params: ListingRequest) {
		try {
			// let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, userType } = params;
			// filter -- satyam
			let { pageNo, limit, searchKey, sortBy, sortOrder, status, shiftType, fromDate, toDate, userType, shiftName } = params;
			let aggPipe = [];

			let match1: any = {};
			match1 = { "$and": [{ "companyCode": { "$eq": params.companyCode } }, { "requestType": { "$eq": config.CONSTANT.TRIP_RESCHEDULE.RESCHEDULE } }] };
			aggPipe.push({ "$match": match1 });
			let match3: any = {};
			if (status) {
				match3.status = { "$eq": status };
				aggPipe.push({ "$match": match3 });
			}

			let match4: any = {};
			if (fromDate && !toDate) {
				match4.created = { "$gte": fromDate };
				aggPipe.push({ "$match": match4 });
			}

			let match5: any = {};
			if (toDate && !fromDate) {
				match5.created = { "$lte": toDate };
				aggPipe.push({ "$match": match5 });
			}

			let match6: any = {};
			if (fromDate && toDate) {
				match6.created = { "$gte": fromDate, "$lte": toDate };
				aggPipe.push({ "$match": match6 });
			}
			// filter -- satyam
			let match7: any = {};
			if (shiftName) {
				match7.shiftName = { "$eq": shiftName };
				aggPipe.push({ "$match": match7 });
			}
			let match8: any = {};
			if (shiftType) {
				match8.shiftType = { "$eq": shiftType };
				aggPipe.push({ "$match": match8 });
			}
			let match9: any = {};
			if (searchKey) {
				match9["$or"] = [
					{ "name": { "$regex": searchKey, "$options": "-i" } },
					{ "email": { "$regex": searchKey, "$options": "-i" } },
					{ "employeeId": { "$regex": searchKey, "$options": "-i" } },
					{ "newCabBadgeId": { "$regex": searchKey, "$options": "-i" } },
				];
				aggPipe.push({ "$match": match9 });
			}
			let sort = {};
			if (sortBy && sortOrder) {
				sort = { "created": sortOrder };
			} else {
				sort = { "createdAt": -1 };
			}
			aggPipe.push({ "$sort": sort });
			if (pageNo && limit) {
				let skip = (pageNo - 1) * limit;
				aggPipe.push({ "$skip": skip });
				aggPipe.push({ "$limit": limit });

			}

			// let project = {
			// 	_id: 1, userId: 1, reason: 1, status: 1
			// };
			// aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let response: any = {};
			// let populate = [
			// 	{
			// 		path: 'userId',
			// 		model: "user",
			// 		select: "_id email countryCode mobileNo profilePicture",
			// 	},
			// ];
			// let rescheduleList = await this.aggregateDataWithPopulate("reschedules", aggPipe, populate);
			let rescheduleList = this.aggregate("reschedules", aggPipe, {});
			let totalCount = this.count('reschedules', { ...match1, ...match3, ...match4, ...match5, ...match6 });
			response = Promise.all([rescheduleList, totalCount]);
			return response;
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function monthRescheduleCount
	 */
	// async monthRescheduleCount(params) {
	// 	let aggPipe = [];
	// 	let sdt = moment().startOf('month').format('x');
	// 	let edt = moment().endOf('month').format('x');
	// 	let match2: any = {};
	// 	match2.userId = params.userId;
	// 	let match1: any = {};
	// 	match1.created = { "$gte": sdt, "$lte": edt };
	// 	let totalCount;
	// 	return totalCount = this.count('reschedules', { ...match1, ...match2 });
	// }
	async monthRescheduleCount(params) {
        let aggPipe = [];
        let sdt = moment().startOf('month').format('x');
        let edt = moment().endOf('month').format('x');
        let match2: any = {};
        match2.userId = params.userId;
        let match1: any = {};
        match1.created = { "$gte": sdt, "$lte": edt };
        match1.requestType = { "$eq": config.CONSTANT.TRIP_RESCHEDULE.RESCHEDULE };
        let totalCount;
        return totalCount = this.count('reschedules', { ...match1, ...match2 });
    }
	/**
	 * @function cancelledList
	 * @param params page no and date
	 */
	async cancelledList(params: ListingRequest) {
		try {
			// let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, userType, FromCancelled } = params;
			// filter -- satyam
			let { pageNo, limit, searchKey, sortBy, sortOrder, status, shiftType, fromDate, toDate, userType, FromCancelled, shiftName } = params;
			let aggPipe = [];

			let match1: any = {};
			match1 = { "$and": [{ "companyCode": { "$eq": params.companyCode } }, { "requestType": { "$eq": config.CONSTANT.TRIP_RESCHEDULE.CANCELLED } }] };
			aggPipe.push({ "$match": match1 });
			let match3: any = {};
			if (status) {
				match3.status = { "$eq": status };
				aggPipe.push({ "$match": match3 });
			}

			// let match4: any = {};
			// if (fromDate && !toDate) {
			// 	match4.created = { "$gte": fromDate };
			// 	aggPipe.push({ "$match": match4 });
			// }

			// let match5: any = {};
			// if (toDate && !fromDate) {
			// 	match5.created = { "$lte": toDate };
			// 	aggPipe.push({ "$match": match5 });
			// }

			// let match6: any = {};
			// if (fromDate && toDate) {
			// 	match6.created = { "$gte": fromDate, "$lte": toDate };
			// 	aggPipe.push({ "$match": match6 });
			// }
			// filter -- satyam
			let match4: any = {};
			if (fromDate && !toDate) {
				match4.cancelledAt = { "$gte": fromDate };
				aggPipe.push({ "$match": match4 });
			}

			let match5: any = {};
			if (toDate && !fromDate) {
				match5.cancelledAt = { "$lte": toDate };
				aggPipe.push({ "$match": match5 });
			}

			let match6: any = {};
			if (fromDate && toDate) {
				match6.cancelledAt = { "$gte": fromDate, "$lte": toDate };
				aggPipe.push({ "$match": match6 });
			}
			let match7: any = {};
			if (shiftName) {
				match7.shiftName = { "$eq": shiftName };
				aggPipe.push({ "$match": match7 });
			}
			let match8: any = {};
			if (shiftType) {
				match8.shiftType = { "$eq": shiftType };
				aggPipe.push({ "$match": match8 });
			}
			let match9: any = {};
			if (searchKey) {
				match9["$or"] = [
					{ "name": { "$regex": searchKey, "$options": "-i" } },
					{ "email": { "$regex": searchKey, "$options": "-i" } },
					{ "employeeId": { "$regex": searchKey, "$options": "-i" } },
					{ "newCabBadgeId": { "$regex": searchKey, "$options": "-i" } },
					{ "mobileNo": { "$regex": searchKey, "$options": "-i" } },
				];
				aggPipe.push({ "$match": match9 });
			}
			let sort = {};
			// if (sortBy && sortOrder) {
			// 	sort = { "created": sortOrder };
			// } else {
			// 	sort = { "createdAt": -1 };
			// }
			if (sortBy && sortOrder) {
				sort = { "cancelledAt": sortOrder };
			} else {
				sort = { "cancelledAt": -1 };
			}
			aggPipe.push({ "$sort": sort });
			if (pageNo && limit) {
				let skip = (pageNo - 1) * limit;
				aggPipe.push({ "$skip": skip });
				aggPipe.push({ "$limit": limit });

			}

			// Get Count of Pending SOS Query - Shivakumar A
			let pendingSOScountMatch: any = {};
			pendingSOScountMatch = {
				"$or": [{
					"status": config.CONSTANT.USER_QUERY_STATUS.PENDING // 4 is pending
				},
				// marksafed -- satyam
				// {
				// 	"status": config.CONSTANT.USER_QUERY_STATUS.MARKSAFE // 3 is marksafe
				// }
				],
				"$and": [{ "queryType": { "$eq": config.CONSTANT.QUERY_TYPE.SOS } }, { "companyCode": { "$eq": params.companyCode } }] // 2 is Sos
			};
			// Get Count of Pending AddressChange Query - Shivakumar A
			let pendingAddresscountMatch: any = {};
			pendingAddresscountMatch.isAddressChangeReq = { "$eq": true };
			pendingAddresscountMatch.userType = { "$eq": config.CONSTANT.USER_TYPE.EMPLOYEE }; // 1 is employee
			pendingAddresscountMatch.companyCode = { "$eq": params.companyCode };

			// Get Count of Pending Reschedule Query - Shivakumar A
			let pendingReschedulecountMatch: any = {};
			pendingReschedulecountMatch.status = { "$eq": config.CONSTANT.USER_QUERY_STATUS.PENDING }; // 4 is pending reschedules
			pendingReschedulecountMatch.requestType = { "$eq": config.CONSTANT.TRIP_RESCHEDULE.RESCHEDULE }; // 2 is reschedule
			pendingReschedulecountMatch.companyCode = { "$eq": params.companyCode };

			// Get Count of Pending OtherRequests Query - Shivakumar A
			let pendingOtherRequestscountMatch: any = {};
			pendingOtherRequestscountMatch.queryType = { "$eq": config.CONSTANT.QUERY_TYPE.QUERY };
			pendingOtherRequestscountMatch.seen = { "$eq": false };
			pendingOtherRequestscountMatch.companyCode = { "$eq": params.companyCode };

			// Get Count of Unseen Cancelled Query - Shivakumar A
			let pendingCancelledcountMatch: any = {};
			pendingCancelledcountMatch.seen = { "$eq": false };
			pendingCancelledcountMatch.requestType = { "$eq": config.CONSTANT.TRIP_RESCHEDULE.CANCELLED }; // 1 is Cancelled
			pendingCancelledcountMatch.companyCode = { "$eq": params.companyCode };

			// let project = {
			// 	_id: 1, userId: 1, reason: 1, status: 1
			// };
			// aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let response: any = {};
			let rescheduleList = this.aggregate("reschedules", aggPipe, {});
			let totalCount = this.count('reschedules', { ...match1, ...match3, ...match4, ...match5, ...match6 });
			// Get Count of Pending SOS - Shivakumar A
			let pendingSosCount = this.count('user_querys', { ...pendingSOScountMatch });
			// Get Count of Pending Address change - Shivakumar A
			let pendingAddressCount = this.count('users', { ...pendingAddresscountMatch });
			// Get Count of Pending Reschedule  - Shivakumar A
			let pendingRescheduleCount = this.count('reschedules', { ...pendingReschedulecountMatch });
			// Get Count of other requests change - Shivakumar A
			let pendingOtherRequestsCount = this.count('user_querys', { ...pendingOtherRequestscountMatch });
			// Get Count of other Cancelled change - Shivakumar A
			let pendingCancelledCount = this.count('reschedules', { ...pendingCancelledcountMatch });
			// Get Count of No Show - Shivakumar A
			let pendingNoShowCount = this.aggregate("roasters", [{ $unwind: "$route.employees" },
			{
				$match: {
					$and: [{ status: { $ne: config.CONSTANT.STATUS.DELETED } },
					{ "route.employees.pickupStatus": { "$eq": config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW } }, { companyCode: { $eq: params.companyCode } }, { "route.employees.seen": { $eq: false } }]
				}
			}, { $group: { _id: null, count: { $sum: 1 } } }], {});

			// response = Promise.all([rescheduleList, totalCount]);
			// Add pendingSosCount to response array - Shivakumar A
			response = Promise.all([rescheduleList, totalCount, pendingSosCount, pendingAddressCount, pendingRescheduleCount, pendingOtherRequestsCount, pendingCancelledCount, pendingNoShowCount]);
			// Update seen in Cancelled after sending response - Shivakumar A
			if (FromCancelled) {
				let addressChangeQuery = {};
				let addressChangeoptions = { new: true };
				this.updateMany("reschedules", addressChangeQuery, { "$set": { "seen": true } }, addressChangeoptions);
			}
			return response;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function rescheduleCancel
	 */
	async rescheduleCancel(params: TripCancelRequest) {
		let query: any = {};
		query = { $and: [{ "requestType": { "$eq": config.CONSTANT.TRIP_RESCHEDULE.RESCHEDULE } }, { "_id": { "$eq": params.rescheduleId } }] };
		let update = {};
		update["$set"] = {
			status: config.CONSTANT.USER_QUERY_STATUS.CANCELLED
		};
		let options = { new: true };
		return await this.findOneAndUpdate("reschedules", query, update, options);
	}

	/**
	 * @function rescheduleAccept
	 */
	async rescheduleAccept(params: TripAcceptRequest) {
		let rescheduleData = await this.findOne("reschedules", { "_id": params.rescheduleId }, {}, {});
		if (rescheduleData.rosterFound === true) {
			if (rescheduleData.oldGroupFormed) {
				let oldRosterUpdate = await this.update("roasters", { "_id": rescheduleData.rosterId }, { "route": rescheduleData.oldGroupFormed }, {});
				let employeeList = rescheduleData.oldGroupFormed.employees;
				// let empIdArray = _.map(employeeList, 'empId');
				let empMessage;
				let empTitle;
				for (let emp of employeeList) {
					let userDevice = await loginHistoryDao.findChunkDevice(emp.empId);
					if (rescheduleData.oldGroupFormed.shiftType === config.CONSTANT.SHIFT_TYPE.LOGIN) {
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
			}
			else {
				await this.deleteMany("roasters", { "_id": rescheduleData.rosterId });
			}
			let newRosterUpdate = await this.update("roasters", { "_id": rescheduleData.newRosterId }, { "route": rescheduleData.newGroupFormed }, {});
			let employeeList1 = rescheduleData.newGroupFormed.employees;
			// let empIdArray = _.map(employeeList1, 'empId');
			let empMessage1;
			let empTitle1;
			for (let emp of employeeList1) {
				let userDevice = await loginHistoryDao.findChunkDevice(emp.empId);
				if (rescheduleData.newGroupFormed.shiftType === config.CONSTANT.SHIFT_TYPE.LOGIN) {
					empTitle1 = config.CONSTANT.NOTIFICATION_TITLE.PICKUP_TIME_CHANGE;
					empMessage1 = config.CONSTANT.NOTIFICATION_MESSAGE.PICKUP_TIME_CHANGE + "" + emp.empPickupTime;
				} else {
					empTitle1 = config.CONSTANT.NOTIFICATION_TITLE.DROP_TIME_CHANGE;
					empMessage1 = config.CONSTANT.NOTIFICATION_MESSAGE.DROP_TIME_CHANGE + "" + emp.empDropTime;
				}
				let notificationData = {
					title: empTitle1,
					message: empMessage1,
					senderId: params.userId,
					notificationType: config.CONSTANT.NOTIFICATION_TYPE.EMP_PICKUP_TIME_CHANGE
				};
				pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
			}
			let query = { $and: [{ "requestType": { "$eq": config.CONSTANT.TRIP_RESCHEDULE.RESCHEDULE } }, { "_id": { "$eq": params.rescheduleId } }] };
			let update = {};
			update["$set"] = { status: config.CONSTANT.USER_QUERY_STATUS.RESOLVED };
			let options = { new: true };
			return await this.findOneAndUpdate("reschedules", query, update, options);
		}
		else {
			if (!params.cabId || !params.driverId) {
				return Promise.reject(rescheduleConstant.MESSAGES.ERROR.INVALID_CAB_DATA);
			} else {
				if (rescheduleData.oldGroupFormed) {
					let oldRosterUpdate = await this.update("roasters", { "_id": rescheduleData.rosterId }, { "route": rescheduleData.oldGroupFormed }, {});
					let employeeList = rescheduleData.oldGroupFormed.employees;
					// let empIdArray = _.map(employeeList, 'empId');
					let empMessage;
					let empTitle;
					for (let emp of employeeList) {
						let userDevice = await loginHistoryDao.findChunkDevice(emp.empId);
						if (rescheduleData.oldGroupFormed.shiftType === config.CONSTANT.SHIFT_TYPE.LOGIN) {
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
				}
				else {
					await this.deleteMany("roasters", { "_id": rescheduleData.rosterId });
				}
				params.rescheduleData = rescheduleData;
				let newRoster = await this.rescheduleRoster(params);
				let query = { $and: [{ "requestType": { "$eq": config.CONSTANT.TRIP_RESCHEDULE.RESCHEDULE } }, { "_id": { "$eq": params.rescheduleId } }] };
				let update = {};
				update["$set"] = { status: config.CONSTANT.USER_QUERY_STATUS.RESOLVED };
				let options = { new: true };
				return await this.findOneAndUpdate("reschedules", query, update, options);
			}
		}
	}
	/**
	 * @function contactAdmin
	 */
	async rescheduleRoster(params: TripAcceptRequest) {
		let arrDlt = [];
		let randomenumber = "ROS" + Math.floor(Math.random() * 100000) + 8;
		let admin = await adminDao.findAdminById(params);
		let rosterObj: any = {
			validFrom: params.rescheduleData.scheduleTime,
			validTill: params.rescheduleData.scheduleTime,
			roasterBadge: randomenumber,
			createdBy: params.userId,
			companyCode: params.companyCode,
			rosterDate: params.rescheduleData.scheduleTime,
			officeLocation: {
				lat: admin.companyAddress.coordinates[1],
				long: admin.companyAddress.coordinates[0]
			},
			officeAddress: admin.companyAddress.address
		};
		let query2: any = {};
		params.createdAt = new Date().getTime();
		rosterObj.route = params.rescheduleData.newGroupFormed;
		let cab = await this.findOne("cabs", { "_id": params.cabId }, {}, {});
		rosterObj.cab = cab;
		for (let [i, driver] of rosterObj.cab.driverMapped.entries()) {
			if (driver._id.toString() !== params.driverId.toString())
				// if (driver._id.toString() !== params.driverId.toString() || driver.shift.shiftTime !== rosterObj.route.shiftTime || driver.shift.shiftType !== rosterObj.route.shiftType)
				arrDlt.push(i);
		}
		_.pullAt(rosterObj.cab.driverMapped, arrDlt);
		await this.save("roasters", rosterObj);
		let query1: any = { "$and": [{ "_id": params.cabId }, { "driverMapped._id": params.driverId }] };
		// let query1: any = { "$and": [{ "_id": params.cabId }, { "driverMapped._id": params.driverId }, { "driverMapped.shift.shiftType": rosterObj.route.shiftType }, { "driverMapped.shift.shiftTime": rosterObj.route.shiftTime }] };
		let update1: any = {};
		let options1 = { new: true };
		update1["$set"] = {
			"driverMapped.$.booked": true
		};
		return await this.updateOne("cabs", query1, update1, options1);
	}
	/**
	 * @function contactAdmin
	 */
	async rescheduleTrip(params: RescheduleRequest) {
		// params.requestType = config.CONSTANT.TRIP_RESCHEDULE.RESCHEDULE;
		// Added newCabBadgeId to params - Shivakumar A
		params.newCabBadgeId = params.newCabBadgeId;
		return await this.save("reschedules", params);
	}

	/**
	 * @param roster
	 */
	async roaterData(rosterId) {
		let query: any = {};
		query._id = rosterId;
		let projection: any = {};
		let options: any = {};
		let response = await this.findOne('roasters', query, projection, options);
		return response;
	}

	async cancelTrip(params: RescheduleRequest) {
		params.requestType = config.CONSTANT.TRIP_RESCHEDULE.CANCELLED;
		params.reason = params.noShowReason;
		return await this.save("reschedules", params);
	}
	/**
	 * @function findUserById
	 */
	async findUserById(params: UserId) {
		let query: any = {};
		query._id = params.userId;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		let project = {
		};
		return await this.findOne("users", query, project, {});
	}
	/**
	 * findRescheduleById
	 * @param params
	 */
	async findRescheduleById(params: RescheduleId) {
		let query: any = {};
		query._id = params.rescheduleId;
		let project = {
		};
		return await this.findOne("reschedules", query, project, {});
	}
	/**
	 * @function findAdminShift
	 * @param params
	 */
	async findAdminShift(params: TokenData) {
		try {
			let query: any = {};
			query.companyCode = params.companyCode;
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
			let projection = { shiftSlot: 1 };
			return await this.findOne("admins", query, projection, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function noshowList
	 * @param params page no and date
	 * Shivakumar A
	*/

	async noshowList(params: ListingRequest) {
		try {
			// filter -- satyam
			// let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, userType, FromCancelled } = params;
			let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, userType, FromCancelled, shiftType, shiftName } = params;
			let aggPipe = [];
			let unwind: any = {};
			unwind = { $unwind: "$route.employees" };
			aggPipe.push(unwind);

			let match1: any = {};
			match1 = { $and: [{ status: { $ne: config.CONSTANT.STATUS.DELETED } }, { "route.employees.pickupStatus": { "$eq": config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW } }, { companyCode: { $eq: params.companyCode } }] };
			aggPipe.push({ "$match": match1 });
			let match3: any = {};
			if (status) {
				match3.status = { "$eq": status };
				aggPipe.push({ "$match": match3 });
			}
			// filter -- satyam
			// let match4: any = {};
			// if (fromDate && !toDate) {
			// 	match4.created = { "$gte": fromDate };
			// 	aggPipe.push({ "$match": match4 });
			// }

			// let match5: any = {};
			// if (toDate && !fromDate) {
			// 	match5.created = { "$lte": toDate };
			// 	aggPipe.push({ "$match": match5 });
			// }

			// let match6: any = {};
			// if (fromDate && toDate) {
			// 	match6.created = { "$gte": fromDate, "$lte": toDate };
			// 	aggPipe.push({ "$match": match6 });
			// }
			let match4: any = {};
			if (fromDate && !toDate) {
				match4["route.employees.noShowedAt"] = { "$gte": fromDate };
				aggPipe.push({ "$match": match4 });
			}

			let match5: any = {};
			if (toDate && !fromDate) {
				match5["route.employees.noShowedAt"] = { "$lte": toDate };
				aggPipe.push({ "$match": match5 });
			}

			let match6: any = {};
			if (fromDate && toDate) {
				match6["route.employees.noShowedAt"] = { "$gte": fromDate, "$lte": toDate };
				aggPipe.push({ "$match": match6 });
			}
			let match7: any = {};
			if (shiftName) {
				match7["route.shiftName"] = { "$eq": shiftName };
				aggPipe.push({ "$match": match7 });
			}
			let match8: any = {};
			if (shiftType) {
				match8["route.shiftType"] = { "$eq": shiftType };
				aggPipe.push({ "$match": match8 });
			}

			let sort = {};
			if (sortBy && sortOrder) {
				sort = { "created": sortOrder };
			} else {
				// sort = { "createdAt": -1 };
				// Sort by noShowedAt - Shivakumar A
				sort = { "route.employees.noshowedAt": -1 };
			}
			aggPipe.push({ "$sort": sort });
			if (pageNo && limit) {
				let skip = (pageNo - 1) * limit;
				aggPipe.push({ "$skip": skip });
				aggPipe.push({ "$limit": limit });

			}
			let option = { collation: { locale: "en", strength: 2 } };
			let response: any = {};
			// let noshowList = this.aggregate("roasters", aggPipe, {});
			let noshowList = this.aggregate("roasters", aggPipe, {});

			let totalCount = this.aggregate("roasters", [{ $unwind: "$route.employees" }, { $match: match1 }, { $group: { _id: null, count: { $sum: 1 } } }], {});
			response = Promise.all([noshowList, totalCount]);

			// Update as seen - Shivakumar A
			let NoshowQuery = { "route.employees": { "$elemMatch": { "pickupStatus": config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW } } };
			let Noshowoptions = { new: true, arrayFilters: [ {"i.pickupStatus": {$eq: config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW } } ] };
			this.updateMany("roasters", NoshowQuery, { "$set": { "route.employees.$[i].seen": true } }, Noshowoptions);
			return response;

		} catch (error) {
			throw error;
		}
	}

}