"use strict";

import * as _ from "lodash";
import * as promise from "bluebird";
import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as models from "@modules/v1/models";
import * as config from "@config/constant";
import * as routeConstant from "@modules/v1/route/routeConstant";
import { promises } from "fs";
import * as mongoose from "mongoose";
const axios = require('axios');
import * as config1 from "@config/environment";
import { AdminDao } from "@modules/v1/admin/AdminDao";
import { ok } from "assert";
// satyam -- group roasters
import * as moment from "moment";
const distFrom = require('distance-from');
let adminDao = new AdminDao();

export class CabRouteDao extends BaseDao {

	/**
	 * @function Routeadd
	 */
	async routeAdd(params: RouteAddRequest) {
		let employeeList = params.employees;
		let query: any = {};
		let empIdArray = _.map(employeeList, 'empId');
		query = { $and: [{ ["employees.empId"]: empIdArray }, { tripType: params.tripType }] };
		let getRouteData = await this.find("cab_routes", query, {}, {});
		console.log(getRouteData);
		if (getRouteData.length > 0) {
			return Promise.reject(routeConstant.MESSAGES.ERROR.EMPLOYEE_ALREADY_ADDED);
		}
		params.createdAt = new Date().getTime();
		return await this.save("cab_routes", params);
	}
	/**
	 * @param params
	 */
	async routeUpdate(params: RouteUpdateRequest) {
		if (params.employeesToAdd || params.employeesToRemove) {
			let empToDlt: any = [];
			let updateOldGroup: any = [];
			let currentRoute = await this.findOne("cab_routes", { "_id": params.routeId }, {}, {});
			if (params.employeesToAdd)
				updateOldGroup = await this.updateOldGroup(params, currentRoute);
			let algoReqObj: any = {};
			let officeLocation: any = {};
			algoReqObj.groups = [];
			let admin = await adminDao.findAdminById(params);
			officeLocation.lat = admin.companyAddress.coordinates[1];
			officeLocation.long = admin.companyAddress.coordinates[0];
			algoReqObj.waitTime = currentRoute.waitTime;
			algoReqObj.officeLocation = officeLocation;
			algoReqObj.maxTripDuration = currentRoute.maxTripDuration;
			algoReqObj.groups = [];
			let groupObj: any = {};
			groupObj.grpDbId = currentRoute._id;
			groupObj.grpId = currentRoute.grpId;
			// groupObj.grpCentre = {
			// 	"lat": 0,
			// 	"long": 0
			// };
			groupObj.grpCentre = currentRoute.employees[0].empLocation;
			groupObj.shiftName = currentRoute.shiftName;
			groupObj.shiftType = currentRoute.shiftType;
			groupObj.shiftTime = currentRoute.shiftTime;
			// groupObj.weekOff = currentRoute.weekOff;
			let employees = [];
			for (let e of currentRoute.employees) {
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
					"gender": e.gender,
				};
				if (params.employeesToRemove && params.employeesToRemove.includes(e.empId)) {
					let a = await empToDlt.some(employee => { if (employee.empId === e.empId) { return 1; } });
					if (!a) { empToDlt.push(obj); }
				}
				else {
					employees.push(obj);
				}
			}
			if (params.employeesToAdd) {
				console.log("inside if");
				for (let ee of updateOldGroup) {
					console.log(ee);
					employees.push(ee);
				}
			}
			groupObj.waitTime = currentRoute.waitTime;
			groupObj.maxTripDuration = currentRoute.maxTripDuration;
			groupObj.maxGroupSize = currentRoute.maxGroupSize;
			groupObj.empCount = employees.length;
			groupObj.employees = employees;
			algoReqObj.groups.push(groupObj);
			// satyam -- single employee use cases
			if ( groupObj.employees.length !== 0 ){
				let routeAlgoEta1 = await this.routingAlgoETA(algoReqObj, params);
				let query: any = {};
				query._id = routeAlgoEta1[0].grpDbId;
				let update = {};
				if (params.routeName) {
					update["$set"] = {
						// "routeName": params.routeName,
						// changed routename value - Shivakumar A
					    "routeName": routeAlgoEta1[0].routeName,
						"grpCentre": routeAlgoEta1[0].grpCentre,
						"empCount": routeAlgoEta1[0].empCount,
						"employees": routeAlgoEta1[0].employees,
						"route": routeAlgoEta1[0].route,
						"bounds": routeAlgoEta1[0].bounds,
						"startLocation": routeAlgoEta1[0].startLocation,
						"endLocation": routeAlgoEta1[0].endLocation,
						"totalTripTime": routeAlgoEta1[0].totalTripTime
					};
				}
				else {
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
				}
				await this.updateOne("cab_routes", query, update, {});
				let updatedRoute = await this.findOne("cab_routes", query, {}, {});
				// satyam-- update roasters
				let roster = await this.updateMany("roasters", { "route._id": updatedRoute._id, "rideStarted": false, "rideCompleted": false, "rosterDate": { "$gte": moment().utcOffset("+05:30").format("x") } }, { "route": updatedRoute }, {});
				if (params.employeesToRemove)
					return await this.createIndividualGroups(empToDlt, groupObj, params);
				else
					return updatedRoute;

			}else{
				let deletedRoute = await this.remove("cab_routes", {"_id": params.routeId});
				await this.deleteMany("roasters", {"route._id": params.routeId, "rideStarted": false, "rideCompleted": false, "rosterDate": { "$gte": moment().utcOffset("+05:30").format("x") } } );
				if (params.employeesToRemove)
					return await this.createIndividualGroups(empToDlt, groupObj, params);
				else
					return deletedRoute;
			}
		}
		else {
			let query: any = {};
			let update: any = {};
			let options = { new: true };
			query._id = params.routeId;
			if (params.routeName) {
				update["$set"] = {
					"routeName": params.routeName
				};
			}
			let response = await this.findOneAndUpdate("cab_routes", query, update, options);
			return response;
		}
	}
	/**
	 * @function routeNameUpdate
	 * @param params routeName
	 */
	async routeNameUpdate(params: RouteUpdateRequest) {
		let query: any = {};
		let query1: any = {};
		let update: any = {};
		let update1: any = {};
		let options = { new: true };
		query._id = params.routeId;
		query1["route._id"] = params.routeId;
		if (params.routeName) {
			update["$set"] = {
				"routeName": params.routeName
			};
			update1["$set"] = {
				"route.routeName": params.routeName
			};
		}
		await this.updateMany("roasters", query1, update1, options);
		let response = await this.findOneAndUpdate("cab_routes", query, update, options);
		return response;
	}
	/**
	 * @param params
	 */
	async updateOldGroup(params: RouteUpdateRequest, currentRoute) {
		let empToAdd: any = [];
		let grpToDlt: any = [];
		let query: any = { "employees": { $elemMatch: { "empId": { $in: params.employeesToAdd } } }, "shiftName": currentRoute.shiftName, "shiftTime": currentRoute.shiftTime, "shiftType": currentRoute.shiftType };
		let getRouteData = await this.findInArr("cab_routes", query);
		let algoReqObj: any = {};
		let officeLocation: any = {};
		algoReqObj.groups = [];
		let admin = await adminDao.findAdminById(params);
		officeLocation.lat = admin.companyAddress.coordinates[1];
		officeLocation.long = admin.companyAddress.coordinates[0];
		algoReqObj.waitTime = currentRoute.waitTime;
		algoReqObj.officeLocation = officeLocation;
		algoReqObj.maxTripDuration = currentRoute.maxTripDuration;
		algoReqObj.groups = [];
		for (let grp of getRouteData) {
			let groupObj: any = {};
			groupObj.grpDbId = grp._id;
			groupObj.grpId = grp.grpId;
			// groupObj.grpCentre = {
			// 	"lat": 0,
			// 	"long": 0
			// };
			groupObj.grpCentre = grp.grpCentre;
			groupObj.shiftName = grp.shiftName;
			groupObj.shiftType = grp.shiftType;
			groupObj.shiftTime = grp.shiftTime;
			// groupObj.weekOff = grp.weekOff;
			let employees = [];
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
				if (params.employeesToAdd.includes(e.empId)) {
					let a = await empToAdd.some(employee => { if (employee.empId === e.empId) { return 1; } });
					if (!a) { empToAdd.push(obj); }
				}
				else {
					employees.push(obj);
				}
			}
			groupObj.waitTime = grp.waitTime;
			groupObj.maxTripDuration = grp.maxTripDuration;
			groupObj.maxGroupSize = grp.maxGroupSize;
			groupObj.empCount = employees.length;
			groupObj.employees = employees;
			if (groupObj.employees.length > 0)
				algoReqObj.groups.push(groupObj);
			else
				grpToDlt.push(groupObj.grpDbId);
		}
		if ( algoReqObj.groups.length > 0 ) {
			let routeAlgoEta = await this.routingAlgoETA(algoReqObj, params);
			for (let route of routeAlgoEta) {
				let query: any = {};
				query._id = route.grpDbId;
				let update = {};
				update["$set"] = {
					"grpCentre": route.grpCentre,
					"empCount": route.empCount,
					"employees": route.employees,
					"route": route.route,
					"bounds": route.bounds,
					"startLocation": route.startLocation,
					"endLocation": route.endLocation,
					"totalTripTime": route.totalTripTime
				};
				let updatedRoute = await this.findOneAndUpdate("cab_routes", query, update, { new: true });
				// satyam-- update roasters
				let roster = await this.updateMany("roasters", { "route._id": updatedRoute._id, "rideStarted": false, "rideCompleted": false, "rosterDate": { "$gte": moment().utcOffset("+05:30").format("x") } }, { "route": updatedRoute }, {});
			}
		}
		// satyam-- update roasters
		await this.deleteMany("cab_routes", { _id: { $in: grpToDlt } });
		await this.deleteMany("roasters", {"route._id": { $in: grpToDlt }, "rideStarted": false, "rideCompleted": false, "rosterDate": { "$gte": moment().utcOffset("+05:30").format("x") } } );
		return empToAdd;
	}

	/**
	 * @param params
	 */
	async createIndividualGroups(employeeArr, groupObj1, params) {
		try {
			let algoReqObj: any = {};
			let officeLocation: any = {};
			let options: any = { ordered: false };
			algoReqObj.groups = [];
			let admin = await adminDao.findAdminById(params);
			officeLocation.lat = admin.companyAddress.coordinates[1];
			officeLocation.long = admin.companyAddress.coordinates[0];
			algoReqObj.waitTime = groupObj1.waitTime;
			algoReqObj.officeLocation = officeLocation;
			algoReqObj.maxTripDuration = groupObj1.maxTripDuration;
			for (let e of employeeArr) {
				let groupObj: any = {};
				groupObj.grpId = groupObj1.grpId;
				// groupObj.grpCentre = {
				// 	"lat": 0,
				// 	"long": 0
				// };
				groupObj.grpCentre = e.empLocation;
				groupObj.shiftName = groupObj1.shiftName;
				groupObj.shiftType = groupObj1.shiftType;
				groupObj.shiftTime = groupObj1.shiftTime;
				// groupObj.weekOff = groupObj1.weekOff;
				groupObj.waitTime = groupObj1.waitTime;
				groupObj.maxTripDuration = groupObj1.maxTripDuration;
				groupObj.maxGroupSize = groupObj1.maxGroupSize;
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
			let routeAlgoEta2 = await this.routingAlgoETA(algoReqObj, params);
			let mergedGroup = await adminDao.insertMany("cab_routes", routeAlgoEta2, options);
			return routeConstant.MESSAGES.SUCCESS.ROUTE_DISSOLVE;
		} catch (error) {
			console.error('Error inside routingAlgo: ', error);
			throw error;
		}
	}

	/**
	 * @param params
	 */
	async routingAlgo(params, user) {
		try {
			let finalArr: any = [];
			let employeesArr: any = [];
			let options: any = { ordered: false };
			const headers = {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'auth': {
					username: config1.SERVER.ALGO_API_NAME,
					password: config1.SERVER.ALGO_API_PASS
				},
				// 'api_key': config1.SERVER.API_KEY
			};
			const response = await axios.post(`${config1.SERVER.ALGO_API_URL}/algo`, params, headers);
			for (let grp of response.data.data) {
				let randomenumber = "RO" + Math.floor(Math.random() * 100000) + 8;
				let randomename = "ROUTE" + Math.floor(Math.random() * 10000) + 8;
				grp.routeName = randomename;
				grp.routeBadge = randomenumber;
				grp.createdBy = mongoose.Types.ObjectId(user.userId);
				grp.companyCode = user.companyCode;
				grp.adminType = user.adminType;
				grp.created = Date.now();
				grp.createdAt = new Date();
				grp.updatedAt = new Date();
				grp.status = config.CONSTANT.STATUS.UN_APPROVED;
				finalArr.push(grp);
				for (const emp of grp.employees) {
					employeesArr.push(emp.empId);
				}
			}
			await this.insertMany("cab_routes", response.data.data, options);
			return this.updateMany("users", { '_id': { $in: employeesArr } }, { $set: { groupFormed: true } }, { new: true });
		} catch (error) {
			console.error('Error inside routingAlgo: ', error);
			throw error;
		}
	}
	/**
	 * @function routeList
	 */
	async routeList(params: RouteListing) {
		try {
			let { pageNo, limit, searchKey, sortBy, sortOrder, status, shiftType, shiftName } = params;
			let aggPipe = [];

			let match1: any = {};
			match1 = { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
			aggPipe.push({ "$match": match1 });

			let match2 = {};
			if (searchKey) {
				match2["$or"] = [
					{ "routeName": { "$regex": searchKey, "$options": "-i" } },
					{ "routeBadge": { "$regex": searchKey, "$options": "-i" } },
					{ "employees.name": { "$regex": searchKey, "$options": "-i" } },
					{ "employees.employeeId": { "$regex": searchKey, "$options": "-i" } },
					{ "shiftName": { "$regex": searchKey, "$options": "-i" } }
				];
				aggPipe.push({ "$match": match2 });
			}

			let match3: any = {};
			if (status) {
				match3.status = { "$eq": status };
				aggPipe.push({ "$match": match3 });
			}

			let match4: any = {};
			if (shiftType) {
				match4.shiftType = { "$eq": shiftType };
				aggPipe.push({ "$match": match4 });
			}

			let match5: any = {};
			if (shiftName) {
				match5.shiftName = { "$eq": shiftName };
				aggPipe.push({ "$match": match5 });
			}

			let sort = {};
			if (sortBy && sortOrder) {
				if (sortBy === "routeName") {
					sort = { "routeName": sortOrder };
				} else {
					sort = { "created": sortOrder };
				}
			} else {
				// sort = { "createdAt": -1 };
				// sort by time --satyam
				// Added createdAt, id to sort - Shivakumar A
				// sort issue resolved -- satyam
				sort = {"shiftTime": 1, "_id": -1,  "created": -1};

			}
			aggPipe.push({ "$sort": sort });
			if (pageNo && limit) {
				let skip = (pageNo - 1) * limit;
				aggPipe.push({ "$skip": skip });
				aggPipe.push({ "$limit": limit });
			}
			let project = {
				_id: 1, cabModel: 1, routeName: 1, created: 1, "assigned": "$driverMapped.assigned", "color": "$vendor.color", "vendorName": "$vendor.name",
				statePermitNumber: 1, countryPermitNumber: 1, cabBadge: 1, type: 1, status: 1, registrationNo: 1, adminType: 1, seatingCapacity: 1,
			};
			// aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let response: any = {};
			let routeList = this.aggregate("cab_routes", aggPipe, {});
			// Employee Count - Shivakumar A
			let employeePipeline = [{
				"$facet": {
					"empCount": [{ $match: { "shiftType": { "$eq": params.shiftType } } }, {
						"$group": {
							_id: '',
							"empCount": {
								"$sum": "$empCount"
							}
						}
					}],
				}
			}];
			let totalEmployee = this.find('cab_routes', { ...match1, ...match2, ...match3, ...match4, ...match5 }, { "empCount": 1 , "_id": 0 }, {});

			let totalCount = this.count('cab_routes', { ...match1, ...match2, ...match3, ...match4, ...match5 });
			let routePipline = [
				{
					"$facet": {
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
						"totalOccupancy": { "$arrayElemAt": ["$totalOccupancy.totalOccupancy", 0] },
					}
				}
			];
			// get new data - Shivakumar A
			let newRoutes = this.find("cab_routes", {   "createdAt" : { $lt: new Date(), $gte: new Date(new Date().getTime() - 1000 * 15) }, "shiftType": { $eq: shiftType }  }, {}, {});
			let routeData = this.aggregate("cab_routes", routePipline, {});
			// response = Promise.all([routeList, totalCount, routeData]);
			// Employee Count, newRoutes - Shivakumar A
			response = Promise.all([routeList, totalCount, routeData, totalEmployee, newRoutes]);
			return response;
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function routeList
	 */
	async processedRouteList(params: RouteListing) {
		try {
			let { pageNo, limit, searchKey, sortBy, sortOrder, shiftType, shiftName } = params;
			let aggPipe = [];

			let match1: any = {};
			match1 = { "$and": [{ "$or": [{ "status": { "$eq": config.CONSTANT.STATUS.APPROVED } }, { "status": { "$eq": config.CONSTANT.STATUS.EXECUTED } }] }, { "companyCode": { "$eq": params.companyCode } }] };
			aggPipe.push({ "$match": match1 });

			let match2 = {};
			if (searchKey) {
				match2["$or"] = [
					{ "routeName": { "$regex": searchKey, "$options": "-i" } },
					{ "routeBadge": { "$regex": searchKey, "$options": "-i" } },
					{ "shiftName": { "$regex": searchKey, "$options": "-i" } },
					{ "employees.employeeId": { "$regex": searchKey, "$options": "-i" } },
					{ "employees.name": { "$regex": searchKey, "$options": "-i" } }
				];
				aggPipe.push({ "$match": match2 });
			}

			// let match3: any = {};
			// if (status) {
			// 	match3.status = { "$eq": status };
			// 	aggPipe.push({ "$match": match3 });
			// }

			let match4: any = {};
			if (shiftType) {
				match4.shiftType = { "$eq": shiftType };
				aggPipe.push({ "$match": match4 });
			}

			let match5: any = {};
			if (shiftName) {
				match5.shiftName = { "$eq": shiftName };
				aggPipe.push({ "$match": match5 });
			}

			let sort = {};
			if (sortBy && sortOrder) {
				if (sortBy === "routeName") {
					sort = { "routeName": sortOrder };
				} else {
					sort = { "created": sortOrder };
				}
			} else {
				// -sort = { "createdAt": -1 };
				// satyam - sort by shiftTime
				sort = { "shiftTime": 1};
			}
			aggPipe.push({ "$sort": sort });
			if (pageNo && limit) {
				let skip = (pageNo - 1) * limit;
				aggPipe.push({ "$skip": skip });
				aggPipe.push({ "$limit": limit });
			}
			let project = {
				_id: 1, cabModel: 1, created: 1, "assigned": "$driverMapped.assigned", "color": "$vendor.color", "vendorName": "$vendor.name",
				statePermitNumber: 1, countryPermitNumber: 1, cabBadge: 1, type: 1, status: 1, registrationNo: 1, adminType: 1, seatingCapacity: 1,
			};
			// aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let response: any = {};
			let routeList = this.aggregate("cab_routes", aggPipe, {});
			let totalCount = this.count('cab_routes', { ...match1, ...match2, ...match4, ...match5 });
			response = Promise.all([routeList, totalCount]);
			console.log(response);
			return response;
		} catch (error) {
			throw error;
		}
	}

	 processedRouteListWithCabVendor(userList){
		try {
			let data = [];
			userList.map( element => {
				data.push(this.findOne( "roasters" , { "route.routeBadge" : element.routeBadge } , {}, {} ));
			});
			let response = Promise.all(data);
			return response;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @param params
	 */
	async routingAlgoETA(params, user) {
		try {
			// console.log('params: ', params);
			// console.log('user: ', user);
			let finalArr: any = [];
			let employeesArr: any = [];
			let options: any = { ordered: false };
			const headers = {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'auth': {
					username: config1.SERVER.ALGO_API_NAME,
					password: config1.SERVER.ALGO_API_PASS
				},
				// 'api_key': config1.SERVER.API_KEY
			};
			const response = await axios.post(`${config1.SERVER.ALGO_API_URL}/routing`, params, headers);
			// console.log('Response: ', response);
			for (let grp of response.data.data) {
				let randomenumber = "RO" + Math.floor(Math.random() * 100000) + 8;
				let randomename = "ROUTE" + Math.floor(Math.random() * 10000) + 8;
				grp.routeName = randomename;
				grp.routeBadge = randomenumber;
				grp.createdBy = mongoose.Types.ObjectId(user.userId);
				grp.companyCode = user.companyCode;
				grp.adminType = user.adminType;
				grp.created = Date.now();
				grp.createdAt = new Date();
				grp.updatedAt = new Date();
				grp.status = config.CONSTANT.STATUS.UN_APPROVED;
				finalArr.push(grp);
				for (const emp of grp.employees) {
					employeesArr.push(emp.empId);
				}
			}
			return response.data.data;
			// await this.insertMany("cab_routes", response.data.data, options);
			// return this.updateMany("users", { '_id': { $in: employeesArr } }, { $set: { groupFormed: true } }, { new: true });
		} catch (error) {
			console.error('Error inside routingAlgo: ', error);
			throw error;
		}
	}

	/**
	 * @param params
	 */
	async routingAlgoRegenerate(params, user) {
		try {
			let finalArr: any = [];
			let employeesArr: any = [];
			let options: any = { ordered: false };
			const headers = {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'auth': {
					username: config1.SERVER.ALGO_API_NAME,
					password: config1.SERVER.ALGO_API_PASS
				},
				// 'api_key': config1.SERVER.API_KEY
			};
			const response = await axios.post(`${config1.SERVER.ALGO_API_URL}/algoRegenerate`, params, headers);
			for (let grp of response.data.data) {
				let randomenumber = "RO" + Math.floor(Math.random() * 100000) + 8;
				let randomename = "ROUTE" + Math.floor(Math.random() * 10000) + 8;
				grp.routeName = randomename;
				grp.routeBadge = randomenumber;
				grp.createdBy = mongoose.Types.ObjectId(user.userId);
				grp.companyCode = user.companyCode;
				grp.adminType = user.adminType;
				grp.created = Date.now();
				grp.createdAt = new Date();
				grp.updatedAt = new Date();
				grp.status = config.CONSTANT.STATUS.UN_APPROVED;
				finalArr.push(grp);
				for (const emp of grp.employees) {
					employeesArr.push(emp.empId);
				}
			}
			await this.insertMany("cab_routes", response.data.data, options);
			return await this.deleteMany("cab_routes", { _id: { $in: user.groups } });
		} catch (error) {
			console.error('Error inside routingAlgo: ', error);
			throw error;
		}
	}
	/**
	 * @function findRouteById
	 */
	async findRouteById(params: RouteId) {
		let query: any = {};
		query._id = params.routeId;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

		return await this.findOne("cab_routes", query, {}, {});
	}

	/**
	 * @param params
	 */
	async removeFromGroup(params) {
		try {
			let removeFromGroupResult: any = {};
			let empDetail = await this.findOne("users", { _id: params.userId }, {}, {});
			let route = await this.findOne("cab_routes", { _id: params.routeId }, {}, {});
			let algoReqObj: any = {};
			let officeLocation: any = {};
			algoReqObj.groups = [];
			let admin = await adminDao.findOne("admins", { _id: empDetail.createdBy }, {}, {});
			officeLocation.lat = admin.companyAddress.coordinates[1];
			officeLocation.long = admin.companyAddress.coordinates[0];
			algoReqObj.waitTime = route.waitTime;
			algoReqObj.officeLocation = officeLocation;
			algoReqObj.maxTripDuration = route.maxTripDuration;
			algoReqObj.groups = [];
			let groupObj: any = {};
			groupObj.grpDbId = route._id;
			groupObj.grpId = route.grpId;
			// groupObj.grpCentre = route.grpCentre;
			groupObj.shiftName = route.shiftName;
			groupObj.shiftType = route.shiftType;
			groupObj.shiftTime = route.shiftTime;
			let employees = [];
			for (let e of route.employees) {
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
				if (params.userId === e.empId) {
					removeFromGroupResult.empShifted = obj;
				}
				else
					employees.push(obj);
			}
			groupObj.waitTime = route.waitTime;
			groupObj.maxTripDuration = route.maxTripDuration;
			groupObj.maxGroupSize = route.maxGroupSize;
			groupObj.empCount = employees.length;
			groupObj.employees = employees;
			if (groupObj.employees.length > 0) {
				groupObj.grpCentre = groupObj.employees[0].empLocation;
				algoReqObj.groups.push(groupObj);
				let routeAlgoEta = await this.routingAlgoETA(algoReqObj, admin);
				removeFromGroupResult.oldGroupFormed = routeAlgoEta[0];
			}
			return removeFromGroupResult;
		} catch (error) {
			console.error('Error inside routingAlgo: ', error);
			throw error;
		}
	}

	/**
	 * @param params
	 */
	async adjustInGroup(params) {
		try {
			let rosterRoutesArray: any = [];
			let potentialGroups: any;
			let empDetail = await this.findOne("users", { _id: params.userId }, {}, {});
			let admin = await adminDao.findOne("admins", { _id: empDetail.createdBy }, {}, {});
			let empLocation: any = {
				"lat": empDetail.pickup.coordinates[1],
				"long": empDetail.pickup.coordinates[0]
			};
			if (params.rescheduleRequest) {
				let potentialRosters = await this.find("roasters", { "route.shiftName": params.shiftName, "route.shiftType": params.shiftType, "rosterDate": params.rosterDate }, { "route._id": 1, "_id": 0 }, {});
				if (potentialRosters.length === 0) {
					return false;
				}
				rosterRoutesArray = await potentialRosters.map(r => { return r.route._id; });
				potentialGroups = await this.find("cab_routes", { "_id": { "$in": rosterRoutesArray }, "shiftName": params.shiftName, "shiftType": params.shiftType, $where: 'this.empCount < this.maxGroupSize' }, {}, {});
			}
			else {
				potentialGroups = await this.find("cab_routes", { "shiftName": params.shiftName, "shiftType": params.shiftType, $where: 'this.empCount < this.maxGroupSize' }, {}, {});
			}
			if (potentialGroups.length > 0) {
				for (let [i, pg] of potentialGroups.entries()) {
					let distance = distFrom([pg.grpCentre.lat, pg.grpCentre.long]).to([empLocation.lat, empLocation.long]);
					if (distance.distance.v <= 3) {
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
						employees.push(params.empShifted);
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
						let routeAlgoEta1 = await this.routingAlgoETA(algoReqObj, admin);
						return routeAlgoEta1[0];
					}
				}
			}
		} catch (error) {
			console.error('Error inside routingAlgo: ', error);
			throw error;
		}
	}

	/**
	 * @param params
	 */
	async createSingleEmpGroup(params) {
		try {
			let algoReqObj: any = {};
			let officeLocation: any = {};
			let empDetail = await this.findOne("users", { _id: params.userId }, {}, {});
			let admin = await adminDao.findOne("admins", { _id: empDetail.createdBy }, {}, {});
			algoReqObj.groups = [];
			officeLocation.lat = admin.companyAddress.coordinates[1];
			officeLocation.long = admin.companyAddress.coordinates[0];
			algoReqObj.waitTime = params.oldRoute.waitTime;
			algoReqObj.officeLocation = officeLocation;
			algoReqObj.maxTripDuration = params.oldRoute.maxTripDuration;
			let groupObj: any = {};
			groupObj.grpId = params.oldRoute.grpId;
			groupObj.grpCentre = params.empShifted.empLocation;
			groupObj.shiftName = params.shiftName;
			groupObj.shiftType = params.shiftType;
			groupObj.shiftTime = params.shiftTime;
			groupObj.waitTime = params.oldRoute.waitTime;
			groupObj.maxTripDuration = params.oldRoute.maxTripDuration;
			groupObj.maxGroupSize = params.oldRoute.maxGroupSize;
			let employees = [];
			employees.push(params.empShifted);
			groupObj.empCount = 1;
			groupObj.employees = employees;
			algoReqObj.groups.push(groupObj);
			let routeAlgoEta2 = await this.routingAlgoETA(algoReqObj, admin);
			return routeAlgoEta2[0];
		} catch (error) {
			console.error('Error inside routingAlgo: ', error);
			throw error;
		}
	}
}