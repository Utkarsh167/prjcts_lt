"use strict";

/**
 * v1 routes
 */
// admin routes
import { adminRoute as adminRouteV1 } from "@modules/v1/admin/adminRoute";
// admin notification routes
import { adminNotificationRoute as adminNotificationRouteV1 } from "@modules/v1/adminNotification/adminNotificationRoute";
// user routes
import { commonRoute as commonRouteV1 } from "@modules/v1/shared/commonRoute";

// notification routes
import { notificationRoute as notificationRouteV1 } from "@modules/v1/notification/notificationRoute";
// user routes
import { userRoute as userRouteV1 } from "@modules/v1/user/userRoute";

// Vendor routes
import { vendorRoute as vendorRouteV1 } from "@modules/v1/vendor/vendorRoute";
// Cab routes
import { cabRoute as cabRouteV1 } from "@modules/v1/cab/cabRoute";
// cab route routes
import { routesRoute as cabsRouteV1 } from "@modules/v1/route/cabsRoute";
// Roaster
import { roasterRoute as roasterRouteV1 } from "@modules/v1/roaster/roasterRoute";
// Contact to admin for any query or sos
import { sosRoute as sosRouteV1 } from "@modules/v1/contactToAdmin/sosRoute";
// Shift change reqest
import { shiftRequestRoute as shiftRequestRouteV1 } from "@modules/v1/shiftRequest/shiftRequestRoute";
// Employee can trip cancel and rescheduled
import { rescheduleRoute as rescheduleV1 } from "@modules/v1/rescheduleRide/rescheduleRoute";
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
			return [].concat(adminRouteV1, adminNotificationRouteV1, commonRouteV1, notificationRouteV1, userRouteV1, vendorRouteV1, cabRouteV1, cabsRouteV1, roasterRouteV1, sosRouteV1, rescheduleV1, shiftRequestRouteV1);
	}
};

// routes = [].concat(baseRoute);