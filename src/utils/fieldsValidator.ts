"use strict";

import * as Joi from "joi";

import * as config from "@config/index";
import { join } from "path";

// fields
let firstName = Joi.string()
	.trim()
	.min(config.CONSTANT.VALIDATION_CRITERIA.FIRST_NAME_MIN_LENGTH)
	.max(config.CONSTANT.VALIDATION_CRITERIA.FIRST_NAME_MAX_LENGTH)
	.required().error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "string.min":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.firstName["minlength"];
					break;
				case "string.max":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.firstName["maxlength"];
					break;
				case "any.empty":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.firstName["required"];
					break;
				case "any.required":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.firstName["required"];
					break;
				default:
					break;
			}
		});
		return errors;
	});

let middleName = Joi.string()
	.trim()
	.min(config.CONSTANT.VALIDATION_CRITERIA.MIDDLE_NAME_MIN_LENGTH)
	.max(config.CONSTANT.VALIDATION_CRITERIA.MIDDLE_NAME_MAX_LENGTH)
	.optional().error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "string.min":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.middleName["minlength"];
					break;
				case "string.max":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.middleName["maxlength"];
					break;
				default:
					break;
			}
		});
		return errors;
	});

let lastName = Joi.string()
	.trim()
	.min(config.CONSTANT.VALIDATION_CRITERIA.LAST_NAME_MIN_LENGTH)
	.max(config.CONSTANT.VALIDATION_CRITERIA.LAST_NAME_MAX_LENGTH)
	.optional().error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "string.min":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.lastName["minlength"];
					break;
				case "string.max":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.lastName["maxlength"];
					break;
				default:
					break;
			}
		});
		return errors;
	});

let name = {
	"minlength": Joi.string()
		.trim()
		.min(3)
		.required().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "string.min":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.name["minlength"];
						break;
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.name["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.name["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"!minlength": Joi.string()
		.trim()
		.required().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.name["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.name["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		})
};

let email = {
	"required": Joi.string()
		.trim()
		.lowercase({ force: true })
		.email({ minDomainAtoms: 2 })
		.regex(config.CONSTANT.REGEX.EMAIL)
		.required().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "string.email":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.email["pattern"];
						break;
					case "string.regex.base":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.email["pattern"];
						break;
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.email["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.email["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.string()
		.trim()
		.lowercase({ force: true })
		.email({ minDomainAtoms: 2 })
		.regex(config.CONSTANT.REGEX.EMAIL)
		.optional().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "string.email":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.email["pattern"];
						break;
					case "string.regex.base":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.email["pattern"];
						break;
					default:
						break;
				}
			});
			return errors;
		})
};

let countryCode = {
	"required": Joi.string()
		.trim()
		.regex(config.CONSTANT.REGEX.COUNTRY_CODE)
		.min(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MIN_LENGTH)
		.max(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MAX_LENGTH)
		.required().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "string.regex.base":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.countryCode["pattern"];
						break;
					case "string.min":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.countryCode["minlength"];
						break;
					case "string.max":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.countryCode["maxlength"];
						break;
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.countryCode["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.countryCode["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.string()
		.trim()
		.regex(config.CONSTANT.REGEX.COUNTRY_CODE)
		.min(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MIN_LENGTH)
		.max(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MAX_LENGTH)
		.optional().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "string.regex.base":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.countryCode["pattern"];
						break;
					case "string.min":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.countryCode["minlength"];
						break;
					case "string.max":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.countryCode["maxlength"];
						break;
					default:
						break;
				}
			});
			return errors;
		})
};

let mobileNo = {
	"required": Joi.string()
		.trim()
		.regex(config.CONSTANT.REGEX.MOBILE_NUMBER)
		.required().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "string.regex.base":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.mobileNo["pattern"];
						break;
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.mobileNo["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.mobileNo["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.string()
		.trim()
		.regex(config.CONSTANT.REGEX.MOBILE_NUMBER)
		.optional().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "string.regex.base":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.mobileNo["pattern"];
						break;
					default:
						break;
				}
			});
			return errors;
		})
};

let password = {
	"required":
		Joi.string()
			.trim()
			// .regex(config.CONSTANT.REGEX.PASSWORD)
			.min(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
			.max(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
			.default("String@123")
			.required().error(errors => {
				errors.forEach(err => {
					switch (err.type) {
						// case "string.regex.base":
						// 	err.message = config.CONSTANT.VALIDATION_MESSAGE.password["pattern"];
						// 	break;
						case "string.min":
							err.message = config.CONSTANT.VALIDATION_MESSAGE.password["minlength"];
							break;
						case "string.max":
							err.message = config.CONSTANT.VALIDATION_MESSAGE.password["maxlength"];
							break;
						case "any.empty":
							err.message = config.CONSTANT.VALIDATION_MESSAGE.password["required"];
							break;
						case "any.required":
							err.message = config.CONSTANT.VALIDATION_MESSAGE.password["required"];
							break;
						default:
							break;
					}
				});
				return errors;
			}),

	"optional":
		Joi.string()
			.trim()
			// .regex(config.CONSTANT.REGEX.PASSWORD)
			.min(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
			.max(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
			.default("String@123")
			.optional().error(errors => {
				errors.forEach(err => {
					switch (err.type) {
						// case "string.regex.base":
						// 	err.message = config.CONSTANT.VALIDATION_MESSAGE.password["pattern"];
						// 	break;
						case "string.min":
							err.message = config.CONSTANT.VALIDATION_MESSAGE.password["minlength"];
							break;
						case "string.max":
							err.message = config.CONSTANT.VALIDATION_MESSAGE.password["maxlength"];
							break;
						default:
							break;
					}
				});
				return errors;
			}),

	"required-!pattern":
		Joi.string()
			.trim()
			.min(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
			.max(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
			.default("String@123")
			.required().error(errors => {
				errors.forEach(err => {
					switch (err.type) {
						case "string.min":
							err.message = config.CONSTANT.VALIDATION_MESSAGE.password["minlength"];
							break;
						case "string.max":
							err.message = config.CONSTANT.VALIDATION_MESSAGE.password["maxlength"];
							break;
						case "any.empty":
							err.message = config.CONSTANT.VALIDATION_MESSAGE.password["required"];
							break;
						case "any.required":
							err.message = config.CONSTANT.VALIDATION_MESSAGE.password["required"];
							break;
						default:
							break;
					}
				});
				return errors;
			}),

	"optional-!default":
		Joi.string()
			.trim()
			// .regex(config.CONSTANT.REGEX.PASSWORD)
			.min(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
			.max(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
			.optional().error(errors => {
				errors.forEach(err => {
					switch (err.type) {
						// case "string.regex.base":
						// 	err.message = config.CONSTANT.VALIDATION_MESSAGE.password["pattern"];
						// 	break;
						case "string.min":
							err.message = config.CONSTANT.VALIDATION_MESSAGE.password["minlength"];
							break;
						case "string.max":
							err.message = config.CONSTANT.VALIDATION_MESSAGE.password["maxlength"];
							break;
						default:
							break;
					}
				});
				return errors;
			}),
};

let oldPassword = Joi.string()
	.trim()
	.min(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
	.max(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
	.default("String@123")
	.required().error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "string.min":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.oldPassword["minlength"];
					break;
				case "string.max":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.oldPassword["maxlength"];
					break;
				case "any.empty":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.oldPassword["required"];
					break;
				case "any.required":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.oldPassword["required"];
					break;
				default:
					break;
			}
		});
		return errors;
	});

let permission = Joi.array().optional();

let gender = {
	"required": Joi.string()
		.trim()
		.lowercase({ force: true })
		.required()
		.valid([
			config.CONSTANT.GENDER.MALE,
			config.CONSTANT.GENDER.FEMALE,
			config.CONSTANT.GENDER.OTHER
		])
		.description("male, female, other").error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.gender["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.gender["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.string()
		.trim()
		.lowercase({ force: true })
		.optional()
		.valid([
			config.CONSTANT.GENDER.MALE,
			config.CONSTANT.GENDER.FEMALE
		])
};

let profilePicture = Joi.string().optional().allow("").label("Image");

let file = {
	"required": Joi.any()
		.meta({ swaggerType: "file" })
		.required()
		.description("file exprension .csv|.xlsx|.xls").error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.file["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.file["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.any()
		.meta({ swaggerType: "file" })
		.optional()
		.description("file exprension .csv|.xlsx|.xls")
};

let image = {
	"required": Joi.any()
		.meta({ swaggerType: "file" })
		.required()
		.description("Image file").error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.image["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.image["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.any()
		.meta({ swaggerType: "file" })
		.optional()
		.description("Image file")
};

let title = {
	"required": Joi.string()
		.trim()
		.required().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.title["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.title["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.string()
		.trim()
		.optional()
};

let link = {
	"required": Joi.string()
		.trim()
		.regex(config.CONSTANT.REGEX.URL)
		.required().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "string.regex.base":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.link["pattern"];
						break;
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.link["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.link["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.string()
		.trim()
		.regex(config.CONSTANT.REGEX.URL)
		.optional().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "string.regex.base":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.link["pattern"];
						break;
				}
			});
			return errors;
		})
};

let message = {
	"required": Joi.string()
		.trim()
		.required().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.message["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.message["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.string()
		.trim()
		.optional()
};

let appPlatform = {
	"required": Joi.string()
		.trim()
		.required()
		.valid([
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
			config.CONSTANT.DEVICE_TYPE.ALL
		])
		.description("device OS '1'-Android, '2'-iOS, '4'-all").error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.platform["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.platform["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.string()
		.trim()
		.optional()
		.valid([
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
			config.CONSTANT.DEVICE_TYPE.ALL
		])
		.description("device OS '1'-Android, '2'-iOS, '4'-all")
};

let type = {
	"required": Joi.string()
		.trim()
		.valid([
			config.CONSTANT.CONTENT_TYPE.CONTACT_US,
			config.CONSTANT.CONTENT_TYPE.FAQ,
			config.CONSTANT.CONTENT_TYPE.PRIVACY_POLICY,
			config.CONSTANT.CONTENT_TYPE.TERMS_AND_CONDITIONS
		])
		.required()
		.description("'1'-Privacy Policy, '2'-Terms & Conditions, '3'-FAQ, '4'-Contact Us").error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.type["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.type["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.string()
		.trim()
		.valid([
			config.CONSTANT.CONTENT_TYPE.CONTACT_US,
			config.CONSTANT.CONTENT_TYPE.FAQ,
			config.CONSTANT.CONTENT_TYPE.PRIVACY_POLICY,
			config.CONSTANT.CONTENT_TYPE.TERMS_AND_CONDITIONS
		])
		.optional()
		.description("'1'-Privacy Policy, '2'-Terms & Conditions, '3'-FAQ, '4'-Contact Us")
};

let accessToken = Joi.string()
	.required()
	.description("access token of (admin/user)").error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "any.empty":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.accessToken["required"];
					break;
				case "any.required":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.accessToken["required"];
					break;
				default:
					break;
			}
		});
		return errors;
	});

let refreshToken = {
	"required": Joi.string()
		.trim()
		.required().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.refreshToken["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.refreshToken["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.string()
		.trim()
		.optional()
};

let updateType = Joi.string()
	.trim()
	.required()
	.valid([
		config.CONSTANT.VERSION_UPDATE_TYPE.NORMAL,
		config.CONSTANT.VERSION_UPDATE_TYPE.FORCEFULLY,
		config.CONSTANT.VERSION_UPDATE_TYPE.SKIPPABLE
	]).error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "any.empty":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.updateType["required"];
					break;
				case "any.required":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.updateType["required"];
					break;
				default:
					break;
			}
		});
		return errors;
	});

// device
let deviceId = Joi.string().trim().required();

let deviceToken = Joi.string().trim().required();

let platform = {
	"required": Joi.string()
		.trim()
		.required()
		.valid([
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
			config.CONSTANT.DEVICE_TYPE.WEB
		])
		.description("device OS '1'-Android, '2'-iOS, '3'-WEB").error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.platform["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.platform["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.string()
		.trim()
		.optional()
		.valid([
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
			config.CONSTANT.DEVICE_TYPE.WEB
		])
		.description("device OS '1'-Android, '2'-iOS, '3'-WEB")
};

// listing
let pageNo = Joi.number().required().description("Page no");

let limit = Joi.number().required().description("limit");

let sortOrder = Joi.number().optional().description("1 for asc, -1 for desc");

let status = {
	"required": Joi.string()
		.trim()
		.lowercase({ force: true })
		.required()
		.valid([
			config.CONSTANT.STATUS.BLOCKED,
			config.CONSTANT.STATUS.UN_BLOCKED
		])
		.description("Status => 'blocked', 'unblocked'").error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.status["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.status["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.string()
		.trim()
		.lowercase({ force: true })
		.optional()
		.valid([
			config.CONSTANT.STATUS.BLOCKED,
			config.CONSTANT.STATUS.UN_BLOCKED
		])
		.description("Status => 'blocked', 'unblocked'")
};
let duration = {
	"required": Joi.string()
		.trim()
		.lowercase({ force: true })
		.required()
		.valid([
			config.CONSTANT.DURATION.MONTHLY,
			config.CONSTANT.DURATION.WEEKLY,
			config.CONSTANT.DURATION.YEARLY
		])
		.description("Duration => 'weekly', 'monthly', 'yearly'").error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.status["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.status["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		}),

	"optional": Joi.string()
		.trim()
		.lowercase({ force: true })
		.optional()
		.valid([
			config.CONSTANT.DURATION.MONTHLY,
			config.CONSTANT.DURATION.WEEKLY,
			config.CONSTANT.DURATION.YEARLY
		])
		.description("Status => 'weekly', 'monthly', 'yearly'")
};
let fromDate = Joi.number().optional().description("in timestamp");

let toDate = Joi.number().optional().description("in timestamp");

let notificationId = Joi.string()
	.trim()
	.regex(config.CONSTANT.REGEX.MONGO_ID)
	.required().error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "string.regex.base":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.notificationId["pattern"];
					break;
				case "any.empty":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.notificationId["required"];
					break;
				case "any.required":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.notificationId["required"];
					break;
				default:
					break;
			}
		});
		return errors;
	});

let userId = Joi.string()
	.trim()
	.regex(config.CONSTANT.REGEX.MONGO_ID)
	.required().error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "string.regex.base":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.userId["pattern"];
					break;
				case "any.empty":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.userId["required"];
					break;
				case "any.required":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.userId["required"];
					break;
				default:
					break;
			}
		});
		return errors;
	});

let subscriptionId = Joi.string()
	.trim()
	.regex(config.CONSTANT.REGEX.MONGO_ID)
	.required().error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "string.regex.base":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.versionId["pattern"];
					break;
				case "any.empty":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.versionId["required"];
					break;
				case "any.required":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.versionId["required"];
					break;
				default:
					break;
			}
		});
		return errors;
	});
let companyId = Joi.string()
	.trim()
	.regex(config.CONSTANT.REGEX.MONGO_ID)
	.required().error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "string.regex.base":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.companyId["pattern"];
					break;
				case "any.empty":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.companyId["required"];
					break;
				case "any.required":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.companyId["required"];
					break;
				default:
					break;
			}
		});
		return errors;
	});

let shiftStartTime = Joi.number().optional().description("in timestamp");

let shiftEndTime = Joi.number().optional().description("in timestamp");
let userType = Joi.number().required().description("1=Employee, 2= Driver");

let longitude = Joi.number().optional().description("longitude");
let latitude = Joi.number().optional().description("latitude");
let userpassword = Joi.string().trim().required().description("Login password for user from app");
let userOldPassword = Joi.string().trim().required().description("Change password for user from app");
let shiftTime = Joi.array().optional().items({
	startShift: Joi.number().required().label("Shift start time"),
	endShift: Joi.number().required().label("Shift end time"),
}).label("Company shift time slot");
let validTill = Joi.number().allow("").optional("Roaster valis till");
let validFrom = Joi.number().allow("").optional("Roaster valis from");
let driverMapped = Joi.string().trim().required().valid([
	config.CONSTANT.DRIVER_ASSIGNED.ASSIGNED,
	config.CONSTANT.DRIVER_ASSIGNED.UNASSIGNED
]).description("Driver mapping => 'Assigned', 'Unassigned'");
let scheduleTime = Joi.number().optional().description("in timestamp");
let companyCode = Joi.string().trim().required().description("Company code");
let contactNumber = Joi.array().optional().items({
	phoneNumber: Joi.string().required().label("Mobile number"),
});
let companyType = Joi.string().trim().optional().description("Company type id");
let audience = Joi.string().required().description("audience for send notification");
let paymentType = Joi.string().trim().required().valid([
	config.CONSTANT.PAYMENT_TYPE.CASH,
	config.CONSTANT.PAYMENT_TYPE.CARD,
	config.CONSTANT.PAYMENT_TYPE.INVOICE,
]).description("payment type card/cash or invoice");
let serverType = Joi.string().trim().required().valid([
	config.CONSTANT.SERVER_TYPE.FLEET_SERVER,
	config.CONSTANT.SERVER_TYPE.IN_HOUSE,
]).description("serverType");
// Cab module
export let fieldsValidator = {
	companyCode,
	audience,
	serverType,
	paymentType,
	contactNumber,
	validFrom,
	validTill,
	shiftTime,
	userType,
	userpassword,
	userOldPassword,
	name,
	email,
	countryCode,
	mobileNo,
	password,
	oldPassword,
	permission,
	gender,
	profilePicture,
	file,
	image,
	title,
	link,
	message,
	appPlatform,
	type,
	accessToken,
	refreshToken,
	updateType,
	deviceId,
	deviceToken,
	platform,
	pageNo,
	limit,
	sortOrder,
	status,
	fromDate,
	toDate,
	notificationId,
	userId,
	longitude,
	latitude,
	scheduleTime,
	subscriptionId,
	companyId,
	duration,
	companyType
};