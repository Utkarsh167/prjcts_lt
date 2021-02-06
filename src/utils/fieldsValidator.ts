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

let cabModel = {
	"minlength": Joi.string()
		.trim()
		.min(3)
		.required().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "string.min":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.cabModel["minlength"];
						break;
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.cabModel["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.cabModel["required"];
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
						err.message = config.CONSTANT.VALIDATION_MESSAGE.cabModel["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.cabModel["required"];
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

let description = {
	"required": Joi.string()
		.trim()
		.required().error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.description["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.description["required"];
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
let deviceId = Joi.string().allow("").optional().description("device id");

let deviceToken = Joi.string().allow("").optional().description("Device token");

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

let sosStatus = {
	"required": Joi.number()
		// .trim()
		// .lowercase({ force: true })
		.required()
		.valid([
			config.CONSTANT.USER_QUERY_STATUS.RESOLVED,
			// config.CONSTANT.USER_QUERY_STATUS.CANCELLED,
			config.CONSTANT.USER_QUERY_STATUS.PENDING,
			config.CONSTANT.USER_QUERY_STATUS.MARKSAFE
		])
		.description("Status => 'Resolved', 'Pending', 'mark safe' ").error(errors => {
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

	"optional": Joi.number()
		// .trim()
		// .lowercase({ force: true })
		.optional()
		.valid([
			config.CONSTANT.USER_QUERY_STATUS.RESOLVED,
			// config.CONSTANT.USER_QUERY_STATUS.CANCELLED,
			config.CONSTANT.USER_QUERY_STATUS.PENDING,
			config.CONSTANT.USER_QUERY_STATUS.MARKSAFE
		])
		.description("Status => 'Resolved', 'Pending', 'mark safe' ")
};

let rescheduleStatus = {
	"required": Joi.number()
		// .trim()
		// .lowercase({ force: true })
		.required()
		.valid([
			config.CONSTANT.USER_QUERY_STATUS.RESOLVED,
			config.CONSTANT.USER_QUERY_STATUS.CANCELLED,
			config.CONSTANT.USER_QUERY_STATUS.PENDING,
		])
		.description("Status => 'Accept','Cancel', 'Pending' ").error(errors => {
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

	"optional": Joi.number()
		// .trim()
		// .lowercase({ force: true })
		.optional()
		.valid([
			config.CONSTANT.USER_QUERY_STATUS.RESOLVED,
			config.CONSTANT.USER_QUERY_STATUS.CANCELLED,
			config.CONSTANT.USER_QUERY_STATUS.PENDING,
		])
		.description("Status => 'Accept','Cancel', 'Pending' ")
};

let fromDate = Joi.number().optional().description("in timestamp");

let toDate = Joi.number().optional().description("in timestamp");

// ids
let contentId = Joi.string()
	.trim()
	.regex(config.CONSTANT.REGEX.MONGO_ID)
	.required().error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "string.regex.base":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.contentId["pattern"];
					break;
				case "any.empty":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.contentId["required"];
					break;
				case "any.required":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.contentId["required"];
					break;
				default:
					break;
			}
		});
		return errors;
	});

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

	let vehicleId = Joi.string()
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

let driverId = Joi.string()
	.trim()
	.regex(config.CONSTANT.REGEX.MONGO_ID)
	.required().error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "string.regex.base":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.driverId["pattern"];
					break;
				case "any.empty":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.driverId["required"];
					break;
				case "any.required":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.driverId["required"];
					break;
				default:
					break;
			}
		});
		return errors;
	});
let cabId = Joi.string()
	.trim()
	.regex(config.CONSTANT.REGEX.MONGO_ID)
	.required().error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "string.regex.base":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.cabId["pattern"];
					break;
				case "any.empty":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.cabId["required"];
					break;
				case "any.required":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.cabId["required"];
					break;
				default:
					break;
			}
		});
		return errors;
	});
let rosterId = Joi.string()
	.trim()
	.regex(config.CONSTANT.REGEX.MONGO_ID)
	.required().error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "string.regex.base":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.rosterId["pattern"];
					break;
				case "any.empty":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.rosterId["required"];
					break;
				case "any.required":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.rosterId["required"];
					break;
				default:
					break;
			}
		});
		return errors;
	});
let shiftId = Joi.string()
	.trim()
	.regex(config.CONSTANT.REGEX.MONGO_ID)
	.optional().error(errors => {
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

let versionId = Joi.string()
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
// Added regNo validation Aashiq - 31/08/2020
let registrationNo1 = Joi.string()
	.trim()
	.regex(config.CONSTANT.REGEX.REGNO)
	.required().error(errors => {
		errors.forEach(err => {
			switch (err.type) {
				case "string.regex.base":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.regNo["pattern"];
					break;
				case "any.empty":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.regNo["required"];
					break;
				case "any.required":
					err.message = config.CONSTANT.VALIDATION_MESSAGE.regNo["required"];
					break;
				default:
					break;
			}
		});
		return errors;
	});
let shiftStartTime = Joi.number().optional().description("in timestamp");

let shiftEndTime = Joi.number().optional().description("in timestamp");
let userType = Joi.string().optional().description("Employee, guest");

// let driverId = Joi.string().required().description("Driver id");
let sosId = Joi.string().required().description("SOs id");
let rescheduleId = Joi.string().required().description("reschedule Id");
let employeeId = Joi.string().required().description("Employee id");
let regNo = Joi.string().required().description("Registration number");
let vehicleType = Joi.string().required().description("Vehcile type");
let modal = Joi.string().required().description("Vehcile modal");
let pickuplat = Joi.number().optional().description("Pick up location");
let longitude = Joi.number().optional().description("longitude");
let latitude = Joi.number().optional().description("latitude");
let pickuplong = Joi.number().optional().description("Pick up location");
let dropofflong = Joi.number().required().description("Pick up location");
let dropofflat = Joi.number().required().description("Pick up location");
let dropoff = Joi.string().optional().description("dropoff up location");
let userpassword = Joi.string().trim().required().description("Login password for user from app");
let userOldPassword = Joi.string().trim().required().description("Change password for user from app");
let dropupAddress = Joi.string().required().description("Company address");
let pickupAddress = Joi.string().required().description("Pick up address");
let documents = Joi.array().optional().items({
	type: Joi.string().required().label("Documents Name"),
	frontImageUrl: Joi.string().required().label("Front image url"),
	rearImageUrl: Joi.string().optional().allow("").label("rear image url"),
});
let employees = Joi.array().required().items({
	empId: Joi.string().required().label("Employee id"),
	pickupTime: Joi.number().required().label("Pick up time"),
	dropTime: Joi.number().required().label("Drop up time"),
});
let tripType = Joi.number().required().valid([
	config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE,
	config.CONSTANT.TRIP_TYPE.OFFICE_TO_HOME,
]).description("trip type home to office 2 office to home 1");
let shiftType = Joi.number().optional().valid([
	config.CONSTANT.SHIFT_TYPE.LOGIN,
	config.CONSTANT.SHIFT_TYPE.LOGOUT,
]).description("login and logout");
let shiftDasboardType = Joi.number().required().valid([
	config.CONSTANT.SHIFT_TYPE.LOGIN,
	config.CONSTANT.SHIFT_TYPE.LOGOUT,
]).description("login and logout");
let tripStatus = Joi.number().allow("").optional().valid([
	config.CONSTANT.TRIP_STATUS.TRIP_COMPLETED,
	config.CONSTANT.TRIP_STATUS.TRIP_ONGOING,
	config.CONSTANT.TRIP_STATUS.TRIP_SCHEDULED,
	// Added Trip missed to validator - Shivakumar A
	config.CONSTANT.TRIP_STATUS.TRIP_MISSED,
]).description("Completed 1 ongoing 2");
let routeName = Joi.string().required("Route name");
let routeId = Joi.string().required().description("route id for route update");
let seatingCapacity = Joi.number().required().description("Cab seating capacity");
let vendorId = Joi.string().trim().optional().label("Vendor id");
let driverIds = Joi.string().trim().optional().label("driver id");
let color = Joi.string().trim().allow("").optional().label("Cab Color");
let statepermitNumber = Joi.string().allow("").optional().label("Cab state permit no");
let registrationNo = Joi.string().trim().allow("").required().label("Cab registration nos");
let countrypermitNumber = Joi.string().allow("").optional().label("Cab state permit no");
let assigned = Joi.boolean().optional().label("Driver assigned filter");
let isAddressChange = Joi.boolean().required().label("Home address change request then true");
let capacity = Joi.number().optional().description("Cab seating capacity");
let driverShift = Joi.number().optional().description("Driver shift");
let drunker = Joi.number().optional().valid([
	config.CONSTANT.DRINK_STATUS.REGULAR_DRUNKER,
	config.CONSTANT.DRINK_STATUS.RARE_DRUNKER,
	config.CONSTANT.DRINK_STATUS.NOT_DRUNKER
]).description("drunk");
let alcoholic = Joi.boolean().description("alcoholic");
let tobacco = Joi.boolean().description("tobacco");
let backgroundVarified = Joi.boolean().description("backgroundVarified");
let dlRenewalDate = Joi.number().description("dlRenewalDate");
let DlBadgeNO = Joi.string().description("DlBadgeNO");
// CAb module
let cabType = Joi.string().required().valid([
	config.CONSTANT.CAB_TYPE.HATCHBACK,
	config.CONSTANT.CAB_TYPE.SEDAN,
	config.CONSTANT.CAB_TYPE.SUV,
	config.CONSTANT.CAB_TYPE.TEMPOTRAVELLER,
	config.CONSTANT.CAB_TYPE.OTHER,
	// Added Medical Cab - Shivakumar A
	config.CONSTANT.CAB_TYPE.MEDICALCAB,
]).description("Cab type");
let fuelType = Joi.string().required().valid([
	config.CONSTANT.FUEL_TYPE.DIESEL,
	config.CONSTANT.FUEL_TYPE.PETROL,
]).description("Cab type");
let transmissionType = Joi.string().required().valid([
	config.CONSTANT.TRANSMISSION_TYPE.AUTOMATIC,
	config.CONSTANT.TRANSMISSION_TYPE.MANUAL,
]).description("Cab type");
let ac = Joi.boolean().optional().description("driverOnly");
let panicButton = Joi.boolean().optional().description("driverOnly");
let toolKit = Joi.boolean().optional().description("toolKit");
let spareWheel = Joi.boolean().optional().description("spareWheel");
let firstAidKit = Joi.boolean().optional().description("firstAidKit");
let torchAmbrella = Joi.boolean().optional().description("torchAmbrella");
let fireExtingusher = Joi.boolean().optional().description("fireExtingusher");
let interiorExterior = Joi.boolean().optional().description("interiorExterior");
let driverOnly = Joi.boolean().optional().description("driverOnly");
let driverOwner = Joi.boolean().optional().description("driverOwner false or true");
let allIndiaPermitForm = Joi.string().allow("").optional().description("allIndiaPermitForm documents");
let statePermitForm = Joi.string().allow("").optional().description("statePermitForm documents");
let insurance = Joi.string().optional().allow("").description(" insurance documents");
let roadTax = Joi.string().allow("").optional().description("roadTax documents");
let fitnessCertificate = Joi.string().allow("").optional().description("fitnessCertificate documents");
let rgsCertificate = Joi.string().allow("").optional().description("rgsCertificate documents");
let companyIssuance = Joi.string().allow("").optional().description("aggrementCopy documents");
let aggrementCopy = Joi.string().allow("").optional().description("aggrementCopy documents");
let routeNo = Joi.string().optional().description("Route no");
let cabImage = Joi.string().optional().description("cabImage");
let houseNo = Joi.string().optional().allow("").description("Home no");
let roadName = Joi.string().optional().allow("").description("Home roadName");
let city = Joi.string().optional().allow("").description("Home city");
let state = Joi.string().optional().allow("").description("Home state");
let landMark = Joi.string().optional().allow("").description("Home landMark");
let query = Joi.string().required().description("User query");
let spot_id = Joi.string().required().description("Spot Id");
let bookingRequestedAt = Joi.number().required().description("Requested time of booking");
let floorName = Joi.string().required().description("floor name");
let zoneName = Joi.string().required().description("zone name");
let shiftTime = Joi.array().optional().items({
	// startShift: Joi.number().required().label("Shift start time"),
	// endShift: Joi.number().required().label("Shift end time"),
	shiftName: Joi.string().required().label("Shift Name"),
	startShift: Joi.string().label("Shift start time"),
	endShift: Joi.string().required().label("Shift end time"),
	weekOff: Joi.array().required().label("Company weekOff")
}).label("Company shift time slot");
let validTill = Joi.number().allow("").optional("Roaster valid till");
let validFrom = Joi.number().allow("").optional("Roaster valid from");
let driverMapped = Joi.string().trim().required().valid([
	config.CONSTANT.DRIVER_ASSIGNED.ASSIGNED,
	config.CONSTANT.DRIVER_ASSIGNED.UNASSIGNED,
	config.CONSTANT.DRIVER_ASSIGNED.UPDATE
]).description("Driver mapping => 'Assigned', 'Unassigned'");
let scheduleTime = Joi.number().allow("").optional().description("in timestamp");
let companyCode = Joi.string().trim().required().description("Company code");
let moduleName = Joi.array().items({
	moduleName: Joi.string().required().valid([
		// config.CONSTANT.MODULE_NAME.DASHBOARD,
		config.CONSTANT.MODULE_NAME.ROSTER,
		config.CONSTANT.MODULE_NAME.ROUTE,
		// config.CONSTANT.MODULE_NAME.BILLING,
		config.CONSTANT.MODULE_NAME.CAB,
		config.CONSTANT.MODULE_NAME.DRIVER,
		config.CONSTANT.MODULE_NAME.EMPLOYEE,
		config.CONSTANT.MODULE_NAME.NOTIFICATION,
		// config.CONSTANT.MODULE_NAME.REPORT,
		config.CONSTANT.MODULE_NAME.REQUEST,
		config.CONSTANT.MODULE_NAME.VENDOR,
		config.CONSTANT.MODULE_NAME.RTLS,
		config.CONSTANT.MODULE_NAME.TRIPHISTORY,
		config.CONSTANT.MODULE_NAME.AUDITLOG,
		config.CONSTANT.MODULE_NAME.SHIFTMANAGEMENT,
	]),
	moduleKey: Joi.string().required().valid([
		// config.CONSTANT.MODULE_KEY.DASHBOARD,
		config.CONSTANT.MODULE_KEY.ROSTER,
		config.CONSTANT.MODULE_KEY.ROUTE,
		// config.CONSTANT.MODULE_KEY.BILLING,
		config.CONSTANT.MODULE_KEY.CAB,
		config.CONSTANT.MODULE_KEY.DRIVER,
		config.CONSTANT.MODULE_KEY.EMPLOYEE,
		config.CONSTANT.MODULE_KEY.NOTIFICATION,
		// config.CONSTANT.MODULE_KEY.REPORT,
		config.CONSTANT.MODULE_KEY.REQUEST,
		config.CONSTANT.MODULE_KEY.VENDOR,
		config.CONSTANT.MODULE_KEY.RTLS,
		config.CONSTANT.MODULE_KEY.TRIPHISTORY,
		config.CONSTANT.MODULE_KEY.SHIFTMANAGEMENT,
		config.CONSTANT.MODULE_KEY.AUDITLOG,
	]),
});
let contactNumber = Joi.array().optional().items({
	phoneNumber: Joi.string().required().label("Mobile number"),
});
let paymentType = Joi.string().trim().required().valid([
	config.CONSTANT.PAYMENT_TYPE.CASH,
	config.CONSTANT.PAYMENT_TYPE.CARD,
	config.CONSTANT.PAYMENT_TYPE.INVOICE,
]).description("payment type card/cash or invoice");
let serverType = Joi.string().trim().required().valid([
	config.CONSTANT.SERVER_TYPE.FLEET_SERVER,
	config.CONSTANT.SERVER_TYPE.IN_HOUSE,
]).description("serverType");
let notificationScheduleType = Joi.string().trim().required().valid([
	config.CONSTANT.NOTIFICATION_SCHEDULE_TYPE.SEND_LATER,
	config.CONSTANT.NOTIFICATION_SCHEDULE_TYPE.SEND_NOW,
]).description("Send now or send later");
let notificationAudience = Joi.string().trim().optional().valid([
	config.CONSTANT.NOTIFICATION_AUDIENCE.ALL,
	config.CONSTANT.NOTIFICATION_AUDIENCE.DRIVER,
	config.CONSTANT.NOTIFICATION_AUDIENCE.EMPLOYEE
]).description("Send to drover or employee or all");
let tripRange = Joi.string().trim().required().valid([
	config.CONSTANT.TRIP_RANGE.WEEKLY,
	config.CONSTANT.TRIP_RANGE.MONTHLY,
]).description("Trip range");
// Cab module
export let fieldsValidator = {
	notificationAudience,
	notificationScheduleType,
	companyCode,
	serverType,
	paymentType,
	contactNumber,
	sosId,
	rescheduleStatus,
	rescheduleId,
	isAddressChange,
	validFrom,
	validTill,
	routeId,
	routeName,
	tripType,
	shiftType,
	tripRange,
	employees,
	drunker,
	DlBadgeNO,
	alcoholic,
	dlRenewalDate,
	backgroundVarified,
	tobacco,
	ac,
	cabImage,
	panicButton,
	driverOnly,
	spareWheel,
	toolKit,
	firstAidKit,
	torchAmbrella,
	fireExtingusher,
	interiorExterior,
	driverOwner,
	statePermitForm,
	allIndiaPermitForm,
	insurance,
	fitnessCertificate,
	rgsCertificate,
	roadTax,
	companyIssuance,
	routeNo,
	aggrementCopy,
	transmissionType,
	fuelType,
	query,
	dropupAddress,
	houseNo,
	roadName,
	city,
	state,
	landMark,
	cabType,
	registrationNo,
	driverShift,
	statepermitNumber,
	countrypermitNumber,
	driverMapped,
	shiftTime,
	capacity,
	assigned,
	color,
	userType,
	pickupAddress,
	userpassword,
	userOldPassword,
	driverId,
	employeeId,
	pickuplat,
	pickuplong,
	dropofflat,
	dropofflong,
	shiftStartTime,
	shiftEndTime,
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
	description,
	type,
	accessToken,
	refreshToken,
	updateType,
	documents,
	deviceId,
	deviceToken,
	platform,
	regNo,
	vehicleType,
	modal,
	pageNo,
	limit,
	sortOrder,
	status,
	fromDate,
	toDate,
	contentId,
	notificationId,
	userId,
	vehicleId,
	cabId,
	versionId,
	seatingCapacity,
	driverIds,
	vendorId,
	shiftId,
	cabModel,
	longitude,
	latitude,
	sosStatus,
	scheduleTime,
	tripStatus,
	subscriptionId,
	moduleName,
	rosterId,
	shiftDasboardType,
	registrationNo1,
	spot_id,
	bookingRequestedAt,
	floorName,
	zoneName
};
