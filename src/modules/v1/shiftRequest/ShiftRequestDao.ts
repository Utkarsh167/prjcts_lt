"use strict";

import * as _ from "lodash";
import * as promise from "bluebird";
import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/constant";
import * as shiftRequestConstant from "@modules/v1/shiftRequest/shiftRequestConstant";
import { promises } from "fs";
import { constants } from "zlib";
import { Query } from "mongoose";
import * as config1 from "@config/index";
import { ok } from "assert";
import { AdminDao } from "@modules/v1/admin/AdminDao";
import { LoginHistoryDao } from "@modules/v1/loginHistory/LoginHistoryDao";
const distFrom = require('distance-from');
import * as pushNotification from '@utils/pushNotification';

let loginHistoryDao = new LoginHistoryDao();
let adminDao = new AdminDao();
export class ShiftRequestDao extends BaseDao {

	/**
	 * Add a new shift change request
	 */
	async addShiftRequest(params: ShiftRequest) {
		try {
			// console.log('params: ', params);
			let admin = await adminDao.findAdminById({ userId: params.userId });
			// console.log('admin: ', admin);
			let employee = await this.findOne("users", { "employeeId": params.employeeId }, {}, {});
			// Start of office to employee max distance check code ----------------------------------------------------------
			let distance = distFrom([admin.companyAddress.coordinates[1], admin.companyAddress.coordinates[0]]).to([employee.pickup.coordinates[1], employee.pickup.coordinates[0]]);
			if (distance.distance.v > admin.maxGroupRadius) {
				// console.log('###skipped employee with distance: ', distance.distance.v);
				return Promise.reject(shiftRequestConstant.MESSAGES.ERROR.MAX_GROUP_RADIUS_EXCEEDS);
			}
			// End of office to employee max distance check code ------------------------------------------------------------------------------------------------
			// console.log('distance.distance.v: ', distance.distance.v);
			let shiftReqObj: any = {};
			let query: any = {
				"employeeId": params.employeeId,
				"validTill": { "$gte": params.validFrom },
				"status": { "$eq": config.CONSTANT.REQUEST_STATUS.REQUESTED }
			};
			let projection: any = {};
			let option: any = {};
			let isExist = await this.findOne("shift_request", query, projection, option);
			if (isExist)
				return Promise.reject(shiftRequestConstant.MESSAGES.ERROR.REQUEST_EXIST);
			// let employee = await this.findOne("users", {"employeeId": params.employeeId}, {}, {});
			shiftReqObj.employeeId = params.employeeId;
			shiftReqObj.shiftName = params.shiftName;
			shiftReqObj.weekOff = params.weekOff;
			shiftReqObj.validFrom = params.validFrom;
			shiftReqObj.validTill = params.validTill;
			shiftReqObj.createdBy = params.userId;
			shiftReqObj.adminType = params.adminType;
			shiftReqObj.companyCode = params.companyCode;
			shiftReqObj.name = employee.name;
			shiftReqObj.email = employee.email;
			// Added gender - Shivakumar A
			shiftReqObj.gender = employee.gender;
			return await this.save("shift_request", shiftReqObj);
		} catch (error) {
			throw error;
		}
	}

	/**
		 * @function bulkShiftRequest
		 */
	async bulkShiftRequest(params) {
		return await this.insertMany("shift_request", params, { new: true });
	}

	/**
	 * @function routeList
	 */
	async shiftRequestList(params: ShiftRequestListing) {
		try {
			let { pageNo, limit, searchKey, sortBy, sortOrder, status, shiftName } = params;
			let aggPipe = [];

			let match1 = {};
			if (searchKey) {
				match1["$or"] = [
					{ "name": { "$regex": searchKey, "$options": "-i" } },
					{ "employeeId": { "$regex": searchKey, "$options": "-i" } },
					{ "shiftName": { "$regex": searchKey, "$options": "-i" } },
					{ "email": { "$regex": searchKey, "$options": "-i" } },
				];
				aggPipe.push({ "$match": match1 });
			}
			let match2: any = {};
			if (status)
				match2["status"] = status;
			else {
				match1["$or"] = [
					{ "status": config.CONSTANT.REQUEST_STATUS.REQUESTED },
					{ "status": config.CONSTANT.REQUEST_STATUS.EXPIRED }
				];
			}
			aggPipe.push({ "$match": match2 });
			let match3: any = {};
			match3 = { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
			aggPipe.push({ "$match": match3 });

			let match4: any = {};
			if (shiftName) {
				match4.shiftName = { "$eq": shiftName };
				aggPipe.push({ "$match": match4 });
			}

			let sort = {};
			if (sortBy && sortOrder) {
				if (sortBy === "validFrom") {
					sort = { "validFrom": sortOrder };
				} else {
					sort = { "created": sortOrder };
				}
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
			// 	_id: 1, cabModel: 1, created: 1, "assigned": "$driverMapped.assigned", "color": "$vendor.color", "vendorName": "$vendor.name",
			// 	statePermitNumber: 1, countryPermitNumber: 1, cabBadge: 1, type: 1, status: 1, registrationNo: 1, adminType: 1, seatingCapacity: 1,
			// };
			// aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let response: any = {};
			let shiftRequestList = this.aggregate("shift_request", aggPipe, {});
			let totalCount = this.count('shift_request', { ...match1, ...match2, ...match3, ...match4});
			response = Promise.all([shiftRequestList, totalCount]);
			return response;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function updatedGroupList
	 */
	async updatedGroupList(params: UpdatedGroupListing) {
		try {
			let { pageNo, limit, searchKey, sortBy, sortOrder } = params;
			let aggPipe = [];

			let match1 = {};
			if (searchKey) {
				match1["$or"] = [
					{ "routeBadge": { "$regex": searchKey, "$options": "-i" } },
					{ "shiftName": { "$regex": searchKey, "$options": "-i" } }
				];
				aggPipe.push({ "$match": match1 });
			}

			let match2: any = {};
			match2 = { "$and": [{ "status": { "$eq": config.CONSTANT.STATUS.UN_EXECUTED } }, { "companyCode": { "$eq": params.companyCode } }] };
			aggPipe.push({ "$match": match2 });

			// let match1: any = {};
			// match1.status = { "$ne": config.CONSTANT.STATUS.DELETED };
			// aggPipe.push({ "$match": match1 });

			let sort = {};
			if (sortBy && sortOrder) {
				if (sortBy === "shiftName") {
					sort = { "shiftName": sortOrder };
				} else {
					sort = { "created": sortOrder };
				}
			} else {
				//  -sort = { "createdAt": -1 };
				// sort by shiftTime - satyam
				sort = { "shiftTime": 1 };
			}
			aggPipe.push({ "$sort": sort });
			if (pageNo && limit) {
				let skip = (pageNo - 1) * limit;
				aggPipe.push({ "$skip": skip });
				aggPipe.push({ "$limit": limit });
			}
			// let project = {
			// 	_id: 1, cabModel: 1, created: 1, "assigned": "$driverMapped.assigned", "color": "$vendor.color", "vendorName": "$vendor.name",
			// 	statePermitNumber: 1, countryPermitNumber: 1, cabBadge: 1, type: 1, status: 1, registrationNo: 1, adminType: 1, seatingCapacity: 1,
			// };
			// aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let response: any = {};
			let shiftRequestList = this.aggregate("updated_routes", aggPipe, {});
			let totalCount = this.count('updated_routes', { ...match1, ...match2 });
			response = Promise.all([shiftRequestList, totalCount]);
			return response;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Add a new shift change request
	 */
	async rosterUpdate(params: RosterUpdate) {
		try {
			let query: any = {};
			query._id = { $in: params.groups };
			let groups = await this.find("cab_routes", query, {}, {});
			if (groups.length > 0) {
				for (let gr of groups) {
					// console.log('gr: ', gr);
					let roster = await this.updateMany("roasters", { "route._id": gr._id, "rideStarted": false, "rideCompleted": false }, { "route": gr }, {});
					// console.log('roster: ', roster);
					let employeeList = gr.employees;
					// let empIdArray = _.map(employeeList, 'empId');
					let empMessage;
					let empTitle;
					for (let emp of employeeList) {
						let userDevice = await loginHistoryDao.findChunkDevice(emp.empId);
						if (gr.shiftType === config.CONSTANT.SHIFT_TYPE.LOGIN) {
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
				let updated_groups = await this.updateMany("updated_routes", { "grpDbId": { "$in": params.groups } }, { "status": config.CONSTANT.STATUS.EXECUTED }, {});
				return ok;
			}
			return ok;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Add a new shift change request
	 */
	async deleteShiftRequest(params: ShiftRequestDelete) {
		try {
			let deleteShiftRequest = await this.update("shift_request", { "_id": params.shiftRequestId }, { "status": config.CONSTANT.REQUEST_STATUS.DELETED }, {});
			return deleteShiftRequest;
		} catch (error) {
			throw error;
		}
	}

}