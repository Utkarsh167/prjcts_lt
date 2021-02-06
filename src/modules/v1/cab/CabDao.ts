"use strict";

import * as _ from "lodash";
import * as promise from "bluebird";
import * as appUtils from "@utils/appUtils";
import { Model } from "mongoose";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/constant";
import * as cabConstant from "@modules/v1/cab/cabConstant";
import { AdminDao } from "@modules/v1/admin/AdminDao";
import { promises } from "fs";
import { Mongoose } from "mongoose";
import * as mongoose from "mongoose";
import * as moment from "moment";

let adminDao = new AdminDao();
export class CabDao extends BaseDao {

	/**
	 * @function Vendorsignup
	 */
	async cabAdd(params: CabAddRequest) {
		params.createdAt = new Date().getTime();
		let vendorData: any = {};
		let query: any = {};
		query._id = params.vendorId;
		if (params.vendorId) {
			let vendorDetails = await this.findOne("vendors", query, {}, {});
			vendorData = {
				_id: vendorDetails._id,
				name: vendorDetails.name,
				email: vendorDetails.email,
				countryCode: vendorDetails.countryCode,
				mobileNo: vendorDetails.mobileNo,
				profilePicture: vendorDetails.profilePicture,
				badgeNo: vendorDetails.badgeNo,
			};
			params.vendor = vendorData;
		}
		let update = {};
		update["$inc"] = {
			cabCount: 1,
		};
		let options = { new: true };
		await this.findOneAndUpdate("vendors", query, update, options);
		return await this.save("cabs", params);
	}
	/**
	 * @function vendorCabCount
	 * @param params vendorBadgeNo, cabCount
	 * @description update cab count in vendor
	 */
	async vendorCabCount(params) {
		let query: any = {};
		query.badgeNo = params.vendorBadgeNo;
		let update = {};
		update["$inc"] = {
			cabCount: params.cabCount,
		};
		let options = { new: true };
		await this.findOneAndUpdate("vendors", query, update, options);
	}
	/**
	 * getting vendor details by vendorBadgeNo
	 */
	async getVendorDetails(params) {
		let query: any = {};
		query.badgeNo = params.vendorBadgeNo;
		let vendorDetails = await this.findOne("vendors", query, {}, {});
		return vendorDetails;
	}
	/**
	 * @function bulkCabSignup
	 */
	async bulkCabSignup(params) {
		console.log('paaraamss: ', params);
		return await this.insertMany("cabs", params, { new: true });
	}
	/**
	 * @function editCab
	 */
	async editCab(params: CabUpdateRequest) {
		let query: any = {};
		query._id = params.cabId;
		let query1: any = {};
		query1["cab._id"] = params.cabId;
		let update: any = {};
		let update1: any = {};

		/**
		 * Cab edit info
		 */
		let set = {};
		update["$set"] = set;

		let fieldsToFill = ["cabModel", "seatingCapacity", "registrationNo", "type", "statePermitNumber", "countryPermitNumber", "color", "fuelType", "transmissionType",
			"routeNo", "aggrementCopy", "companyIssuance", "rgsCertificate", "fitnessCertificate", "roadTax", "insurance", "statePermitForm", "allIndiaPermitForm", "driverOwner", "driverOnly",
			"ac", "panicButton", "toolKit", "spareWheel", "firstAidKit", "torchAmbrella", "fireExtingusher", "interiorExterior", "cabImage"];
		set = appUtils.setInsertObject(params, set, fieldsToFill);

		if (!_.isEmpty(set)) {
			update["$set"] = set;
		}

		// update["$set"] = {
		// 	"cabModel": params.cabModel,
		// };
		update1['$set'] = {
			"cab.$.cabModel": params.cabModel,
		};
		if (params.type) {
			// update.type = params.type;
			update1["cab.$.type"] = params.type;
		}
		if (params.registrationNo) {
			// update.registrationNo = params.registrationNo;
			update1["cab.$.registrationNo"] = params.registrationNo;
		}
		if (params.statePermitNumber) {
			// update.statePermitNumber = params.statePermitNumber;
			update1["cab.$.statePermitNumber"] = params.statePermitNumber;
		}
		if (params.countryPermitNumber) {
			// update.countryPermitNumber = params.countryPermitNumber;
			update1["cab.$.countryPermitNumber"] = params.countryPermitNumber;
		}
		if (params.vendorId) {
			let query1: any = {};
			query1._id = params.vendorId;
			let vendorData: any = {};
			update.vendorId = params.vendorId;
			let vendorDetails = await this.findOne("vendors", query1, {}, {});
			vendorData = {
				_id: vendorDetails._id,
				name: vendorDetails.name,
				email: vendorDetails.email,
				countryCode: vendorDetails.countryCode,
				mobileNo: vendorDetails.mobileNo,
				profilePicture: vendorDetails.profilePicture,
				badgeNo: vendorDetails.badgeNo,
			};
			// params.vendor = vendorData;
			update.vendor = vendorData;
		}
		let options = { new: true };
		let step1 = this.updateMany("users", query1, update1, options);
		return await this.findOneAndUpdate("cabs", query, update, options);
	}
	/**
	 * @function cabList
	 */
	async cabList(params: ListingRequest) {
		let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, assigned, vendorId, seatingCapacity } = params;
		let aggPipe = [];
		let match1: any = {};
		// if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN) {
		// Added access for subadmin - Shivakumar A
		if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {
			if (params.isArchived) {
				match1 = { "$and": [{ "status": { "$eq": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
			} else {
				match1 = { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
			}
		} else {
			if (params.isArchived) {
				match1 = {
					"$and": [{ "status": { "$eq": config.CONSTANT.STATUS.DELETED } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.SUB_ADMIN } },
					{ "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyCode": { "$eq": params.companyCode } }]
				};
			} else {
				match1 = {
					"$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.SUB_ADMIN } },
					{ "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyCode": { "$eq": params.companyCode } }]
				};
			}
		}
		// match = { "$and": [{ "adminType": { "$ne": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN } }, { "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyCode": { "$eq": params.companyCode } }] };
		aggPipe.push({ "$match": match1 });
		// let match1: any = {};
		// match1.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		// aggPipe.push({ "$match": match1 });

		let match2 = {};
		if (searchKey) {
			match2["$or"] = [
				{ "cabModel": { "$regex": searchKey, "$options": "-i" } },
				// commented registration No - Shivakumar - A
				// { "registrationNo": { "$regex": searchKey, "$options": "-i" } },
				{ "vendor.name": { "$regex": searchKey, "$options": "-i" } },
				// commented cabBadge - Shivakumar - A
				// { "cabBadge": { "$regex": searchKey, "$options": "-i" } },
				{ "routeNo": { "$regex": searchKey, "$options": "-i" } },
			];
			aggPipe.push({ "$match": match2 });
		}
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
		let match7: any = {};
		if (assigned === true) {
			match7["driverMapped.assigned"] = config.CONSTANT.DRIVER_ASSIGNED.ASSIGNED;
		} else if (assigned === false) {
			match7["driverMapped.assigned"] = config.CONSTANT.DRIVER_ASSIGNED.UNASSIGNED;
		}
		if (vendorId) {
			match7 = {
				"vendor._id": appUtils.toObjectId(vendorId)
			};
		}
		if (seatingCapacity) {
			match7.seatingCapacity = seatingCapacity;
		}
		aggPipe.push({ "$match": match7 });

		let sort = {};
		if (sortBy && sortOrder) {
			if (sortBy === "cabModel") {
				sort = { "cabModel": sortOrder };
			} else if (sortBy === "seatingCapacity") {
				sort = { "seatingCapacity": sortOrder };
			} else if (sortBy === "vendorName") {
				sort = { "vendor.name": sortOrder };
				// Added condition for cabBadge - Shivakumar A
			} else if (sortBy === "cabBadge") {
				sort = { "routeNo": sortOrder };
			}  else {
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
		let project = {
			// Added comment by satyam -- reasonForArchive
			_id: 1, cabModel: 1, created: 1, "assigned": "$driverMapped.assigned", "color": "$vendor.color", "vendorName": "$vendor.name",
			routeNo: 1, statePermitNumber: 1, countryPermitNumber: 1, cabBadge: 1, type: 1, status: 1, registrationNo: 1, adminType: 1, seatingCapacity: 1, comment: 1
		};
		aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let userList = this.aggregate("cabs", aggPipe, {});
		let totalCount = this.count('cabs', { ...match1, ...match2, ...match3, ...match4, ...match5, ...match6, ...match7 });
		response = Promise.all([userList, totalCount]);
		return response;
	}
	/**
	 * @function cabList
	 */
	async driverMappedList(params: ListingRequest) {
		let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, assigned, vendorId, seatingCapacity } = params;
		let aggPipe = [];

		let match1: any = {};
		match1 = { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
		aggPipe.push({ "$match": match1 });

		let match2 = {};
		if (searchKey) {
			match2["$or"] = [
				{ "cabModel": { "$regex": searchKey, "$options": "-i" } },
				{ "registrationNo": { "$regex": searchKey, "$options": "-i" } },
				{ "vendor.name": { "$regex": searchKey, "$options": "-i" } },
				// Added search on CabID - Shivakumar A
				{ "routeNo": { "$regex": searchKey, "$options": "-i" } }
			];
			aggPipe.push({ "$match": match2 });
		}
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
		let match7: any = {};
		if (assigned === true) {
			match7.assigned = true;
		} else if (assigned === false) {
			match7.assigned = false;
		}
		if (vendorId) {
			match7.vendorId = appUtils.toObjectId(vendorId);
		}
		if (seatingCapacity) {
			match7.seatingCapacity = seatingCapacity;
		}
		aggPipe.push({ "$match": match7 });
		aggPipe.push({ "$unwind": "$driverMapped" });
		let sort = {};
		if (sortBy && sortOrder) {
			if (sortBy === "cabModel") {
				sort = { "cabModel": sortOrder };
			} else if (sortBy === "seatingCapacity") {
				sort = { "seatingCapacity": sortOrder };
				// sort by cabId -- satyam
			} else if (sortBy === "cabBadge"){
				sort = { "routeNo": sortOrder  };
			}else {
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
		let project = {
			_id: 1, cabModel: 1, created: 1, driverMapped: 1, assigned: 1,
			"color": "$vendor.color", "vendorName": "$vendor.name",
			statePermitNumber: 1, countryPermitNumber: 1, cabBadge: 1, routeNo: 1,
			type: 1, status: 1, registrationNo: 1, adminType: 1,
			seatingCapacity: 1
		};
		aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let userList = this.aggregate("cabs", aggPipe, {});
		// Added total count - Shivakumar A
        let totalCount = this.count('cabs', { ...match1, ...match2, ...match3, ...match4, ...match5, ...match6, ...match7 });
        response = Promise.all([userList, totalCount]);
		return response;
	}
	/**
	 * @function findCabById
	 */
	async findCabById(params: CabId) {
		let query: any = {};
		query._id = params.cabId;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

		return await this.findOne("cabs", query, {}, {});
	}
	/**
	 * @function isCabAlreadyAssigned
	 * Is check cab is assign in trip or not
	 * @param params cab id
	 */
	async isCabAlreadyAssigned(params: CabId) {
		let query: any = {};
		// query._id = params.cabId;
		// query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		query = { "$and": [{ "busySlots": { "$exists": true } }, { "busySlots.0": { "$exists": true } }, { "_id": { "$eq": params.cabId } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }] };
		return await this.findOne("cabs", query, {}, {});
	}
	/**
	 * @function findCabById
	 */
	async companyShift(params) {
		let query: any = {};
		query._id = params.userId;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		let project = {
			shiftSlot: 1
		};
		return await this.findOne("admins", query, project, {});
	}
	/**
	 * @function blockUnblock
	 */
	async blockUnblock(params: BlockRequest) {
		let query: any = {};
		query._id = params.cabId;
		let query1: any = {};
		query1["cab._id"] = params.cabId;
		let options = {};
		let update1 = {};
		update1["$pull"] = {
			cab: { "_id": { "$in": [params.cabId] } },
		};
		await this.updateMany("users", query1, update1, options);
		let update = {};
		update["$set"] = {
			status: params.status,
			driverMapped: [],
		};

		return await this.findOneAndUpdate("cabs", query, update, options);
	}
	/**
	 * @function deleteCab
	 */
	async deleteCab(params: DeleteRequest) {
		let query: any = {};
		query._id = params.cabId;
		let query2: any = {};
		let query1: any = {};
		query1["cab._id"] = params.cabId;
		let options = {};
		let update1 = {};
		update1["$pull"] = {
			cab: { "_id": { "$in": [params.cabId] } },
		};
		await this.updateMany("users", query1, update1, options);
		let update = {};
		// reasonForArchive
		// update["$set"] = {
		// 	status: config.CONSTANT.STATUS.DELETED,
		// 	driverMapped: [],
		// };
		if ( params.comment ) {
			update["$set"] = {
				status: config.CONSTANT.STATUS.DELETED,
				comment: params.comment,
				driverMapped: [],
			};
		} else {
			update["$set"] = {
				status: config.CONSTANT.STATUS.DELETED,
				driverMapped: [],
			};
		}
		let cabDetails = await this.findOne("cabs", query, {}, {});
		query2._id = cabDetails.vendorId;
		let update2 = {};
		update2["$inc"] = {
			cabCount: -1,
		};
		let options1 = { new: true };
		await this.findOneAndUpdate("vendors", query2, update2, options1);
		return await this.findOneAndUpdate("cabs", query, update, options);
	}

	/**
	 * @function isDriverAssigned
	 */
	async isDriverAssigned(params) {
		let query: any = {};
		query["$or"] = [
			{
				"driverMapped._id": params.driverId,
				"driverMapped.shift.shift": params.shift,
				"driverMapped.shift.shiftType": params.shiftType,
				status: config.CONSTANT.STATUS.UN_BLOCKED
			},
			{
				"_id": params.cabId,
				"driverMapped.shift.shift": params.shift,
				"driverMapped.shift.shiftType": params.shiftType,
				status: config.CONSTANT.STATUS.UN_BLOCKED
			}
		];
		let isExist = await this.find("cabs", query, {}, {});
		if (isExist.length !== 0) {
			return Promise.reject(cabConstant.MESSAGES.ERROR.DRIVER_ASSIGNED);
		} else {
			return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
		}
	}

	/**
	 * @function driver assigned
	 */
	async driverAssign(params: CabDriverMappRequest) {
		let update: any = {};
		let update1: any = {};
		let query: any = {};
		let query1: any = {};
		query1._id = params.driverId;
		query._id = params.cabId;
		// let shiftArr: any = [];
		// await this.isDriverAssigned(params);
		// let shift = await adminDao.findAdminById(params);
		// let shiftSlot = shift.shiftSlot;
		// let driverShiftObj: any = {};
		// let shiftObj = _.find(shiftSlot, (obj) => { return obj.shiftName === params.shift; });
		// driverShiftObj._id = shiftObj._id;
		// driverShiftObj.shift = shiftObj.shiftName;
		// if (params.shiftType === 'login')
		// 	driverShiftObj.shiftTime = shiftObj.startShift;
		// else
		// 	driverShiftObj.shiftTime = shiftObj.endShift;
		// driverShiftObj.shiftType = params.shiftType;
		if (params.driverId && params.cabId) {
			let driverData: any = {};
			let driverDetails = await this.findOne("users", query1, {}, {});
			// New driver mapped in cab start code ======================================
			let cabDetails = await this.findOne("cabs", query, {}, {});
			let trackingData = cabDetails.driverMapped;
			let tracking: any = {};
			tracking.name = driverDetails.name,
				tracking._id = driverDetails._id,
				tracking.email = driverDetails.email,
				tracking.countryCode = driverDetails.countryCode,
				tracking.mobileNo = driverDetails.mobileNo,
				tracking.profilePicture = driverDetails.profilePicture,
				tracking.driverId = driverDetails.driverId,
				// tracking.shift = driverShiftObj,
				tracking.companyLocation = driverDetails.dropoff,
				trackingData.push(tracking);
			update['$set'] = {
				driverMapped: trackingData
			};
			// Driver cab mapping=========================================
			let driverCabMap = driverDetails.cab;
			let dcMap: any = {};
			let sdate = new Date(params.startShift);
			let edate = new Date(params.endShift);
			let startDate = sdate.getHours() + ":" + sdate.getMinutes();
			let endDate = sdate.getHours() + ":" + sdate.getMinutes();
			dcMap.cabModel = cabDetails.cabModel,
				dcMap._id = cabDetails._id,
				dcMap.registrationNo = cabDetails.registrationNo,
				dcMap.type = cabDetails.type,
				dcMap.cabBadge = cabDetails.cabBadge,
				dcMap.statePermitNumber = cabDetails.statePermitNumber,
				dcMap.countryPermitNumber = cabDetails.countryPermitNumber,
				dcMap.seatingCapacity = cabDetails.seatingCapacity,
				dcMap.routeNo = cabDetails.routeNo,
				// dcMap.shiftId = params.shiftId,
				// dcMap.startShift = params.startShift,
				// dcMap.endShift = params.endShift,
				// dcMap.startTime = startDate,
				// dcMap.startTime = endDate,
				// dcMap.shift = driverShiftObj,
				dcMap.vendor = cabDetails.vendor,
				driverCabMap.push(dcMap);
			update1['$set'] = {
				cab: driverCabMap
			};
		}
		let options: any = {};
		let response1 = this.findOneAndUpdate("users", query1, update1, options);
		let response2 = this.findOneAndUpdate("cabs", query, update, options);
		let responce = await promise.join(response1, response2);
		return responce[1];
	}

	/**
	 * @function driver assigned
	 */
	async driverUnAssign(params: CabDriverMappRequest) {
		let update: any = {};
		let update1: any = {};
		let query: any = {};
		let query1: any = {};
		query1._id = params.driverId;
		query._id = params.cabId;
		if (params.driverId && params.cabId) {
			update["$pull"] = {
				driverMapped: { "shiftId": { "$in": [params.shiftId] } },
			};
			// Driver cab mapping=========================================

			update1["$pull"] = {
				cab: { "shiftId": { "$in": [params.shiftId] } },
			};
		}
		let options: any = {};
		let response1 = this.findOneAndUpdate("users", query1, update1, options);
		let response2 = this.findOneAndUpdate("cabs", query, update, options);
		let responce = await promise.join(response1, response2);
		return responce[1];
	}
	/**
	 * @function cabDriverUpdate
	 */
	async cabDriverUpdate(params: CabDriverMappRequest) {
		let update: any = {};
		let update1: any = {};
		let update2: any = {};
		let update3: any = {};
		let query: any = {};
		let query1: any = {};
		let query2: any = {};
		let query3: any = {};
		query1._id = params.driverId;
		query._id = params.cabId;
		if (params.driverId && params.cabId) {
			let driverData: any = {};
			let driverDetails = await this.findOne("users", query1, {}, {});
			// New driver mapped in cab start code ======================================
			let cabDetails = await this.findOne("cabs", query, {}, {});
			// console.log('cabDetails: ', cabDetails);
			// console.log('cabDetails.driverMapped: ', cabDetails.driverMapped);
			if (cabDetails.driverMapped.length === 0) {
				return Promise.reject(cabConstant.MESSAGES.ERROR.DRIVER_UPDATE_ERROR);
			}
			query2._id = cabDetails.driverMapped[0]._id;
			update2["$pull"] = {
				cab: { "_id": params.cabId },
			};
			let trackingData = cabDetails.driverMapped;
			let tracking: any = {};
			tracking.name = driverDetails.name,
				tracking._id = driverDetails._id,
				tracking.email = driverDetails.email,
				tracking.countryCode = driverDetails.countryCode,
				tracking.mobileNo = driverDetails.mobileNo,
				tracking.profilePicture = driverDetails.profilePicture,
				tracking.driverId = driverDetails.driverId,
				tracking.companyLocation = driverDetails.dropoff,
				trackingData.push(tracking);
			update['$set'] = {
				"driverMapped": tracking
			};
			// Driver cab mapping=========================================
			let driverCabMap = driverDetails.cab;
			let dcMap: any = {};
			let sdate = new Date(params.startShift);
			let edate = new Date(params.endShift);
			let startDate = sdate.getHours() + ":" + sdate.getMinutes();
			let endDate = sdate.getHours() + ":" + sdate.getMinutes();
			dcMap.cabModel = cabDetails.cabModel,
				dcMap._id = cabDetails._id,
				dcMap.registrationNo = cabDetails.registrationNo,
				dcMap.type = cabDetails.type,
				dcMap.cabBadge = cabDetails.cabBadge,
				dcMap.statePermitNumber = cabDetails.statePermitNumber,
				dcMap.countryPermitNumber = cabDetails.countryPermitNumber,
				dcMap.seatingCapacity = cabDetails.seatingCapacity,
				dcMap.vendor = cabDetails.vendor,
				driverCabMap.push(dcMap);
			update1['$set'] = {
				cab: driverCabMap
			};

			// query3["cab._id"] = params.cabId;
			update3['$set'] = {
				"cab.driverMapped": tracking
			};
		}
		let options: any = {};
		let response1 = this.findOneAndUpdate("users", query1, update1, options);
		let response2 = this.findOneAndUpdate("cabs", query, update, options);
		let response3 = this.findOneAndUpdate("users", query2, update2, options);
		let response4 = this.updateMany("roasters", { "cab._id": params.cabId, "rideStarted": false, "rideCompleted": false }, update3, options);
		let response = await promise.join(response1, response2, response3, response4);
		return response[1];
	}

	/**
	 * @function onlineCabList
	 * @description online cab from roasters
	 * @param params
	 */
	async onlineCabList(params: TokenData) {
		let aggPipe = [];
		// let sdt = moment().startOf('day').format('x');
		let sdt = moment().startOf('day').subtract({ 'hours': 5, 'minutes': 30 }).format('x');
		let edt = moment().endOf('day').format('x');
		let startdate = parseInt(sdt);
		let enddate = parseInt(edt);
		let match1: any = {};
		match1 = { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
		aggPipe.push({ "$match": match1 });
		let match2: any = {};
		match2.rosterDate = { "$eq": startdate };
		aggPipe.push({ "$match": match2 });
		let match9: any = {};
		match9.rideStarted = true;
		match9.rideCompleted = false;
		aggPipe.push({ "$match": match9 });
		let match10: any = {};
		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let rosterList = this.aggregate("roasters", aggPipe, {});
		let totalCount = this.count('roasters', { ...match1, ...match2, ...match9, ...match10 });
		response = Promise.all([rosterList, totalCount]);
		return response;
	}

	/**
	 * @function cabRoasterList
	 * @description online cab, driver, employee details from roasters
	 * @param params
	 */
	async cabRoasterList(params: ListingRequest) {
		// Added shiftName - Shivakumar A
		let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, tripStatus, shiftName } = params;
		let aggPipe = [];
		// let sdt = moment().startOf('day').format('x');
		let sdt = moment().startOf('day').subtract({ 'hours': 5, 'minutes': 30 }).format('x');
		let edt = moment().endOf('day').format('x');
		let startdate = parseInt(sdt);
		let enddate = parseInt(edt);
		let match1: any = {};
		match1 = { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
		aggPipe.push({ "$match": match1 });
		let match2: any = {};
		match2.rosterDate = { "$eq": startdate };
		aggPipe.push({ "$match": match2 });
		let match12 = {};
		if (searchKey) {
			match12["$or"] = [
				{ "cab.cabModel": { "$regex": searchKey, "$options": "-i" } },
				{ "cab.registrationNo": { "$regex": searchKey, "$options": "-i" } },
				{ "cab.vendor.name": { "$regex": searchKey, "$options": "-i" } },
				{ "cab.cabBadge": { "$regex": searchKey, "$options": "-i" } },
				{ "cab.routeNo": { "$regex": searchKey, "$options": "-1" } }
			];
			aggPipe.push({ "$match": match12 });
		}
		let match3: any = {};
		if (params.shiftType) {
			match3 = { "route.shiftType": { "$eq": params.shiftType } };
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
		let match7: any = {};
		match7.rideStarted = false;
		match7.rideCompleted = false;
		let match8: any = {};
		match8.rideStarted = false;
		match8.rideCompleted = true;
		// Added rideMissed - Shivakumar A
		match8.rideMissed = false;

		let match9: any = {};
		match9.rideStarted = true;
		match9.rideCompleted = false;

		// Added match13 to get missed rides - Shivakumar A
		let match13: any = {};
		match13.rideStarted = false;
		match13.rideCompleted = true;
		match13.rideMissed = true;

		// Filter for Shift - Shivakumar A
		let match14: any = {};
		if (shiftName) {
			match14["route.shiftName"] = { "$eq": shiftName };
			aggPipe.push({ "$match": match14 });
		}

		let match10: any = {};
		if (tripStatus === config.CONSTANT.TRIP_STATUS.TRIP_COMPLETED) {
			match10.rideCompleted = true;
			// Added rideMissed - Shivakumar A
			match10.rideMissed = false;
			aggPipe.push({ "$match": match10 });
		} else if (tripStatus === config.CONSTANT.TRIP_STATUS.TRIP_ONGOING) {
			match10.rideStarted = true;
			aggPipe.push({ "$match": match10 });
		} else if (tripStatus === config.CONSTANT.TRIP_STATUS.TRIP_SCHEDULED) {
			match10 = {
				"$and": [{
					"rideStarted": { "$eq": false }
				}, {
					"rideCompleted": { "$eq": false }
				}]
			};
			aggPipe.push({ "$match": match10 });
			// check if tripstatus is missed - Shivakumar A
		} else if (tripStatus === config.CONSTANT.TRIP_STATUS.TRIP_MISSED) {
			match10.rideCompleted = true;
			match10.rideMissed = true;
			aggPipe.push({ "$match": match10 });
		}
		let match11: any = {};
		match11 = {
			// "$and": [{ "companyCode": { "$eq": params.companyCode } }, { "status": { "$eq": config.CONSTANT.USER_QUERY_STATUS.PENDING } }, { "createdAt": { $gte: new Date().setUTCHours(0, 0, 0) } }]
			// Added queryType Filter - Shivakumar A
			"$and": [{ "companyCode": { "$eq": params.companyCode } }, { "queryType": { "$eq": config.CONSTANT.QUERY_TYPE.SOS } }, { "status": { "$eq": config.CONSTANT.USER_QUERY_STATUS.PENDING } }, { "createdAt": { $gte: new Date().setUTCHours(0, 0, 0) } }]

		};
		// let project = {
		// 	_id: 1, cabModel: 1, created: 1, driverMapped: 1, assigned: 1,
		// 	"color": "$vendor.color", "vendorName": "$vendor.name",
		// 	statePermitNumber: 1, countryPermitNumber: 1, cabBadge: 1,
		// 	type: 1, status: 1, registrationNo: 1, adminType: 1,
		// 	seatingCapacity: 1
		// };
		// aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let rosterList = this.aggregate("roasters", aggPipe, {});
		let totalCount = this.count('roasters', { ...match1, ...match2, ...match3, ...match4, ...match5, ...match6, ...match10 });
		let totalScheduled = this.count('roasters', { ...match1, ...match2, ...match7 });
		let totalCompleted = this.count('roasters', { ...match1, ...match2, ...match8 });
		// Added totalMissed Count - Shivakumar A
		let totalMissed = this.count('roasters', { ...match1, ...match2, ...match13 });
		let totalOngoing = this.count('roasters', { ...match1, ...match2, ...match9 });
		let totalCriticalSos = this.count('user_querys', { ...match11 });
		// response = Promise.all([rosterList, totalCount, totalScheduled, totalCompleted, totalOngoing, totalCriticalSos]);
		response = Promise.all([rosterList, totalCount, totalScheduled, totalCompleted, totalOngoing, totalCriticalSos, totalMissed]);
		return response;

	}
	/**
	 * @function cabRoaster
	 * @description online cab, driver, employee details from roasters
	 * @param params
	 */
	async cabRoaster(params: TokenData) {
		let aggPipe = [];
		let match1: any = {};
		match1 = { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "rosterId": { "$eq": params.rosterId } }, { "companyCode": { "$eq": params.companyCode } }] };
		aggPipe.push({ "$match": match1 });

		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let rosterList = this.aggregate("roasters", aggPipe, {});
		return rosterList;
	}

	/**
	 * @function cabListing
	 */
	async cabListing(params: CabListingRequest) {
		// let { searchKey } = params;
		let aggPipe = [];
		let resArr = [];
		let match2: any = {};

		let match: any = {};
		match.status = { "$eq": config.CONSTANT.STATUS.UN_BLOCKED };
		match["vendor._id"] = mongoose.Types.ObjectId(params.vendorId);
		// match["driverMapped.shift.shift"] = params.shift;
		// match["driverMapped.shift.shiftType"] = params.shiftType;
		// match["driverMapped.booked"] = false;
		// if (searchKey) {
		// 	match["$or"] = [
		// 		{ "cabBadge": { "$regex": searchKey, "$options": "-i" } }
		// 	];
		// }
		aggPipe.push({ "$match": match });

		match2["$or"] = [
			{ "driverMapped": { "$exists": false } },
			{ "driverMapped.0": { "$exists": false } },
		];
		aggPipe.push({ "$match": match2 });

		// Added type - Shivakumar A
		let project = {
			_id: 1, cabBadge: 1, routeNo: 1, type: 1
			// driverMapped: 1,
		};
		aggPipe.push({ "$project": project });
		let cabs = await this.aggregate("cabs", aggPipe, {});
		// for (let cabItem of cabs) {
		// 	for (let driver of cabItem.driverMapped) {
		// 		// if (driver.booked === false && driver.shift.shift === params.shift && driver.shift.shiftType === params.shiftType) {
		// 			let resObj = {
		// 				cabId: cabItem._id,
		// 				cabBadge: cabItem.cabBadge,
		// 				driverId: driver._id
		// 			};
		// 			resArr.push(resObj);
		// 		// }
		// 	}
		// }
		// let response: any = {};
		// response = resArr;
		// return response;
		return cabs;
	}

	/**
	 * @function cabListingWithDriver
	 */
	async cabListingWithDriver(params: CabDriverListingRequest) {
		let aggPipe = [];
		let resArr = [];
		let match2: any = {};
		let match: any = {};
		let from, to;
		let busySlotObj: any = {};

		if (params.shiftType === 'login') {
		from = moment(params.shiftTime, 'HH:mm').subtract(config.CONSTANT.CAB_BUFFER + params.totalTripTime + 1, 'minutes').format('HH:mm');
		to = moment(params.shiftTime, 'HH:mm').add(config.CONSTANT.CAB_BUFFER + 1, 'minutes').format('HH:mm');
		busySlotObj.from = from;
		busySlotObj.to = to;
		}
		else if (params.shiftType === 'logout') {
		from = moment(params.shiftTime, 'HH:mm').subtract(config.CONSTANT.CAB_BUFFER + 1, 'minutes').format('HH:mm');
		to = moment(params.shiftTime, 'HH:mm').add(config.CONSTANT.CAB_BUFFER + params.totalTripTime + 1, 'minutes').format('HH:mm');
		busySlotObj.from = from;
		busySlotObj.to = to;
		}
		match.status = { "$eq": config.CONSTANT.STATUS.UN_BLOCKED };
		match["vendor._id"] = mongoose.Types.ObjectId(params.vendorId);
		aggPipe.push({ "$match": match });
		match2["$and"] = [
		{ "driverMapped": { "$exists": true } },
		{ "driverMapped.0": { "$exists": true } },
		];
		aggPipe.push({ "$match": match2 });
		let project = {
		_id: 1, cabBadge: 1,
		driverMapped: 1,
		busySlots: 1,
		routeNo: 1,
		// seatingCapacity - satyam
		seatingCapacity: 1,
		// cabType - satyam
		type: 1
		};
		aggPipe.push({ "$project": project });
		let cabs = await this.aggregate("cabs", aggPipe, {});
		for (let cabItem of cabs) {
		let flag = 0;
		if (cabItem.busySlots && cabItem.busySlots.length > 0) {
		for (let busySlot of cabItem.busySlots) {
		let a = moment(busySlot.from, 'HH:mm').format('HH:mm');
		let b = moment(busySlot.to, 'HH:mm').format('HH:mm');
		let x = moment(busySlotObj.from, 'HH:mm').format('HH:mm');
		let y = moment(busySlotObj.to, 'HH:mm').format('HH:mm');
		let c = moment(a, 'HH:mm').isBetween((moment(x, 'HH:mm')), (moment(y, 'HH:mm')));
		let d = moment(b, 'HH:mm').isBetween((moment(x, 'HH:mm')), (moment(y, 'HH:mm')));
		if (c || d) {
		flag = 1;
		}
		}
		}
		if (flag !== 1) {
		let resObj = {
		cabId: cabItem._id,
		cabBadge: cabItem.cabBadge,
		routeNo: cabItem.routeNo,
		driverId: cabItem.driverMapped[0]._id,
		// seatingCapacity - satyam
		seatingCapacity: cabItem.seatingCapacity,
		};
		if (cabItem.type) {
		resObj['type'] = cabItem.type;
		}
		resArr.push(resObj);
		}
		}
		return resArr;
		}

	/**
	 * Cab registration no unique check
	 */
	async isRegistrationNoUnique(params: IsRegistrationNoUnique) {
		let query: any = {};
		query["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "registrationNo": { "$eq": params.registrationNo } }];
		let projection = {};
		return await this.findOne("cabs", query, projection, {});
	}
	/**
	 * @function isCabBadgeNoUnique
	 * Badge no route no unique check
	 */
	async isCabBadgeNoUnique(params: IsCabBadgeNoUnique) {
		let query: any = {};
		query["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "routeNo": { "$eq": params.routeNo } }];
		let projection = {};
		return await this.findOne("cabs", query, projection, {});
	}
	/**
	 * @function isNonDeletedCabExist
	 * If a vendor have assigned cab which do not have status 'deleted'
	 */
	async isNonDeletedCabExist(vendorId: any) {
		let query: any = {};
		query["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "vendor._id": { "$eq": vendorId } }];
		return await this.findOne("cabs", query, {}, {});
	}
}
