"use strict";

import * as _ from "lodash";
import * as promise from "bluebird";
import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/constant";
import * as sosConstant from "@modules/v1/contactToAdmin/sosConstant";
import { UserDao } from "@modules/v1/user/UserDao";
import { promises } from "fs";
import { constants } from "zlib";
// import { executer } from "@lib/socketManager";

let userDao = new UserDao();
export class SosDao extends BaseDao {

	/**
	 * @function sosList
	 */
	async sosList(params: ListingRequest) {
		try {
			// filter -- satyam
			// let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, userType } = params;
			let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, userType, shiftName, shiftType } = params;
			let aggPipe = [];

			let match1: any = {};
			match1 = { "$and": [{ "companyCode": { "$eq": params.companyCode } }, { "status": { "$ne": config.CONSTANT.USER_QUERY_STATUS.CANCELLED } }, { "queryType": { "$eq": config.CONSTANT.QUERY_TYPE.SOS } }] };
			aggPipe.push({ "$match": match1 });

			let match2 = {};
			// filter -- satyam
			if (searchKey) {
				match2["$or"] = [
					{ "name": { "$regex": searchKey, "$options": "-i" } },
					{ "employeeId": { "$regex": searchKey, "$options": "-i" } },
					{ "newCabBadgeId": { "$regex": searchKey, "$options": "-i" } },
					{ "mobileNo": { "$regex": searchKey, "$options": "-i" } },
					{ "roster.cab.driverMapped[0].name": { "$regex": searchKey, "$options": "-i" }},
					{ "roster.cab.driverMapped[0].mobileNo": { "$regex": searchKey, "$options": "-i" }},

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
			if (userType) {
				match7.userType = { "$eq": userType };
				aggPipe.push({ "$match": match7 });
			}
			// filter -- satyam
			let match8: any = {};
			if (shiftName) {
				match8.shiftName = { "$eq": shiftName };
				aggPipe.push({ "$match": match8 });
			}
			let match9: any = {};
			if (shiftType) {
				match7.shiftType = { "$eq": shiftType };
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
			// Get Count of Pending SOS Query - Shivakumar A
			let pendingSOScountMatch: any = {};
			pendingSOScountMatch = {
				"$or": [{
					"status": config.CONSTANT.USER_QUERY_STATUS.PENDING // 4 is pending
				}, {
					"status": config.CONSTANT.USER_QUERY_STATUS.MARKSAFE // 3 is marksafe
				}], "$and": [{ "queryType": { "$eq": config.CONSTANT.QUERY_TYPE.SOS } }] // 2 is Sos
			};

			// let project = {

			// };
			// aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let response: any = {};
			let userList = this.aggregate("user_querys", aggPipe, {});
			let totalCount = this.count('user_querys', { ...match1, ...match2, ...match3, ...match4, ...match5, ...match6 });
			// Get Count of Pending SOS - Shivakumar A
			let pendingSosCount = this.count('user_querys', { ...pendingSOScountMatch });
			// response = Promise.all([userList, totalCount]);
			// Add pendingSosCount to response array - Shivakumar A
			response = Promise.all([userList, totalCount, pendingSosCount]);
			return response;
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function userQueryList
	 * @param params
	 * @description contact to admin by user query list
	 */
	async userQueryList(params: ListingRequest) {
		try {
			let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, userType } = params;
			let aggPipe = [];

			let match1: any = {};
			match1 = { "$and": [{ "companyCode": { "$eq": params.companyCode } }, { "status": { "$ne": config.CONSTANT.USER_QUERY_STATUS.CANCELLED } }, { "queryType": { "$eq": config.CONSTANT.QUERY_TYPE.QUERY } }] };
			aggPipe.push({ "$match": match1 });

			let match2 = {};
			if (searchKey) {
				match2["$or"] = [
					{ "name": { "$regex": searchKey, "$options": "-i" } },
					{ "email": { "$regex": searchKey, "$options": "-i" } },
					{ "mobileNo": { "$regex": searchKey, "$options": "-i" } },
					// filter -- satyam
					{ "employeeId": { "$regex": searchKey, "$options": "-i" }},
					{ "driverId": { "$regex": searchKey, "$options": "-i" }}
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
			if (userType) {
				match7.userType = { "$eq": userType };
				aggPipe.push({ "$match": match7 });
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

			// Update as seen - Shivakumar A
			let userListQuery = {};
			let userListoptions = { new: true };
			this.updateMany("user_querys", userListQuery, { "$set": { "seen": true } }, userListoptions);

			// let project = {
			// 	_id: 1, status: 1, email: 1, countryCode: 1, mobileNo: 1, profilePicture: 1,
			// 	userId: 1, name: 1, sosLocation: 1, userEmpId: 1, query: 1
			// };

			// Added created, employeeId, driverId & gender field - Shivakumar A
			let project = {
				_id: 1, status: 1, email: 1, countryCode: 1, mobileNo: 1, profilePicture: 1,
				userId: 1, name: 1, sosLocation: 1, userEmpId: 1, query: 1, created: 1, gender: 1, employeeId: 1, driverId: 1
			};

			aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let response: any = {};
			let userList = this.aggregate("user_querys", aggPipe, {});
			let totalCount = this.count('user_querys', { ...match1, ...match2, ...match3, ...match4, ...match5, ...match6 });
			response = Promise.all([userList, totalCount]);
			return response;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function blockUnblock
	 */
	async sosCancel(params: DeleteRequest) {
		try {
			let query: any = {};
			query = { $and: [{ "queryType": { "$eq": config.CONSTANT.QUERY_TYPE.SOS } }, { "userId": { "$eq": params.userId } }, { "status": { "$eq": config.CONSTANT.USER_QUERY_STATUS.PENDING } }] };
			let update = {};
			update["$set"] = {
				status: config.CONSTANT.USER_QUERY_STATUS.CANCELLED
			};
			let options = { new: true };
			return await this.findOneAndUpdate("user_querys", query, update, options);
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function markSafe
	 */
	async SosMarkSafe(params: DeleteRequest) {
		try {
			let query: any = {};
			// Added SosID, RosterID - Shivakumar A
			query = { $and: [{ "queryType": { "$eq": config.CONSTANT.QUERY_TYPE.SOS } }, { "userId": { "$eq": params.userId } }, { "status": { "$eq": config.CONSTANT.USER_QUERY_STATUS.RESOLVED } }, { "_id": { "$eq": params.sosId } },
			 { "roster._id": { "$eq": params.rosterId } }] };
			let update = {};
			update["$set"] = {
				status: config.CONSTANT.USER_QUERY_STATUS.MARKSAFE
			};

			let options = { new: true };
			return await this.findOneAndUpdate("user_querys", query, update, options);
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function resolveSos
	 */
	async resolveSos(params: DeleteRequest) {
		try {
			let query: any = {};
			query = { $and: [{ "queryType": { "$eq": config.CONSTANT.QUERY_TYPE.SOS } }, { "_id": { "$eq": params.sosId } }] };
			let update = {};
			update["$set"] = {
				status: config.CONSTANT.USER_QUERY_STATUS.RESOLVED
			};

			let options = { new: true };
			return await this.findOneAndUpdate("user_querys", query, update, options);
		} catch (error) {
			throw error;
		}
	}
	async rejectSos(params: DeleteRequest) {
		try {
			let query: any = {};
			query = { $and: [{ "queryType": { "$eq": config.CONSTANT.QUERY_TYPE.SOS } }, { "_id": { "$eq": params.sosId } }] };
			let update = {};
			update["$set"] = {
				status: config.CONSTANT.USER_QUERY_STATUS.REJECTED
			};

			let options = { new: true };
			return await this.findOneAndUpdate("user_querys", query, update, options);
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function resolveSos
	 */
	async resolveRequest(params: DeleteRequest) {
		try {
			let query: any = {};
			query = { $and: [{ "queryType": { "$eq": config.CONSTANT.QUERY_TYPE.QUERY } }, { "_id": { "$eq": params.requestId } }] };
			let update = {};
			update["$set"] = {
				status: config.CONSTANT.USER_QUERY_STATUS.RESOLVED
			};

			let options = { new: true };
			return await this.findOneAndUpdate("user_querys", query, update, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function requestReject
	 */
	async requestReject(params: DeleteRequest) {
		let query: any = {};
		query = { $and: [{ "queryType": { "$eq": config.CONSTANT.QUERY_TYPE.QUERY } }, { "_id": { "$eq": params.requestId } }] };
		let update = {};
		update["$set"] = {
			status: config.CONSTANT.USER_QUERY_STATUS.REJECTED
		};

		let options = { new: true };
		return await this.findOneAndUpdate("user_querys", query, update, options);
	}
	/**
	 * @function contactAdmin
	 */
	async contactAdmin(params: UserQueryRequest) {
		try {
			let userData = await this.findUserById(params);
			let sosData = await this.findSosById(params);
			let location: any = {};
			params.name = userData.name;
			params.query = config.CONSTANT.SOS_QUERY.SOS_MESSAGE;
			params.queryType = config.CONSTANT.QUERY_TYPE.SOS;
			params.profilePicture = userData.profilePicture;
			location.coordinates = [params.longitude, params.latitude];
			location.address = params.sosLocation;
			params.sosLocation = location;

			// Added CabBadge & gender to params - Shivakumar A
			params.newCabBadgeId = params.roster.cab.routeNo;
			params.gender = userData.gender;

			if (params.userType = config.CONSTANT.USER_TYPE.DRIVER) {
				params.userEmpId = userData.driverId;
			} else {
				params.userEmpId = userData.employeeId;
			}
			if (sosData) {
				let query: any = {};
				query._id = sosData._id;
				let update = {};
				update["$set"] = params;
				let options = { new: true };
				return await this.findOneAndUpdate("user_querys", query, update, options);
			} else {
				return await this.save("user_querys", params);
			}
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function findUserById
	 */
	async findUserById(params: UserId) {
		try {
			let query: any = {};
			query._id = params.userId;
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
			let project = {
			};
			return await this.findOne("users", query, project, {});
		} catch (error) {
			throw error;
		}
	}
	/**
	 * findSosBySosId
	 * @param params
	 */
	async findSosBySosId(params: SosId) {
		try {
			let query: any = {};
			query._id = params.sosId;
			let project = {
			};
			return await this.findOne("user_querys", query, project, {});
		} catch (error) {
			throw error;
		}
	}
	async findRequestByRequestId(params: ReaquestId) {
		try {
			let query: any = {};
			query._id = params.requestId;
			let project = {
			};
			return await this.findOne("user_querys", query, project, {});
		} catch (error) {
			throw error;
		}
	}
	/**
	 * Find user already sos to admin
	 */
	async findSosById(params: RosetrId) {
		try {
			let query: any = {};
			query = {
				$and: [{ "companyCode": { "$eq": params.companyCode } }, { "roster._id": { "$eq": params.rosterId } }, { "queryType": { "$eq": config.CONSTANT.QUERY_TYPE.SOS } },
				{ "userId": { "$eq": params.userId } }, { "status": { "$eq": config.CONSTANT.USER_QUERY_STATUS.PENDING } }]
			};
			let project = {
			};
			return await this.findOne("user_querys", query, project, {});
		} catch (error) {
			throw error;
		}
	}

	async findSosByUserId(params: RosetrId) {
		try {
			let query: any = {};
			query = {
				$and: [{ "companyCode": { "$eq": params.companyCode } }, { "queryType": { "$eq": config.CONSTANT.QUERY_TYPE.SOS } },
				{ "userId": { "$eq": params.userId } }, { "status": { "$eq": config.CONSTANT.USER_QUERY_STATUS.PENDING } }]
			};
			let project = {
			};
			return await this.findOne("user_querys", query, project, {});
		} catch (error) {
			throw error;
		}
	}
	/**
	 * Find user already sos to admin
	 */
	async findResolvedSosById(params: UserId) {
		try {
			let query: any = {};
			query = { $and: [{ "queryType": { "$eq": config.CONSTANT.QUERY_TYPE.SOS } }, { "userId": { "$eq": params.userId } }, { "status": { "$eq": config.CONSTANT.USER_QUERY_STATUS.RESOLVED } }] };
			let project = {
			};
			// Added sort to get latest first- Shivakumar A
			return await this.findOne("user_querys", query, project, { "sort": { $natural: -1 } } );
		} catch (error) {
			throw error;
		}
	}

}