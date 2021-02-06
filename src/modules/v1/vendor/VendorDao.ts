"use strict";

import * as _ from "lodash";
import * as promise from "bluebird";
import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/constant";
import * as vendorConstant from "@modules/v1/vendor/vendorConstant";
import { promises } from "fs";

export class VendorDao extends BaseDao {

	/**
	 * @function Vendorsignup
	 */
	async vendorSignup(params: VendorSignupRequest) {
		try {
			params.createdAt = new Date().getTime();
			return await this.save("vendors", params);
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function bulkVendoSignup
	 */
	async bulkVendoSignup(params) {
		console.log('paaraamss: ', params);
		return await this.insertMany("vendors", params, { new: true });
	}

	/**
	 * @function findVendorByEmail
	 */
	// check if email already exists

	async isEmailAlreadyExists(params: VendorSignupRequest) {
		try {
			let query: any = {};

			query.email = params.email;
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

			let projection: any = {};

			let options: any = {};

			let isExist = await this.findOne("vendors", query, projection, options);

			if (isExist) {
				return Promise.reject(vendorConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
			} else {
				return config.CONSTANT.STATUS_MSG.SUCCESS.DEFAULT;
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editVendorProfile
	 */
	async editVendor(params: VendorUpdateRequest) {
		try {
			let query: any = {};
			let query1: any = {};
			query1['vendor._id'] = params.userId;
			query._id = params.userId;
			let update: any = {};
			update["$set"] = {
				"name": params.name
			};
			if (params.profilePicture) {
				update.profilePicture = params.profilePicture;
			}
			if (params.mobileNo) {
				update.mobileNo = params.mobileNo;
			}
			if (params.countryCode) {
				update.countryCode = params.countryCode;
			}
			let options = { new: true };
			let update1: any = {};
			update1["$set"] = {
				"vendor.name": params.name,
				"vendor.profilePicture": params.profilePicture,
				"vendor.mobileNo": params.mobileNo,
				"vendor.countryCode": params.countryCode
			};
			let option: any = { multi: true };
			let response1 = this.updateMany("cabs", query1, update1, option);
			let response2 = this.findOneAndUpdate("vendors", query, update, options);
			let responce = await promise.join(response1, response2);
			return responce[1];
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function vendorList
	 */
	async vendorList(params: ListingRequest) {
		try {
			let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, userType, isArchived } = params;
			let aggPipe = [];

			let match1: any = {};
			// if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN) {
			// Added Subadmin Access - Shivakumar A
			if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {

				if (isArchived) {
					match1 = { "$and": [{ "status": { "$eq": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
				} else {
					match1 = { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
				}
			} else {
				if (isArchived) {
					match1 = {
						"$and": [{ "status": { "$eq": config.CONSTANT.STATUS.DELETED } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.SUB_ADMIN } },
						{ "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyCode": { "$eq": params.companyCode } }]
					};
				} else {
					match1 = {
						"$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.SUB_ADMIN } },
						{ "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyCode": { "$eq": params.companyCode } }]
					};
				}
			}
			// match = { "$and": [{ "adminType": { "$ne": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN } }, { "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyCode": { "$eq": params.companyCode } }] };
			aggPipe.push({ "$match": match1 });
			// let match1: any = {};
			// match1.status = { "$ne": config.CONSTANT.STATUS.DELETED };
			// aggPipe.push({ "$match": match1 });

			let match2 = {};
			if (searchKey) {
				match2["$or"] = [
					{ "name": { "$regex": searchKey, "$options": "-i" } },
					{ "email": { "$regex": searchKey, "$options": "-i" } },
					{ "mobileNo": { "$regex": searchKey, "$options": "-i" } },
					{ "badgeNo": { "$regex": searchKey, "$options": "-i" } },
				];
				aggPipe.push({ "$match": match2 });
			}
			let match3: any = {};
			if (status) {
				match3.status = { "$eq": status };
				aggPipe.push({ "$match": match3 });
			}

			let match4: any = {};
			if (fromDate && !toDate) {
				match4.created = { "$gte": fromDate };
				aggPipe.push({ "$match": match4 });
			}

			let match5: any = {};
			if (toDate && !fromDate) {
				match5.created = { "$lte": toDate };
				aggPipe.push({ "$match": match5 });
			}

			let match6: any = {};
			if (fromDate && toDate) {
				match6.created = { "$gte": fromDate, "$lte": toDate };
				aggPipe.push({ "$match": match6 });
			}
			let sort = {};
			if (sortBy && sortOrder) {
				if (sortBy === "name") {
					sort = { "name": sortOrder };
				} else if (sortBy === "vendorId") {
					sort = { "badgeNo": sortOrder };
				} else {
					sort = { "created": sortOrder };
				}
			} else {
				sort = { "createdAt": -1 };
			}
			aggPipe.push({ "$sort": sort });
			if (pageNo && limit) {
				let skip = (pageNo - 1) * limit;
				aggPipe.push({ "$skip": skip });
				aggPipe.push({ "$limit": limit });

			}
			let project = {
				// Added comment by satyam - reasonForArchive
				_id: 1, name: 1, email: 1, countryCode: 1, mobileNo: 1, created: 1, status: 1, badgeNo: 1, adminType: 1, profilePicture: 1, cabCount: 1, comment: 1
			};
			aggPipe.push({ "$project": project });
			let option = { collation: { locale: "en", strength: 2 } };
			let response: any = {};
			let userList = this.aggregate("vendors", aggPipe, {});
			let totalCount = this.count('vendors', { ...match1, ...match2, ...match3, ...match4, ...match5, ...match6 });
			response = Promise.all([userList, totalCount]);
			return response;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function vendorListing
	 */
	async vendorListing(params: ListingRequest) {
		try {
			let { searchKey } = params;
			let aggPipe = [];

			let match: any = {};
			match = { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "companyCode": { "$eq": params.companyCode } }] };
			if (searchKey) {
				match["$or"] = [
					{ "name": { "$regex": searchKey, "$options": "-i" } }
				];
			}
			aggPipe.push({ "$match": match });
			let project = {
				_id: 1, name: 1,
			};
			aggPipe.push({ "$project": project });
			let response: any = {};
			response = await this.aggregate("vendors", aggPipe, {});
			return response;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function blockUnblock
	 */
	async blockUnblock(params: BlockRequest) {
		try {
			let query: any = {};
			query._id = params.userId;

			let update = {};
			update["$set"] = {
				status: params.status
			};

			let options = { new: true };

			return await this.findOneAndUpdate("vendors", query, update, options);
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function deleteVendor
	 */
	async deleteVendor(params: DeleteRequest) {
		try {
			let query: any = {};
			query._id = params.userId;

			let update = {};
			// reasonForArchive
			// update["$set"] = {
			// 	status: config.CONSTANT.STATUS.DELETED
			// };
			if ( params.comment ) {
				update["$set"] = {
					status: config.CONSTANT.STATUS.DELETED,
					comment: params.comment,
				};
			} else {
				update["$set"] = {
					status: config.CONSTANT.STATUS.DELETED,
				};
			}

			let options = { new: true };

			return await this.findOneAndUpdate("vendors", query, update, options);
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function findVendorById
	 */
	async findVendorById(params: UserId) {
		try {
			let query: any = {};
			query._id = params.userId;
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

			return await this.findOne("vendors", query, {}, {});
		} catch (error) {
			throw error;
		}
	}

}