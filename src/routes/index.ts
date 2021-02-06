"use strict";

/**
 * v1 routes
 */

// Algo routes
import { algoRoute as algoRouteV1 } from "@modules/v1/algo/algoRoute";
// simple routing
let baseRoute = [
	{
		method: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
		path: "/{path*}",
		handler: function (request, h) {
			return { "message": "Hello from pramod" };
		}
	}
];

export let routes = (version) => {
	switch (version) {
		case "v1":
			return [].concat(algoRouteV1);
	}
};
