"use strict";

import * as _ from "lodash";

import { DashboardDao } from "@modules/v1/dashboard/DashboardDao";
import { EmpVehicleDao } from "@modules/v1/empVehicle/EmpVehicleDao";
import { EntryLogDao} from "@modules/v1/entryLog/EntryLogDao";
import * as config from "@config/constant";
import { MailManager } from "@lib/MailManager";
import * as tokenManager from "@lib/tokenManager";
import { LoginHistoryDao } from "@modules/v1/loginHistory/LoginHistoryDao";
import { AuditLogDao } from "@modules/v1/auditLog/AuditLogDao";
import * as dashboardConstant from "@modules/v1/dashboard/dashboardConstant";

let dashboardDao = new DashboardDao();
let empVehicleDao = new EmpVehicleDao();
let entyLogDao = new EntryLogDao();
// Removed premission check for all dashboard APIs Aashiq - 25/08/2020
/**
 * @author Utkarsh Patil 20/07/2020userList
 * @description Get Scope Data
 */
const scopeParqueryApiCall = async function (params: ScopeRequest, tokenData: TokenData) {
	try {
		// if (
		// 	tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
		// 	tokenData.permission.indexOf("dashboard") !== -1
		// ) {
			let showcaseData: any = await dashboardDao.getScope(params);
			return dashboardConstant.MESSAGES.SUCCESS.SCOPE_API(JSON.parse(showcaseData));
		// } else {
		// 	return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		// }
	} catch (error) {
		throw error;
	}
};

/**
 * @author Utkarsh Patil 20/07/2020
 * @description Get Scope Data
 */
const timeTrackSnapshotApiCall = async function (params: SnapshotRequest, tokenData: TokenData) {
	try {
		// if (
		// 	tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
		// 	tokenData.permission.indexOf("dashboard") !== -1
		// ) {
			// console.log("paramsTime", params);
			let showcaseData: any = await dashboardDao.getSnapshot(params);
			let spotData: any = JSON.parse(showcaseData);
			let regNoArr = spotData.spot_states.map(a => a.vehicle_id);
			// Added vehData in vehDetails field Aashiq - 31/08/2020
			let vehData: any = await dashboardDao.getvehData(regNoArr);
			spotData.spot_states.forEach(i => {
				let val = _.find(vehData, (obj) => {
					if (i.vehicle_id === obj.regNo) {
						return obj;
					}
				});
				if (val){
					i.vehicleDetails = val;
				}
			});
			return dashboardConstant.MESSAGES.SUCCESS.SNAPSHOT_API(spotData);
		// } else {
		// 	return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		// }
	} catch (error) {
		throw error;
	}
};
/**
 * @author Utkarsh Patil 20/07/2020
 * @description Get Image Data
 */
const planImageParqueryApiCall = async function (params: PlanImageRequest, tokenData: TokenData) {
	try {
		// if (
		// 	tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
		// 	tokenData.permission.indexOf("dashboard") !== -1
		// ) {
			let showcaseData: any = await dashboardDao.getPlanImage(params);
			return dashboardConstant.MESSAGES.SUCCESS.PLAN_IMAGE(showcaseData);
		// } else {
		// 	return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		// }
	} catch (error) {
		throw error;
	}
};

/**
 * @author Utkarsh Patil 24/07/2020
 * @description Get Image Data
 */
const historicalRangeApiCall = async function (params: HistoricalAgregateRequest, tokenData: TokenData) {
	try {
		// if (
		// 	tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
		// 	tokenData.permission.indexOf("dashboard") !== -1
		// ) {
			let showcaseData: any = await dashboardDao.getHistoricalRange(params);
			return dashboardConstant.MESSAGES.SUCCESS.HISTORICAL_RANGE_API(JSON.parse(showcaseData));
		// } else {
		// 	return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		// }
	} catch (error) {
		throw error;
	}
};

/**
 * @author Utkarsh Patil 24/07/2020
 * @description Get Image Data
 */
const historicalAggregateApiCall = async function (params: HistoricalAgregateRequest, tokenData: TokenData) {
	try {
		// if (
		// 	tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
		// 	tokenData.permission.indexOf("dashboard") !== -1
		// ) {
			let showcaseData: any = await dashboardDao.getHistoricalAggregate(params);
			return dashboardConstant.MESSAGES.SUCCESS.HISTORICAL_AGGREGATE_API(JSON.parse(showcaseData));
		// } else {
		// 	return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		// }
	} catch (error) {
		throw error;
	}
};

/**
 * @author Utkarsh Patil 24/07/2020
 * @description Get Image Data
 */
const timeTrackRangeApiCall = async function (params: HistoricalAgregateRequest, tokenData: TokenData) {
	try {
		// if (
		// 	tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
		// 	tokenData.permission.indexOf("dashboard") !== -1
		// ) {
			let showcaseData: any = await dashboardDao.getTimeTrackRange(params);
			return dashboardConstant.MESSAGES.SUCCESS.TIME_TRACK_RANGE(JSON.parse(showcaseData));
		// } else {
		// 	return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		// }
	} catch (error) {
		throw error;
	}
};
/**
 * @author Utkarsh Patil 24/07/2020
 * @description Get Image Data
 */
const timeTrackOccupiersApiCall = async function (params: TimeTrackOccupiersRequest, tokenData: TokenData) {
	try {
		// if (
		// 	tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
		// 	tokenData.permission.indexOf("dashboard") !== -1
		// ) {
			let showcaseData: any = await dashboardDao.getTimeTrackOccupiers(params);
			return dashboardConstant.MESSAGES.SUCCESS.TIME_TRACK_OCCUPIERS(JSON.parse(showcaseData));
		// } else {
		// 	return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		// }
	} catch (error) {
		throw error;
	}
};

/**
 * @author Utkarsh Patil 24/07/2020
 * @description Get Image Data
 */
const timeTrackVacantsApiCall = async function (params: TimeTrackOccupiersRequest, tokenData: TokenData) {
	try {
		// if (
		// 	tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
		// 	tokenData.permission.indexOf("dashboard") !== -1
		// ) {
			let showcaseData: any = await dashboardDao.getTimeTrackVacants(params);
			return dashboardConstant.MESSAGES.SUCCESS.TIME_TRACK_VACANTS(JSON.parse(showcaseData));
		// } else {
		// 	return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		// }
	} catch (error) {
		throw error;
	}
};

const timeTrackVideoFromFormApiCall = async function (params: TimeTrackVideoFromFormRequest) {
	try {
		// if (
		// 	tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
		// 	tokenData.permission.indexOf("dashboard") !== -1
		// ) {
			let showcaseData: any = await dashboardDao.getTimeTrackVideoFromForm(params);
			return showcaseData;
			// return dashboardConstant.MESSAGES.SUCCESS.TIME_TRACK_VACANTS(JSON.parse(showcaseData));
		// } else {
		// 	return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		// }
	} catch (error) {
		throw error;
	}
};

const cardData = async function (params){
	try{
		let step1 = await dashboardDao.getCompanyDetails(params);
		let response: any = {};
		response.building = step1.locations.length;
		let floors = 0;
		let spots = 0;

		for (let i = 0; i < step1.locations.length; i++){
			floors += step1.locations[i].floors.length;
			for (let j = 0; j < step1.locations[i].floors.length; j++){
				for (let k = 0; k < step1.locations[i].floors[j].zones.length; k++){
					spots += step1.locations[i].floors[j].zones[k].spots.length;
				}
			}
		}
		response.floors = floors;
		response.spots = spots;
		let step2 = await empVehicleDao.userList(params);
		response.employees = step2[1];
		let step3 = await empVehicleDao.vehicleList(params);
		response.vehicles = step3[1][0].count;
		let step4 = await entyLogDao.entryLogList(params);
		response.entryLog = step4[1][0].count;
		return response;
	} catch (error){
		throw error;
	}
};
export let dashboardController = {
	scopeParqueryApiCall,
	planImageParqueryApiCall,
	historicalAggregateApiCall,
	historicalRangeApiCall,
	timeTrackSnapshotApiCall,
	timeTrackRangeApiCall,
	timeTrackVacantsApiCall,
	timeTrackOccupiersApiCall,
	timeTrackVideoFromFormApiCall,
	cardData
};
