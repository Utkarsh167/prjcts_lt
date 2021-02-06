"use strict";

import * as _ from "lodash";
import * as promise from "bluebird";

import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/constant";
import * as empVehicleConstant from "@modules/v1/empVehicle/empVehicleConstant";
import * as config1 from "@config/environment";
import { AdminDao } from "@modules/v1/admin/AdminDao";
// import { CabRouteDao } from "@modules/v1/route/RouteDao";
// import { CabDao } from "@modules/v1/cab/CabDao";
import { promises } from "fs";
import * as moment from "moment";
import { now } from "moment";
// import { executer } from "@lib/socketManager";
// import { RoasterDao } from "@modules/v1/roaster/RoasterDao";
import { LoginHistoryDao } from "@modules/v1/loginHistory/LoginHistoryDao";
import * as pushNotification from '@utils/pushNotification';
import * as mongoose from "mongoose";

const googleMapsClient = require('@google/maps').createClient({
	key: config1.SERVER.GOOGLE_API_KEY,
	Promise: Promise
});

// let roasterDao = new RoasterDao();
// let cabRouteDao = new CabRouteDao();
let adminDao = new AdminDao();
let loginHistoryDao = new LoginHistoryDao();
// let cabDao = new CabDao();
export class EmpVehicleDao extends BaseDao {
	/**
	 * @description adding new vehicle details
	 * @author Utkarsh Patil 07/07/2020
	 * @function createVehicle
	 */
	async createVehicleData(params: Vehicle) {
		try {
			return await this.save("vehicles", params);
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function findUserByEmailOrMobileNo
	 */
	async findUserByEmailOrMobileNo(params) {
		let query: any = {};
		query["$or"] = [{ "email": params.email }, { "countryCode": params.countryCode, "mobileNo": params.mobileNo }];
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		query.userType = { "$eq": params.userType };

		let options: any = { lean: true };

		return await this.findOne("users", query, {}, options);
	}
	/**
	 * @function findUserByEmailCompanyCode
	 * @param email, companyId
	 */
	async findUserByEmailCompanyCode(params) {
		let query: any = {};
		// query["$or"] = [{ "email": params.email }, { "countryCode": params.countryCode, "mobileNo": params.mobileNo }];
		query["$or"] = [{ "email": params.email }];
		query.status = { "$ne": config.CONSTANT.STATUS.BLOCKED };
		query.type = { "$eq": params.type };
		// query.companyId = { "$eq": params.companyId };

		let options: any = { lean: true };

		return await this.findOne("users", query, {}, options);
	}

	/**
	 * @function findUserByEmail
	 */
	// check if email already exists

	async isEmailAlreadyExists(params: DriverSignupRequest) {

		let query: any = {};

		query.email = params.email;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

		let projection: any = {};

		let options: any = {};

		let isExist = await this.findOne("users", query, projection, options);

		if (isExist) {
			return Promise.reject(empVehicleConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
		} else {
			return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
		}
	}
	/**
	 * @function isEmpEmailAlreadyExists
	 * @param params email
	 */
	async isEmpEmailAlreadyExists(params: EmpSignupRequest) {
		let query: any = {};
		query.email = params.email;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		let projection: any = {};
		let options: any = {};
		let isExist = await this.findOne("users", query, projection, options);
		if (isExist) {
			console.log(isExist);
			return Promise.reject(empVehicleConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
		} else {
			return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
		}
	}
	/**
	 * @function isLocationNameAlreadyExists
	 * @param params company location name
	 */
	async isLocationNameAlreadyExists(params: EmpSignupRequest) {
		let isExist = await this.count("company_details", {"locations.name": params.companyLocationName});
		if (isExist < 1) {
			return Promise.reject(empVehicleConstant.MESSAGES.ERROR.LOCATION_NAME_NOT_EXIST);
		} else {
			return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
		}
	}
/**
	 * @function isEmployeeIdAlreadyExists
	 * @param params employeeId
	 */
	async isEmployeeIdAlreadyExists(params: EmpSignupRequest) {
		let query: any = {};
		query.employeeId = params.employeeId.toString();
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		let projection: any = {};
		let options: any = {};
		let isExist = await this.findOne("users", query, projection, options);
		if (isExist) {
			return Promise.reject(empVehicleConstant.MESSAGES.ERROR.EMPLOYEE_ID_ALREADY_EXIST);
		} else {
			return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
		}
	}
	/**
	 * @function isVehicleExistForUserId
	 * @param params employeeId
	 */
	async isVehicleExistForUserId(status , params: Vehicle) {
		let query: any = {};
		query.userId = params.userId;
		if ( status === config.CONSTANT.STATUS.UN_BLOCKED ){
			query.status = { "$eq": config.CONSTANT.STATUS.BLOCKED };
		}else{
			query.status = { "$ne": config.CONSTANT.STATUS.BLOCKED };
		}
		let projection: any = {};
		let options: any = {};
		let isExist = await this.find("vehicles", query, projection, options);
		if (isExist) {
			return isExist;
		} else {
			return empVehicleConstant.MESSAGES.ERROR.NO_VEHICLE_FOR_EMPLOYEE;
		}
	}

	/**
	 * @function isEmployeeIdAlreadyExists
	 * @param params employeeId
	 * @author Utkarsh Patil 13/07/2020
	 */
	async isEmployeeIdAlreadyExistsForVehicle(params: EmpSignupRequest) {
		let query: any = {};
		query.employeeId = params.employeeId.toString();
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		let projection: any = {};
		let options: any = {};
		let isExist = await this.findOne("users", query, projection, options);
		if (isExist) {
			return isExist;
		} else {
			return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
			// return Promise.reject(empVehicleConstant.MESSAGES.ERROR.EMPLOYEE_ID_NOT_PRESENT);
		}
	}
	// satyam -- Employee Id - alreadyExists
	async isEmployeeIdAlreadyExistsUpdate(params: EmpUpdateRequest) {

		let query: any = {};

		query = {
			"$and": [
						{ "_id":
							{ "$ne": params.empId }
						},
						{ "employeeId": { "$eq": params.employeeId }
						},
						{ "status":
							{ "$ne": config.CONSTANT.STATUS.BLOCKED
							}
						}
					]
		};
		let projection: any = {};

		let options: any = {};

		let isExist = await this.findOne("users", query, projection, options);

		if (isExist) {
			return Promise.reject(empVehicleConstant.MESSAGES.ERROR.EMPLOYEE_ID_ALREADY_EXIST);
		} else {
			return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
		}
	}
	/**
	 * @function isEmpEmailByIdExists
	 * @param params empId
	 */
	async isEmpEmailByIdExists(params: EmpUpdateRequest) {

		let query: any = {};
		// query.email = params.email;
		query = {
					"$and": [
								{ "_id":
									{ "$ne": params.empId }
								},
								{ "email": { "$eq": params.email }
								},
								{ "status":
									{ "$ne": config.CONSTANT.STATUS.BLOCKED
									}
								}
							]
				};

		let projection: any = {};

		let options: any = {};

		let isExist = await this.findOne("users", query, projection, options);

		if (isExist) {
			return Promise.reject(empVehicleConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
		} else {
			return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
		}
	}
	/**
	 * @function findUserById
	 */
	async findUserById(params: UserId) {
		let query: any = {};
		query._id = params.userId;
		query.status = { "$ne": config.CONSTANT.STATUS.BLOCKED };
		// let project = {email: 1, name: 1, contactNo: 1, employeeId: 1, companyId: 1, status: 1, type: 1, companyLocationName: 1};
		return await this.findOne("users", query, {}, {});
	}
	async findUserByIdForAuth(params: UserId) {
		let query: any = {};
		query._id = params.userId;
		// query.status = { "$ne": config.CONSTANT.STATUS.BLOCKED };
		// let project = {email: 1, name: 1, contactNo: 1, employeeId: 1, companyId: 1, status: 1, type: 1, companyLocationName: 1};
		return await this.findOne("users", query, {}, {});
	}
	/**
	 * @function findVehilceByUserId
	 */
	async findVehicleByUserId(userId) {
		let query: any = {};
		query.userId = userId;
		query.status = { "$ne": config.CONSTANT.STATUS.BLOCKED };
		let project = {
		};
		return await this.find("vehicles", query, project, {});
	}

	/**
	 * @function findVehilceByVehicleId
	 */
	async findVehicleByVehicleId(params: UserId) {
		let query: any = {};
		query._id = params.vehicleId;
		query.status = { "$ne": config.CONSTANT.STATUS.BLOCKED };
		let project = {
		};
		return await this.findOne("vehicles", query, project, {});
	}

	async findVehicleByVehicleRegNo(params: UserId) {
		let query: any = {};
		query.regNo = params.vehicleId;
		query.status = { "$ne": config.CONSTANT.STATUS.BLOCKED };
		let project = {
		};
		return await this.findOne("vehicles", query, project, {});
	}

	// User Counts -- satyam
	async getUserrequestCountCancelled(params: UserId) {
		let query: any = {};
		query.userId = params.userId;
		query.requestType = config.CONSTANT.TRIP_RESCHEDULE.CANCELLED;
		return await this.count("reschedules", query);
	}
	// User Counts -- satyam
	async getUserrequestCountReschedule(params: UserId) {
		let query: any = {};
		query.userId = params.userId;
		query.requestType = config.CONSTANT.TRIP_RESCHEDULE.RESCHEDULE;
		return await this.count("reschedules", query);
	}
	// User Counts -- satyam
	async getUserNoShowStatus(params: UserId) {
		let query: any = {};
		return await this.count("roasters", { "route.employees.empId": params.userId, "route.employees.pickupStatus": 4 });
	}
	/**
	 * @function findUserGroupById
	 */
	async findUserGroupById(params: UserId) {
		let query: any = {};
		query["employees.empId"] = params.userId;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		let project = {
			routeBadge: 1,
			routeName: 1,
			_id: 1
		};
		return await this.findOne("cab_routes", query, project, {});
	}
	/**
	 * @function findUserByCompanyCode
	 * @param userId, companyId
	 */
	async findUserByCompanyCode(params: UserId) {
		let query: any = {};
		query._id = params.userId;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		query.companyId = { "$eq": params.companyId };
		let project = {
		};
		return await this.findOne("users", query, project, {});
	}

	/**
	 * @function findUserProfile
	 */
	async findUserProfile(params: TokenData) {
		console.log(params);
		let query: any = {};
		query._id = params.userId;
		query.status = { "$ne": config.CONSTANT.STATUS.BLOCKED };
		query.companyId = { "$eq": params.companyId };
		query.isSpotBooked = { "$eq": true };
		let project = {
		};
		let user =  await this.findOne("users", query, project, {});
		let query2: any = {};
		query2.userId = params.userId;
		query2.isLogin = true;
		query2.deviceId = params.deviceId;
		let userloginHistory = await this.findOne("login_histories", query2, {}, {});
		console.log(userloginHistory);
		if (user){
			let project1 = {
				spotId: 1,
				bookedAt: 1,
				floorName: 1,
				zoneName: 1
			};
			let query1: any = {};
			query1.spotId = user.bookedSpot;
			query1.bookedAt = user.bookedAt;
			query1.userId = user._id;
			let slot = await this.findOne("booking_slot", query1, project1, {});
			// response["isLogin"] = userloginHistory.isLogin;
			let response = {
				spotId: slot.spotId,
				bookedAt : slot.bookedAt,
				floorName : slot.floorName,
				zoneName : slot.zoneName,
				isLogin: userloginHistory.isLogin,
				_id: slot._id,
				id: slot.id
			};
			return response;
		} else {
			return {isSpotBooked: false, isLogin: userloginHistory.isLogin};
		}

	}

	/**
	 * @function driverListing
	 */
	async driverListing(params: ListingRequest) {
		let { searchKey } = params;
		let aggPipe = [];
		let match: any = {};
		let match1: any = {};
		let match2: any = {};
		if (params.type === config.CONSTANT.ADMIN_TYPE.ADMIN) {
			match = { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { userType: { $eq: config.CONSTANT.USER_TYPE.DRIVER } }, { "companyId": { "$eq": params.companyId } }] };
		} else {
			match = {
				"$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { userType: { $eq: config.CONSTANT.USER_TYPE.DRIVER } }, { "type": { "$eq": config.CONSTANT.ADMIN_TYPE.SUB_ADMIN } },
				{ "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyId": { "$eq": params.companyId } }]
			};
		}
		aggPipe.push({ "$match": match });
		// // match = { "$and": [{ "type": { "$ne": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN } }, { "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyId": { "$eq": params.companyId } }] };
		// // match = { $and: [{ status: { $ne: config.CONSTANT.STATUS.DELETED } }, { userType: { $eq: config.CONSTANT.USER_TYPE.DRIVER } }] };
		// if (searchKey) {
		// 	match["$or"] = [
		// 		{ "name": { "$regex": searchKey, "$options": "-i" } }
		// 	];
		// }
		if (searchKey) {
			match1 = { "name": { "$regex": searchKey, "$options": "-i" } };
			aggPipe.push({ "$match": match1 });
		}

		match2["$or"] = [
			{ "cab": { "$exists": false } },
			{ "cab.0": { "$exists": false } },
		];
		aggPipe.push({ "$match": match2 });

		let project = {
			_id: 1, name: 1,
		};
		aggPipe.push({ "$project": project });
		let response: any = {};
		response = await this.aggregate("users", aggPipe, {});
		return response;
	}

	/**
	 * @function employeeListing
	 */
	async employeeListing(params: ListingRequest) {
		let { searchKey } = params;
		let aggPipe = [];
		let match: any = {};
		let match1: any = {};
		match = { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.BLOCKED } }, { type: { $eq: config.CONSTANT.ADMIN_TYPE.EMPLOYEE } }, { "companyId": {$eq: appUtils.toObjectId(params.companyId)}}]};
		aggPipe.push({ "$match": match });
		if (searchKey) {
			match1 = { "employeeId": { "$regex": searchKey, "$options": "-i" } };
			aggPipe.push({ "$match": match1 });
		}

		let project = {
			_id: 1, name: 1, employeeId: 1
		};
		aggPipe.push({ "$project": project });
		let response: any = {};
		response = await this.aggregate("users", aggPipe, {});
		return response;
	}

	/**
	 * @param params tokenData
	 */
	async empList(params: TokenData) {
		let aggPipe = [];

		let match: any = {};
		// { cabdriverId: { $eq: params.userId } }
		match = { $and: [{ status: { $ne: config.CONSTANT.STATUS.DELETED } }, { userType: { $eq: config.CONSTANT.USER_TYPE.EMPLOYEE } }] }, // { "$ne": config.CONSTANT.STATUS.DELETED };
			aggPipe.push({ "$match": match });
		let project = {
			_id: 1, name: 1, pickup: 1, dropoff: 1, shiftStartTime: 1, shiftEndTime: 1, pickupStatus: 1, otpTime: 1, weekOff: 1, shift: 1
		};
		let sort = {};
		sort = { "distance": 1 };
		aggPipe.push({ "$sort": sort });
		aggPipe.push({ "$project": project });
		let skip = 0; // Only for dummy data api so we can limit hard coded pass
		let limit = 4; // Only for dummy data api so we can limit hard coded pass
		aggPipe.push({ "$skip": skip });
		aggPipe.push({ "$limit": limit });
		let response: any = {};
		response = await this.aggregate("users", aggPipe, {});
		return response;
	}

	/**
	 * @param params tokenData
	 */
	async bookedSpots(params: TokenData) {
		let aggPipe = [];

		let match: any = {};
		// { cabdriverId: { $eq: params.userId } }
		match = { $and: [{ status: { $ne: config.CONSTANT.STATUS.BLOCKED } },
			 { type: { $eq: config.CONSTANT.ADMIN_TYPE.EMPLOYEE } },
			  { isSpotBooked: { $eq: true }  },
			   { companyLocationName: { $eq: params.companyLocationName }  }] }, // { "$ne": config.CONSTANT.STATUS.DELETED };
			aggPipe.push({ "$match": match });
		let project = {
			_id: 1, name: 1, type: 1, isSpotBooked: 1, status: 1, companyLocationName: 1, email: 1, employeeId: 1, bookedAt: 1, bookedSpot: 1
		};
		// let sort = {};
		// sort = { "distance": 1 };
		// aggPipe.push({ "$sort": sort });
		aggPipe.push({ "$project": project });
		// let skip = 0; // Only for dummy data api so we can limit hard coded pass
		// let limit = 4; // Only for dummy data api so we can limit hard coded pass
		// aggPipe.push({ "$skip": skip });
		// aggPipe.push({ "$limit": limit });
		let response: any = {};
		response = await this.aggregate("users", aggPipe, {});
		return response;
	}

	/**
	 * @function Driversignup
	 */
	async driverSignup(params: DriverSignupRequest) {
		params.createdAt = new Date().getTime();
		return await this.save("users", params);
	}

	/**
	 * @function Empsignup
	 */
	async empSignup(params: EmpSignupRequest) {
		params.createdAt = new Date().getTime();
		return await this.save("users", params);
	}

	/**
	 * @function changeForgotPassword
	 */
	async changeForgotPassword(params: ChangeForgotPasswordRequest) {
		let query: any = {};
		query._id = params.userId;

		let update = {};
		update["$set"] = {
			hash: params.hash
		};

		let options = { new: true };

		return await this.findOneAndUpdate("users", query, update, options);
	}

	async checkExistingToken(userData, token) {
		let query: any = {};
		query._id = userData.userId;
		query['$or'] = [{ forgetToken: token }, { emailToken: token }];
		query.status = config.CONSTANT.STATUS.UN_BLOCKED;
		let projection: any = {};
		let options: any = {};
		return await this.findOne('users', query, projection, options);
	}
	/**
	 *@function  employeeById
	 * @param params employeeId
	 */
	async employeeById(params: IsEmployee) {
		let query: any = {};
		query["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "employeeId": { "$eq": params.empId } }, { "companyId": { "$eq": params.companyId } }];
		let projection = {};
		return await this.findOne("users", query, projection, {});
	}
	// satyam -- employee for group
	async empForGroup(params: EmployeeForGroupRequest) {
		let query: any = {};
		query["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } },
		{ "employeeId": { "$eq": params.empId } },
		{ "companyId": { "$eq": params.companyId } },
		{ "shift": { "$eq": params.shift } },
		{ "groupFormed": { "$eq": true } },
		{ "isAddressChange": { "$eq": true } },
		{ "_id": { "$nin": params.employeesIds } }
		];
		let projection = {};
		return await this.findOne("users", query, projection, {});
	}

	async isTokenExist(userData) {
		let query: any = {};
		query._id = userData.userId;
		let projection: any = {};
		let options: any = {};
		let response = await this.findOne('users', query, projection, options);
		return response;
	}

	async emptyForgetToken(userData) {
		let query: any = {};
		query._id = userData._id;
		let update: any = {};
		update['$set'] = {
			forgetToken: '',
		};
		let options: any = {};
		let response = await this.update('users', query, update, options);
		return response;
	}
	/**
	 * @function userList
	 */
	async userList(params: ListingRequest) {
		// compLocationName --satyam
		let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, userType, requestedPage, compLocationName } = params;
		let aggPipe = [];
		let match1: any = {};
		// if (params.type === config.CONSTANT.ADMIN_TYPE.ADMIN) {
		// Added Access for Subadmin - Shivakumar A
		// Removed Displaying deleted accounts - Aashiq M
		if ( requestedPage === config.CONSTANT.STATUS.BLOCKED){
			match1 = { "$and": [{ "type": { "$eq": config.CONSTANT.ADMIN_TYPE.EMPLOYEE } }, { "status": { "$eq": config.CONSTANT.STATUS.BLOCKED } }, { "companyId": { "$eq": appUtils.toObjectId(params.companyId) } }] };
		}else{
			match1 = { "$and": [{ "type": { "$eq": config.CONSTANT.ADMIN_TYPE.EMPLOYEE } }, { "status": { "$eq": config.CONSTANT.STATUS.UN_BLOCKED } }, { "companyId": { "$eq": appUtils.toObjectId(params.companyId) } }] };
		}
		// match = { "$and": [{ "type": { "$ne": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN } }, { "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyId": { "$eq": params.companyId } }] };
		aggPipe.push({ "$match": match1 });
		// let match1: any = {};
		// match1.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		// aggPipe.push({ "$match": match1 });
		// Added match cond for companyLocationName - Aashiq - 28/08/2020
		let matchLocName: any = {};
		// compLocationName --satyam
		if (compLocationName){
			matchLocName.companyLocationName = compLocationName;
			aggPipe.push({"$match": matchLocName});
		}
		let match2 = {};
		if (searchKey) {
			match2["$or"] = [
				{ "name": { "$regex": searchKey, "$options": "-i" } },
				{ "email": { "$regex": searchKey, "$options": "-i" } },
				{ "employeeId": { "$regex": searchKey, "$options": "-i" } },
				// { "driverId": { "$regex": searchKey, "$options": "-i" } },
				// { "pickup.address.fullAddress": { "$regex": searchKey, "$options": "-i" } }
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

		// let match7: any = {};
		// if (userType) {
		// 	match7.userType = { "$eq": userType };
		// 	aggPipe.push({ "$match": match7 });
		// }

		// let match8: any = {};
		// if (shiftName) {
		// 	match8.shift = { "$eq": shiftName };
		// 	aggPipe.push({ "$match": match8 });
		// }
		// let match9: any = {};
		// if (isAddressChangeReq) {
		// 	match9.isAddressChangeReq = { "$eq": isAddressChangeReq };
		// 	aggPipe.push({ "$match": match9 });
		// }
		let sort = {};
		if (sortBy && sortOrder) {
			if (sortBy === "name") {
				sort = { "name": sortOrder };
			}
			// else if (sortBy === "driverId") {
			// 	sort = { "driverId": sortOrder };
			// }
			 else if (sortBy === "employeeId") {
				sort = { "employeeId": sortOrder };
			}
			//  else if (sortBy === "shiftStartTime") {
			// 	sort = { "shiftStartTime": sortOrder };
			// } else if (sortBy === "shiftEndTime") {
			// 	sort = { "shiftEndTime": sortOrder };
			// }
			else {
				sort = { "created": sortOrder };
			}
		} else {
			sort = { "created": -1 };
		}
		aggPipe.push({ "$sort": sort });
		if (pageNo && limit) {
			let skip = (pageNo - 1) * limit;
			aggPipe.push({ "$skip": skip });
			aggPipe.push({ "$limit": limit });
		}
		// Added filter for displaying only unblocked vehicles - Aashiq M
		let matchVehicles =  { from: "vehicles", localField: "_id", foreignField: "userId", as: "vehicleList" } ;
		 aggPipe.push({ "$lookup": matchVehicles });
		let filter = {
			$filter : {
				input: "$vehicleList",
				as : "vehicleList_field",
				cond : {
					$eq: ["$$vehicleList_field.status", config.CONSTANT.STATUS.UN_BLOCKED]
				}
			}
		};
		let project = {
			_id: 1, name: 1, email: 1, mobileNo: 1, created: 1, status: 1, type: 1, employeeId: 1, companyLocationName: 1,
			profilePicture: 1, vehicleList: filter
		};
		aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let userList = this.aggregate("users", aggPipe, {});

		// let totalCount = this.count('users', { ...match1, ...match2, ...match3, ...match4, ...match5, ...match6, ...match7, ...match9 });
		// Add all matching cases to get count - Shivakumar A
		let totalCount = this.count('users', { ...match1, ...matchLocName, ...match2, ...match3, ...match4, ...match5, ...match6 });
		response = Promise.all([userList, totalCount]);
		return response;
	}

	/**
	 * @function vehicleList
	 * @author Utkarsh Patil 16/07/2020
	 */
	async vehicleList(params: ListingRequest) {
		// compLocationName --satyam
		console.log(params);
		let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, type, requestedPage, vehicleType, compLocationName } = params;
		let aggPipe = [];
		let aggPipe2 = [];
		let match1: any = {};
		let query: any = {};
		query._id = params.userId;
		// if (params.type === config.CONSTANT.ADMIN_TYPE.ADMIN) {
		// Added Access for Subadmin - Shivakumar A
		if ( requestedPage === config.CONSTANT.STATUS.BLOCKED){
				match1 = { "$and": [ { "companyId": { "$eq": appUtils.toObjectId(params.companyId) } }, { "status": { "$eq": config.CONSTANT.STATUS.BLOCKED } }] };
		}else{
				match1 = { "$and": [ { "companyId": { "$eq": appUtils.toObjectId(params.companyId) } }, { "status": { "$eq": config.CONSTANT.STATUS.UN_BLOCKED } }] };
		}
		// match = { "$and": [{ "type": { "$ne": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN } }, { "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyId": { "$eq": params.companyId } }] };
		aggPipe.push({ "$match": match1 });
		// let match1: any = {};
		// match1.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		// aggPipe.push({ "$match": match1 });

		let match2 = {};
		if (searchKey) {
			match2["$or"] = [
				{ "regNo": { "$regex": searchKey, "$options": "-i" } },
				{ "modal": { "$regex": searchKey, "$options": "-i" } },
				// { "driverId": { "$regex": searchKey, "$options": "-i" } },
				// { "pickup.address.fullAddress": { "$regex": searchKey, "$options": "-i" } }
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
		if (vehicleType) {
			match7.vehicleType = { "$eq": vehicleType };
			aggPipe.push({ "$match": match7 });
		}

		let lookup = {
			"from": "users",
			"localField": "userId",
			"foreignField": "_id",
			"as": "users"
		};
		aggPipe.push({ "$lookup": lookup });
		aggPipe.push({ $unwind: { path: "$users", preserveNullAndEmptyArrays: true } });
		if ( requestedPage !== config.CONSTANT.STATUS.BLOCKED){
			aggPipe.push({$match: {"users.status": config.CONSTANT.STATUS.UN_BLOCKED}});
		}
		// Added match cond for companyLocationName - Aashiq - 28/08/2020
		let matchLocName: any = {};
		// compLocationName --satyam
		if (compLocationName){
			matchLocName = {"users.companyLocationName": compLocationName};
			aggPipe.push({"$match": matchLocName});
		}
		aggPipe2 = [...aggPipe];
		// let match7: any = {};
		// if (userType) {
		// 	match7.userType = { "$eq": userType };
		// 	aggPipe.push({ "$match": match7 });
		// }

		// let match8: any = {};
		// if (shiftName) {
		// 	match8.shift = { "$eq": shiftName };
		// 	aggPipe.push({ "$match": match8 });
		// }
		// let match9: any = {};
		// if (isAddressChangeReq) {
		// 	match9.isAddressChangeReq = { "$eq": isAddressChangeReq };
		// 	aggPipe.push({ "$match": match9 });
		// }
		let sort = {};
		if (sortBy && sortOrder) {
			if (sortBy === "regNo") {
				sort = { "regNo": sortOrder };
			}else if (sortBy === "model"){
				console.log("check");
				sort = { "modal": sortOrder};
			}else if (sortBy === "userName"){
				sort = { "users.name": sortOrder};
			}else {
				console.log("check2");
				sort = { "created": sortOrder };
			}
		} else {
			sort = { "created": -1 };
		}
		aggPipe.push({ "$sort": sort });
		if (pageNo && limit) {
			let skip = (pageNo - 1) * limit;
			aggPipe.push({ "$skip": skip });
			aggPipe.push({ "$limit": limit });
		}

		let project = {
			name: "$users.name", email: "$users.email", employeeId: "$users.employeeId", _id: 1, regNo: 1, modal: 1, vehicleType: 1, status: 1, created: 1, companyLocationName: "$users.companyLocationName", userStatus: "$users.status"
		};

		aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let vehicleList = this.aggregate("vehicles", aggPipe, {});
		// Added aggregate to fetch the totalcount;
		aggPipe2.push({$group: {_id: null, count: {$sum: 1}}});
        aggPipe2.push({$project: {count: {$cond: {if: "$count", then: "$count", else: 0}}}});
        let totalCount = await this.aggregate('vehicles', aggPipe2, {});
		// let totalCount = this.count('vehicles', { ...match1, ...match2, ...match3, ...match4, ...match5, ...match6, ...match7 });
		response = Promise.all([vehicleList, totalCount]);
		return response;
	}
	// userList with approved address - satyam
	async userListCurrent(params: ListingRequest) {
		let { shiftName, isAddressChangeReq, pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, userType } = params;
		let aggPipe = [];
		let match1: any = {};
		if (params.type === config.CONSTANT.ADMIN_TYPE.ADMIN || params.type === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {

			if (params.isArchived) {
				match1 = { "$and": [{ "status": { "$eq": config.CONSTANT.STATUS.DELETED } }, { "companyId": { "$eq": params.companyId } }] };
			} else {
				match1 = { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyId": { "$eq": params.companyId } }, { "isAddressChange": { "$eq": true } }] };
			}
		} else {
			if (params.isArchived) {
				match1 = {
					"$and": [{ "status": { "$eq": config.CONSTANT.STATUS.DELETED } }, { "type": { "$eq": config.CONSTANT.ADMIN_TYPE.SUB_ADMIN } },
					{ "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyId": { "$eq": params.companyId } }]
				};
			} else {
				match1 = {
					"$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "type": { "$eq": config.CONSTANT.ADMIN_TYPE.SUB_ADMIN } },
					{ "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyId": { "$eq": params.companyId } }]
				};
			}
		}
		// match = { "$and": [{ "type": { "$ne": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN } }, { "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyId": { "$eq": params.companyId } }] };
		aggPipe.push({ "$match": match1 });
		// let match1: any = {};
		// match1.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		// aggPipe.push({ "$match": match1 });

		let match2 = {};
		if (searchKey) {
			match2["$or"] = [
				{ "name": { "$regex": searchKey, "$options": "-i" } },
				{ "email": { "$regex": searchKey, "$options": "-i" } },
				{ "employeeId": { "$regex": searchKey, "$options": "-i" } },
				{ "driverId": { "$regex": searchKey, "$options": "-i" } },
				{ "pickup.address.fullAddress": { "$regex": searchKey, "$options": "-i" } }
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

		let match8: any = {};
		if (shiftName) {
			match8.shift = { "$eq": shiftName };
			aggPipe.push({ "$match": match8 });
		}
		let match9: any = {};
		if (isAddressChangeReq) {
			match9.isAddressChangeReq = { "$eq": isAddressChangeReq };
			aggPipe.push({ "$match": match9 });
		}
		let sort = {};
		if (sortBy && sortOrder) {
			if (sortBy === "name") {
				sort = { "name": sortOrder };
			} else if (sortBy === "driverId") {
				sort = { "driverId": sortOrder };
			} else if (sortBy === "employeeId") {
				sort = { "employeeId": sortOrder };
			} else if (sortBy === "shiftStartTime") {
				sort = { "shiftStartTime": sortOrder };
			} else if (sortBy === "shiftEndTime") {
				sort = { "shiftEndTime": sortOrder };
			} else {
				sort = { "created": sortOrder };
			}
		} else {
			sort = { "created": -1 };
		}
		aggPipe.push({ "$sort": sort });
		if (pageNo && limit) {
			let skip = (pageNo - 1) * limit;
			aggPipe.push({ "$skip": skip });
			aggPipe.push({ "$limit": limit });
		}
		let project = {
			_id: 1, dropoff: 1, groupFormed: 1, tempPickup: 1, pickup: 1, shift: 1, name: 1, email: 1, countryCode: 1, mobileNo: 1, gender: 1, created: 1, status: 1, userType: 1, driverId: 1, employeeId: 1,
			type: 1, profilePicture: 1, tripCount: 1, shiftStartTime: 1, shiftEndTime: 1, weekOff: 1
		};
		aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let userList = this.aggregate("users", aggPipe, {});
		let totalCount = this.count('users', { ...match1, ...match2, ...match3, ...match4, ...match5, ...match6, ...match7, ...match8, ...match9 });
		response = Promise.all([userList, totalCount]);
		return response;
	}

	/**
	 * @function exportUser
	 */
	async exportUser(params: ListingRequest) {
		let { searchKey, sortBy, sortOrder, status, fromDate, toDate } = params;
		let aggPipe = [];

		let match1: any = {};
		match1.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		aggPipe.push({ "$match": match1 });

		let match2 = {};
		if (searchKey) {
			match2["$or"] = [
				{ "firstName": { "$regex": searchKey, "$options": "-i" } },
				{ "middleName": { "$regex": searchKey, "$options": "-i" } },
				{ "lastName": { "$regex": searchKey, "$options": "-i" } },
				{ "email": { "$regex": searchKey, "$options": "-i" } }
			];
			aggPipe.push({ "$match": match2 });
		}

		aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });

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

		let project = {
			_id: 1, firstName: 1, middleName: 1, lastName: 1, email: 1, countryCode: 1, mobileNo: 1, dob: 1, gender: 1,
			createdAt: 1, created: 1, status: 1
		};
		aggPipe.push({ "$project": project });

		let sort = {};
		if (sortBy && sortOrder) {
			if (sortBy === "firstName") {
				sort = { "firstName": sortOrder };
			} else if (sortBy === "middleName") {
				sort = { "middleName": sortOrder };
			} else if (sortBy === "lastName") {
				sort = { "lastName": sortOrder };
			} else if (sortBy === "dob") {
				sort = { "dob": sortOrder };
			} else {
				sort = { "created": sortOrder };
			}
		} else {
			sort = { "createdAt": -1 };
		}
		aggPipe.push({ "$sort": sort });

		return await this.aggregate("users", aggPipe, {});
	}

	/**
	 * @function blockUnblock
	 */
	async blockUnblockEmployee(params: BlockRequest) {
		let query: any = {};
		query._id = params.userId;
		let options = {};
		let update = {};
		update["$set"] = {
			status: params.status,
		};
		return await this.findOneAndUpdate("users", query, update, options);
	}

	/**
	 * @function blockUnblock
	 */
	async blockUnblockVehicle(vehicleId , params: BlockRequest) {
		let query: any = {};
		query._id = vehicleId;
		let options = {};
		let update = {};
		update["$set"] = {
			status: params.status,
		};
		return await this.findOneAndUpdate("vehicles", query, update, options);
	}

	/**
	 * @function multiBlockUnblock
	 */
	async multiBlockUnblock(params: MultiBlockRequest) {
		let query: any = {};
		query._id = params.userId;

		let update = {};
		update["$set"] = {
			status: params.status
		};

		let options = { new: true };

		return await this.findOneAndUpdate("users", query, update, options);
	}

	/**
	 * @function deleteUser
	 */
	// async deleteUser(params: DeleteRequest) {
	// 	let query: any = {};
	// 	let query1: any = {};
	// 	query._id = params.userId;
	// 	query1["driverMapped._id"] = params.userId;
	// 	let options = {};
	// 	let update1 = {};
	// 	update1["$pull"] = {
	// 		driverMapped: { "_id": { "$in": [params.userId] } },
	// 	};
	// 	let userData = await this.findUserById(params);
	// 	if (userData.userType === config.CONSTANT.USER_TYPE.DRIVER) {
	// 		let cab = await this.find("cabs", { "driverMapped._id": params.userId }, {}, {});
	// 		// if (cab.length !== 0) {
	// 		// 	let isExist = await cabDao.isCabAlreadyAssigned({ cabId: cab[0]._id });
	// 		// 	if (isExist) {
	// 		// 		return Promise.reject(empVehicleConstant.MESSAGES.ERROR.CAB_ASSIGN_IN_TRIP);
	// 		// 	}
	// 		// }
	// 		// app-inventive code
	// 		// let isExist = await cabDao.isCabAlreadyAssigned({ cabId: cab[0]._id });
	// 		// 	if (isExist) {
	// 		// 		return Promise.reject(empVehicleConstant.MESSAGES.ERROR.CAB_ASSIGN_IN_TRIP);
	// 		// 	}
	// 		await this.updateMany("cabs", query1, update1, options);
	// 	}
	// 	let update = {};
	// 	update["$set"] = {
	// 		status: config.CONSTANT.STATUS.DELETED,
	// 		cab: [],
	// 	};
	// 	let userRoutes = await this.find("cab_routes", { "employees.employeeId": userData.employeeId }, {}, {});
	// 	let admin = await adminDao.findOne("users", { _id: userData.createdBy }, {}, {});
	// 	for (let userRoute of userRoutes) {
	// 		let algoReqObj: any = {};
	// 		let officeLocation: any = {};
	// 		algoReqObj.groups = [];
	// 		officeLocation.lat = admin.companyAddress.coordinates[1];
	// 		officeLocation.long = admin.companyAddress.coordinates[0];
	// 		algoReqObj.waitTime = userRoute.waitTime;
	// 		algoReqObj.officeLocation = officeLocation;
	// 		algoReqObj.maxTripDuration = userRoute.maxTripDuration;
	// 		let groupObj: any = {};
	// 		groupObj.grpId = userRoute.grpId;
	// 		groupObj.grpCentre = userRoute.grpCentre;
	// 		groupObj.shiftName = userRoute.shiftName;
	// 		groupObj.shiftType = userRoute.shiftType;
	// 		groupObj.shiftTime = userRoute.shiftTime;
	// 		groupObj.waitTime = userRoute.waitTime;
	// 		groupObj.grpDbId = userRoute._id;
	// 		groupObj.maxTripDuration = userRoute.maxTripDuration;
	// 		groupObj.maxGroupSize = userRoute.maxGroupSize;
	// 		let employees = [];
	// 		for (let e of userRoute.employees) {
	// 			let obj = {
	// 				"empId": e.empId,
	// 				"empLocation": e.empLocation,
	// 				"weekOff": e.weekOff,
	// 				"name": e.name,
	// 				"employeeId": e.employeeId,
	// 				"countryCode": e.countryCode,
	// 				"mobileNo": e.mobileNo,
	// 				"address": e.address
	// 			};
	// 			if (e.employeeId !== userData.employeeId) {
	// 				employees.push(obj);
	// 			}
	// 		}
	// 		groupObj.employees = employees;
	// 		groupObj.empCount = employees.length;
	// 		algoReqObj.groups.push(groupObj);
	// 		if (employees.length > 0) {
	// 			let routeAlgoEta1 = await cabRouteDao.routingAlgoETA(algoReqObj, params);
	// 			let query2: any = {};
	// 			query2._id = routeAlgoEta1[0].grpDbId;
	// 			let update2 = {};
	// 			update2["$set"] = {
	// 				"grpCentre": routeAlgoEta1[0].grpCentre,
	// 				"empCount": routeAlgoEta1[0].empCount,
	// 				"employees": routeAlgoEta1[0].employees,
	// 				"route": routeAlgoEta1[0].route,
	// 				"bounds": routeAlgoEta1[0].bounds,
	// 				"startLocation": routeAlgoEta1[0].startLocation,
	// 				"endLocation": routeAlgoEta1[0].endLocation,
	// 				"totalTripTime": routeAlgoEta1[0].totalTripTime
	// 			};
	// 			let updatedRoute = await this.findOneAndUpdate("cab_routes", query2, update2, { new: true });
	// 			let roster = await this.updateMany("roasters", { "route._id": userRoute._id, "rideStarted": false, "rideCompleted": false }, { "route": updatedRoute }, {});
	// 			let employeeList = updatedRoute.employees;
	// 			// let empIdArray = _.map(employeeList, 'empId');
	// 			let empMessage;
	// 			let empTitle;
	// 			for (let emp of employeeList) {
	// 				let userDevice = await loginHistoryDao.findChunkDevice(emp.empId);
	// 				if (updatedRoute.shiftType === config.CONSTANT.SHIFT_TYPE.LOGIN) {
	// 					empTitle = config.CONSTANT.NOTIFICATION_TITLE.PICKUP_TIME_CHANGE;
	// 					empMessage = config.CONSTANT.NOTIFICATION_MESSAGE.PICKUP_TIME_CHANGE + "" + emp.empPickupTime;
	// 				} else {
	// 					empTitle = config.CONSTANT.NOTIFICATION_TITLE.DROP_TIME_CHANGE;
	// 					empMessage = config.CONSTANT.NOTIFICATION_MESSAGE.DROP_TIME_CHANGE + "" + emp.empDropTime;
	// 				}
	// 				let notificationData = {
	// 					title: empTitle,
	// 					message: empMessage,
	// 					senderId: params.userId,
	// 					notificationType: config.CONSTANT.NOTIFICATION_TYPE.EMP_PICKUP_TIME_CHANGE
	// 				};
	// 				pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
	// 			}
	// 		}
	// 		else {
	// 			let busySlotObj: any = {};
	// 			let from, to;
	// 			let deleteRoute = await this.remove("cab_routes", { _id: userRoute._id });
	// 			let roster = await this.findOne("roasters", { "route._id": userRoute._id }, {}, {});
	// 			if (roster) {
	// 				if (userRoute.shiftType === 'login') {
	// 					from = moment(userRoute.shiftTime, 'HH:mm').subtract(config.CONSTANT.CAB_BUFFER + userRoute.totalTripTime, 'minutes').format('HH:mm');
	// 					to = moment(userRoute.shiftTime, 'HH:mm').add(config.CONSTANT.CAB_BUFFER, 'minutes').format('HH:mm');
	// 					busySlotObj.from = from;
	// 					busySlotObj.to = to;
	// 				}
	// 				else if (userRoute.shiftType === 'logout') {
	// 					from = moment(userRoute.shiftTime, 'HH:mm').subtract(config.CONSTANT.CAB_BUFFER, 'minutes').format('HH:mm');
	// 					to = moment(userRoute.shiftTime, 'HH:mm').add(config.CONSTANT.CAB_BUFFER + userRoute.totalTripTime, 'minutes').format('HH:mm');
	// 					busySlotObj.from = from;
	// 					busySlotObj.to = to;
	// 				}
	// 				let query1: any = { "_id": roster.cab._id };
	// 				let update1: any = {};
	// 				let options1 = { new: true };
	// 				update1["$pull"] = {
	// 					"busySlots": busySlotObj
	// 				};
	// 				await this.updateOne("cabs", query1, update1, options1);
	// 			}
	// 			let deleteRoster = await this.deleteMany("roasters", { "route._id": userRoute._id, "rideStarted": false, "rideCompleted": false });
	// 		}
	// 	}
	// 	return await this.findOneAndUpdate("users", query, update, options);
	// }

	/**
	 * @function getChunksOfUser
	 */
	async getChunksOfUser(params: AddAdminNotificationRequest) {
		let aggPipe = [];
		// aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });
		let lookup = {
			"from": "login_histories",
			"localField": "_id",
			"foreignField": "userId",
			"as": "users"
		};
		aggPipe.push({ "$lookup": lookup });

		aggPipe.push({ "$unwind": "$users"});

		let project1 = {
			_id: 1, isLogin: "$users.isLogin", platform: "$users.platform", deviceId: "$users.deviceId",
			deviceToken: "$users.deviceToken", arn: "$users.arn", firstName: 1, middleName: 1, lastName: 1, gender: 1,
			created: 1, type: 1
		};
		aggPipe.push({ "$project": project1 });

		let match1: any = {};

		if (params.single) {
          match1._id = params.userId;
		} else {
			if (params.audience === config.CONSTANT.NOTIFICATION_AUDIENCE.EMPLOYEE) {
				match1.type = config.CONSTANT.ADMIN_TYPE.EMPLOYEE;
			} else if (params.audience === config.CONSTANT.NOTIFICATION_AUDIENCE.DRIVER) {
				match1.type = config.CONSTANT.USER_TYPE.DRIVER;
			}
		}

		match1.isLogin = true;
		aggPipe.push({ "$match": match1 });
		return await this.aggregate("users", aggPipe, {});
	}

	/**
	 * @function getChunksOfSingleUser
	 */
	async getChunksOfSingleUser() {
		let aggPipe = [];

		let lookup = {
			"from": "login_histories",
			"localField": "_id",
			"foreignField": "userId",
			"as": "users"
		};
		aggPipe.push({ "$lookup": lookup });

		aggPipe.push({ "$unwind": "$users" });

		let project = {
			_id: 1, isLogin: "$users.isLogin", platform: "$users.platform", deviceToken: "$users.deviceToken",
			deviceId: "$users.deviceId", arn: "$users.arn", profilePicture: 1
		};
		aggPipe.push({ "$project": project });

		let match: any = {};
		match.isLogin = true;
		aggPipe.push({ "$match": match });

		aggPipe.push({
			"$group": {
				_id: "$_id", profilePicture: { "$first": "$profilePicture" },
				data: { "$push": { _id: "$_id", platform: "$platform", deviceToken: "$deviceToken", deviceId: "$deviceId", arn: "$arn" } }
			}
		});

		let response = await this.aggregate("users", aggPipe, {});
		return response[0];
	}

	/**
	 * @function addUser
	 */
	async addUser(params) {
		params.createdAt = new Date().getTime();
		return await this.save("users", params);
	}

	/**
	 * @function updateUser
	 */
	async updateUser(params) {
		let query: any = {};
		query["$or"] = [{ "email": params.email }, { "countryCode": params.countryCode, "mobileNo": params.mobileNo }];
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

		let set = {};
		let unset = {};
		let update = {};
		update["$set"] = set;

		let fieldsToFill = ["firstName", "middleName", "lastName", "dob", "age", "gender"];

		set = appUtils.setInsertObject(params, set, fieldsToFill);

		unset = appUtils.unsetInsertObject(params, unset, fieldsToFill);
		if (!_.isEmpty(unset)) {
			update["$unset"] = unset;
		}

		let options = { new: true };

		return await this.findOneAndUpdate("users", query, update, options);
	}

	async checkAlreadyRequest(params) {
		let userDetails = await this.findUserById(params);
		let getRequestTime = userDetails.requestTime;
		let date1 = new Date(getRequestTime);
		let currentTime = Date.now();
		let date2 = new Date(currentTime);
		let diffTime = Math.abs(date2.getTime() - date1.getTime());
		let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		if (diffDays <= 30) {
			return Promise.reject(empVehicleConstant.MESSAGES.ERROR.CHANGE_REQUESTED);
		} else {
			return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
		}
	}

	// User update home address first time login
	async updateHomeAddress(params: HomeAddressRequest) {
		let query: any = {};
		query._id = params.userId;
		let location: any = {};
		let homeAddress: any = {};
		let address = '';
		// let fullAddress = address.concat(params.houseNo, ', ', params.roadName, ', ', params.city, ', ', params.state, ', ', params.landMark);
		// Save Full Address - Shivakumar A
		let fullAddress = params.fullAddress;
		await this.checkAlreadyRequest(params);
		homeAddress = {
			houseNo: params.houseNo,
			roadName: params.roadName,
			city: params.city,
			state: params.state,
			landMark: params.landMark,
			fullAddress: fullAddress,
		};
		location.address = homeAddress;
		location.coordinates = [params.longitude, params.latitude];
		// params.address = location;
		let update: any = {};
		// due to testing purpose commenting checks tru to false
		if (params.isAddressChange === true) {
			update['$set'] = {
				tempPickup: location,
				// isAddressChange: true,
				requestTime: Date.now(),
				isAddressChangeReq: true,
				// distance: params.distance,
				// estimatedTime: params.estimatedTime,
				// distKm: params.distKm,
				// durationMinute: params.durationMinute
			};
		} else {
			update['$set'] = {
				pickup: location,
				isAddressChange: true,
				requestTime: Date.now(),
				isEmailChange: true,
				isAddressChangeReq: false,
				// distance: params.distance,
				// estimatedTime: params.estimatedTime,
				// distKm: params.distKm,
				// durationMinute: params.durationMinute
			};
		}
		// update['$set'] = {
		// 	pickup: location,
		// 	isAddressChange: false,
		// 	requestTime: Date.now(),
		// 	distance: params.distance,
		// 	estimatedTime: params.estimatedTime,
		// 	distKm: params.distKm,
		// 	durationMinute: params.durationMinute
		// };

		let options: any = {};
		let response = await this.update("users", query, update, options);
	}

	/**
	 * @function editDriverProfile
	 */
	async updateDriver(params: DriverUpdateRequest) {
		let query: any = {};
		let query1: any = {};
		let query3: any = {};
		query._id = params.userId;
		query1.userId = params.userId;
		query3["driverMapped._id"] = params.userId;
		let step1 = this.findUserById(params);
		let update: any = {};
		let update1: any = {};
		update["$set"] = {
			"name": params.name,
			"drunker": params.drunker,
			"alcoholic": params.alcoholic,
			"tobacco": params.tobacco,
			"backgroundVarified": params.backgroundVarified,
			"dlRenewalDate": params.dlRenewalDate,
			"DlBadgeNO": params.DlBadgeNO
		};
		update1['$set'] = {
			"driverMapped.$.name": params.name,
		};
		if (params.profilePicture) {
			update.profilePicture = params.profilePicture;
			update1["driverMapped.$.profilePicture"] = params.profilePicture;
		}
		if (params.documents) {
			update.documents = params.documents;
		}
		if (params.documents) {
			update.documents = params.documents;
		}
		if (params.mobileNo) {
			update.mobileNo = params.mobileNo;
			update1["driverMapped.$.mobileNo"] = params.mobileNo;
		}
		if (params.emergencyNo) {
			update.emergencyNo = params.emergencyNo;
		}
		if (params.countryCode) {
			update.countryCode = params.countryCode;
			update1["driverMapped.$.countryCode"] = params.countryCode;
		}
		let options = { new: true };
		let step2 = this.updateMany("user_querys", query1, update, options);
		let step3 = this.updateMany("cabs", query3, update1, options);
		let step4 = this.findOneAndUpdate("users", query, update, options);
		let step5 = await promise.join(step2, step3, step4);
		return step5[2];
	}
	/**
	 * @function editEmployeeProfile
	 * @author Utkarsh Patil 17/07/2020
	 */
	async updateEmp(params: EmpUpdateRequest) {
		let query: any = {};
		query._id = params.empId;
		let update: any = {};
		if (params.employeeId){
			update.employeeId = params.employeeId;
		}
		if (params.name) {
			update.name = params.name;
		}
		if (params.mobileNo) {
			update.mobileNo = params.mobileNo;
		}
		if (params.guestValidity) {
		update.guestValidity = params.guestValidity;
		}
		if (params.companyLocationName){
			update.companyLocationName = params.companyLocationName;
		}
		let options = { new: true };
		return this.findOneAndUpdate("users", query, update, options);
	}

	/**
	 * @function editVehicleData
	 * @author Utkarsh Patil 17/07/2020
	 */
	async updateVehicle(params: VehicleUpdateRequest) {
		let query: any = {};
		query._id = params.vehicleId;
		let update: any = {};
		if ( params.vehicleType){
			update.vehicleType = params.vehicleType;
		}
		if (params.regNo) {
			update.regNo = params.regNo.toUpperCase();
		}
		if (params.modal) {
			update.modal = params.modal;
		}
		let options = { new: true };
		return this.findOneAndUpdate("vehicles", query, update, options);
	}

	/**
	 * @function contactAdmin
	 */
	async contactAdmin(params: UserQueryRequest) {
		let userData = await this.findUserById(params);
		params.name = userData.name;
		params.companyId = params.companyId;
		params.profilePicture = userData.profilePicture;
		params.queryType = config.CONSTANT.QUERY_TYPE.QUERY;
		// Add false to Seen  & gender- Shivakumar A
		params.seen = false;
		params.gender = userData.gender;
		// changed from driver to subadmin as it was throwing error Utkarsh 08/07/2020
		if (params.type = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {
			params.userEmpId = userData.driverId;
		} else {
			params.userEmpId = userData.employeeId;
		}
		return await this.save("user_querys", params);
	}

	// async driverLiveTracking(data, serviceData) {
	// 	let query: any = {};
	// 	query._id = data.userId;
	// 	let projection: any = {};
	// 	let options: any = {};
	// 	let emplist = serviceData.employeeList;
	// 	// console.log(JSON.stringify(serviceData.employeeList));
	// 	// let serviceData = await this.findOne('users', query, projection, options);
	// 	if (emplist) {
	// 		console.log("driver tracking data");
	// 		emplist.forEach(async function (item) {
	// 			// if (item.empId.pickupStatus === config.CONSTANT.EMP_PICKUP_STATUS.ONBOARDED || item.empId.pickupStatus === config.CONSTANT.EMP_PICKUP_STATUS.STARTRIDE) {
	// 			// 	console.log(item.empId._id);
	// 			await executer('serviceRequest', 'driverTracking', [item.empId._id, data]);
	// 			// }
	// 		});
	// 	} else {
	// 		return;
	// 	}
	// }

	/**
	 * @function removeDeviceByUserId
	 */
	// async otpUpdateEmployee(params, newOtp) {
	// 	let query: any = {};
	// 	let query1: any = {};
	// 	query._id = { $eq: params };
	// 	query1 = { "$and": [{ "_id": { $eq: params } }, { "pickupStatus": { $eq: config.CONSTANT.EMP_PICKUP_STATUS.NOACTION } }] };
	// 	let update1 = {};
	// 	update1["$set"] = {
	// 		pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.STARTRIDE
	// 	};
	// 	let update = {};
	// 	update["$set"] = {
	// 		otp: newOtp,
	// 		otpTime: Date.now(),
	// 		// pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.STARTRIDE
	// 	};
	// 	let options: any = { multi: true };
	// 	let data = {
	// 		"message": config.CONSTANT.NOTIFICATION_MESSAGE.DRIVER_START_RIDE + " " + newOtp || "",
	// 		"otp": newOtp,
	// 	};
	// 	await executer('serviceRequest', 'driverStartRide', [params, data]);
	// 	await this.updateMany("users", query, update, options);
	// 	return await this.updateMany("users", query1, update1, options);
	// }

	/**
	 * Driver pick up and employee onboard
	 */

	// async onboardEmp(params, employeeList) {
	// 	let query: any = {};
	// 	query._id = { $eq: params.empId };
	// 	let update = {};
	// 	update["$set"] = {
	// 		pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.ONBOARDED,
	// 	};
	// 	let options: any = { multi: true };
	// 	let data = {
	// 		"message": config.CONSTANT.NOTIFICATION_MESSAGE.EMPLOYEE_ONBOARD,
	// 		"empId": params.empId,
	// 	};
	// 	if (employeeList) {
	// 		console.log("Employee onboard");
	// 		employeeList.forEach(async function (item) {
	// 			console.log(item.empId._id);
	// 			await executer('serviceRequest', 'employeeOnboard', [item.empId._id, data]);
	// 		});
	// 	}
	// 	return await this.updateMany("users", query, update, options);
	// }
	/**
	 * Driver mark as all employee ofboard
	 * @param params
	 * @param employeeList
	 */
	// async allOfboard(params, allArrayData) {
	// 	let query: any = {};
	// 	query._id = { $in: params };
	// 	let update = {};
	// 	update["$set"] = {
	// 		pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.OFFBOARD,
	// 		// otp: "",
	// 	};
	// 	let query1: any = {};
	// 	query1._id = { $in: allArrayData };
	// 	let update1 = {};
	// 	update1["$set"] = {
	// 		pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.NOACTION,
	// 		// otp: "",
	// 	};
	// 	let options: any = { multi: true };
	// 	let data = {
	// 		"message": config.CONSTANT.NOTIFICATION_MESSAGE.ALL_OFBOARDED,
	// 	};
	// 	if (params) {
	// 		params.forEach(async function (item) {
	// 			await executer('serviceRequest', 'employeeOfboard', [item, data]);
	// 		});
	// 	}
	// 	await this.updateMany("users", query1, update1, options);
	// 	return await this.updateMany("users", query, update, options);
	// }

	/**
	 * Driver mark as all employee ofboard
	 * @param params
	 * @param employeeList
	 */
	// async driverMarkEmpOffboard(params) {
	// 	let query: any = {};
	// 	query._id = { $in: params.empId };
	// 	let update = {};
	// 	update["$set"] = {
	// 		pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.OFFBOARD,
	// 	};
	// 	let options: any = { multi: true };
	// 	let data = {
	// 		"message": config.CONSTANT.NOTIFICATION_MESSAGE.ALL_OFBOARDED,
	// 	};
	// 	await executer('serviceRequest', 'employeeOfboard', [params.empId, data]);
	// 	return await this.updateMany("users", query, update, options);
	// }

	/**
	 * Employee mark offboard
	 * @param params
	 * @param employeeOffboard
	 */
	async employeeOffboard(params) {
		let query: any = {};
		query._id = { $in: params.empId };
		let update = {};
		if (params.driverStartRide === false) {
			update["$set"] = {
				pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.NOACTION,
				otp: "",
			};
		} else {
			update["$set"] = {
				pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.STARTRIDE,
			};
		}

		let options: any = { multi: true };
		return await this.updateMany("users", query, update, options);
	}
	/**
	 * employeeHomeOffboard
	 * @param params
	 * @description office to home offboarded
	 */
	async employeeHomeOffboard(params) {
		let query: any = {};
		query._id = { $in: params.empId };
		let update = {};
		update["$set"] = {
			pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.NOACTION,
		};
		let options: any = { multi: true };
		return await this.updateMany("users", query, update, options);
	}

	// async markNoShow(params, employeeList) {
	// 	let query: any = {};
	// 	query._id = { $eq: params.empId };
	// 	let update = {};
	// 	update["$set"] = {
	// 		pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW,
	// 		noShowReason: params.noShowReason,
	// 	};
	// 	let options: any = {};
	// 	let data = {
	// 		"message": config.CONSTANT.NOTIFICATION_MESSAGE.EMPLOYEE_NOT_REACHED,
	// 		"empId": params.empId,
	// 	};
	// 	if (employeeList) {
	// 		console.log("Employee no show");
	// 		employeeList.forEach(async function (item) {
	// 			console.log(item.empId._id);
	// 			await executer('serviceRequest', 'markNoShow', [item.empId._id, data]);
	// 		});
	// 	}
	// 	return await this.updateMany("users", query, update, options);
	// }

	async reachedOnPickupPoints(params) {
		let query: any = {};
		query._id = { $eq: params.empId };
		let update = {};
		update["$set"] = {
			pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.DRIVER_REACHED,
		};
		let options: any = {};
		return await this.updateMany("users", query, update, options);
	}

	// async empCancelRide(params, employeeList) {
	// 	let query: any = {};
	// 	query._id = { $eq: params.empId };
	// 	let update = {};
	// 	update["$set"] = {
	// 		pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED,
	// 		noShowReason: params.reason,
	// 	};
	// 	let options: any = {};
	// 	let data = {
	// 		"message": config.CONSTANT.NOTIFICATION_MESSAGE.CANCELLED_RIDE,
	// 		"empId": params.empId,
	// 	};
	// 	if (employeeList) {
	// 		console.log("Employee cancel");
	// 		employeeList.forEach(async function (item) {
	// 			console.log(item.empId._id);
	// 			await executer('serviceRequest', 'cancelledRide', [item.empId._id, data]);
	// 		});
	// 	}
	// 	return await this.updateMany("users", query, update, options);
	// }

	/**
	 * @function bulkEmpSignup
	 */
	async bulkEmpSignup(params) {
		// console.log('paaraamss: ', params);
		return await this.insertMany("users", params, { new: true });
	}

	/**
	 * @function bulkVehicleSignup
	 * @author Utkarsh Patil 13/07/2020
	 */
	async bulkVehicleSignup(params) {
		// console.log('paaraamss: ', params);
		return await this.insertMany("vehicles", params, { new: true });
	}

	/**
	 * @function addrToLatLong
	 */
	async addrToLatLong(params) {
		let address;
		await googleMapsClient.geocode({ address: params })
			.asPromise()
			.then((response) => {
				if (response.json.results[0])
					address = response.json.results[0].geometry.location;
				else
					return undefined;
				// return Promise.reject(empVehicleConstant.MESSAGES.ERROR.INVALID_ADDRESS);
			})
			.catch((err) => {
				console.log(err);
			});
		return address;
	}
	/**
	 * @function latLongToAddress
	 * @param params lat long
	 */
	async latLongToAddress(params) {
		let address;
		await googleMapsClient.reverseGeocode({ latlng: [params.latitude, params.longitude] })
			.asPromise()
			.then((response) => {
				address = response.json.results[0].formatted_address;
			})
			.catch((err) => {
				console.log(err);
			});
		return address;
	}

	async empShiftList(params: EmpShiftListing) {
		try {
			let { pageNo, limit, searchKey, sortBy, sortOrder } = params;
			let aggPipe = [];

			let match1: any = {};
			match1 = { $and: [{ status: { $ne: config.CONSTANT.STATUS.DELETED } }, { userType: { $eq: config.CONSTANT.USER_TYPE.EMPLOYEE } }] },
				aggPipe.push({ "$match": match1 });

			let match2 = {};
			if (searchKey) {
				match2["name"] = { "$regex": searchKey, "$options": "-i" };
				aggPipe.push({ "$match": match2 });
			}

			let sort = {};
			if (sortBy && sortOrder) {
				if (sortBy === "name") {
					sort = { "name": sortOrder };
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
			let project = {
				_id: 1, name: 1, weekOff: 1, shift: 1
			};
			aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let response: any = {};
			let userList = this.aggregate("users", aggPipe, {});
			let userCount = this.count('users', { ...match1, ...match2 });
			response = Promise.all([userList, userCount]);
			return response;
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function editEmployeeShift
	 */
	async updateEmpShift(params: EmpShiftUpdateRequest) {
		// let query: any = {};
		// let query1: any = {};
		// query._id = params.userId;
		// query1.userId = params.userId;
		// let step1 = this.findUserById(params);
		// let update: any = {};
		// update["$set"] = {
		// 	"name": params.name,
		// 	"employeeId": params.employeeId,
		// };
		// if (params.profilePicture) {
		// 	update.profilePicture = params.profilePicture;
		// }
		// if (params.gender) {
		// 	update.gender = params.gender;
		// }
		// // if (params.shift) {
		// // 	update.shift = params.shift;
		// // }
		// // if (params.shiftStartTime) {
		// // 	update.shiftStartTime = params.shiftStartTime;
		// // }
		// // if (params.shiftEndTime) {
		// // 	update.shiftEndTime = params.shiftEndTime;
		// // }
		// if (params.mobileNo) {
		// 	update.mobileNo = params.mobileNo;
		// }
		// if (params.countryCode) {
		// 	update.countryCode = params.countryCode;
		// }
		// update.userEmpId = update.employeeId;
		// let options = { new: true };
		// let response1 = this.updateMany("user_querys", query1, update, options);
		// let response2 = this.findOneAndUpdate("users", query, update, options);
		// let responce = await promise.join(response1, response2);
		// return responce[1];
	}
	/**
	 * @function ratingUserRoster  user rating driver for trip
	 * @param params rating
	 */
	// async ratingUserRoster(params: RoasterUpdateRequest) {
	// 	let query: any = {};
	// 	query._id = params.userId;
	// 	let update = {};
	// 	update["$set"] = {
	// 		"avgRating": params.avgRating,
	// 		"totalRating": params.totalRating,
	// 	};
	// 	let options = { new: true };
	// 	return await this.updateMany("users", query, update, options);
	// }
	/**
	 * @function addressChangeRequest
	 */
	// async addressChangeRequest(params: IsAddressChangeRequest) {
	// 	let query: any = {};
	// 	query._id = params.empId;
	// 	let update = {};
	// 	let adminId = params.userId;
	// 	params.userId = params.empId;
	// 	let step1 = await this.findUserById(params);
	// 	if (params.actionType === config.CONSTANT.STATUS.REJECTED) {
	// 		update["$set"] = {
	// 			isAddressChangeReq: false
	// 		};
	// 		let options = { new: true };
	// 		return await this.findOneAndUpdate("users", query, update, options);
	// 	} else {
	// 		update["$set"] = {
	// 			isAddressChangeReq: false,
	// 			pickup: step1.tempPickup,
	// 		};
	// 		let options = { new: true };
	// 		let updatedUser = await this.findOneAndUpdate("users", query, update, options);
	// 		let nextDate = moment().startOf('day').subtract({ 'hours': 5, 'minutes': 30 }).add(2, 'day').format('x');
	// 		let empGroups = await this.find("cab_routes", { "employees.empId": params.empId }, {}, {});
	// 		if (empGroups.length > 0) {
	// 			for (let eg of empGroups) {
	// 				let oldGroupObj = { userId: params.userId, routeId: eg._id };
	// 				let oldGroupFormed = await cabRouteDao.removeFromGroup(oldGroupObj);
	// 				if (oldGroupFormed.oldGroupFormed) {
	// 					let query: any = {};
	// 					query._id = oldGroupFormed.oldGroupFormed.grpDbId;
	// 					let update = {};
	// 					update["$set"] = {
	// 						"grpCentre": oldGroupFormed.oldGroupFormed.grpCentre,
	// 						"empCount": oldGroupFormed.oldGroupFormed.empCount,
	// 						"employees": oldGroupFormed.oldGroupFormed.employees,
	// 						"route": oldGroupFormed.oldGroupFormed.route,
	// 						"bounds": oldGroupFormed.oldGroupFormed.bounds,
	// 						"startLocation": oldGroupFormed.oldGroupFormed.startLocation,
	// 						"endLocation": oldGroupFormed.oldGroupFormed.endLocation,
	// 						"totalTripTime": oldGroupFormed.oldGroupFormed.totalTripTime
	// 					};
	// 					let updatedRoute = await this.findOneAndUpdate("cab_routes", query, update, { new: true });
	// 					let roster = await this.updateMany("roasters", { "route._id": updatedRoute._id, "rideStarted": false, "rideCompleted": false, "rosterDate": { "$gte": nextDate } }, { "route": updatedRoute }, {});
	// 					let employeeList = updatedRoute.employees;
	// 					// let empIdArray = _.map(employeeList, 'empId');
	// 					let empMessage;
	// 					let empTitle;
	// 					for (let emp of employeeList) {
	// 						let userDevice = await loginHistoryDao.findChunkDevice(emp.empId);
	// 						if (updatedRoute.shiftType === config.CONSTANT.SHIFT_TYPE.LOGIN) {
	// 							empTitle = config.CONSTANT.NOTIFICATION_TITLE.PICKUP_TIME_CHANGE;
	// 							empMessage = config.CONSTANT.NOTIFICATION_MESSAGE.PICKUP_TIME_CHANGE + "" + emp.empPickupTime;
	// 						} else {
	// 							empTitle = config.CONSTANT.NOTIFICATION_TITLE.DROP_TIME_CHANGE;
	// 							empMessage = config.CONSTANT.NOTIFICATION_MESSAGE.DROP_TIME_CHANGE + "" + emp.empDropTime;
	// 						}
	// 						let notificationData = {
	// 							title: empTitle,
	// 							message: empMessage,
	// 							senderId: params.userId,
	// 							notificationType: config.CONSTANT.NOTIFICATION_TYPE.EMP_PICKUP_TIME_CHANGE
	// 						};
	// 						pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
	// 					}
	// 				}
	// 				else {
	// 					let deleteOldGroup = await this.remove("cab_routes", { _id: eg._id });
	// 					// let deleteOldRosters = await this.deleteMany("roasters", { "route._id": eg._id, "rideStarted": false, "rideCompleted": false, "rosterDate": { "$gte": nextDate } });
	// 					let deleteOldRosters = await this.deleteMany("roasters", { "route._id": eg._id, "rideStarted": false, "rideCompleted": false });
	// 				}
	// 				console.log(step1);
	// 				oldGroupFormed.empShifted.empLocation.lat = step1.tempPickup.coordinates[1];
	// 				oldGroupFormed.empShifted.empLocation.long = step1.tempPickup.coordinates[0];
	// 				oldGroupFormed.empShifted.address = step1.tempPickup.address.fullAddress;
	// 				let adjustInGroupObj = {
	// 					userId: params.userId,
	// 					shiftName: eg.shiftName,
	// 					shiftType: eg.shiftType,
	// 					empShifted: oldGroupFormed.empShifted
	// 				};
	// 				let adjustInGroup = await cabRouteDao.adjustInGroup(adjustInGroupObj);
	// 				if (adjustInGroup) {
	// 					let query: any = {};
	// 					query._id = adjustInGroup.grpDbId;
	// 					let update = {};
	// 					update["$set"] = {
	// 						"grpCentre": adjustInGroup.grpCentre,
	// 						"empCount": adjustInGroup.empCount,
	// 						"employees": adjustInGroup.employees,
	// 						"route": adjustInGroup.route,
	// 						"bounds": adjustInGroup.bounds,
	// 						"startLocation": adjustInGroup.startLocation,
	// 						"endLocation": adjustInGroup.endLocation,
	// 						"totalTripTime": adjustInGroup.totalTripTime
	// 					};
	// 					let updatedRoute = await this.findOneAndUpdate("cab_routes", query, update, { new: true });
	// 					// let roster = await this.updateMany("roasters", { "route._id": updatedRoute._id, "rideStarted": false, "rideCompleted": false, "rosterDate": { "$gte": nextDate } }, { "route": updatedRoute }, {});
	// 					let roster = await this.updateMany("roasters", { "route._id": updatedRoute._id, "rideStarted": false, "rideCompleted": false }, { "route": updatedRoute }, {});
	// 					let employeeList = updatedRoute.employees;
	// 					// let empIdArray = _.map(employeeList, 'empId');
	// 					let empMessage;
	// 					let empTitle;
	// 					for (let emp of employeeList) {
	// 						let userDevice = await loginHistoryDao.findChunkDevice(emp.empId);
	// 						if (updatedRoute.shiftType === config.CONSTANT.SHIFT_TYPE.LOGIN) {
	// 							empTitle = config.CONSTANT.NOTIFICATION_TITLE.PICKUP_TIME_CHANGE;
	// 							empMessage = config.CONSTANT.NOTIFICATION_MESSAGE.PICKUP_TIME_CHANGE + "" + emp.empPickupTime;
	// 						} else {
	// 							empTitle = config.CONSTANT.NOTIFICATION_TITLE.DROP_TIME_CHANGE;
	// 							empMessage = config.CONSTANT.NOTIFICATION_MESSAGE.DROP_TIME_CHANGE + "" + emp.empDropTime;
	// 						}
	// 						let notificationData = {
	// 							title: empTitle,
	// 							message: empMessage,
	// 							senderId: params.userId,
	// 							notificationType: config.CONSTANT.NOTIFICATION_TYPE.EMP_PICKUP_TIME_CHANGE
	// 						};
	// 						pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
	// 					}
	// 				}
	// 				else {
	// 					let newGroupObj = {
	// 						userId: params.userId,
	// 						shiftName: eg.shiftName,
	// 						shiftType: eg.shiftType,
	// 						shiftTime: eg.shiftTime,
	// 						empShifted: oldGroupFormed.empShifted,
	// 						oldRoute: eg
	// 					};
	// 					let newGroupData = await cabRouteDao.createSingleEmpGroup(newGroupObj);
	// 					let newGroup = await adminDao.save("cab_routes", newGroupData);
	// 				}
	// 			}
	// 		}
	// 		return true;
	// 	}
	// }

	/**
	 * @function isMobileNoUnique
	 * Mobile no unique check
	 */
	async isMobileNoUnique(params: IsMobileNoUnique) {
		let query: any = {};
		query["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "contactNo": { "$eq": params.mobileNo } }];
		let projection = {};
		return await this.findOne("users", query, projection, {});
	}

	/**
	 * Cab registration no unique check
	 */
	async isRegistrationNoUnique(params: IsRegistrationNoUnique) {
		let query: any = {};
		if (params.registrationNo2) {
			query["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "regNo": { "$eq": params.registrationNo.toUpperCase() } }, { "regNo": { "$eq": params.registrationNo2.toUpperCase() } }];
		} else {
			query["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "regNo": { "$eq": params.registrationNo.toUpperCase() } }];
		}
		let projection = {};
		return await this.findOne("vehicles", query, projection, {});
	}

	async isVehicleRegistrationNoUnique(params) {
		let query: any = {};
			query["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "regNo": { "$in": params } }];
		let projection = {};
		return await this.count("vehicles", query);
	}
	async isRegistrationNoUniqueForUpdate(params: VehicleUpdateRequest) {
		let query: any = {};
		query["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.BLOCKED } }, { "regNo": { "$eq": params.regNo.toUpperCase() } }, {"_id": {"$ne": params.vehicleId}}];
		let projection = {};
		let isExist = await this.findOne("vehicles", query, projection, {});
		console.log("isexist");
		console.log(isExist);
		if (isExist) {
			return Promise.reject(empVehicleConstant.MESSAGES.ERROR.REGISTRATION_NO_EXIST);
		} else {
			return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
		}
	}

	async isVehicleIdExist(params: VehicleUpdateRequest) {
		let query: any = {};
		query["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.BLOCKED } }, {"_id": {"$eq": params.vehicleId}}];
		let projection = {};
		let isExist = await this.findOne("vehicles", query, projection, {});
		if (!isExist) {
			return Promise.reject(empVehicleConstant.MESSAGES.ERROR.VEHICLE_ID_NOT_PRESENT);
		} else {
			return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
		}
	}

	async demoShowcaseApi(){
		const request = require('request');
			let data;
			const formData = JSON.stringify({
				"camera_ids": ["cotesa-384"],
				"range_from": 1592994601,
				"range_to": 1593081001
			});

			 const authData = {
				user: 'showcase',
				pass: 'audience-another-as-forth',
				sendImmediately: false
			  };

		 return await new Promise(function (resolve, reject) {
			request.post(
			   {
				 url: 'https://showcase-alpha.io.parquery.com/dashboard/api/historical/aggregate',
				 form: formData,
				 auth: authData
			   },
			   function (err, httpResponse, body) {
				   if (!err && httpResponse.statusCode === 200){
					resolve(body);
				   }else{
					reject(err);
				   }
				// data = body;
				console.log(err, body);
			   }
			 );
		 });
	}
	async userVehicleList(params: VehicleListForUser){
		console.log(params);
		console.log("from dao");
		let query: any = {};
		// query["$and"] = [{"status": { "$ne": config.CONSTANT.STATUS.BLOCKED } }, {"userId": { "$eq": params.userId }}];
		// changed by satyam asked by shiv
		query["$and"] = [{"userId": { "$eq": params.userId }}];
		return await this.find("vehicles", query, {}, {});
	}
	async getUserCompany(params){
		let query: any = {};
        query = {_id: params.companyId};
        let projection: any = {locations: {$elemMatch: { name: params.companyLocationName}}};
        let options: any = {};
        let response = await this.findOne('company_details', query, projection, options);
        return response;
	}
	async blockUnblockEmpVehicle(params){
		let query: any = {};
		query.userId = params.userId;
		let update: any = {};
		update["$set"] = {
			status: params.status
		};
		return await this.updateMany("vehicles", query, update, {});
	}
}
