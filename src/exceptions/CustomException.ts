"use strict";

import * as config from "@config/constant";
import { Exception } from "@utils/Exception";
import * as empVehicleConstant from "@modules/v1/empVehicle/empVehicleConstant";

export class CustomException {

	constructor() { }

	tokenGenerateException(error: any) {
		return new Exception({
			statusCode: config.CONSTANT.MESSAGES.ERROR.TOKEN_GENERATE_ERROR.statusCode,
			message: config.CONSTANT.MESSAGES.ERROR.TOKEN_GENERATE_ERROR.message.replace("{{key}}", error),
			type: config.CONSTANT.MESSAGES.ERROR.TOKEN_GENERATE_ERROR.type
		});
	}
	invalidTokenException(error: any) {
		return new Exception({
			statusCode: config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN.statusCode,
			message: config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN.message.replace("{{key}}", error),
			type: config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN.type
		});
	}
	unauthorizedAccessException() {
		return new Exception(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
	}
	accessDeniedException() {
		return new Exception(config.CONSTANT.MESSAGES.ERROR.ACCESS_DENIED);
	}
	userNotFoundException() {
		return new Exception(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
	}
	blockedException() {
		return new Exception(config.CONSTANT.MESSAGES.ERROR.BLOCKED);
	}
	deletedException() {
		return new Exception(config.CONSTANT.MESSAGES.ERROR.DELETED);
	}
	sessionExpiredException() {
		return new Exception(empVehicleConstant.MESSAGES.ERROR.SESSION_EXPIRED);
	}
	permissionChangedByAdmin() {
		return new Exception(config.CONSTANT.MESSAGES.ERROR.PERMISSION_CHANGE);
	}
	passwordChangedBySelf() {
		return new Exception(config.CONSTANT.MESSAGES.ERROR.PASSWORD_CHANGE);
	}
}