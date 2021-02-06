"use strict";

const SWAGGER_DEFAULT_RESPONSE_MESSAGES = [
	{ code: 200, message: "OK" },
	{ code: 400, message: "Bad Request" },
	{ code: 401, message: "Unauthorized" },
	{ code: 404, message: "Data Not Found" },
	{ code: 500, message: "Internal Server Error" }
];

const HTTP_STATUS_CODE = {
	OK: 200,
	CREATED: 201,
	UPDATED: 202,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	PAYMENY_REQUIRED: 402,
	ACCESS_FORBIDDEN: 403,
	URL_NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	UNREGISTERED: 410,
	PAYLOAD_TOO_LARGE: 413,
	CONCURRENT_LIMITED_EXCEEDED: 429,
	// TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SHUTDOWN: 503
};

const ACCOUNT_LEVEL = {
	ADMIN: "admin",
	NORMAL_USER: "user",
	SUPER: "super"
};

const DB_MODEL_REF = {
	ADMIN: "admin",
	ADMIN_NOTIFICATION: "admin_notification",
	CONTENT: "content",
	NOTIFICATION: "notification",
	WEBNOTIFICATION: "web_notification",
	USER: "user",
	LOGIN_HISTORY: "login_history",
	VERSION: "version",
	VENDOR: "vendor",
	CAB: "cab",
	ROUTE: "cab_route",
	ROASTER: "roaster",
	TEMP_ROSTER: "temp_roster",
	ROASTER_HISTORY: "roaster_history",
	RESCHEDULE: "reschedule",
	USER_QUERY: "user_query",
	SUBSCRIPTION: "subscription",
	COMPANY_TYPE: "company_type",
	PERMISSION: "permission",
	SHIFT_REQUEST: "shift_request",
	UPDATED_ROUTES: "updated_routes",
	AUDIT_LOG: "audit_log",
};

const LOG_HISTORY_TYPE = {
	ADD: "CREATE",
	EDIT: "UPDATE",
	DELETE: "DELETE",
	BLOCK: "BLOCK",
	UNBLOCK: "UNBLOCK",
	ARCHIVE: "ARCHIVE",
};
const DEVICE_TYPE = {
	ANDROID: "1",
	IOS: "2",
	WEB: "3",
	ALL: "4"
};

const ADMIN_TYPE = {
	SUPER_ADMIN: "super",
	SUB_ADMIN: "sub",
	ADMIN: "admin",
};

const PAYMENT_TYPE = {
	CARD: "card",
	CASH: "cash",
	INVOICE: "invoice",
};
const MODULE_NAME = {
	// DASHBOARD: "Dashboard",
	ROUTE: "Route Management",
	ROSTER: "Roster Management",
	RTLS: "Live Screen",
	REQUEST: "Request Management",
	EMPLOYEE: "Employee Management",
	CAB: "Cab Management",
	DRIVER: "Driver Management",
	// BILLING: "Billing Management",
	// REPORT: "Report Management",
	NOTIFICATION: "Notification Management",
	VENDOR: "Vendor Management",
	TRIPHISTORY: "Trip History",
	AUDITLOG: "Audit Log",
	SHIFTMANAGEMENT: "User Shift Management",
};

const MODULE_KEY = {
	// DASHBOARD: "dashboard",
	ROUTE: "route",
	ROSTER: "roster",
	RTLS: "rtls",
	REQUEST: "request",
	EMPLOYEE: "employee",
	CAB: "cab",
	DRIVER: "driver",
	// BILLING: "billing",
	// REPORT: "report",
	NOTIFICATION: "notification",
	VENDOR: "vendor",
	TRIPHISTORY: "trip",
	AUDITLOG: "audit",
	SHIFTMANAGEMENT: "shift",
};

const SERVER_TYPE = {
	IN_HOUSE: "house",
	FLEET_SERVER: "fleet"
};
const NOTIFICATION_SCHEDULE_TYPE = {
	SEND_NOW: "sendNow",
	SEND_LATER: "sendLater"
};
const NOTIFICATION_AUDIENCE = {
	ALL: "all",
	DRIVER: "drivers",
	EMPLOYEE: "employees",
	ADMIN: "admin",
};

const GENDER = {
	MALE: "male",
	FEMALE: "female",
	OTHER: "other",
	ALL: "all"
};

const SOCIAL_LOGIN_TYPE = {
	FACEBOOK: "facebook",
	GOOGLE: "google",
	INSTA: "instagram",
	TWITTER: "twitter",
	LINKED_IN: "linkedin"
};

const STATUS = {
	BLOCKED: "blocked",
	UN_BLOCKED: "unblocked",
	DELETED: "deleted",
	APPROVED: "approved",
	UN_APPROVED: "unapproved",
	EXECUTED: "executed",
	UN_EXECUTED: "unexecuted",
	REJECTED: "rejected",
};

const REQUEST_STATUS = {
	EXPIRED: "expired",
	CURRENT: "current",
	REQUESTED: "requested",
	DELETED: "deleted"
};

const DRINK_STATUS = {
	REGULAR_DRUNKER: 1,
	RARE_DRUNKER: 2,
	NOT_DRUNKER: 3
};
const TRIP_TYPE = {
	OFFICE_TO_HOME: 1,
	HOME_TO_OFFICE: 2,
};
const SHIFT_TYPE = {
	LOGIN: 'login',
	LOGOUT: 'logout',
};
const TRIP_RANGE = {
	WEEKLY: 'weekly',
	MONTHLY: 'monthly',
};
const TRIP_STATUS = {
	TRIP_COMPLETED: 1,
	TRIP_ONGOING: 2,
	TRIP_SCHEDULED: 3,
	// Added TRIP_MISSED - Shivakumar A
	TRIP_MISSED: 4,
	// All Trip satyam
	ALL_TRIP: 5
};
const CAB_TYPE = {
	HATCHBACK: "hatchback",
	SUV: "SUV",
	SEDAN: "Sedan",
	TEMPOTRAVELLER: "Tempo Traveller",
	OTHER: "Other",
	// Added Medical Cab - Shivakumar A
	MEDICALCAB: "Medical Cab"
};

const FUEL_TYPE = {
	PETROL: "Petrol",
	DIESEL: "Diesel",
	CNG: "CNG",
};

const TRANSMISSION_TYPE = {
	MANUAL: "Manual",
	AUTOMATIC: "Automatic"
};

const VALIDATION_CRITERIA = {
	FIRST_NAME_MIN_LENGTH: 3,
	FIRST_NAME_MAX_LENGTH: 10,
	MIDDLE_NAME_MIN_LENGTH: 3,
	MIDDLE_NAME_MAX_LENGTH: 10,
	LAST_NAME_MIN_LENGTH: 3,
	LAST_NAME_MAX_LENGTH: 10,
	NAME_MIN_LENGTH: 3,
	COUNTRY_CODE_MIN_LENGTH: 1,
	COUNTRY_CODE_MAX_LENGTH: 4,
	PASSWORD_MIN_LENGTH: 3,
	PASSWORD_MAX_LENGTH: 30
};

const VALIDATION_MESSAGE = {
	firstName: {
		required: "Please enter first name.",
		minlength: `First name must be between ${VALIDATION_CRITERIA.FIRST_NAME_MIN_LENGTH}-${VALIDATION_CRITERIA.FIRST_NAME_MAX_LENGTH} characters.`,
		maxlength: `First name must be between ${VALIDATION_CRITERIA.FIRST_NAME_MIN_LENGTH}-${VALIDATION_CRITERIA.FIRST_NAME_MAX_LENGTH} characters.`
	},
	middleName: {
		minlength: `Middle name must be between ${VALIDATION_CRITERIA.MIDDLE_NAME_MIN_LENGTH}-${VALIDATION_CRITERIA.MIDDLE_NAME_MAX_LENGTH} characters.`,
		maxlength: `Middle name must be between ${VALIDATION_CRITERIA.MIDDLE_NAME_MIN_LENGTH}-${VALIDATION_CRITERIA.MIDDLE_NAME_MAX_LENGTH} characters.`
	},
	lastName: {
		minlength: `Last name must be between ${VALIDATION_CRITERIA.LAST_NAME_MIN_LENGTH}-${VALIDATION_CRITERIA.LAST_NAME_MAX_LENGTH} characters.`,
		maxlength: `Last name must be between ${VALIDATION_CRITERIA.LAST_NAME_MIN_LENGTH}-${VALIDATION_CRITERIA.LAST_NAME_MAX_LENGTH} characters.`
	},
	name: {
		required: "Please enter name.",
		minlength: `Last name must be between ${VALIDATION_CRITERIA.NAME_MIN_LENGTH}-${VALIDATION_CRITERIA.NAME_MIN_LENGTH} characters.`
	},
	cabModel: {
		required: "Please enter cab model.",
		minlength: `Cab model must be between ${VALIDATION_CRITERIA.NAME_MIN_LENGTH}-${VALIDATION_CRITERIA.NAME_MIN_LENGTH} characters.`
	},
	email: {
		required: "Please enter email address.",
		pattern: "Please enter a valid email address."
	},
	countryCode: {
		required: "Please enter country code.",
		pattern: "Please enter a valid country code.",
		minlength: `Country code must be between ${VALIDATION_CRITERIA.COUNTRY_CODE_MIN_LENGTH}-${VALIDATION_CRITERIA.COUNTRY_CODE_MAX_LENGTH} characters.`,
		maxlength: `Country code must be between ${VALIDATION_CRITERIA.COUNTRY_CODE_MIN_LENGTH}-${VALIDATION_CRITERIA.COUNTRY_CODE_MAX_LENGTH} characters.`
	},
	mobileNo: {
		required: "Please enter mobile number.",
		pattern: "Please enter a valid mobile number."
	},
	password: {
		required: "Please enter password.",
		pattern: "Please enter a valid password.",
		minlength: `Password must be between ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH}-${VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH} characters.`,
		maxlength: `Password must be between ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH}-${VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH} characters.`
	},
	oldPassword: {
		required: "Please enter old password.",
		minlength: `Old password must be between ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH}-${VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH} characters.`,
		maxlength: `Old password must be between ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH}-${VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH} characters.`
	},
	socialLoginType: {
		required: "Social login type is required."
	},
	status: {
		required: "Status is required."
	},
	file: {
		required: "File is required."
	},
	image: {
		required: "Image is required."
	},
	title: {
		required: "Please enter title."
	},
	link: {
		required: "Please enter link.",
		pattern: "Please enter a valid link."
	},
	message: {
		required: "Please enter message."
	},
	gender: {
		required: "Gender is required."
	},
	description: {
		required: "Please enter description."
	},
	type: {
		required: "Type is required."
	},
	refreshToken: {
		required: "Refresh token is required."
	},
	updateType: {
		required: "Version update type is required."
	},
	platform: {
		required: "Platform is required."
	},
	accessToken: {
		required: "Access token is required."
	},
	contentId: {
		required: "Content id is required.",
		pattern: "Please enter a valid content id."
	},
	notificationId: {
		required: "Notification id is required.",
		pattern: "Please enter a valid notification id."
	},
	userId: {
		required: "User id is required.",
		pattern: "Please enter a valid user id."
	},
	driverId: {
		required: "Driver id is required.",
		pattern: "Please enter a valid driver id."
	},
	rosterId: {
		required: "Roster id is required.",
		pattern: "Please enter a valid roster id."
	},
	cabId: {
		required: "Cab id is required.",
		pattern: "Please enter a valid cab id."
	},
	versionId: {
		required: "Version id is required.",
		pattern: "Please enter a valid version id."
	}
};

const MESSAGES = {
	ERROR: {
		UNAUTHORIZED_ACCESS: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "You are not authorized to perform this action.",
			"type": "UNAUTHORIZED_ACCESS"
		},
		INTERNAL_SERVER_ERROR: {
			"statusCode": HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
			"message": "Please try after some time.",
			"type": "INTERNAL_SERVER_ERROR"
		},
		INVALID_TOKEN: {
			"statusCode": 419,
			"message": "{{key}}.",
			"type": "INVALID_TOKEN"
		},
		TOKEN_EXPIRED: {
			"statusCode": 419,
			"message": "Token has been expired.",
			"type": "TOKEN_EXPIRED"
		},
		TOKEN_GENERATE_ERROR: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "{{key}}.",
			"type": "TOKEN_GENERATE_ERROR"
		},
		EMAIL_NOT_REGISTERED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Please register your email address.",
			"type": "EMAIL_NOT_REGISTERED"
		},
		BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Your account have been blocked by the admin.",
			"type": "USER_BLOCKED"
		},
		DELETED: {
			statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Your account have been deleted by the admin.",
			type: "DELETED"
		},
		INCORRECT_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"message": "Authentication failed, wrong password.",
			"type": "INCORRECT_PASSWORD"
		},
		USER_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.UNREGISTERED,
			"message": "User not found.",
			"type": "USER_NOT_FOUND"
		},
		ACCESS_DENIED: {
			"statusCode": HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"message": "Access denied.",
			"type": "ACCESS_DENIED"
		},
		INVALID_MOBILE_NUMBER: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Please enter valid mobile number.",
			"type": "INVALID_MOBILE_NUMBER"
		},
		BLOCKED_MOBILE: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Action blocked for illegal use of services.",
			"type": "BLOCKED_MOBILE"
		},
		PERMISSION_CHANGE: {
			statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Your permission has been changed by the admin.",
			type: "PERMISSION_CHANGE"
		},
		PASSWORD_CHANGE: {
			statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Session has been expired due to change password.",
			type: "PASSWORD_CHANGE"
		},
	},
	SUCCESS: {
		DEFAULT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Success",
			"type": "DEFAULT"
		},
		REFRESH_TOKEN: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"message": "Token refresh successfully",
				"type": "REFRESH_TOKEN",
				"data": data
			};
		}
	}
};

const EMAIL_TEMPLATE = {
	SOCIAL_LINK: {
		FB: "https://www.facebook.com",
		INSTAGRAM: "https://www.instagram.com",
		TWITTER: "https://twitter.com"
	},
	GSG_ADDRESS: "Appinventiv Technologies Pvt. Ltd. B-25 Nr Thomson Reuters, Sector 58, Noida, Uttar Pradesh 201301, India",
	SUBJECT: {
		FORGOT_PWD_EMAIL: "Reset Password Request",
		RESET_PASSWORD: "Reset password link",
		VERIFY_EMAIL: "Verify e-mail address",
		WECOME_GLIDAR: "Welcome to Commutev!",
		SIGNUP_PWD_EMAIL: "Login Credential",
	},
	BCC_MAIL: ["utkarsh.patil@translabinnovations.com"],
	FROM_MAIL: "donot-reply@commutev.com" // "do-not-reply@mail.appinventive.com"
};

const SMS = {
	TOKEN: "[TOKEN]",
	TEMPLATES: {
		FORGOT_PASSWORD: "Your forgot password link!\
		\nLINK\
		\n \
		\nRegards, \nFLEET app",
	}
};

const NOTIFICATION_TYPE = {
	BULK_NOTIFICATION: 1,
	ONE_TO_ONE: 2,
	DRIVER_START_RIDE: 3,
	DRIVER_REACHED_PICKUP_POINT: 4,
	ALL_OFBOARDED: 5,
	SOS_RESOLVED_BY_ADMIN: 6,
	TRIP_REQUEST_RESCHEDULE_BY_ADMIN: 7,
	TRIP_REQUEST_CANCEL_BY_ADMIN: 8,
	SEND_BY_ADMIN: 9,
	SOS_REJECTED_BY_ADMIN: 10,
	REQUEST_RESOLVED_BY_ADMIN: 11,
	REQUEST_REJECTED_BY_ADMIN: 12,
	ROSTER_EXPIRED_NOTIFIED: 13,
	TRIP_CANCEL_BY_EMPLOYEE: 14,
	CAB_CHANGED_OF_EMPLOYEE: 15,
	EMP_PICKUP_TIME_CHANGE: 16,
	SOS_NOTIFICATION_SEND_TO_ADMIN: 17,
	DRIVER_ABOUT_TO_REACHED: 18,
};
const NOTIFICATION_MESSAGE = {
	DRIVER_START_RIDE: 'Driver has started ride. You can track your driver and share this OTP to driver: ',
	EMPLOYEE_ONBOARD: 'Employee onboard successfully.',
	EMPLOYEE_NOT_REACHED: "EMployee not comming due to some reason.",
	DRIVER_REACHED_PICKUP_POINT: "Cab reached your location please contact to driver",
	ALL_OFBOARDED: 'Please mark you are safely ofboarded',
	SOS_RESOLVED_BY_ADMIN: 'Your SOS request closed by the admin.',
	SOS_REJECTED_BY_ADMIN: 'Your SOS request rejected by the admin.',
	REQUEST_RESOLVED_BY_ADMIN: 'Your request resolved by the admin.',
	REQUEST_REJECTED_BY_ADMIN: 'Your request rejected by the admin.',
	CANCELLED_RIDE: "Employee cancelled ride.",
	TRIP_REQUEST_RESCHEDULE_BY_ADMIN: "Trip reschedule request resolved",
	TRIP_REQUEST_CANCEL_BY_ADMIN: "Trip reschedule request rejected",
	TRIP_CANCEL_BY_EMPLOYEE: 'Trip canceled by employee.',
	CAB_CHANGE_OF_EMPLOYEE: 'Your cab has been changed today. Your new cab No-: ',
	PICKUP_TIME_CHANGE: 'Your pickup time has been changed. Your new pickup time-: ',
	DROP_TIME_CHANGE: 'Your drop time has been changed. Your new drop time-: ',
	DRIVER_ABOUT_TO_REACHED: 'Driver is about to reached your location'
};

const NOTIFICATION_TITLE = {
	DRIVER_START_RIDE: 'Driver started ride',
	DRIVER_REACHED_PICKUP_POINT: 'Driver reached',
	ALL_OFBOARDED: 'All Ofboarded',
	SOS_RESOLVED_BY_ADMIN: 'SOS resolved',
	SOS_REJECTED_BY_ADMIN: 'SOS rejected',
	TRIP_REQUEST_RESCHEDULE_BY_ADMIN: "Request resolved",
	TRIP_REQUEST_CANCEL_BY_ADMIN: "Request rejected",
	REQUEST_RESOLVED_BY_ADMIN: 'Request resolved.',
	REQUEST_REJECTED_BY_ADMIN: 'Request rejected.',
	TRIP_CANCEL_BY_EMPLOYEE: 'Trip canceled',
	CAB_CHANGE_OF_EMPLOYEE: 'Cab change',
	PICKUP_TIME_CHANGE: 'Pickup time change',
	DROP_TIME_CHANGE: 'Drop time change',
	DRIVER_ABOUT_TO_REACHED: 'Driver is about to reached'
};

const SNS_SERVER_TYPE = {
	DEV: "APNS_SANDBOX",
	PROD: "APNS"
};

const CONTENT_TYPE = {
	PRIVACY_POLICY: "1",
	TERMS_AND_CONDITIONS: "2",
	FAQ: "3",
	CONTACT_US: "4"
};

const MIME_TYPE = {
	XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	CSV1: "application/vnd.ms-excel",
	CSV2: "text/csv",
	XLS: "application/vnd.ms-excel"
};

const EXCEL_KEY_MAP = {
	"First Name": "firstName",
	"Middle Name": "middleName",
	"Last Name": "lastName",
	"DOB": "dob",
	"Gender": "gender",
	"Email": "email",
	"Country Code": "countryCode",
	"Mobile Number": "mobileNo",
	"Status": "status",
	// 'Company Reg 1':{'parent':'companyReg', 'child':'registration1'}
};

const REGEX = {
	EMAIL: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/,
	// EMAIL: /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	/* URL: /^(http?|ftp|https):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|\
		int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/, */
	URL: /^(https?|http|ftp|torrent|image|irc):\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i,
	SSN: /^(?!219-09-9999|078-05-1120)(?!666|000|9\d{2})\d{3}-(?!00)\d{2}-(?!0{4})\d{4}$/, // US SSN
	ZIP_CODE: /^[0-9]{5}(?:-[0-9]{4})?$/,
	PASSWORD: /(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9]).{8,}/, // Minimum 6 characters, At least 1 lowercase alphabetical character, At least 1 uppercase alphabetical character, At least 1 numeric character, At least one special character
	COUNTRY_CODE: /^\d{1,4}$/,
	MOBILE_NUMBER: /^\d{6,16}$/,
	STRING_REPLACE: /[-+ ()*_$#@!{}|\/^%`~=?,.<>:;'"]/g,
	MONGO_ID: /^[a-f\d]{24}$/i
};

const VERSION_UPDATE_TYPE = {
	NORMAL: "normal",
	SKIPPABLE: "skippable",
	FORCEFULLY: "forcefully"
};

const JOB_ASSIGNED = {
	ASSIGNED: 1,
	UNASSIGNED: 2,
};

// CRF & CANCELLATION CUTOFF TIME - Shivakumar A
const CUT_OFF_TIME = {
    CANCELLATION_CUTOFF: 12,
};

const EMP_PICKUP_STATUS = {
	NOACTION: 0,
	ONBOARDED: 1,
	CANCELLED: 2,
	RESCHEDULE: 3,
	NOSHOW: 4,
	STARTRIDE: 5,
	OFFBOARD: 6,
	DRIVER_REACHED: 7,
	EMP_SELF_OFFBOARD: 8,
	// empMissed - satyam
	MISSED: 9
};

const DRIVER_ASSIGNED = {
	ASSIGNED: "Assigned",
	UNASSIGNED: "Unassigned",
	UPDATE: "Update"
};

const USER_TYPE = {
	EMPLOYEE: 1,
	DRIVER: 2,
	ADMIN: 3,
	SUBADMIN: 4
};
const USER_QUERY_STATUS = {
	PENDING: 4,
	RESOLVED: 1,
	CANCELLED: 2,
	MARKSAFE: 3,
	REJECTED: 5,
};
const QUERY_TYPE = {
	SOS: 2,
	QUERY: 1,
	DEFAULT: 0
};
const TRIP_RESCHEDULE = {
	RESCHEDULE: 2,
	CANCELLED: 1,
};

const SOS_QUERY = {
	SOS_MESSAGE: "Please find SOS request and try to connect with him.",
};

const EXPORT_SHEET = {
	USER_LIST: [
		{ header: "S No.", key: "sno" },
		{ header: "First Name", key: "firstName", width: 32, outlineLevel: 1 },
		{ header: "Middle Name", key: "middleName", width: 32, outlineLevel: 1 },
		{ header: "Last Name", key: "lastName", width: 32, outlineLevel: 1 },
		{ header: "DOB", key: "dob", width: 32, outlineLevel: 1 },
		{ header: "Gender", key: "gender", width: 32, outlineLevel: 1 },
		{ header: "Email", key: "email", width: 32, outlineLevel: 1 },
		{ header: "Registration Date", key: "created", width: 32, outlineLevel: 1 },
		{ header: "Status", key: "status", width: 32, outlineLevel: 1 }
	]
};

const PUSH_SENDING_TYPE = {
	SNS: 1,
	FCM: 2,
	APNS: 3
};

const MAIL_SENDING_TYPE = {
	SENDGRID: 1,
	SMTP: 2,
	AMAZON: 3
};

const JOB_SCHEDULER_TYPE = {
	DRIVER_BEFORE_START_RIDE: "driver-before-ride-start",
	NOTIFICATION_SEND_LATER: "notification-send-later",
};

const DEEPLINK = {
	FALLBACK_URL: 'https://google.com',
	URL_DRIVER: 'fleetdriver://fleetdev.appskeeper.com/?user_id-',
	URL_EMP: 'fleetemp://fleetdev.appskeeper.com/?user_id-',
	IOSEMPLINK: 'fleetemp://userId@',
	EMAIL_VERIFY_IOSDRIVERLINK: 'fleetdriver://verify@',
	EMAIL_VERIFY_IOSEMPLINK: 'fleetemp://verify@',
	IOS_STORE_LINK: 'https://itunes.apple.com',
	ANDROID_DRIVER_PACKAGE_NAME: 'com.commutevdriver.translab',
	ANDROID_EMP_PACKAGE_NAME: 'com.commutevemployee.translab',
	ANDROID_FLEET_EMP_REDIRECT_LNK: 'fleetempredirect://fleetdev.appskeeper.com/?user_id-',
	ANDROID_FLEET_DRIVER_REDIRECT_LINK: 'fleetdriverredirect://fleetdev.appskeeper.com/?user_id-',
	IOS_FLEET_EMP_REDIRECT_LINK: 'fleetemp://verify@',
};

const STATUS_MSG = {
	ERROR: {
		DATA_NOT_FOUND: {
			statusCode: 401,
			type: "DATA_NOT_FOUND",
			message: "Result not data"
		},

		TOKEN_ALREADY_EXPIRED: {
			statusCode: 401,
			message: "Your login session expired!",
			type: "TOKEN_ALREADY_EXPIRED"
		},
		DB_ERROR: {
			statusCode: 400,
			message: "DB Error : ",
			type: "DB_ERROR"
		},

		INVALID_ID: {
			statusCode: 400,
			message: "Invalid Id Provided : ",
			type: "INVALID_ID"
		},

		APP_ERROR: {
			statusCode: 400,
			message: "Application Error",
			type: "APP_ERROR"
		},
		ADDRESS_NOT_FOUND: {
			statusCode: 400,
			message: "Address not found",
			type: "ADDRESS_NOT_FOUND"
		},
		SAME_ADDRESS_ID: {
			statusCode: 400,
			message: "Pickup and Delivery Address Cannot Be Same",
			type: "SAME_ADDRESS_ID"
		},
		APP_VERSION_ERROR: {
			statusCode: 400,
			message: "One of the latest version or updated version value must be present",
			type: "APP_VERSION_ERROR"
		},
		INVALID_TOKEN: {
			statusCode: 401,
			message: "Invalid token provided",
			type: "INVALID_TOKEN"
		},
		LINK_USED: {
			statusCode: 401,
			message: "Link is already used once.",
			type: "LINK_USED"
		},
		INVALID_CODE: {
			statusCode: 400,
			message: "Invalid Verification Code",
			type: "INVALID_CODE"
		},
		DEFAULT: {
			statusCode: 400,
			message: "Error",
			type: "DEFAULT"
		},
		DUPLICATE: {
			statusCode: 400,
			message: "Duplicate Entry",
			type: "DUPLICATE"
		},
		DUPLICATE_ADDRESS: {
			statusCode: 400,
			message: "Address Already Exist",
			type: "DUPLICATE_ADDRESS"
		}
	},
	SUCCESS: {
		DEFAULT: {
			statusCode: 200,
			message: "Success",
			type: "DEFAULT"
		}
	},
	SOCKET_ERROR: {
		FAILURE_ACKNOWLEDGEMENT: (listner) => {
			return {
				statusCode: 400,
				success: false,
				message: "Message not recveived on server.",
				type: "FAILURE_ACKNOWLEDGEMENT",
				listner: listner,
				result: {},
			};
		},
		LISTENER_TYPE_REQUIRED: {
			statusCode: 400,
			success: false,
			message: "Listener type is required.",
			type: "LISTENER_TYPE_REQUIRED",
			result: {},
		},
		INVALID_LISTENER_TYPE: {
			statusCode: 400,
			success: false,
			message: "Invalid Listener type.",
			type: "INVALID_LISTENER_TYPE",
			result: {},
		},
		AUTHORIZATION_ERROR: {
			statusCode: 400,
			success: false,
			message: "Error in authorization.",
			type: "AUTHORIZATION_ERROR",
			result: {},
		},
		CAB_ASSIGN_ERROR: {
			statusCode: 402,
			success: false,
			message: "Error Cab not assign yet. Without cab assign can't start ride.",
			type: "CAB_NOT_ASSIGN_ERROR",
			result: {},
		},
		TRIP_CANCELLED: {
			statusCode: 406,
			success: false,
			message: "Your current trip has been cancelled.",
			type: "TRIP_CANCELLED",
			result: {},
		},
		OTP_MATCH_ERROR: {
			statusCode: 405,
			success: false,
			message: "Error OTP not match.",
			type: "OTP_MATCH_ERROR",
			"data": {}
		},
		NETWORK_ERROR: {
			statusCode: 400,
			success: false,
			message: "Implementation error.",
			type: "NETWORK_ERROR",
			result: {},
		},
	},
};
// const SOCKET = {
// 	DEFAULT: {
// 		CONNECTION: 'connection',
// 		CONNECTED: 'connected',
// 		DISCONNECT: 'disconnect',
// 	},
// 	SERVICE: {
// 		NEW_USERS: 'new_users',
// 		SOCKET_ERROR: 'socket_error',
// 	},
// 	ERROR: {
// 		NETWORK_ERROR: 'network-error',
// 		SOCKET_ERROR: "socket-error",
// 	},
// };

const SOCKET = {
	DEFAULT: {
		CONNECTION: "connection",
		CONNECTED: "connected",
		DISCONNECT: "disconnect",
	},
	ERROR: {
		FAILURE_ACKNOWLEDGEMENT: (listner) => {
			return {
				"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
				"message": "Message not recveived on server.",
				"type": "FAILURE_ACKNOWLEDGEMENT",
				"data": {
					"listner": listner
				}
			};
		},
		INVALID_LISTENER_TYPE: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Invalid Listener type.",
			"type": "INVALID_LISTENER_TYPE",
			"data": {}
		},
		AUTHORIZATION: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Error in authorization.",
			"type": "AUTHORIZATION_ERROR",
			"data": {}
		},
		NETWORK: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Implementation error.",
			"type": "NETWORK_ERROR",
			"data": {}
		},
		SOCKET: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Socket Implementation error.",
			"type": "SOCKET_ERROR",
			"data": {}
		}
	},
	SUCCESS: {
		CONNECTION_ESTABLISHED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Connection Established",
			"data": {}
		},
		OPT_VERIFIED: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"message": "OTP verify successfully.",
				"data": data,
			};
		},
		CONTACT_SYNCING: (data) => {
			return {
				"statusCode": data.statusCode,
				"message": "Contacts synchronize successfully.",
				"type": "CONTACT_SYNCING",
				"data": {
					"contacts": data.contacts,
					"lastSno": data.lastSno
				}
			};
		}
	},
	EVENT: {
		NETWORK_ERROR: "network-error",
		SOCKET_ERROR: "socket-error",
		ACK_ERROR: "ack-error",
		INSUFFICIENT_INFO_ERROR: "insufficient-info",
		AUTHORIZATION_ERROR: "authorization-error",
		DRIVER_TRACKING: "driver-tracking", // add
		DRIVER_START_RIDE: "driver-start-ride",
		COMMON_ERROR: "common-error",
		DRIVER_REACHED_PICKUP_POINT: "driver-reached-pickup-point",
		DRIVER_OTP_VERIFY: "driver-otp-verify",
		EMPLOYEE_ONBOARD: "employee-onboard",
		EMPLOYEE_OFBOARD: "employee-offboard",
		MARK_NO_SHOW: "mark-no-show",
		ALL_OFFBOARDED: "all-offboarded",
		DRIVER_ALL_OFFBOARDED: "driver-all-offboarded",
		EMPLOYEE_OFFBOARDED: "employee-offboarded",
		EMPLOYEE_CANCEL_RIDE: "employee-cancel-ride",
		DRIVER_OFFBOARDED: "driver-offboarded",
		EMPLOYEE_HOME_OFFBOARDED: "employee-home-offboarded",
		ADMIN_ON_TRACKING_MAP: "admin-on-tracking-map",
		ADMIN_LEAVE_TRACKING_MAP: "admin-leave-tracking-map",
		ADMIN_TRACKING_DATA: "admin-tracking-data",
		ADMIN_NEW_RIDE_START: "admin-new-ride-start",
		ADMIN_ON_TRACKING: "admin-on-tracking",
		ADMIN_LEAVE_TRACKING: "admin-leave-tracking",
		ADMIN_TRACKING_CAB: "admin-tracking-cab",
	},
	ROOMS: {
		TRACKING_MAP_ROOM: "map-room",
		TRACKING_ROOM: "tracking-room",
	}
};

const DAY_TYPE = {
	MONDAY: 1,
	TUESDAY: 2,
	WEDNESDAY: 3,
	THURSDAY: 4,
	FRIDAY: 5,
	SATURDAY: 6,
	SUNDAY: 0
};

// const ROUTE_DATA = {
// 	MAX_GROUP_SIZE: 4,
// 	WAIT_TIME: 3,
// 	MAX_TRIP_DURATION: 90
// };

const CAB_BUFFER = 60; // cab buffer time in minutes

export const CONSTANT = Object.freeze({
	JOB_SCHEDULER_TYPE,
	NOTIFICATION_AUDIENCE,
	STATUS_MSG: STATUS_MSG,
	CAB_TYPE,
	FUEL_TYPE: FUEL_TYPE,
	TRANSMISSION_TYPE: TRANSMISSION_TYPE,
	SWAGGER_DEFAULT_RESPONSE_MESSAGES: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
	HTTP_STATUS_CODE: HTTP_STATUS_CODE,
	ACCOUNT_LEVEL: ACCOUNT_LEVEL,
	DB_MODEL_REF: DB_MODEL_REF,
	DEVICE_TYPE: DEVICE_TYPE,
	ADMIN_TYPE: ADMIN_TYPE,
	GENDER: GENDER,
	SOCIAL_LOGIN_TYPE: SOCIAL_LOGIN_TYPE,
	STATUS: STATUS,
	REQUEST_STATUS: REQUEST_STATUS,
	VALIDATION_CRITERIA: VALIDATION_CRITERIA,
	VALIDATION_MESSAGE: VALIDATION_MESSAGE,
	MESSAGES: MESSAGES,
	EMAIL_TEMPLATE: EMAIL_TEMPLATE,
	SMS: SMS,
	NOTIFICATION_TYPE: NOTIFICATION_TYPE,
	SNS_SERVER_TYPE: SNS_SERVER_TYPE,
	CONTENT_TYPE: CONTENT_TYPE,
	MIME_TYPE: MIME_TYPE,
	EXCEL_KEY_MAP: EXCEL_KEY_MAP,
	REGEX: REGEX,
	VERSION_UPDATE_TYPE: VERSION_UPDATE_TYPE,
	EXPORT_SHEET: EXPORT_SHEET,
	PUSH_SENDING_TYPE: PUSH_SENDING_TYPE,
	MAIL_SENDING_TYPE: MAIL_SENDING_TYPE,
	JOB_ASSIGNED: JOB_ASSIGNED,
	USER_TYPE: USER_TYPE,
	DEEPLINK: DEEPLINK,
	SOCKET: SOCKET,
	DRIVER_ASSIGNED,
	USER_QUERY_STATUS,
	DRINK_STATUS,
	TRIP_TYPE,
	EMP_PICKUP_STATUS,
	NOTIFICATION_MESSAGE,
	NOTIFICATION_TITLE,
	QUERY_TYPE,
	SOS_QUERY,
	TRIP_RESCHEDULE,
	TRIP_STATUS,
	PAYMENT_TYPE,
	SERVER_TYPE,
	NOTIFICATION_SCHEDULE_TYPE,
	MODULE_NAME,
	MODULE_KEY,
	DAY_TYPE,
	SHIFT_TYPE,
	// ROUTE_DATA,
	TRIP_RANGE,
	CAB_BUFFER,
	LOG_HISTORY_TYPE,
	// Added CUT_OFF_TIME - Shivakumar A
	CUT_OFF_TIME
});