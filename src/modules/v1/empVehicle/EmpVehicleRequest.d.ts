
declare interface Documents {
	frontImageUrl?: string;
	rearImageUrl?: string;
	type?: string;
}
declare interface Dropoff {
	address?: string;
	longitude?: string;
	latitude?: string;
	_id?: string;
}

declare interface Pickup {
	address: string;
	coordinates: Coordinates;
	type?: string;
}
declare interface DriverSignupRequest extends TokenData {
	email: string;
	password: string;
	countryCode?: string;
	mobileNo?: string;
	name?: string;
	createdAt?: number;
	created?: number;
	driverId?: string;
	profilePicture?: string;
	userType?: string;
	createdBy?: string;
	type?: string;
	documents?: [Documents];
	badgeNo?: number;
	dropoff?: Address;
	companyCode?: string;
	file?: string;
}
declare interface DriverUpdateRequest extends TokenData {
	countryCode?: string;
	userId?: string;
	mobileNo?: string;
	name?: string;
	driverId?: string;
	profilePicture?: string;
	emergencyNo?: string;
	drunker?: number;
	alcoholic?: boolean;
	tobacco?: boolean;
	backgroundVarified?: boolean;
	dlRenewalDate?: number;
	DlBadgeNO?: string;
	documents?: [Documents];
}
declare interface EmpSignupRequest extends TokenData {
	email?: string;
	password?: string;
	contactNo?: string;
	// countryCode?: string;
	// mobileNo?: string;
	name: string;
	created?: number;
	employeeId: string;
	createdAt?: number;
	companyId: string;
	companyLocationName: string;
	// gender?: string;
	profilePicture?: string;
	// userType?: string;
	createdBy?: string;
	type?: string;
	vehicles?: Vehicle[];
}

declare interface VehicleSignUpRequest extends TokenData {
	file: string;
}

declare interface EmpUpdateRequest extends TokenData {
	countryCode?: string;
	password?: string;
	mobileNo?: string;
	name: string;
	employeeId?: string;
	gender?: string;
	profilePicture?: string;
	// shiftStartTime?: number;
	// shiftEndTime?: number;
	isAddressChangeReq?: boolean;
	pickup?: Address;
	shift?: string;
	empId?: string;
	latitude: number;
	longitude: number;
	homeAddress: string;
	houseNo: string;
	roadName: string;
	city: string;
	state: string;
	landMark: string;
	fullAddress: string;
	email: string;
	isEmailChange: boolean;
	hash?: string;
	vehicles?: VehicleUpdateRequest[];
	// Added guestValidity Aashiq - 24/08/2020
	guestValidity: string;
}

declare interface LoginRequest extends Device {
	email?: string;
	password: string;
	hash?: string;
	userType?: number;
}

declare interface SocialLoginRequest extends Device {
	email?: string;
	password?: string;
	countryCode?: string;
	mobileNo?: string;
	firstName: string;
	middleName: string;
	lastName: string;
	socialLoginType: string;
	facebookId: string;
	isFacebookLogin: boolean;
	googleId: string;
	isGoogleLogin: boolean;
	socialId: string;
	dob: number;
	age: number;
}

declare interface MultiBlockRequest extends TokenData {
	userIds?: UserIds;
	status: string;
}

declare interface DeleteRequest extends TokenData { }

declare interface ImportUsersRequest extends TokenData {
	file: any;
}

declare interface HomeAddressRequest extends TokenData {
	isAddressChange?: boolean;
	longitude?: number;
	latitude?: number;
	houseNo?: string;
	roadName?: string;
	city?: string;
	state?: string;
	landMark?: string;
	estimatedTime?: number;
	distance?: number;
	distKm?: string;
	durationMinute?: string;
	// To get fullAddress - Shivakumar A
	fullAddress: string;
}
declare interface UserQueryRequest extends TokenData {
	query?: string;
	profilePicture?: string;
	userEmpId?: number;
	queryType?: number;
	// Added seen & gender - Shivakumar A
	seen?: boolean;
	gender?: string;
}
declare interface EmpBulkSignupRequest extends TokenData {
	file: string;
}

declare interface EmpShiftListing extends Pagination, TokenData {
	searchKey: string;
	sortBy: string;
	sortOrder: number | string;
	// status?: string;
	// name?: string;
}
declare interface EmpShiftUpdateRequest extends TokenData {
	employeeId: string;
	shiftName?: string;
	weekOff?: [number];
}
declare interface IsEmployee extends TokenData {
	empId?: string;
}
declare interface IsAddressChangeRequest extends TokenData {
	actionType?: string;
	empId?: string;
}
declare interface IsMobileNoUnique extends TokenData {
	mobileNo?: string;
}

declare interface IsRegistrationNoUnique {
	registrationNo?: string;
	registrationNo2?: string;

}

// satyam -- employee for group
declare interface EmployeeForGroupRequest extends TokenData {
	employeesIds: [string];
	empId: string;
	shift: string;
}
// vehicle list satyam
declare interface VehicleListForUser {
	userId?: string;
}