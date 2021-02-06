"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	ERROR: {
		EMAIL_ALREADY_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "User with this email is already registered.",
			"type": "EMAIL_ALREADY_EXIST"
		},
	},
	SUCCESS: {
		ALGO_DATA: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Algo data fetched successfully.",
				"type": "ALGO_DATA",
				"data": data
			};
		},
	}
};