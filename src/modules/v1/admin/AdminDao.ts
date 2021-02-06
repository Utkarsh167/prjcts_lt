"use strict";

import * as _ from "lodash";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/constant";
import * as models from "@modules/v1/models";
import * as adminConstant from "@modules/v1/admin/adminConstant";
import { AuditLogDao } from "@modules/v1/auditLog/AuditLogDao";
import * as moment from "moment";

let auditLogDao = new AuditLogDao();

export class AdminDao extends BaseDao {

	public admin: Model<models.IAdmin> = models.admins;
	public audiLog: Model<models.IAuditLog> = models.audit_logs;

	/**
	 * @function isEmailExists
	 */
	async isEmailExists(params) {
		try {
			let query: any = {};
			query.email = params.email;
			if (params.userId) {
				query._id = { "$not": { "$eq": params.userId } };
			}
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
			query.adminType = { "$ne": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN };

			return await this.findOne("admins", query, {}, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function findAdminById
	 */
	async findAdminById(params: TokenData) {
		try {
			let query: any = {};
			query._id = params.userId;
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
			let projection = { loginAttempts: 0, accessToken: 0 };
			return await this.findOne("admins", query, projection, {});
		} catch (error) {
			throw error;
		}
	}

	async findAdminByCreatedBy(params: TokenData) {
		try {
			let query: any = {};
			query._id = params.createdBy;
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
			let projection = { crfLimitMonth: 1 };
			return await this.findOne("admins", query, projection, {});
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function findAdminByCompanyCode
	 */
	async findAdminByCompanyCode(params: TokenData) {
		try {
			let query: any = {};
			query.companyCode = params.companyCode;
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
			let projection = { loginAttempts: 0, accessToken: 0 };
			return await this.find("admins", query, projection, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addRouteConf
	 */
	async addRouteConf(params: RoutingAlgoRequest) {
		try {
			let query: any = {};
			query._id = params.userId;

			let update = {};
			update["$set"] = {
				routeConf: {
					maxGroupSize: params.maxGroupSize,
					waitTime: params.waitTime,
					maxTripDuration: params.maxTripDuration
				}
			};
			return await this.updateOne("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function getPermission
	 */
	async getPermission(params: TokenData) {
		try {
			let query: any = {};
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

			let projection = {};

			return await this.findOne("permissions", query, projection, {});
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function findSubAdminById
	 */
	async findSubAdminById(params: TokenData) {
		try {
			let query: any = {};
			query._id = params.subAdminId;
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

			let projection = { _id: 1, name: 1, email: 1, created: 1, status: 1, permission: 1 };

			return await this.findOne("admins", query, projection, {});
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function createAdmin
	 */
	async createAdmin(params: CreateAdminRequest) {
		try {
			return await this.save("admins", params);
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function createPermission
	 */
	async createPermission(params: Permission) {
		try {
			return await this.save("permissions", params);
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function createDefaultPermission
	 * @param params modile name module key first time running on insert
	 */
	async createDefaultPermission(params) {
		try {
			return await this.save("permissions", params);
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function subAdminList
	 */
	async subAdminList(params: ListingRequest) {
		try {
			let { pageNo, limit, searchKey, sortBy, sortOrder, status } = params;
			let aggPipe = [];

			let match1: any = {};
			// match1.adminType = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
			// match1.status = { "$ne": config.CONSTANT.STATUS.DELETED };

			// archived sub-admins satyam
			// match1 = {
			// 	"$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.SUB_ADMIN } },
			// 	{ "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyCode": { "$eq": params.companyCode } }]
			// };
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
			aggPipe.push({ "$match": match1 });

			if (searchKey) {
				let match2 = {};
				match2["$or"] = [
					{ "name": { "$regex": searchKey, "$options": "-i" } },
					{ "email": { "$regex": searchKey, "$options": "-i" } }
				];
				aggPipe.push({ "$match": match2 });
			}

			aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });

			if (status) {
				let match3: any = {};
				match3.status = { "$eq": status };
				aggPipe.push({ "$match": match3 });
			}

			let project = { _id: 1, totalCount: 1, name: 1, email: 1, created: 1, status: 1, comment: 1 };
			aggPipe.push({ "$project": project });

			let sort = {};
			if (sortBy && sortOrder) {
				if (sortBy === "name") {
					sort = { "name": sortOrder };
				} else {
					sort = { "created": sortOrder };
				}
			} else {
				sort = { "created": -1 };
			}
			aggPipe.push({ "$sort": sort });

			return await appUtils.paginate(this.admin, aggPipe, limit, pageNo);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteSubAdmin
	 */
	async deleteSubAdmin(params: DeleteSubAdmin) {
		try {
			let query: any = {};
			query._id = params.userId;
			// reasonForArchive -- satyam
			let update = {};
			// update["$set"] = {
			// 	"status": config.CONSTANT.STATUS.DELETED
			// };
			if ( params.comment ) {
				update["$set"] = {
					status: config.CONSTANT.STATUS.DELETED,
					comment: params.comment,
				};
			} else {
				update["$set"] = {
					status: config.CONSTANT.STATUS.DELETED,
				};
			}
			// return await this.updateOne("admins", query, update, {});
			return await this.findOneAndUpdate("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editSubAdmin
	 */
	async editSubAdmin(params: EditSubAdminRequest) {
		try {
			params.permission = params.permission ? params.permission : [];
			let query: any = {};
			query._id = params.userId;

			let set = {};
			let update = {};
			update["$set"] = set;

			let fieldsToFill = ["name", "permission", "totalCount"];
			set = appUtils.setInsertObject(params, set, fieldsToFill);

			let query1: any = {};
			query1.userId = params.userId;
			query1.isLogin = true;

			let update1 = {};
			update1["$set"] = {
				isLogin: false,
				lastLogout: Date.now()
			};
			update1["$unset"] = { deviceToken: "", arn: "", refreshToken: "" };

			let options1: any = { multi: true };

			await this.updateMany("login_histories", query1, update1, options1);
			return await this.findOneAndUpdate("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function blockUnblock
	 */
	async blockUnblock(params: BlockRequest) {
		try {
			let query: any = {};
			query._id = params.userId;

			let update = {};
			update["$set"] = {
				status: params.status
			};

			return await this.findOneAndUpdate("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function changePassword
	 */
	async changePassword(params: ChangeForgotPasswordRequest | ChangePasswordRequest) {
		try {
			let query: any = {};
			query._id = params.userId;
			let userData = await this.isTokenExist(params);
			if (userData.forgetToken) {
				// EMPTY THE TOKEN
				let update = {};
				update["$set"] = {
					"hash": params.hash,
					"forgetToken": "",
				};
				let query1: any = {};
				query1.userId = params.userId;
				query1.isLogin = true;

				let update1 = {};
				update1["$set"] = {
					isLogin: false,
					lastLogout: Date.now()
				};
				update1["$unset"] = { deviceToken: "", arn: "", refreshToken: "" };

				let options1: any = { multi: true };

				await this.updateMany("login_histories", query1, update1, options1);
				return await this.updateOne("admins", query, update, {});
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.TOKEN_EXPIRED);
			}
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function adminChangePassword
	 * @param params
	 */
	async adminChangePassword(params: ChangeForgotPasswordRequest | ChangePasswordRequest) {
		try {
			let query: any = {};
			query._id = params.userId;
			let update = {};
			update["$set"] = {
				"hash": params.hash,
			};
			return await this.updateOne("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function updateLoginHistory
	 */
	async updateLoginHistory(params) {
		try {
			let query: any = {};
			query._id = params.userId;

			let set = {};
			let update = {};
			update["$set"] = set;

			let fieldsToFill = ["isLogin", "lastLogin", "loginAttempts"];

			params = _.extend(params, { isLogin: true, lastLogin: Date.now() });
			set = appUtils.setInsertObject(params, set, fieldsToFill);

			update["$addToSet"] = {
				loginAttempts: [{
					"remoteAddress": params.remoteAddress,
					"platform": params.platform
				}]
			};

			return await this.updateOne("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function logout
	 */
	async logout(params: TokenData) {
		try {
			let query: any = {};
			query._id = params.userId;

			let update = {};
			update["$set"] = {
				"isLogin": false,
				"lastLogout": Date.now()
			};

			return await this.update("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editProfile
	 */
	async editProfile(params: EditProfileRequest) {
		try {
			let query: any = {};
			query._id = params.userId;
			let query1: any = {};
			query1.createdBy = params.userId;
			let query2: any = {};
			query2.createdBy = params.userId;
			// query2["driverMapped._id"] = { "$ne": "" };
			let update = {};
			let update1: any = {};
			let update2: any = {};
			let location: any = {};
			location.address = params.address;
			location.coordinates = [params.longitude, params.latitude];
			update["$set"] = {
				"name": params.name,
				// "email": params.email,
				// "shiftSlot": params.shiftSlot,
				// "companyAddress": location,
				// "isProfileComplete": true,
				// "crfLimitMonth": params.crfLimitMonth,
			};
			update1['$set'] = {
				dropoff: location
			};
			// let companyAddress: any = {};
			// companyAddress.companyLocation = location;
			update2['$set'] = {
				"driverMapped.$[].companyLocation": location
			};
			let options = {};

			// ------------Updating shift for all admins - sub admins of a company --------------------
			let query3: any = {};
			query3.companyCode = params.companyCode;
			if (params.shiftSlot.length > 0) {
				update2['$set'] = {
					"shiftSlot": params.shiftSlot,
					"companyAddress": location,
					"crfLimitMonth": params.crfLimitMonth,
					"isProfileComplete": true,
					// crfTimings -- satyam
					"loginCutoff": params.loginCutoff,
					"logoutCutoff": params.logoutCutoff
				};
			}
			else {
				update2['$set'] = {
					"shiftSlot": params.shiftSlot,
					"companyAddress": location,
					"crfLimitMonth": params.crfLimitMonth,
					"isProfileComplete": false,
					// crfTimings -- satyam
					"loginCutoff": params.loginCutoff,
					"logoutCutoff": params.logoutCutoff
				};
			}
			let step1 = await this.updateMany("admins", query3, update2, options);
			step1.moduleName = "ADMIN, SUBADMIN";
			step1.message = params.adminType + " " + params.name + " " + "updated company profile setting";
			let step4 = await auditLogDao.addLog(step1, params, config.CONSTANT.LOG_HISTORY_TYPE.EDIT);
			// ------------------------------------------------------------------------------------------

			let step2 = this.updateMany("users", query1, update1, options);
			let setep3 = this.updateMany("cabs", query2, update2, options);
			return await this.findOneAndUpdate("admins", query, update, options);

		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function dashboard
	 * @param params adminId
	 */
	async dashboard(params: ListingRequest) {
		let aggPipe = [];
		let sdt = moment().startOf('day').subtract({ 'hours': 5, 'minutes': 30 });
		let edt = moment().endOf('day').format('x');
		let todatDate = sdt.toDate();
		let endDate = moment(sdt).endOf('day').toDate();

		let match1: any = {};
		match1 = { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
		aggPipe.push({ "$match": match1 });
		let match2: any = {};
		match2 = {
			// "$or": [{ "$and": [{ "status": { "$eq": config.CONSTANT.REQUEST_STATUS.CURRENT } }, { "companyCode": { "$eq": params.companyCode } }] },
			// { "$and": [{ "status": { "$eq": config.CONSTANT.REQUEST_STATUS.REQUESTED } }, { "companyCode": { "$eq": params.companyCode } }] }]
			"$and": [{ "status": { "$eq": config.CONSTANT.REQUEST_STATUS.REQUESTED } }, { "companyCode": { "$eq": params.companyCode } }, { "createdAt": { $gte: new Date().setUTCHours(0, 0, 0) } }]
		};
		let match3: any = {};
		match3 = { "$and": [{ "status": { "$eq": config.CONSTANT.STATUS.EXECUTED } }, { "companyCode": { "$eq": params.companyCode } }, { "updatedAt": { $gte: new Date().setUTCHours(0, 0, 0) } }] };
		let match4: any = {};
		match4 = { "$and": [{ "status": { "$eq": config.CONSTANT.STATUS.UN_EXECUTED } }, { "companyCode": { "$eq": params.companyCode } }, { "createdAt": { $gte: new Date().setUTCHours(0, 0, 0) } }] };

		let response: any = {};

		let empOnboardOffboard = this.dashboardEmpTracking(params);
		// let employeeOnboard = tripHistory;
		let requestPipeline = [
			{
				"$match": {
					"$and": [
						{ "companyCode": { "$eq": params.companyCode } }]
				}
			},
			{ "$group": { _id: "$status", count: { $sum: 1 } } }
		];
		let userPipline = [
			{
				"$facet": {
					"driverUnassign": [
						{
							"$match": {
								"$or": [{ "$and": [{ "cab": { "$exists": false } }, { "userType": { "$eq": config.CONSTANT.USER_TYPE.DRIVER } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] },
								{ "$and": [{ "cab.0": { "$exists": false } }, { "userType": { "$eq": config.CONSTANT.USER_TYPE.DRIVER } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] }]
							}
						},
						{ "$count": "driverUnassign" },
					],
					"driverAssign": [
						{
							"$match": {
								"$and": [{ "userType": { "$eq": config.CONSTANT.USER_TYPE.DRIVER } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } },
								{ "companyCode": { "$eq": params.companyCode } }, { "cab": { "$exists": true } }, { "cab.0": { "$exists": true } }]
							}
						},
						{ "$count": "driverAssign" }
					],
					"totalDriver": [
						{ "$match": { "$and": [{ "userType": { "$eq": config.CONSTANT.USER_TYPE.DRIVER } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] } },
						{ "$count": "totalDriver" }
					],
					"totalEmployee": [
						{ "$match": { "$and": [{ "userType": { "$eq": config.CONSTANT.USER_TYPE.EMPLOYEE } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] } },
						{ "$count": "totalEmployee" }
					]
				}
			},
			{
				"$project": {
					"driverUnassign": { "$arrayElemAt": ["$driverUnassign.driverUnassign", 0] },
					"driverAssign": { "$arrayElemAt": ["$driverAssign.driverAssign", 0] },
					"totalDriver": { "$arrayElemAt": ["$totalDriver.totalDriver", 0] },
					"totalEmployee": { "$arrayElemAt": ["$totalEmployee.totalEmployee", 0] }
				}
			}
		];
		let cabPipline = [
			{
				"$facet": {
					"cabUnassign": [
						{
							"$match": {
								// "$or": [{ "$and": [{ "driverMapped": { "$exists": false } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] },
								"$and": [{ "$or": [{ "busySlots": { "$exists": false } }, { "busySlots.0": { "$exists": false } }] }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }]
								// { "$and": [{ "cab.0": { "$exists": false } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] }]
							}
						},
						{ "$count": "cabUnassign" },
					],
					"cabAssign": [
						{
							"$match": {
								"$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } },
								// { "companyCode": { "$eq": params.companyCode } }, { "driverMapped": { "$exists": true } }, { "driverMapped.0": { "$exists": true } }]
								{ "companyCode": { "$eq": params.companyCode } }, { "busySlots": { "$exists": true } }, { "busySlots.0": { "$exists": true } }]
							}
						},
						{ "$count": "cabAssign" }
					],
					"totalCab": [
						{ "$match": { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] } },
						{ "$count": "totalCab" }
					],
				}
			},
			{
				"$project": {
					"cabUnassign": { "$arrayElemAt": ["$cabUnassign.cabUnassign", 0] },
					"cabAssign": { "$arrayElemAt": ["$cabAssign.cabAssign", 0] },
					"totalCab": { "$arrayElemAt": ["$totalCab.totalCab", 0] },
				}
			}
		];
		let routePipline = [
			{
				"$facet": {
					"routePending": [
						{
							"$match": {
								"$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } },
								{ "companyCode": { "$eq": params.companyCode } }, { "status": { "$eq": config.CONSTANT.STATUS.UN_APPROVED } }]
							}
						},
						{ "$count": "routePending" },
					],
					"routeApproved": [
						{
							"$match": {
								"$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } },
								{ "companyCode": { "$eq": params.companyCode } }, { "$or": [{ "status": { "$eq": config.CONSTANT.STATUS.APPROVED } }, { "status": { "$eq": config.CONSTANT.STATUS.EXECUTED } }] }]
							}
						},
						{ "$count": "routeApproved" }
					],
					"totalRoute": [
						{ "$match": { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] } },
						{ "$count": "totalRoute" }
					],
					"totalOccupancy": [{ $match: { "companyCode": { "$eq": params.companyCode } } },
					{ "$group": { "_id": {}, "totalSeat": { "$sum": '$maxGroupSize' }, "totalOccupied": { "$sum": '$empCount' } } },
					{
						"$project": {
							"totalOccupancy": {
								"$concat": [{ "$substr": [{ "$multiply": [{ "$divide": ["$totalOccupied", '$totalSeat'] }, 100] }, 0, 2] }, "", "%"]
							}
						}
					}
					],
				}
			},
			{
				"$project": {
					"routePending": { "$arrayElemAt": ["$routePending.routePending", 0] },
					"routeApproved": { "$arrayElemAt": ["$routeApproved.routeApproved", 0] },
					"totalRoute": { "$arrayElemAt": ["$totalRoute.totalRoute", 0] },
					"totalOccupancy": { "$arrayElemAt": ["$totalOccupancy.totalOccupancy", 0] },
				}
			}
		];
		let sosPipline = [
			{
				"$facet": {
					"sosCatered": [
						{
							"$match": {
								"$and": [
									{ "companyCode": { "$eq": params.companyCode } }, { "status": { "$eq": config.CONSTANT.USER_QUERY_STATUS.RESOLVED } }, { "updatedAt": { $gte: new Date().setUTCHours(0, 0, 0) } }]
							}
						},
						{ "$count": "sosCatered" },
					],
					"sosPending": [
						{
							"$match": {
								"$and": [
									{ "companyCode": { "$eq": params.companyCode } }, { "status": { "$eq": config.CONSTANT.USER_QUERY_STATUS.PENDING } }, { "createdAt": { $gte: new Date().setUTCHours(0, 0, 0) } }]
							}
						},
						{ "$count": "sosPending" }
					],
					"totalSos": [
						{ "$match": { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }, { "createdAt": { $gte: new Date().setUTCHours(0, 0, 0) } }] } },
						{ "$count": "totalSos" }
					],
				}
			},
			{
				"$project": {
					"sosCatered": { "$arrayElemAt": ["$sosCatered.sosCatered", 0] },
					"sosPending": { "$arrayElemAt": ["$sosPending.sosPending", 0] },
					"totalSos": { "$arrayElemAt": ["$totalSos.totalSos", 0] },
				}
			}
		];
		// start of the day - Shivakumar A
		// let currentDate = moment().startOf("day");
		let currentDate = moment().startOf("day").subtract({'hours': 5, 'minutes': 30});
		let sDate = Date.parse(currentDate.toString());

		// end of the day - Shivakumar A
		// let currentDate2 = moment().endOf("day");
		let currentDate2 = moment().endOf("day").subtract({'hours': 5, 'minutes': 30});
		let eDate = Date.parse(currentDate2.toString());

		let tripPipline = [
			{
				"$facet": {
					"tripCompleted": [
						{
							"$match": {
								"$and": [
									// Added rideMissed, rosterdate check - Shivakumar A
									{ "companyCode": { "$eq": params.companyCode } }, { "rideStarted": { "$eq": false } }, { "rideCompleted": { "$eq": true } }, { "rideMissed": { "$eq": false } }, { "rosterDate": { "$gte": sDate, "$lt": eDate } }]
							}
						},
						{ "$count": "tripCompleted" },
					],
					"tripOngoing": [
						{
							"$match": {
								"$and": [
									// Added rosterdate check - Shivakumar A
									{ "companyCode": { "$eq": params.companyCode } }, { "rideStarted": { "$eq": true } }, { "rideCompleted": { "$eq": false } }, { "rosterDate": { "$gte": sDate, "$lt": eDate } }]
							}
						},
						{ "$count": "tripOngoing" }
					],
					"tripScheduled": [
						{
							"$match": {
								"$and": [
									// Added rosterdate check - Shivakumar A
									{ "companyCode": { "$eq": params.companyCode } }, { "rideStarted": { "$eq": false } }, { "rideCompleted": { "$eq": false } }, { "rosterDate": { "$gte": sDate, "$lt": eDate } }]
							}
						},
						{ "$count": "tripScheduled" }
					],
					"tripLoginCount": [
						{
							"$match": {
								"$and": [
									// Added rosterdate check - Shivakumar A
									{ "companyCode": { "$eq": params.companyCode } }, { "rideStarted": { "$eq": false } }, { "rideCompleted": { "$eq": true }, "route.shiftType": { "$eq": config.CONSTANT.SHIFT_TYPE.LOGIN } }, { "rosterDate": { "$gte": sDate, "$lt": eDate } }]
							}
						},
						{ "$count": "tripLoginCount" }
					],
					"tripLoginOnTimeCount": [
						{
							"$match": {
								"$and": [
									// Added rosterDate for current day - Shivakumar A
									{ "companyCode": { "$eq": params.companyCode } }, { "rideStarted": { "$eq": false } }, { "rideCompleted": { "$eq": true }, "route.shiftType": { "$eq": config.CONSTANT.SHIFT_TYPE.LOGIN },
									 "onTime": { "$eq": true } }, { "rosterDate": { "$gte": sDate, "$lt": eDate } } ]
							}
						},
						{ "$count": "tripLoginOnTimeCount" }
					],
					// Added tripMissed, totalTrips, tripCompletedOnTime count - Shivakumar - A
					"tripMissed": [
						{
							"$match": {
								"$and": [
									{ "companyCode": { "$eq": params.companyCode } }, { "rideStarted": { "$eq": false } }, { "rideCompleted": { "$eq": true } }, { "rideMissed": { "$eq": true } }, { "rosterDate": { "$gte": sDate, "$lt": eDate } }]
							}
						},
						{ "$count": "tripMissed" },
					],
					"totalTrips": [
						{
							"$match": {
								"$and": [
									{ "companyCode": { "$eq": params.companyCode } }, { "rosterDate": { "$gte": sDate, "$lt": eDate } }]
							}
						},
						{ "$count": "totalTrips" },
					],
					"tripCompletedOnTime": [
						{
							"$match": {
								"$and": [
									// Added rideMissed, rosterdate check - Shivakumar A
									{ "companyCode": { "$eq": params.companyCode } }, { "rideStarted": { "$eq": false } }, { "rideCompleted": { "$eq": true } }, { "rideMissed": { "$eq": false } }, { "onTime": { "$eq": true } },
									{ "rosterDate": { "$gte": sDate, "$lt": eDate } }]
							}
						},
						{ "$count": "tripCompletedOnTime" },
					],
				}
			},
			{
				"$project": {
					"tripCompleted": { "$arrayElemAt": ["$tripCompleted.tripCompleted", 0] },
					"tripOngoing": { "$arrayElemAt": ["$tripOngoing.tripOngoing", 0] },
					// Added Missed & Total count - Shivakumar A
					"tripMissed": { "$arrayElemAt": ["$tripMissed.tripMissed", 0] },
					"totalTrips": { "$arrayElemAt": ["$totalTrips.totalTrips", 0] },
					"tripCompletedOnTime": { "$arrayElemAt": ["$tripCompletedOnTime.tripCompletedOnTime", 0] },
					"tripScheduled": { "$arrayElemAt": ["$tripScheduled.tripScheduled", 0] },
					"totalOnTime": { "$concat": [{ "$substr": [{ "$divide": [{ "$multiply": [{ "$arrayElemAt": ["$tripLoginOnTimeCount.tripLoginOnTimeCount", 0] }, 100] }, { "$arrayElemAt": ["$tripLoginCount.tripLoginCount", 0] }] }, 0, 2] }, "", "%"] }
				}
			}
		];
		let vendorPipeline = [
			{
				"$match": {
					"$and": [
						{ "companyCode": { "$eq": params.companyCode } }]
				}
			},
			{ "$group": { "_id": { "vendorId": "$cab.vendor._id", "vendoName": "$cab.vendor.name" }, count: { $sum: 1 } } }
		];

		// get todays date - Shivakumar A
		// let startofDay = moment().startOf('day').format('x');
		let startofDay = moment().startOf('day').subtract({'hours': 5, 'minutes': 30}).format('x');
		let startdate = parseInt(startofDay);
		// shiftOnTimePipeline - Shivakumar A
		let shiftOnTimePipeline = [{
			"$facet": {
				"tripOnTime": [{
					"$match": {
						"$and": [
							{ "companyCode": { "$eq": params.companyCode } }, { "onTime": { "$eq": true } }, { "rosterDate": { "$eq": startdate } }]
					}
				},
				{ "$group": { "_id": { "shiftName": "$route.shiftName", "onTime": "$onTime" }, count: { $sum: 1 } } }],
				"totalTripCount": [{
					"$match": {
						"$and": [
							{ "companyCode": { "$eq": params.companyCode } }, { "rosterDate": { "$eq": startdate } }]
					}
				}, { "$group": { "_id": { "shiftName": "$route.shiftName" }, count: { $sum: 1 } } }]
			}
		}];
        // Added onTimeData - Shivakumar A
		let onTimeData = this.aggregate("roasters", shiftOnTimePipeline, {});
		let usersData = this.aggregate("users", userPipline, {});
		let cabData = this.aggregate("cabs", cabPipline, {});
		let routeData = this.aggregate("cab_routes", routePipline, {});
		let sosData = this.aggregate("user_querys", sosPipline, {});
		let tripData = this.aggregate("roasters", tripPipline, {});
		let totalvendors = this.count('vendors', { ...match1 });
		let crPending1 = this.count('shift_request', { ...match2 });
		let crPending2 = this.count('updated_routes', { ...match4 });
		let crApproved = this.count('updated_routes', { ...match3 });
		// let shiftRequests = this.aggregate("shift_request", requestPipeline, {});
		let vendorData = this.aggregate("roasters", vendorPipeline, {});
		// Added onTimeData to response -  Shivakumar A
		response = Promise.all([usersData, cabData, totalvendors, crPending1, routeData, sosData, tripData, vendorData, empOnboardOffboard, crApproved, crPending2, onTimeData]);
		return response;

	}
	/**
	 * @function dashboardTripHistory
	 * @param params triptype triprange
	 */
	async dashboardTripHistory(params: ListingRequest) {
		let aggPipe = [];
		let startDate;
		let endDate;

		startDate = params.fromDate;
		endDate = params.toDate;
		let dateArray = [];
		let currentDate = moment(startDate).startOf('day').subtract({ 'hours': 5, 'minutes': 30 });
		let stopDate = moment(endDate);
		while (currentDate <= stopDate) {
			dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
			currentDate = moment(currentDate).add(1, 'days');
		}

		let response: any = {};
		let tripCancelPipeline;
		let tripReschedulePipeline;
		if (params.shiftType) {
			tripCancelPipeline = [
				{ $project: { "rosterDate": 1, "companyCode": 1, "route.shiftType": 1, "route.employees.pickupStatus": 1, "status": 1, "route.employees.name": 1, "_id": 1, "updatedAt": 1, "rideStarted": 1 } },
				{ $unwind: "$route.employees" },
				{
					"$match": {
						"$and": [{ "rosterDate": { "$gt": startDate, "$lte": endDate } }, { "route.shiftType": { "$eq": params.shiftType } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } },
						{ "companyCode": { "$eq": params.companyCode } }, { "route.employees.pickupStatus": { "$eq": config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED } }]
					}
				},
				{ $project: { day: { $substr: [{ $toDate: '$rosterDate' }, 0, 10] } } },
				{
					$group: {
						_id: "$day",
						count: { $sum: 1 },
						time: { $avg: { $toDate: '$rosterDate' } },
					}
				},
				{ $sort: { _id: 1 } },
				{
					$project: {
						date: '$_id',
						views: '$count',
					},
				},
				{
					$group: {
						_id: null,
						stats: { $push: "$$ROOT" }
					}
				},
				{
					$project: {
						stats: {
							$map: {
								input: dateArray,
								as: "date",
								in: {
									$let: {
										vars: { dateIndex: { "$indexOfArray": ["$stats._id", "$$date"] } },
										in: {
											$cond: {
												if: { $ne: ["$$dateIndex", -1] },
												then: { $arrayElemAt: ["$stats", "$$dateIndex"] },
												else: { _id: "$$date", date: "$$date", views: 0 }
											}
										}
									}
								}
							}
						}
					}
				},
				{
					$unwind: "$stats"
				},
				{
					$replaceRoot: {
						newRoot: "$stats"
					}
				}
			];

			tripReschedulePipeline = [

				{ $project: { "rosterDate": 1, "companyCode": 1, "route.shiftType": 1, "route.employees.pickupStatus": 1, "status": 1, "route.employees.name": 1, "_id": 1, "updatedAt": 1, "rideStarted": 1 } },
				{ $unwind: "$route.employees" },
				{
					"$match": {
						"$and": [{ "rosterDate": { "$gt": startDate, "$lte": endDate } }, { "route.shiftType": { "$eq": params.shiftType } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } },
						{ "companyCode": { "$eq": params.companyCode } }, { "route.employees.pickupStatus": { "$eq": config.CONSTANT.EMP_PICKUP_STATUS.RESCHEDULE } }]
					}
				},
				{ $project: { day: { $substr: [{ $toDate: '$rosterDate' }, 0, 10] } } },
				{
					$group: {
						_id: "$day",
						count: { $sum: 1 },
						time: { $avg: { $toDate: '$rosterDate' } },
					}
				},
				{ $sort: { _id: 1 } },
				{
					$project: {
						date: '$_id',
						views: '$count',
					},
				},
				{
					$group: {
						_id: null,
						stats: { $push: "$$ROOT" }
					}
				},
				{
					$project: {
						stats: {
							$map: {
								input: dateArray,
								as: "date",
								in: {
									$let: {
										vars: { dateIndex: { "$indexOfArray": ["$stats._id", "$$date"] } },
										in: {
											$cond: {
												if: { $ne: ["$$dateIndex", -1] },
												then: { $arrayElemAt: ["$stats", "$$dateIndex"] },
												else: { _id: "$$date", date: "$$date", views: 0 }
											}
										}
									}
								}
							}
						}
					}
				},
				{
					$unwind: "$stats"
				},
				{
					$replaceRoot: {
						newRoot: "$stats"
					}
				}
			];
		} else {
			tripCancelPipeline = [
				{
					"$match": {
						"$and": [{ "rosterDate": { "$gt": startDate, "$lte": endDate } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } },
						{ "companyCode": { "$eq": params.companyCode } }, { "route.employees.pickupStatus": { "$eq": config.CONSTANT.EMP_PICKUP_STATUS.RESCHEDULE } }]
					}
				},
				{ $project: { day: { $substr: [{ $toDate: '$rosterDate' }, 0, 10] } } },
				{
					$group: {
						_id: "$day",
						count: { $sum: 1 },
						time: { $avg: { $toDate: '$rosterDate' } },
					}
				},
				{ $sort: { _id: 1 } },
				{
					$project: {
						date: '$_id',
						views: '$count',
					},
				},
				{
					$group: {
						_id: null,
						stats: { $push: "$$ROOT" }
					}
				},
				{
					$project: {
						stats: {
							$map: {
								input: dateArray,
								as: "date",
								in: {
									$let: {
										vars: { dateIndex: { "$indexOfArray": ["$stats._id", "$$date"] } },
										in: {
											$cond: {
												if: { $ne: ["$$dateIndex", -1] },
												then: { $arrayElemAt: ["$stats", "$$dateIndex"] },
												else: { _id: "$$date", date: "$$date", views: 0 }
											}
										}
									}
								}
							}
						}
					}
				},
				{
					$unwind: "$stats"
				},
				{
					$replaceRoot: {
						newRoot: "$stats"
					}
				}
			];

			tripReschedulePipeline = [
				{
					"$match": {
						"$and": [{ "rosterDate": { "$gt": startDate, "$lte": endDate } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } },
						{ "companyCode": { "$eq": params.companyCode } }, { "route.employees.pickupStatus": { "$eq": config.CONSTANT.EMP_PICKUP_STATUS.RESCHEDULE } }]
					}
				},
				{ $project: { day: { $substr: [{ $toDate: '$rosterDate' }, 0, 10] } } },
				{
					$group: {
						_id: "$day",
						count: { $sum: 1 },
						time: { $avg: { $toDate: '$rosterDate' } },
					}
				},
				{ $sort: { _id: 1 } },
				{
					$project: {
						date: '$_id',
						views: '$count',
					},
				},
				{
					$group: {
						_id: null,
						stats: { $push: "$$ROOT" }
					}
				},
				{
					$project: {
						stats: {
							$map: {
								input: dateArray,
								as: "date",
								in: {
									$let: {
										vars: { dateIndex: { "$indexOfArray": ["$stats._id", "$$date"] } },
										in: {
											$cond: {
												if: { $ne: ["$$dateIndex", -1] },
												then: { $arrayElemAt: ["$stats", "$$dateIndex"] },
												else: { _id: "$$date", date: "$$date", views: 0 }
											}
										}
									}
								}
							}
						}
					}
				},
				{
					$unwind: "$stats"
				},
				{
					$replaceRoot: {
						newRoot: "$stats"
					}
				}
			];
		}
		let tripCancelData = this.aggregate("roasters", tripCancelPipeline, {});
		let tripRescheduleData = this.aggregate("roasters", tripReschedulePipeline, {});
		response = Promise.all([tripCancelData, tripRescheduleData]);
		return response;

	}

	/**
	 * @function dashboardEmpTracking
	 * @param params triptype triprange
	 */
	async dashboardEmpTracking(params: ListingRequest) {
		let aggPipe = [];
		let sdt = moment().startOf('day').subtract({ 'hours': 5, 'minutes': 30 }).format('x');
		let startDate = parseInt(sdt);
		let response: any = {};
		let empTrackingPipline = [
			{
				"$facet": {
					"onboardedEmployees": [
						{ $project: { "cab.registrationNo": 1, "cab.cabBadge": 1, "route.employees.pickupStatus": 1, "route.employees.employeeId": 1, "route.employees.name": 1, "_id": 1, "updatedAt": 1, "rideStarted": 1, "companyCode": 1 } },
						{ $sort: { _id: -1 } },
						{ $unwind: "$route.employees" },
						{ $match: { "companyCode": params.companyCode, "route.employees.pickupStatus": config.CONSTANT.EMP_PICKUP_STATUS.ONBOARDED, "rideStarted": true } },
					],
					"offBoardedEmployees": [
						{ $project: { "cab.registrationNo": 1, "companyCode": 1, "cab.cabBadge": 1, "route.employees.pickupStatus": 1, "route.employees.employeeId": 1, "route.employees.name": 1, "_id": 1, "updatedAt": 1, "rideStarted": 1 } },
						{ $sort: { _id: -1 } },
						{ $unwind: "$route.employees" },
						{ $match: { "companyCode": params.companyCode, "route.employees.pickupStatus": config.CONSTANT.EMP_PICKUP_STATUS.OFFBOARD, "rideStarted": true } },
					]
				}
			},
		];
		let empTrackingData = this.aggregate("roasters", empTrackingPipline, {});
		response = Promise.all([empTrackingData]);
		return response;

	}
	/**
	 * @function isShiftNameAlreadyExists
	 * @param params shiftName
	 */
	async isShiftNameAlreadyExists(params: ShiftName) {

		let query: any = {};

		let regex = new RegExp(["^", params.shiftName, "$"].join(""), "i");
		query["shiftSlot.shiftName"] = regex;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		query.companyCode = { "$eq": params.companyCode };

		let projection: any = {};

		let options: any = {};

		let isExist = await this.findOne("admins", query, projection, options);

		if (isExist) {
			return Promise.reject(adminConstant.MESSAGES.ERROR.SHIFT_NAME_ALREADY_EXIST);
		} else {
			return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
		}
	}
	async getSingleUserDevice(params: AddAdminNotificationRequest) {
		let aggPipe = [];

		aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });

		let lookup = {
			"from": "login_histories",
			"localField": "_id",
			"foreignField": "userId",
			"as": "admins"
		};
		aggPipe.push({ "$lookup": lookup });

		aggPipe.push({ "$unwind": "$admins" });

		let project1 = {
			_id: 1, isLogin: "$admins.isLogin", platform: "$admins.platform", deviceId: "$admins.deviceId",
			deviceToken: "$admins.deviceToken", arn: "$admins.arn", name: 1, gender: 1,
			created: 1, adminType: 1
		};
		aggPipe.push({ "$project": project1 });

		let match1: any = {};
		match1.isLogin = true;
		match1._id = appUtils.toObjectId(params.receiverId);
		match1.adminType = config.CONSTANT.ADMIN_TYPE.ADMIN;
		aggPipe.push({ "$match": match1 });
		return await this.aggregate("admins", aggPipe, {});
	}
	/**
	 * @function auditLogList
	 * @param params page no limit
	 */
	async auditLogList(params: ListingRequest) {
		try {
			let { pageNo, limit } = params;
			let aggPipe = [];
			let match1: any = {};
			match1 = {
				"$and": [
					{ "companyCode": { "$eq": params.companyCode } }]
			};
			aggPipe.push({ "$match": match1 });
			aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });

			let sort = {};
			sort = { "createdAt": -1 };
			aggPipe.push({ "$sort": sort });
			return await appUtils.paginate(this.audiLog, aggPipe, limit, pageNo);
		} catch (error) {
			throw error;
		}
	}

	// Forgot passsword toke save
	async updateForgetPassword(tokenData, accessToken) {
		let query: any = {};

		query._id = tokenData.userId;

		let update: any = {};
		update['$set'] = {
			forgetToken: accessToken
		};

		let options: any = {};

		let response = await this.update('admins', query, update, options);

		return response;
	}

	async isTokenExist(userData) {
		let query: any = {};
		query._id = userData.userId;
		let projection: any = {};
		let options: any = {};
		let response = await this.findOne('admins', query, projection, options);
		return response;
	}
	/**
	 * @function isPermissionExist permission exist when running server
	 * @param params
	 */
	async isPermissionExist() {
		let query: any = {};
		query = { "$or": [{ "moduleName": { "$exists": true } }, { "moduleName.0": { "$exists": true } }] };
		let projection: any = {};
		let options: any = {};
		let response = await this.findOne('permissions', query, projection, options);
		return response;
	}
	/**
	 * @function createCompanyAdmin
	 */
	async createCompanyAdmin(params: CreateCompanyRequest) {
		let query: any = {};
		let query1: any = {};
		let projection = {};
		// query._id = params.planeId;
		// query1._id = params.companyType;
		let location: any = {};
		location.address = params.address;
		location.coordinates = [params.longitude, params.latitude];
		params.companyBranch = location;
		params.companyAddress = location;
		let compantData: any = {};
		compantData = {
			_id: params.companyType,
			type: "software"
		};
		params.companyType = compantData;
		// if (params.companyType) {
		// 	let companyType = await this.findOne("company_types", query1, projection, {});
		// 	let compantData: any = {};
		// 	compantData = {
		// 		_id: companyType._id,
		// 		type: companyType.companyType
		// 	};
		// 	params.companyType = compantData;
		// }
		// if (params.planeId) {
		// 	let subscription = await this.findOne("subscriptions", query, projection, {});
		// 	let yearMonth = subscription.year * 12;
		// 	let totalMonth = subscription.month + yearMonth;
		// 	let CurrentDate = new Date();
		// 	let expiryDate = CurrentDate.setMonth(CurrentDate.getMonth() + totalMonth);
		// 	// params.expiryDate = expiryDate;
		// 	let newExpiry = new Date(expiryDate);
		// 	let expiryEndDate = newExpiry.setDate(newExpiry.getDate() + subscription.gracePeriod);
		// 	// params.expiryEndDate = expiryEndDate;
		// 	params.plane = {
		// 		_id: subscription._id,
		// 		name: subscription.name,
		// 		price: subscription.price,
		// 		description: subscription.description,
		// 		gracePeriod: subscription.gracePeriod,
		// 		year: subscription.year,
		// 		month: subscription.month,
		// 		expiryDate: expiryDate,
		// 		expiryEndDate: expiryEndDate,
		// 		paymentDate: Date.now(),
		// 	};
		// 	let update = {};
		// 	update["$inc"] = {
		// 		totalSubscribers: 1,
		// 	};
		// 	await this.updateOne("subscriptions", query, update, {});
		// 	params.totalAmount = subscription.price;
		// }

		return await this.save("admins", params);
	}
}