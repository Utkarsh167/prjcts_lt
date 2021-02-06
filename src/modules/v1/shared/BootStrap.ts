"use strict";

import { AdminDao } from "@modules/v1/admin/AdminDao";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/index";
import { Worker } from "@lib/Worker";

let adminDao = new AdminDao();

export class BootStrap extends BaseDao {

	startWorkers() {
		new Worker().init();
	}

	async bootstrapSeedData() {
		let adminData = {
			"email": config.SERVER.ADMIN_CREDENTIALS.EMAIL,
			"password": config.SERVER.ADMIN_CREDENTIALS.PASSWORD,
			"name": config.SERVER.ADMIN_CREDENTIALS.NAME
		};
		try {
			let isPermissionExist = await adminDao.isPermissionExist();
			if (!isPermissionExist) {
				let permissionData = {
					"moduleName": [
						// {
						// 	"moduleName": config.CONSTANT.MODULE_NAME.DASHBOARD,
						// 	"moduleKey": config.CONSTANT.MODULE_KEY.DASHBOARD
						// },
						{
							"moduleName": config.CONSTANT.MODULE_NAME.ROUTE,
							"moduleKey": config.CONSTANT.MODULE_KEY.ROUTE
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.ROSTER,
							"moduleKey": config.CONSTANT.MODULE_KEY.ROSTER
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.RTLS,
							"moduleKey": config.CONSTANT.MODULE_KEY.RTLS
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.REQUEST,
							"moduleKey": config.CONSTANT.MODULE_KEY.REQUEST
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.EMPLOYEE,
							"moduleKey": config.CONSTANT.MODULE_KEY.EMPLOYEE
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.CAB,
							"moduleKey": config.CONSTANT.MODULE_KEY.CAB
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.DRIVER,
							"moduleKey": config.CONSTANT.MODULE_KEY.DRIVER
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.NOTIFICATION,
							"moduleKey": config.CONSTANT.MODULE_KEY.NOTIFICATION
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.VENDOR,
							"moduleKey": config.CONSTANT.MODULE_KEY.VENDOR
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.SHIFTMANAGEMENT,
							"moduleKey": config.CONSTANT.MODULE_KEY.SHIFTMANAGEMENT
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.TRIPHISTORY,
							"moduleKey": "trip"
						},
						{
							"moduleName": config.CONSTANT.MODULE_NAME.AUDITLOG,
							"moduleKey": config.CONSTANT.MODULE_KEY.AUDITLOG
						}]
				};
				let step1 = await adminDao.createDefaultPermission(permissionData);
			}
			let isExist = await adminDao.isEmailExists(adminData);
			if (!isExist) {
				let step1 = await adminDao.createAdmin(adminData);
			}
		} catch (error) {
			return Promise.resolve();
		}
	}
}