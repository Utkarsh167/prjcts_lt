"use strict";

import { AdminDao } from "@modules/v1/admin/AdminDao";
import { empVehicleController } from "@modules/v1/empVehicle/empVehicleController";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/index";
import { Worker } from "@lib/Worker";
import { EmpVehicleDao } from "../empVehicle/EmpVehicleDao";

let adminDao = new AdminDao();
let empVehicleDao = new EmpVehicleDao();

export class BootStrap extends BaseDao {

	startWorkers() {
		new Worker().init();
	}

	// Inserting Configuration, admin and company data at first installation Utkarsh 01/07/2020
	async bootstrapSeedData() {
		let adminData = {
			"email": config.SERVER.ADMIN_CREDENTIALS.EMAIL,
			"password": config.SERVER.ADMIN_CREDENTIALS.PASSWORD,
			"name": config.SERVER.ADMIN_CREDENTIALS.NAME,
			"companyId": "",
			"type": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN,
			"contactNo": config.SERVER.ADMIN_CREDENTIALS.CONTACTNUMBER,
			// for showcase
			// "companyLocationName": config.SERVER.LOCATIONS[0].NAME,
			// for translab
			"companyLocationName": config.SERVER.LOCATIONS[0].NAME,
		};

		// Company sample data at initial insertion Utkarsh 03/07/2020 for showcase and ivrea
		// Removed ivrea as it was not working
		let companyData = {
			"code": config.SERVER.COMPANY_DETAILS.CODE,
			"name": config.SERVER.COMPANY_DETAILS.NAME,
			"address": config.SERVER.ADDRESS_DETAILS.FULL_ADDRESS,
			"config": {
					booking_status_cutoff: config.SERVER.CONFIG.BOOKING_STATUS_CUTOFF,
					geofence_cutoff: config.SERVER.CONFIG.GEOFENCE_CUTOFF,
		},

		"locations": [
			{
				"name": config.SERVER.LOCATIONS[0].NAME,
				"key": config.SERVER.LOCATIONS[0].KEY,
				"parqueryValue": config.SERVER.LOCATIONS[0].PARQUERY_VALUE,
				"user": config.SERVER.LOCATIONS[0].USER,
				"password": config.SERVER.LOCATIONS[0].PASSWORD,
				"address": {
					"fullAddress": config.SERVER.ADDRESS_DETAILS.FULL_ADDRESS,
					"lat": config.SERVER.ADDRESS_DETAILS.LAT,
					"lng": config.SERVER.ADDRESS_DETAILS.LNG
				},
				"cameras": config.SERVER.COTESA_CAMERAS,
				"floors": [
					{
						"name": config.SERVER.FLOORS[0].NAME,
						"value": config.SERVER.FLOORS[0].VALUE,
						"key": config.SERVER.FLOORS[0].KEY,
						"parqueryValue": config.SERVER.FLOORS[0].PARQUERY_VALUE,
						"cameras": config.SERVER.COTESA_CAMERAS,
						"zones": [
							{
								"name": config.SERVER.ZONES[0].NAME,
								"key": config.SERVER.ZONES[0].KEY,
								"parqueryValue": config.SERVER.ZONES[0].PARQUERY_VALUE,
								"spots": [
									{
										"name": config.SERVER.SPOTS[0].NAME,
									},
									{
										"name": config.SERVER.SPOTS[1].NAME,
									},
									{
										"name": config.SERVER.SPOTS[2].NAME,
									},
									{
										"name": config.SERVER.SPOTS[3].NAME,
									},
									{
										"name": config.SERVER.SPOTS[4].NAME,
									},
									{
										"name": config.SERVER.SPOTS[5].NAME,
									},
									{
										"name": config.SERVER.SPOTS[6].NAME,
									},
									{
										"name": config.SERVER.SPOTS[7].NAME,
									},
									{
										"name": config.SERVER.SPOTS[8].NAME,
									},
									{
										"name": config.SERVER.SPOTS[9].NAME,
									},
									{
										"name": config.SERVER.SPOTS[10].NAME,
									},
									{
										"name": config.SERVER.SPOTS[11].NAME,
									},
									{
										"name": config.SERVER.SPOTS[12].NAME,
									},
									{
										"name": config.SERVER.SPOTS[13].NAME,
									},
									{
										"name": config.SERVER.SPOTS[14].NAME,
									},
									{
										"name": config.SERVER.SPOTS[15].NAME,
									},
									{
										"name": config.SERVER.SPOTS[16].NAME,
									},
									{
										"name": config.SERVER.SPOTS[1].NAME,
									},
									{
										"name": config.SERVER.SPOTS[1].NAME,
									},
									{
										"name": config.SERVER.SPOTS[18].NAME,
									},
									{
										"name": config.SERVER.SPOTS[19].NAME,
									},
									{
										"name": config.SERVER.SPOTS[20].NAME,
									},
									{
										"name": config.SERVER.SPOTS[21].NAME,
									},
									{
										"name": config.SERVER.SPOTS[22].NAME,
									},
									{
										"name": config.SERVER.SPOTS[23].NAME,
									},
									{
										"name": config.SERVER.SPOTS[24].NAME,
									},
									{
										"name": config.SERVER.SPOTS[25].NAME,
									},
									{
										"name": config.SERVER.SPOTS[26].NAME,
									},
									{
										"name": config.SERVER.SPOTS[27].NAME,
									},
									{
										"name": config.SERVER.SPOTS[28].NAME,
									},
									{
										"name": config.SERVER.SPOTS[29].NAME,
									},
									{
										"name": config.SERVER.SPOTS[30].NAME,
									},
									{
										"name": config.SERVER.SPOTS[31].NAME,
									},
									{
										"name": config.SERVER.SPOTS[32].NAME,
									},
									{
										"name": config.SERVER.SPOTS[33].NAME,
									},
									{
										"name": config.SERVER.SPOTS[34].NAME,
									},
									{
										"name": config.SERVER.SPOTS[35].NAME,
									},
									{
										"name": config.SERVER.SPOTS[36].NAME,
									},
									{
										"name": config.SERVER.SPOTS[37].NAME,
									},
									{
										"name": config.SERVER.SPOTS[38].NAME,
									},
									{
										"name": config.SERVER.SPOTS[39].NAME,
									},
									{
										"name": config.SERVER.SPOTS[40].NAME,
									},
									{
										"name": config.SERVER.SPOTS[41].NAME,
									},
									{
										"name": config.SERVER.SPOTS[42].NAME,
									},
								]
							},
							{
								"name": config.SERVER.ZONES[1].NAME,
								"key": config.SERVER.ZONES[1].KEY,
								"parqueryValue": config.SERVER.ZONES[1].PARQUERY_VALUE,
								"spots": [
									{
										"name": config.SERVER.SPOTS[0].NAME,
									},
									{
										"name": config.SERVER.SPOTS[1].NAME,
									},
									{
										"name": config.SERVER.SPOTS[2].NAME,
									},
									{
										"name": config.SERVER.SPOTS[3].NAME,
									},
									{
										"name": config.SERVER.SPOTS[4].NAME,
									},
									{
										"name": config.SERVER.SPOTS[5].NAME,
									},
									{
										"name": config.SERVER.SPOTS[6].NAME,
									},
									{
										"name": config.SERVER.SPOTS[7].NAME,
									},
									{
										"name": config.SERVER.SPOTS[8].NAME,
									},
									{
										"name": config.SERVER.SPOTS[9].NAME,
									},
									{
										"name": config.SERVER.SPOTS[10].NAME,
									},
									{
										"name": config.SERVER.SPOTS[11].NAME,
									},
									{
										"name": config.SERVER.SPOTS[12].NAME,
									},
									{
										"name": config.SERVER.SPOTS[13].NAME,
									},
									{
										"name": config.SERVER.SPOTS[14].NAME,
									},
									{
										"name": config.SERVER.SPOTS[15].NAME,
									},
									{
										"name": config.SERVER.SPOTS[16].NAME,
									},
									{
										"name": config.SERVER.SPOTS[1].NAME,
									},
									{
										"name": config.SERVER.SPOTS[1].NAME,
									},
									{
										"name": config.SERVER.SPOTS[18].NAME,
									},
									{
										"name": config.SERVER.SPOTS[19].NAME,
									},
									{
										"name": config.SERVER.SPOTS[20].NAME,
									},
									{
										"name": config.SERVER.SPOTS[21].NAME,
									},
									{
										"name": config.SERVER.SPOTS[22].NAME,
									},
									{
										"name": config.SERVER.SPOTS[23].NAME,
									},
									{
										"name": config.SERVER.SPOTS[24].NAME,
									},
									{
										"name": config.SERVER.SPOTS[25].NAME,
									},
									{
										"name": config.SERVER.SPOTS[26].NAME,
									},
									{
										"name": config.SERVER.SPOTS[27].NAME,
									},
									{
										"name": config.SERVER.SPOTS[28].NAME,
									},
									{
										"name": config.SERVER.SPOTS[29].NAME,
									},
									{
										"name": config.SERVER.SPOTS[30].NAME,
									},
									{
										"name": config.SERVER.SPOTS[31].NAME,
									},
									{
										"name": config.SERVER.SPOTS[32].NAME,
									},
									{
										"name": config.SERVER.SPOTS[33].NAME,
									},
									{
										"name": config.SERVER.SPOTS[34].NAME,
									},
									{
										"name": config.SERVER.SPOTS[35].NAME,
									},
									{
										"name": config.SERVER.SPOTS[36].NAME,
									},
									{
										"name": config.SERVER.SPOTS[37].NAME,
									},
									{
										"name": config.SERVER.SPOTS[38].NAME,
									},
									{
										"name": config.SERVER.SPOTS[39].NAME,
									},
									{
										"name": config.SERVER.SPOTS[40].NAME,
									},
									{
										"name": config.SERVER.SPOTS[41].NAME,
									},
									{
										"name": config.SERVER.SPOTS[42].NAME,
									},
								]
							}
						]
					}
				]
			},
			{
				"name": config.SERVER.LOCATIONS[1].NAME,
				"key": config.SERVER.LOCATIONS[1].KEY,
				"parqueryValue": config.SERVER.LOCATIONS[1].PARQUERY_VALUE,
				"user": config.SERVER.LOCATIONS[1].USER,
				"password": config.SERVER.LOCATIONS[1].PASSWORD,
				"address": {
					"fullAddress": config.SERVER.ADDRESS_DETAILS.FULL_ADDRESS,
					"lat": config.SERVER.ADDRESS_DETAILS.LAT,
					"lng": config.SERVER.ADDRESS_DETAILS.LNG
				},
				"cameras": config.SERVER.IVREA_CAMERAS,
				"floors": [
					{
						"name": config.SERVER.FLOORS[1].NAME,
						"value": config.SERVER.FLOORS[1].VALUE,
						"key": config.SERVER.FLOORS[1].KEY,
						"parqueryValue": config.SERVER.FLOORS[1].PARQUERY_VALUE,
						"cameras": [config.SERVER.IVREA_CAMERAS[3], config.SERVER.IVREA_CAMERAS[4]],
						"zones": [
							{
								"name": config.SERVER.ZONES[3].NAME,
								"key": config.SERVER.ZONES[3].KEY,
								"parqueryValue": config.SERVER.ZONES[3].PARQUERY_VALUE,
								"spots": [
									{
										"name": config.SERVER.SPOTS[0].NAME,
									},
									{
										"name": config.SERVER.SPOTS[1].NAME,
									},
									{
										"name": config.SERVER.SPOTS[2].NAME,
									},
									{
										"name": config.SERVER.SPOTS[3].NAME,
									},
									{
										"name": config.SERVER.SPOTS[4].NAME,
									}
								]
							},
							{
								"name": config.SERVER.ZONES[2].NAME,
								"key": config.SERVER.ZONES[2].KEY,
								"parqueryValue": config.SERVER.ZONES[2].PARQUERY_VALUE,
								"spots": [
									{
										"name": config.SERVER.SPOTS[0].NAME,
									},
									{
										"name": config.SERVER.SPOTS[1].NAME,
									},
									{
										"name": config.SERVER.SPOTS[2].NAME,
									},
									{
										"name": config.SERVER.SPOTS[3].NAME,
									},
									{
										"name": config.SERVER.SPOTS[4].NAME,
									}
								]
							}
						]
					},
					{
						"name": config.SERVER.FLOORS[2].NAME,
						"value": config.SERVER.FLOORS[2].VALUE,
						"key": config.SERVER.FLOORS[2].KEY,
						"parqueryValue": config.SERVER.FLOORS[2].PARQUERY_VALUE,
						"cameras": [config.SERVER.IVREA_CAMERAS[0], config.SERVER.IVREA_CAMERAS[1], config.SERVER.IVREA_CAMERAS[2], ],
						"zones": [
							{
								"name": config.SERVER.ZONES[3].NAME,
								"key": config.SERVER.ZONES[3].KEY,
								"parqueryValue": config.SERVER.ZONES[3].PARQUERY_VALUE,
								"spots": [
									{
										"name": config.SERVER.SPOTS[0].NAME,
									},
									{
										"name": config.SERVER.SPOTS[1].NAME,
									},
									{
										"name": config.SERVER.SPOTS[2].NAME,
									},
									{
										"name": config.SERVER.SPOTS[3].NAME,
									},
									{
										"name": config.SERVER.SPOTS[4].NAME,
									}
								]
							},
							{
								"name": config.SERVER.ZONES[2].NAME,
								"key": config.SERVER.ZONES[2].KEY,
								"parqueryValue": config.SERVER.ZONES[2].PARQUERY_VALUE,
								"spots": [
									{
										"name": config.SERVER.SPOTS[0].NAME,
									},
									{
										"name": config.SERVER.SPOTS[1].NAME,
									},
									{
										"name": config.SERVER.SPOTS[2].NAME,
									},
									{
										"name": config.SERVER.SPOTS[3].NAME,
									},
									{
										"name": config.SERVER.SPOTS[4].NAME,
									}
								]
							}
						]
					},
				]
			}
		]
		};

		// Utkarsh new configuration for translab demo
		// let companyData = {
		// 	"code": config.SERVER.COMPANY_DETAILS_TRANSLAB.CODE,
		// 	"name": config.SERVER.COMPANY_DETAILS_TRANSLAB.NAME,
		// 	"address": config.SERVER.ADDRESS_DETAILS_TRANSLAB.FULL_ADDRESS,
		// 	"config": {
		// 			booking_status_cutoff: config.SERVER.CONFIG.BOOKING_STATUS_CUTOFF,
		// 			geofence_cutoff: config.SERVER.CONFIG.GEOFENCE_CUTOFF,
		// },

		// "locations": [{
		// 		"name": config.SERVER.LOCATIONS_TRANSLAB[0].NAME,
		// 		"key": config.SERVER.LOCATIONS_TRANSLAB[0].KEY,
		// 		"parqueryValue": config.SERVER.LOCATIONS_TRANSLAB[0].PARQUERY_VALUE,
		// 		"user": config.SERVER.LOCATIONS_TRANSLAB[0].USER,
		// 		"password": config.SERVER.LOCATIONS_TRANSLAB[0].PASSWORD,
		// 		"address": {
		// 			"fullAddress": config.SERVER.ADDRESS_DETAILS_TRANSLAB.FULL_ADDRESS,
		// 			"lat": config.SERVER.ADDRESS_DETAILS_TRANSLAB.LAT,
		// 			"lng": config.SERVER.ADDRESS_DETAILS_TRANSLAB.LNG
		// 		},
		// 		"cameras": config.SERVER.CAMERAS_TRANSLAB,
		// 		"floors": [
		// 			{
		// 				"name": config.SERVER.FLOORS_TRANSLAB[0].NAME,
		// 				"value": config.SERVER.FLOORS_TRANSLAB[0].VALUE,
		// 				"key": config.SERVER.FLOORS_TRANSLAB[0].KEY,
		// 				"parqueryValue": config.SERVER.FLOORS_TRANSLAB[0].PARQUERY_VALUE,
		// 				"cameras": config.SERVER.CAMERAS_TRANSLAB,
		// 				"zones": [
		// 					{
		// 						"name": config.SERVER.ZONES_TRANSLAB[0].NAME,
		// 						"key": config.SERVER.ZONES_TRANSLAB[0].KEY,
		// 						"parqueryValue": config.SERVER.ZONES_TRANSLAB[0].PARQUERY_VALUE,
		// 						"spots": [
		// 							{
		// 								"name": config.SERVER.SPOTS_TRANSLAB[0].NAME,
		// 							},
		// 							{
		// 								"name": config.SERVER.SPOTS_TRANSLAB[1].NAME,
		// 							},
		// 							{
		// 								"name": config.SERVER.SPOTS_TRANSLAB[2].NAME,
		// 							},
		// 						]
		// 					},

		// 					{
		// 						"name": config.SERVER.ZONES_TRANSLAB[1].NAME,
		// 						"key": config.SERVER.ZONES_TRANSLAB[1].KEY,
		// 						"parqueryValue": config.SERVER.ZONES_TRANSLAB[1].PARQUERY_VALUE,
		// 						"spots": [
		// 							{
		// 								"name": config.SERVER.SPOTS_TRANSLAB[3].NAME,
		// 							},
		// 							{
		// 								"name": config.SERVER.SPOTS_TRANSLAB[4].NAME,
		// 							},
		// 							{
		// 								"name": config.SERVER.SPOTS_TRANSLAB[5].NAME,
		// 							},
		// 						]
		// 					},
		// 				]
		// 			}
		// 		]
		// 	}]
		// };

		let tokenData = {
			"userId": "5f056065a78a8c2ceedb6911",
			"type": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN,
		};
		let employeeVehicleData = {
			"email": config.SERVER.USER_CREDENTIALS.EMAIL,
			"name": config.SERVER.USER_CREDENTIALS.NAME,
			"employeeId": config.SERVER.USER_CREDENTIALS.EMPLOYEE_ID,
			"companyId": "5f056065a78a8c2ceedb6911",
			"type": config.CONSTANT.ADMIN_TYPE.EMPLOYEE,
			"contactNo": config.SERVER.USER_CREDENTIALS.CONTACTNUMBER,
			"createdBy": "5f056065a78a8c2ceedb691a",
			// "gender": config.SERVER.USER_CREDENTIALS.GENDER,
			// "userType": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN,
			"userId": "5f056065a78a8c2ceedb6911",
			"vehicles": [
				{
					"regNo": config.SERVER.VEHICLE_DETAILS[0].REG_NO,
					"status": config.SERVER.VEHICLE_DETAILS[0].STATUS,
					"vehicleType": config.SERVER.VEHICLE_DETAILS[0].VEHICLE_TYPE,
					// "companyId": "5f056065a78a8c2ceedb6911",
					// "userId": "5f056065a78a8c2ceedb691a",
					// "createdBy": "5f056065a78a8c2ceedb691a",
					"modal": config.SERVER.VEHICLE_DETAILS[0].MODAL,
				}
			]
		};
		/**let locations = [{
				"name": "DELL EMC",
				"key": "url_parquery(project)",
				"parqueryValue": "www.showcase.com",
				"floors": [
					{
						"name": "Basement1",
						"key": "visual plan",
						"parqueryValue": "cotesa384",
						"zones": [
							{
								"name": "P1",
								"key": "block id",
								"parqueryValue": "Muncipal",
								"slots": [
									{
										"name": "S1"
									}
								]
							}
						]
					}
				]
			}]; **/

		console.log(adminData);
		try {
			let isPermissionExist = await adminDao.isPermissionExist();
			if (!isPermissionExist) {
				console.log("Permission not exist");
				let permissionData = {
					"moduleName": [
						{
							"moduleName": config.CONSTANT.MODULE_NAME.DASHBOARD,
							"moduleKey": config.CONSTANT.MODULE_KEY.DASHBOARD
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.ENTRY_LOG,
							"moduleKey": config.CONSTANT.MODULE_KEY.ENTRY_LOG
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.REAL_TIME_DURATION,
							"moduleKey": config.CONSTANT.MODULE_KEY.REAL_TIME_DURATION
						},
						// {
						// 	"moduleName": config.CONSTANT.MODULE_NAME.EMPLOYEE,
						// 	"moduleKey": config.CONSTANT.MODULE_KEY.EMPLOYEE
						// },
						// {
						// 	"moduleName": config.CONSTANT.MODULE_NAME.VEHICLE,
						// 	"moduleKey": config.CONSTANT.MODULE_KEY.VEHICLE
						// },
						{
							"moduleName": config.CONSTANT.MODULE_NAME.GUARD,
							"moduleKey": config.CONSTANT.MODULE_KEY.GUARD
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.NOTIFICATION,
							"moduleKey": config.CONSTANT.MODULE_KEY.NOTIFICATION
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.SUBADMIN,
							"moduleKey":  config.CONSTANT.MODULE_KEY.SUBADMIN
						},
						// {
						// 	"moduleName": config.CONSTANT.MODULE_NAME.REPORTS,
						// 	"moduleKey":  config.CONSTANT.MODULE_KEY.REPORTS
						// },
						{
							"moduleName": config.CONSTANT.MODULE_NAME.AUDITLOG,
							"moduleKey": config.CONSTANT.MODULE_KEY.AUDITLOG
						},
						// {
						// 	"moduleName": config.CONSTANT.MODULE_NAME.SETTINGS,
						// 	"moduleKey": config.CONSTANT.MODULE_KEY.SETTINGS
						// },
						{
							"moduleName": config.CONSTANT.MODULE_NAME.EMPLOYEE_VEHICLE,
							"moduleKey": config.CONSTANT.MODULE_KEY.EMPLOYEE_VEHICLE_MANAGEMENT
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.PROFILE,
							"moduleKey": config.CONSTANT.MODULE_KEY.PROFILE
						},
					]
				};
				let step1 = await adminDao.createDefaultPermission(permissionData);
			}

			// let test1 = await empVehicleController.empVehicleSignup(employeeVehicleData , tokenData);
			// let test2 = await empVehicleDao.createVehicleData(employeeVehicleData.vehicles[0]);
			let isExist = await adminDao.isEmailExists(adminData);
			if (!isExist) {
				let step1 = await adminDao.createCompanyDetails(companyData);
				// console.log("===================>>>>>>>>>" + step1._id);
				adminData.companyId = step1._id;
				 let step2 = await adminDao.createAdmin(adminData);

			}
		} catch (error) {
			console.log(error);
			return Promise.resolve();
		}
	}
}
