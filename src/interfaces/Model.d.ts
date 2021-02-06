declare interface UserId {
	userId?: string;
}
declare interface CompanyId {
	companyId?: string;
}

declare interface CompanyCode extends TokenData {
	companyCode?: string;
}

declare interface SosId {
	sosId?: string;
}

declare interface RescheduleId {
	rescheduleId?: string;
}
declare interface CabId {
	cabId?: string;
}

declare interface Device extends UserId {
	platform?: string;
	deviceId?: string;
	deviceToken?: string;
	refreshToken?: string;
	accessToken?: string;
	remoteAddress?: string;
	arn?: string;
	salt?: string;
}

declare interface TokenData extends UserId {
	socialLoginType?: string;
	socialId?: string;
	email?: string;
	name?: string;
	firstName?: string;
	middleName?: string;
	lastName?: string;
	countryCode?: string;
	mobileNo?: string;
	platform?: string;
	deviceId?: string;
	salt?: string;
	permission?: string[];
	accountLevel?: string;
	adminType?: string;
	created?: number;
	userType?: number;
	cabId?: string;
	sosId?: string;
	subscriptionId?: string;
	driverTripType?: number;
	companyId?: string;
}

declare interface ForgotPasswordRequest {
	email?: string;
	userType?: number;
}

declare interface ChangeForgotPasswordRequest extends TokenData {
	password: string;
	hash?: string;
}

declare interface ChangePasswordRequest extends TokenData {
	password: string;
	oldPassword: string;
	salt?: string;
	hash?: string;
}

declare interface ChangeUserPasswordRequest extends TokenData {
	password: string;
	oldPassword: string;
	salt?: string;
	hash?: string;
	userId?: string;
}

declare interface Pagination {
	pageNo?: number;
	limit?: number;
}

declare interface Filter {
	searchKey: string;
	sortBy: string;
	sortOrder: number | string;
	status?: string;
	fromDate?: number;
	toDate?: number;
	userType?: number;
	vendorId?: string;
	driverId?: string;
	assigned?: boolean;
	seatingCapacity?: number;
	tripStatus?: number;
	duration?: string;
	companyType?: string;
	type?: string;
}

declare interface RefreshTokenRequest extends TokenData {
	refreshToken?: string;
}

declare interface UserIds {
	[index: string]: string;
}

declare interface Coordinates {
	[index: number]: number;
}

declare interface Address {
	address: string;
	type?: string;
	coordinates: Coordinates;
}

declare interface Empaddroute {
	empId: string;
	pickupTime?: number;
	dropTime?: number;
	status: number;
}

declare interface LoginAttempts {
	remoteAddress: string;
	platform: string;
}
declare interface ShiftSlot {
	startShift: number;
	endShift: number;
}

declare interface Permission {
	[index: string]: string;
}

declare interface ListingRequest extends Pagination, Filter, TokenData { }

declare interface ResetPasswordRequest extends TokenData {
	accessToken?: string;
}
declare interface BlockRequest extends TokenData {
	status: string;
}

// Model Type For DAO manager
declare type ModelNames =
	"admins" |
	"admin_notifications" |
	// "contents" |
	"login_histories" |
	"web_notifications" |
	// "users" |
	// "versions" |
	// "vendors" |
	// "user_querys" |
	// "cabs" |
	// "roasters" |
	// "roaster_histories" |
	// "reschedules" |
	"subscriptions" |
	// "cab_routes" |
	"company_types";