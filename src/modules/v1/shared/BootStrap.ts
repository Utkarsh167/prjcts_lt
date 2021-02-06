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
			"email": config.SERVER.SUPER_ADMIN_CREDENTIALS.EMAIL,
			"password": config.SERVER.SUPER_ADMIN_CREDENTIALS.PASSWORD,
			"name": config.SERVER.SUPER_ADMIN_CREDENTIALS.NAME,
			"adminType": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN
		};
		let companyTypeData = {
			"companyType": "Software"
		};
		try {
			let isCompanyTypeExist = await adminDao.isCompanyTypeExists(companyTypeData);
			if (!isCompanyTypeExist) {
				let step1 = await adminDao.createCompanyType(companyTypeData);
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