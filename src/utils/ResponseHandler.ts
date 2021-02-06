"use strict";

import * as Boom from "boom";
import * as Hapi from "hapi";

import { APIResponse } from "@utils/APIResponse";
import { logger } from "@lib/logger";

export class ResponseHandler {

	constructor() { }

	_sendResponse(h: Hapi.ResponseToolkit, result: any) {
		// send status code 200 and 201
		return h.response(result);
	}

	sendError(error: any) {
		console.log("fromresponsehandler", error);
		if (!error.statusCode) {
			// console.log("ERROR OCCURED=========>", error);
			logger.error("Unhandled error=======>", error);
		}
		let errorToSend;
		if (error.statusCode) { // handled error
			if (!error.output) {
				errorToSend = Boom.badRequest(error);
				errorToSend.output.statusCode = error.statusCode;
				errorToSend.output.payload = {
					...error
				};
			} else {
				// errorToSend = error.output.payload;
				errorToSend = Boom.badRequest(errorToSend);
				errorToSend.output.statusCode = error.output.statusCode;
				errorToSend.output.payload = {
					...error.output.payload
				};
			}
		} else { // unhaldled error'
			errorToSend = Boom.badRequest(error);
		}
		return errorToSend;
	}

	handleError(error: any) {
		// unhandled error
		this.sendError(error);
	}

	sendSuccess(h: Hapi.ResponseToolkit, result: any) {
		result = new APIResponse(result);
		return this._sendResponse(h, result);
	}

	sendSuccessForVideo(h, result: any) {
		// result = new APIResponse(result);
		return this._sendResponse(h, result);
	}

	sendSuccessWithMsg(h: Hapi.ResponseToolkit, message: any) {
		const result = { message: message };
		return this._sendResponse(h, result);
	}
}