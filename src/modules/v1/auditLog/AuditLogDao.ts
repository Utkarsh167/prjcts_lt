"use strict";

import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/index";

export class AuditLogDao extends BaseDao {
	async addLog(params, tokenData: TokenData, actionType) {
		let data: AuditLogRequest.Add = {
			"moduleName": params.moduleName,
			"userId": tokenData.userId,
			"userName": tokenData.name,
			"userEmail": tokenData.email,
			"targetEmail": params.email,
			"targetId": params._id,
			"targetName": params.name,
			"message": params.message,
			"actionType": actionType,
			"type": tokenData.type,
			"companyId": tokenData.companyId,
			"regNo": params.regNo,
			"created": Date.now()
		};
		return await this.save("audit_logs", data);
	}

	// async update(params, tokenData: TokenData, type: string) {
	// 	let data: AuditLogRequest.Add = {
	// 		"moduleName": params.moduleName,
	// 		"userId": tokenData.userId,
	// 		"userName": tokenData.name,
	// 		"userEmail": tokenData.email,
	// 		"targetEmail": params.targetEmail,
	// 		"targetId": params.targetId,
	// 		"targetName": params.targetName,
	// 		"message": params.message,
	// 		"crudAction": "UPDATE",
	// 		"actionType": config.CONSTANT.LOG_HISTORY_TYPE.EDIT,
	// 		"created": Date.now()
	// 	};
	// 	return await this.save("audit_logs", data);
	// }

	// async create(params, tokenData: TokenData) {
	// 	let data: AuditLogRequest.Add = {
	// 		"moduleName": params.moduleName,
	// 		"userId": tokenData.userId,
	// 		"userName": tokenData.name,
	// 		"userEmail": tokenData.email,
	// 		"targetEmail": params.targetEmail,
	// 		"targetId": params.targetId,
	// 		"targetName": params.targetName,
	// 		"message": params.message,
	// 		"crudAction": "CREATE",
	// 		"actionType": config.CONSTANT.LOG_HISTORY_TYPE.ADD,
	// 		"created": Date.now()
	// 	};
	// 	return await this.save("audit_logs", data);
	// }

	// async delete(params, tokenData: TokenData) {
	// 	let data: AuditLogRequest.Add = {
	// 		"moduleName": params.moduleName,
	// 		"userId": tokenData.userId,
	// 		"userName": tokenData.name,
	// 		"userEmail": tokenData.email,
	// 		"targetEmail": params.targetEmail,
	// 		"targetId": params.targetId,
	// 		"targetName": params.targetName,
	// 		"message": params.message,
	// 		"crudAction": "DELETE",
	// 		"actionType": config.CONSTANT.LOG_HISTORY_TYPE.DELETE,
	// 		"created": Date.now()
	// 	};
	// 	return await this.save("audit_logs", data);
	// }
	// async block(params, tokenData: TokenData) {
	// 	let data: AuditLogRequest.Add = {
	// 		"moduleName": params.moduleName,
	// 		"userId": tokenData.userId,
	// 		"userName": tokenData.name,
	// 		"userEmail": tokenData.email,
	// 		"targetEmail": params.targetEmail,
	// 		"targetId": params.targetId,
	// 		"targetName": params.targetName,
	// 		"message": params.message,
	// 		"crudAction": "BLOCK",
	// 		"actionType": config.CONSTANT.LOG_HISTORY_TYPE.BLOCK,
	// 		"created": Date.now()
	// 	};
	// 	return await this.save("audit_logs", data);
	// }
	// async unblock(params, tokenData: TokenData) {
	// 	let data: AuditLogRequest.Add = {
	// 		"moduleName": params.moduleName,
	// 		"userId": tokenData.userId,
	// 		"userName": tokenData.name,
	// 		"userEmail": tokenData.email,
	// 		"targetEmail": params.targetEmail,
	// 		"targetId": params.targetId,
	// 		"targetName": params.targetName,
	// 		"message": params.message,
	// 		"crudAction": "UNBLOCK",
	// 		"actionType": config.CONSTANT.LOG_HISTORY_TYPE.UNBLOCK,
	// 		"created": Date.now()
	// 	};
	// 	return await this.save("audit_logs", data);
	// }
}