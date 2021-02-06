"use strict";

import { BaseDao } from "@modules/v1/shared/BaseDao";

export class LoginHistoryDao extends BaseDao {

	/**
	 * @function createUserLoginHistory
	 */
	async createUserLoginHistory(params: LoginHistoryRequest) {
		params.isLogin = true;
		params.lastLogin = Date.now();
		params.lastLogout = Date.now();
		return await this.save("login_histories", params);
	}

	/**
	 * @function removeDeviceByUserId
	 */
	async removeDeviceByUserId(params: Device) {
		let query: any = {};
		query.userId = params.userId;
		query.isLogin = true;

		let update = {};
		update["$set"] = {
			isLogin: false,
			lastLogout: Date.now()
		};
		update["$unset"] = { deviceToken: "", arn: "", refreshToken: "" };

		let options: any = { multi: true };

		return await this.updateMany("login_histories", query, update, options);
	}

	/**
	 * @function removeUserDeviceById
	 */
	async removeUserDeviceById(params: Device) {
		let query: any = {};
		query.userId = params.userId;
		query.deviceId = params.deviceId;
		query.isLogin = true;

		let update = {};
		update["$set"] = {
			isLogin: false,
			lastLogout: Date.now()
		};
		update["$unset"] = { deviceToken: "", arn: "", refreshToken: "" };

		let options: any = { multi: true };

		return await this.updateMany("login_histories", query, update, options);
	}

	/**
	 * @function findDeviceById
	 */
	async findDeviceById(params: Device) {
		let query: any = {};
		query.deviceId = params.deviceId;
		query.userId = params.userId;
		query.salt = params.salt;
		query.isLogin = true;

		let projection = { salt: 1, refreshToken: 1 };

		let options: any = { lean: true };

		return await this.findOne("login_histories", query, projection, options);
	}

	/**
	 * @function findDeviceById
	 */
	async findChunkDevice(params) {
		let query: any = {};
		query.userId = { "$in": params };
		query.isLogin = true;
		let projection = { userId: 1, userType: 1, deviceId: 1, deviceToken: 1, platform: 1 };
		let options: any = {};
		return await this.find("login_histories", query, projection, options);
	}

	/**
	 * @function updateRefreshToken
	 */
	async updateRefreshToken(params: Device) {
		let query: any = {};
		query.deviceId = params.deviceId;
		query.userId = params.userId;
		query.isLogin = true;

		let update = {};
		update["$set"] = {
			"refreshToken": params.refreshToken
		};

		return await this.updateOne("login_histories", query, update, {});
	}
}