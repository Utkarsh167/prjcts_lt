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

export class RoasterDao extends BaseDao {

	/**
	 * @function Roasteradd
	 */
	async roasterAdd(params: RoasterAddRequest) {
		let arrDlt = [];
		let dr;
		let rosterObj: any = {
			validFrom: params.validFrom,
			validTill: params.validTill,
			roasterBadge: params.roasterBadge,
			createdBy: params.createdBy,
			companyCode: params.companyCode
		};
		let query: any = {};
		query.routeId = params.routeId;
		let projection: any = {};
		let options: any = {};
		let roaster = await this.findOne('roasters', query, projection, options);
		if (roaster) {
			return Promise.reject(roasterConstant.MESSAGES.ERROR.CAB_OR_ROUTE_ALREADY_ASSIGN);
		}
		params.createdAt = new Date().getTime();
		let route = await this.findOne("cab_routes", {"_id": params.routeId}, {}, {});
		rosterObj.route = route;
		let cab = await this.findOne("cabs", {"_id": params.cabId}, {}, {});
		rosterObj.cab = cab;
		for (let [i, driver] of rosterObj.cab.driverMapped.entries()) {
			if (driver._id.toString() !== params.driverId.toString() || driver.shift.shiftTime !== route.shiftTime || driver.shift.shiftType !== route.shiftType)
			arrDlt.push(i);
			else
			dr = i;
		}
		_.pullAt(rosterObj.cab.driverMapped, arrDlt);
		let roster = await this.save("roasters", rosterObj);
		let query1: any = {"$and": [{"_id": params.cabId}, {"driverMapped._id": params.driverId}, {"driverMapped.shift.shiftType": rosterObj.route.shiftType}, {"driverMapped.shift.shiftTime": rosterObj.route.shiftTime}]};
		let update1: any = {};
		let options1 = { new: true };
		update1["$set"] = {
			"driverMapped.$.booked": true
		};
		await this.updateOne("cabs", query1, update1, options1);
		return roster;
	}
	/**
	 * @param params
	 */
	// async roasterUpdate(params: RoasterUpdateRequest) {
	// 	let query: any = {};
	// 	query._id = params.roasterId;
	// 	let update: any = {};
	// 	update["$set"] = {
	// 		"routeId": params.routeId,
	// 		"cabId": params.cabId,
	// 	};
	// 	if (params.validFrom) {
	// 		update.validFrom = params.validFrom;
	// 	}
	// 	if (params.validTill) {
	// 		update.validTill = params.validTill;
	// 	}
	// 	let options = { new: true };
	// 	let response = await this.findOneAndUpdate("roasters", query, update, options);
	// 	return response;
	// }

	/**
	 * @function allRoasterList
	 * @description driver can get all riders of employee and cab details
	 * @param params
	 */
	async allRoasterList(params: TokenData) {
		let driverData = await this.findUserProfile(params);
		// console.log(JSON.stringify(driverData));
		// console.log(driverData.cab[0]._id + "================" + driverData.cab[0]._id);
		if (driverData.cab.length < 1) {
			return Promise.reject(roasterConstant.MESSAGES.ERROR.CAB_NOT_ASSIGN);
		}
		let startFlag;
		let a = Date.now();
		let currentDate = new Date(a);
		let shiftEndTime = new Date(driverData.cab[0].endShift);
		let shiftStartTime = new Date(driverData.cab[0].startShift);
		if (currentDate.getHours() >= shiftEndTime.getHours() && currentDate.getHours() >= shiftStartTime.getHours()) {
			startFlag = true;
		} else {
			startFlag = false;
		}
		let cabId = driverData.cab[0]._id;
		let { userId } = params;
		let aggPipe = [];
		let match: any = {};
		match = { $and: [{ status: { "$ne": config.CONSTANT.STATUS.DELETED } }, { cabId: { "$eq": appUtils.toObjectId(cabId) } }] };
		aggPipe.push({ "$match": match });
		let sort = { "createdAt": -1 };
		aggPipe.push({ "$sort": sort });

		let project = {
			_id: 1, tripType: 1, driverStartRide: 1, roasterBadge: 1, routeId: 1, employees: 1, cabId: 1
		};
		aggPipe.push({ "$project": project });
		let populate = [
			{
				path: 'routeId',
				model: "cab_route",
				select: "_id tripType routeBadge employees.dropTime employees.pickupTime",
				populate: {
					path: 'employees.empId',
					model: "user",
					select: "noShowReason otpTime pickupStatus otp distance estimatedTime distKm durationMinute _id email name mobileNo profilePicture shiftStartTime shiftEndTime pickup dropoff employeeId",
				}
			},
			{
				path: 'cabId',
				model: "cab",
				select: "_id cabImage cabModel color fuelType cabBadge transmissionType registrationNo seatingCapacity",
			},
		];
		let response: any = {};
		let roasterData = await this.aggregateDataWithPopulate("roasters", aggPipe, populate);
		response.cabDriver = roasterData[0].cabId;
		let roasterJsonData = {
			_id: roasterData[0]._id,
			tripType: roasterData[0].tripType,
			driverStartRide: roasterData[0].driverStartRide,
		};
		response.roasters = roasterJsonData;
		// response.employeeList = rosterData[0].routeId.employees;
		let dataSort = roasterData[0].routeId.employees;
		let sortedObjs;
		// console.log(JSON.stringify(params) + "=+++++++++++++++++++" + roasterData[0].tripType + "]]]]]]]]]]]====");
		if (params.driverTripType === config.CONSTANT.TRIP_TYPE.OFFICE_TO_HOME) {
			sortedObjs = _.sortBy(dataSort, ['empId.distance']);
		} else if (params.driverTripType === config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE) {
			sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		} else if (roasterData[0].tripType === config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE) {
			sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		} else if (roasterData[0].tripType === config.CONSTANT.TRIP_TYPE.OFFICE_TO_HOME) {
			sortedObjs = _.sortBy(dataSort, ['empId.distance']);
		} else {
			sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		}
		// sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		response.employeeList = sortedObjs;
		// let sortedObjs = _.reverse(_.sortBy(objs, 'first_nom'));
		// console.log("--------------ddddddddd" + JSON.stringify(sortedObjs) + "xcccccccccccccccc=========");
		return response;
	}

	/**
	 * @function roasterList
	 * @description driver can get all riders of employee and cab details who start ride
	 * @param params
	 */
	async trackingRoasterList(params: RoasterTripTypeRequest) {
		let driverData = await this.findUserProfile(params);
		// console.log(driverData.cab[0]._id + "================" + driverData.cab[0]._id);
		if (driverData.cab.length < 1) {
			return Promise.reject(roasterConstant.MESSAGES.ERROR.CAB_NOT_ASSIGN);
		}
		let startFlag;
		let a = Date.now();
		let currentDate = new Date(a);
		let shiftEndTime = new Date(driverData.cab[0].endShift);
		let shiftStartTime = new Date(driverData.cab[0].startShift);
		if (currentDate.getHours() >= shiftEndTime.getHours() && currentDate.getHours() >= shiftStartTime.getHours()) {
			startFlag = true;
		} else {
			startFlag = false;
		}
		let cabId = driverData.cab[0]._id;
		let { userId } = params;
		let aggPipe = [];
		let match: any = {};
		match = { $and: [{ status: { "$ne": config.CONSTANT.STATUS.DELETED } }, { cabId: { "$eq": appUtils.toObjectId(cabId) } }] };
		aggPipe.push({ "$match": match });
		let sort = { "createdAt": -1 };
		aggPipe.push({ "$sort": sort });

		let project = {
			_id: 1, tripType: 1, driverStartRide: 1, roasterBadge: 1, routeId: 1, employees: 1, cabId: 1
		};
		aggPipe.push({ "$project": project });
		let populate = [
			{
				path: 'routeId',
				model: "cab_route",
				select: "_id tripType routeBadge employees.dropTime employees.pickupTime",
				populate: {
					path: 'employees.empId',
					options: { lean: true },
					model: "user",
					select: "noShowReason otpTime pickupStatus otp distance estimatedTime distKm durationMinute _id email name mobileNo profilePicture shiftStartTime shiftEndTime pickup dropoff employeeId",
					match: {
						pickupStatus: {
							$in: [
								config.CONSTANT.EMP_PICKUP_STATUS.STARTRIDE,
								config.CONSTANT.EMP_PICKUP_STATUS.ONBOARDED,
							]
						}
					}
				}
			},
			{
				path: 'cabId',
				model: "cab",
				select: "_id cabImage cabModel color fuelType cabBadge transmissionType registrationNo seatingCapacity",
			},
		];
		let response: any = {};
		let roasterData = await this.aggregateDataWithPopulate("roasters", aggPipe, populate);

		response.cabDriver = roasterData[0].cabId;
		let roasterJsonData = {
			_id: roasterData[0]._id,
			tripType: roasterData[0].tripType,
			driverStartRide: roasterData[0].driverStartRide,
		};
		response.roasters = roasterJsonData;
		// response.employeeList = rosterData[0].routeId.employees;
		let filterData = roasterData[0].routeId.employees;
		let dataSort = filterData.filter(empIdObj => empIdObj.empId != null);
		// console.log("[[[[[[[[[[[[[[[[[[[[[====" + filterData + "roasterData[0].routeId.employees================================");
		let sortedObjs;
		// console.log(JSON.stringify(params) + "=+++++++++++++++++++" + roasterData[0].tripType + "]]]]]]]]]]]====");
		if (params.driverTripType === config.CONSTANT.TRIP_TYPE.OFFICE_TO_HOME) {
			sortedObjs = _.sortBy(dataSort, ['empId.distance']);
		} else if (params.driverTripType === config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE) {
			sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		} else if (roasterData[0].tripType === config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE) {
			sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		} else if (roasterData[0].tripType === config.CONSTANT.TRIP_TYPE.OFFICE_TO_HOME) {
			sortedObjs = _.sortBy(dataSort, ['empId.distance']);
		} else {
			sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		}
		// sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		response.employeeList = sortedObjs;
		// let sortedObjs = _.reverse(_.sortBy(objs, 'first_nom'));
		// console.log(JSON.stringify(sortedObjs) + "--------------ddddddddd" + JSON.stringify(sortedObjs) + "xcccccccccccccccc=========");
		return response;
	}

	/**
	 * @function roasterList
	 * @description driver can get all riders of employee and cab details who start ride
	 * @param params
	 */
	async roasterList(params: RoasterTripTypeRequest) {
		let driverData = await this.findUserProfile(params);
		// console.log(driverData.cab[0]._id + "================" + driverData.cab[0]._id);
		if (driverData.cab.length < 1) {
			return Promise.reject(roasterConstant.MESSAGES.ERROR.CAB_NOT_ASSIGN);
		}
		let startFlag;
		let a = Date.now();
		let currentDate = new Date(a);
		let shiftEndTime = new Date(driverData.cab[0].endShift);
		let shiftStartTime = new Date(driverData.cab[0].startShift);
		if (currentDate.getHours() >= shiftEndTime.getHours() && currentDate.getHours() >= shiftStartTime.getHours()) {
			startFlag = true;
		} else {
			startFlag = false;
		}
		let cabId = driverData.cab[0]._id;
		let { userId } = params;
		let aggPipe = [];
		let match: any = {};
		match = { $and: [{ status: { "$ne": config.CONSTANT.STATUS.DELETED } }, { cabId: { "$eq": appUtils.toObjectId(cabId) } }] };
		aggPipe.push({ "$match": match });
		let sort = { "createdAt": -1 };
		aggPipe.push({ "$sort": sort });

		let project = {
			_id: 1, tripType: 1, driverStartRide: 1, roasterBadge: 1, routeId: 1, employees: 1, cabId: 1
		};
		aggPipe.push({ "$project": project });
		let populate = [
			{
				path: 'routeId',
				model: "cab_route",
				select: "_id tripType routeBadge employees.dropTime employees.pickupTime",
				populate: {
					path: 'employees.empId',
					options: { lean: true },
					model: "user",
					select: "noShowReason otpTime pickupStatus otp distance estimatedTime distKm durationMinute _id email name mobileNo profilePicture shiftStartTime shiftEndTime pickup dropoff employeeId",
					match: {
						pickupStatus: {
							$in: [
								config.CONSTANT.EMP_PICKUP_STATUS.STARTRIDE,
								config.CONSTANT.EMP_PICKUP_STATUS.ONBOARDED,
								config.CONSTANT.EMP_PICKUP_STATUS.NOACTION,
								config.CONSTANT.EMP_PICKUP_STATUS.OFFBOARD,
								config.CONSTANT.EMP_PICKUP_STATUS.DRIVER_REACHED,
							]
						}
					}
				}
			},
			{
				path: 'cabId',
				model: "cab",
				select: "_id cabImage cabModel color fuelType cabBadge transmissionType registrationNo seatingCapacity",
			},
		];
		let response: any = {};
		let roasterData = await this.aggregateDataWithPopulate("roasters", aggPipe, populate);

		response.cabDriver = roasterData[0].cabId;
		let roasterJsonData = {
			_id: roasterData[0]._id,
			tripType: roasterData[0].tripType,
			driverStartRide: roasterData[0].driverStartRide,
		};
		response.roasters = roasterJsonData;
		// response.employeeList = rosterData[0].routeId.employees;
		let filterData = roasterData[0].routeId.employees;
		let dataSort = filterData.filter(empIdObj => empIdObj.empId != null);
		// console.log("[[[[[[[[[[[[[[[[[[[[[====" + filterData + "roasterData[0].routeId.employees================================");
		let sortedObjs;
		// console.log(JSON.stringify(params) + "=+++++++++++++++++++" + roasterData[0].tripType + "]]]]]]]]]]]====");
		if (params.driverTripType === config.CONSTANT.TRIP_TYPE.OFFICE_TO_HOME) {
			sortedObjs = _.sortBy(dataSort, ['empId.distance']);
		} else if (params.driverTripType === config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE) {
			sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		} else if (roasterData[0].tripType === config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE) {
			sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		} else if (roasterData[0].tripType === config.CONSTANT.TRIP_TYPE.OFFICE_TO_HOME) {
			sortedObjs = _.sortBy(dataSort, ['empId.distance']);
		} else {
			sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		}
		// sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		response.employeeList = sortedObjs;
		// let sortedObjs = _.reverse(_.sortBy(objs, 'first_nom'));
		// console.log(JSON.stringify(sortedObjs) + "--------------ddddddddd" + JSON.stringify(sortedObjs) + "xcccccccccccccccc=========");
		return response;
	}

	/**
	 * @function findUserProfile
	 */
	async findUserProfile(params: UserId) {
		let ongoing = {
			$filter: {
				input: "$cab",
				as: "item",
				cond: {

					$or: [
						{
							$and: [{ $gt: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.startShift" } }] }, { $lt: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.endShift" } }] }]
						},
						{
							$and: [{ $eq: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.startShift" } }] }, { $gt: [{ $minute: new Date() }, { $minute: { $toDate: "$$item.startShift" } }] }]
						},
						{
							$and: [{ $eq: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.endShift" } }] }, { $lt: [{ $minute: new Date() }, { $minute: { $toDate: "$$item.endShift" } }] }]
						},
						{
							$and: [{ $gt: [{ $hour: { $toDate: "$$item.startShift" } }, { $hour: { $toDate: "$$item.endShift" } }] },

							{

								$or: [
									{
										$or: [{ $gt: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.startShift" } }] }, { $lt: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.endShift" } }] }]
									},
									{
										$and: [{ $eq: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.startShift" } }] }, { $gt: [{ $minute: new Date() }, { $minute: { $toDate: "$$item.startShift" } }] }]
									},
									{
										$and: [{ $eq: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.endShift" } }] }, { $lt: [{ $minute: new Date() }, { $minute: { $toDate: "$$item.endShift" } }] }]
									}
								]

							}
							]
						}
					]

				}
			}
		};
		let upcoming = {
			$filter: {
				input: "$cab",
				as: "item",
				cond: {

					$or: [
						{
							$lt: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.startShift" } }]
						},
						{
							$and: [{ $eq: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.startShift" } }] }, { $lt: [{ $minute: new Date() }, { $minute: { $toDate: "$$item.startShift" } }] }]
						},
						{
							$and: [{ $gt: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.startShift" } }] }, { $gt: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.endShift" } }] }]
						}
					]

				}
			}
		};
		let cab = { $slice: [{ $concatArrays: [ongoing, upcoming] }, 0, 1] };
		let pipeLine = [
			{ $match: { "_id": appUtils.toObjectId(params.userId) } },
			{
				$addFields: {
					cab: cab
				}
			},
			{
				$project: {
					salt: 0,
					hash: 0,
					createdBy: 0,
					companyCode: 0,
					createdAt: 0
				}
			}
		];
		let cabDetails = await this.aggregate("users", pipeLine, {});
		return cabDetails[0]; // await this.findOne("users", query, project1, {});
	}
	/**
	 * @function roasterListEmp
	 * @description employee get rosters of driver cab and emp list who rides with him
	 * @param params
	 */
	async roasterListEmp(params: TokenData) {
		console.log("cancelllllllllllllllllllllllllllllllll" + JSON.stringify(params));
		let { userId } = params;
		let routeData = await this.cabRouteEmployee(params);
		let routeId = routeData._id;
		let rosterData = await this.roasterEmployee(routeId);
		console.log(rosterData[0] + "===========================-----");
		if (routeData.length < 1 || rosterData.length < 1) {
			return Promise.reject(roasterConstant.MESSAGES.ERROR.CAB_NOT_ASSIGN);
		}
		let cabId = rosterData[0].cabId;
		let response: any = {};
		let driverMapped = await this.findCabDriver(cabId);
		response.cabDriver = driverMapped;
		let roasterJsonData = {
			_id: rosterData[0]._id,
			tripType: rosterData[0].tripType,
			driverStartRide: rosterData[0].driverStartRide,
		};
		response.roasters = roasterJsonData;
		// response.employeeList = rosterData[0].routeId.employees;
		// let dataSort = rosterData[0].routeId.employees;
		let filterData = rosterData[0].routeId.employees;
		let dataSort = filterData.filter(empIdObj => empIdObj.empId != null);
		let sortedObjs: any = {};
		if (rosterData[0].tripType === config.CONSTANT.TRIP_TYPE.OFFICE_TO_HOME) {
			sortedObjs = _.sortBy(dataSort, ['empId.distance']);
		} else if (rosterData[0].tripType === config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE) {
			sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		} else {
			sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		}
		// Office to home
		// let sortedObjs = _.sortBy(dataSort, ['empId.distance']);
		// Home to office
		// let sortedObjs = _.reverse(_.sortBy(dataSort, ['empId.distance']));
		response.employeeList = sortedObjs;
		// let sortedObjs = _.reverse(_.sortBy(objs, 'first_nom'));
		console.log("--------------ddddddddd" + JSON.stringify(sortedObjs) + "xcccccccccccccccc=========");
		return response;
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
	 * @function rosters  get cab of employee
	 * @param params
	 */
	async roasterEmployee(routeId) {
		let query: any = {};
		let aggPipe = [];
		let match: any = {};
		match = { $and: [{ status: { "$ne": config.CONSTANT.STATUS.DELETED } }, { routeId: { "$eq": appUtils.toObjectId(routeId) } }] };
		aggPipe.push({ "$match": match });
		let sort = { "createdAt": -1 };
		aggPipe.push({ "$sort": sort });

		let project = {
			_id: 1, tripType: 1, driverStartRide: 1, routeId: 1, employees: 1, cabId: 1
		};
		aggPipe.push({ "$project": project });
		let populate =
			{
				path: 'routeId',
				model: "cab_route",
				select: "_id routeBadge employees.dropTime employees.pickupTime",
				populate: {
					path: 'employees.empId',
					model: "user",
					select: "noShowReason otpTime pickupStatus otp distance estimatedTime distKm durationMinute _id email name mobileNo profilePicture shiftStartTime shiftEndTime pickup dropoff employeeId",
					// match: {
					// 	pickupStatus: {
					// 		$in: [
					// 			config.CONSTANT.EMP_PICKUP_STATUS.STARTRIDE,
					// 			config.CONSTANT.EMP_PICKUP_STATUS.ONBOARDED,
					// 			config.CONSTANT.EMP_PICKUP_STATUS.NOACTION,
					// 			config.CONSTANT.EMP_PICKUP_STATUS.OFFBOARD,
					// 			config.CONSTANT.EMP_PICKUP_STATUS.DRIVER_REACHED,
					// 		]
					// 	}
					// }
				}
			};
		let response: any = {};

		response = await this.aggregateDataWithPopulate("roasters", aggPipe, populate);
		return response;
	}

	/**
	 * @function resolveSos
	 */
	async driverStartRide(params, employeeList) {
		let query: any = {};
		let query1: any = {};
		query1["driverMapped._id"] = params.userId;
		query._id = params._id;
		let update = {};
		let update1 = {};
		update1['$set'] = {
			"driverMapped.$.onlineStatus": params.startRideFlag,
			"driverMapped.$.latitude": params.latitude,
			"driverMapped.$.longitude": params.longitude
		};
		update["$set"] = {
			driverStartRide: params.startRideFlag,
			tripType: params.driverTripType ? params.driverTripType : config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE,
		};

		let options = { new: true };
		let step3 = this.updateMany("cabs", query1, update1, options);
		return await this.findOneAndUpdate("roasters", query, update, options);
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
	 * @description Getting shift wise driver data
	 * @function findCabDriver
	 */
	async findCabDriver(cabId) {
		let ongoing = {
			$filter: {
				input: "$driverMapped",
				as: "item",
				cond: {

					$or: [
						{
							$and: [{ $gt: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.startShift" } }] }, { $lt: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.endShift" } }] }]
						},
						{
							$and: [{ $eq: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.startShift" } }] }, { $gt: [{ $minute: new Date() }, { $minute: { $toDate: "$$item.startShift" } }] }]
						},
						{
							$and: [{ $eq: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.endShift" } }] }, { $lt: [{ $minute: new Date() }, { $minute: { $toDate: "$$item.endShift" } }] }]
						},
						{
							$and: [{ $gt: [{ $hour: { $toDate: "$$item.startShift" } }, { $hour: { $toDate: "$$item.endShift" } }] },

							{

								$or: [
									{
										$or: [{ $gt: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.startShift" } }] }, { $lt: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.endShift" } }] }]
									},
									{
										$and: [{ $eq: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.startShift" } }] }, { $gt: [{ $minute: new Date() }, { $minute: { $toDate: "$$item.startShift" } }] }]
									},
									{
										$and: [{ $eq: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.endShift" } }] }, { $lt: [{ $minute: new Date() }, { $minute: { $toDate: "$$item.endShift" } }] }]
									}
								]

							}
							]
						}
					]

				}
			}
		};
		let upcoming = {
			$filter: {
				input: "$driverMapped",
				as: "item",
				cond: {

					$or: [
						{
							$lt: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.startShift" } }]
						},
						{
							$and: [{ $eq: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.startShift" } }] }, { $lt: [{ $minute: new Date() }, { $minute: { $toDate: "$$item.startShift" } }] }]
						},
						{
							$and: [{ $gt: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.startShift" } }] }, { $gt: [{ $hour: new Date() }, { $hour: { $toDate: "$$item.endShift" } }] }]
						}
					]

				}
			}
		};
		let driverMapped = { $slice: [{ $concatArrays: [ongoing, upcoming] }, 0, 1] };
		let pipeLine = [
			{ $match: { "_id": appUtils.toObjectId(cabId) } },
			{
				$addFields: {
					driverMapped: driverMapped
				}
			},
			{
				$project: {
					createdAt: 0,
					vendor: 0,
					aggrementCopy: 0,
					companyIssuance: 0,
					rgsCertificate: 0,
					fitnessCertificate: 0,
					roadTax: 0,
					insurance: 0,
					statePermitForm: 0,
					allIndiaPermitForm: 0,
					driverOwner: 0,
					driverOnly: 0,
					ac: 0,
					panicButton: 0,
					toolKit: 0,
					spareWheel: 0,
					firstAidKit: 0,
					torchAmbrella: 0,
					fireExtingusher: 0,
					interiorExterior: 0,
					adminType: 0,
					created: 0,
					type: 0,
					vendorId: 0,
					createdBy: 0,
					companyCode: 0,
				}
			}
		];
		let cabDetails = await this.aggregate("cabs", pipeLine, {});
		return cabDetails[0];
	}
	/**
	 * @param userData
	 */
	async roasterData(routeId) {
		let query: any = {};
		query.routeId = routeId;
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
}