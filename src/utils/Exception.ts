"use strict";

import * as Boom from "boom";

export class Exception {

	constructor(error: any) {
		let self: any = {};
		let err = new Error();
		let errorToSend = Boom.boomify(err, { statusCode: error.statusCode });
		errorToSend.statusCode = error.statusCode;
		errorToSend.output.statusCode = error.statusCode;
		errorToSend.output.payload = {
			...error
		};
		self = errorToSend;
		return self;
	}
}