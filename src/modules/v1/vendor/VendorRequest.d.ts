declare interface VendorSignupRequest extends TokenData {
	email: string;
	countryCode?: string;
	mobileNo?: string;
	name?: string;
	createdAt?: number;
	created?: number;
	profilePicture?: string;
	createdBy?: string;
	adminType?: string;
	badgeNo?: string;
	companyCode?: string;
	file: string;
}
declare interface VendorUpdateRequest extends TokenData {
	countryCode?: string;
	mobileNo?: string;
	name?: string;
	profilePicture?: string;
}