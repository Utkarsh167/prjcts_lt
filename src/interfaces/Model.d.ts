declare interface UserId {
	userId?: string;
	companyId?: string;
	vehicleId?: string;
}

declare interface RosetrId {
	userId?: string;
	companyCode?: string;
	rosterId?: string;
}

declare interface SosId {
	sosId?: string;
}
declare interface ReaquestId {
	requestId?: string;
}

declare interface RescheduleId {
	rescheduleId?: string;
}
declare interface CabId {
	cabId?: string;
}
declare interface RouteId {
	routeId?: string;
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

declare interface VehicleInfoManual {
    reg_no?: string;
    name?: string;
    purposeOfVisit?: string;
    estimatedParkingDuration?: number;
    visitorId?: string;
    visitorIdType?: string;
    contactNo?: string;
    vehcileType?: string;
	email?: string;
	companyLocationName?: string;
}

declare interface TokenData extends UserId {
	// socialLoginType?: string;
	// socialId?: string;
	email?: string;
	companyId?: string;
	name?: string;
	// firstName?: string;
	// middleName?: string;
	// lastName?: string;
	// countryCode?: string;
	// mobileNo?: string;
	contactNo?: string;
	platform?: string;
	deviceId?: string;
	salt?: string;
	permission?: string[];
	// accountLevel?: string;
	type?: string;
	created?: number;
	// userType?: string;
	// cabId?: string;
	// sosId?: string;
	// requestId?: string;
	// subscriptionId?: string;
	// driverTripType?: number;
	// companyType?: string;
	// companyCode?: string;
	createdBy?: string;
	subAdminId?: string;
	// totalCount?: number;
	employeeId?: string;
	// driverId?: string;
	// rosterId?: string;
	// Added gender - Shivakumar A
	// gender?: string;
	companyLocationName?: string;
}

declare interface ForgotPasswordRequest {
	email?: string;
	type?: number;
}

declare interface ChangeForgotPasswordRequest extends TokenData {
	password: string;
	hash?: string;
}

declare interface Vehicle {
	regNo?: string;
	companyId?: string;
	modal?: string;
	vehicleType?: string;
	userId?: string;
	status?: string;
	comapnyId?: string;
	createdBy?: string;
	created?: number;
}

declare interface VehicleUpdateRequest {
	vehicleId: string;
	regNo?: string;
	companyId?: string;
	modal?: string;
	vehicleType?: string;
	userId?: string;
	status?: string;
	comapnyId?: string;
	createdBy?: string;
	created?: number;
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
	searchKey?: string;
	sortBy?: string;
	sortOrder?: number | string;
	status?: string;
	requestedPage?: string;
	fromDate?: number;
	toDate?: number;
	scheduleFromDate?: number;
	scheduleToDate?: number;
	userType?: string;
	vendorId?: string;
	driverId?: string;
	assigned?: boolean;
	seatingCapacity?: number;
	tripStatus?: number;
	shiftType?: string;
	tripRange?: string;
	shiftName?: string;
	isAddressChangeReq?: boolean;
	isArchived?: boolean;
	// FromCancelled , newCabBadgeId - Shivakumar A
	FromCancelled?: boolean;
	newCabBadgeId?: string;
	vehicleType?: string;
	companyLocationName?: string;
	// added by - satyam
	compLocationName?: string;
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

declare interface CreateCompanyDetailsRequest {
	code: string;
	name: string;
	address: string;
	locations: LocationDetails[];
}

declare interface DisplaySettings {
	code: string;
	name: string;
	address: string;
	locations: LocationDetails[];
}

declare interface AddressDetails {
	fullAddress?: string;
	lat?: string;
	lng?: string;
}

declare interface LocationDetails {
	name?: string;
	key?: string;
	parqueryValue?: string;
	address: AddressDetails;
	floors: FloorDetails[];
	user: string;
	password: string;
}

declare interface FloorDetails {
	name?: string;
	key?: string;
	parqueryValue?: string;
	cameras?: string[];
	zones: ZoneDetails[];
}

declare interface ZoneDetails {
	name?: string;
	key?: string;
	parqueryValue?: string;
	cameras?: string[];
	spots: SpotDetails[];
}

declare interface SpotDetails {
	name?: string;
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
	shiftName: string;
	startShift: string;
	endShift: string;
	weekOff: [number];
}

declare interface Permission {
	[index: string]: string;
}
declare interface AdminPermission {
	moduleName: string;
}

declare interface ListingRequest extends Pagination, Filter, TokenData {
	flag?: string;
}

declare interface ResetPasswordRequest extends TokenData {
	accessToken?: string;
}
declare interface BlockRequest extends TokenData {
	status: string;
}

declare interface RouteConf {
	maxGroupSize: number;
	waitTime: number;
	maxTripDuration: number;
}

declare interface CreateCompanyRequest extends TokenData {
	name: string;
	email: string;
	companyCode: string;
	contactNumber: [CompanyMobile];
	companyType: string;
	companyBranch: string;
	companyAddress: string;
	totalEmp: number;
	planeId: string;
	paymentType: string;
	serverType: string;
	url: string;
	companyId: string;
	password: string;
	createdBy: string;
	plane: {};
	address: string;
	longitude: number;
	latitude: number;
	totalAmount: number;
	userId: string;
}

declare interface UpdateSettings extends TokenData {
	booking_status_cutoff?: number;
	geofence_cutoff?: number;
	duration?: number;
}

declare interface BookingSlotRequest extends TokenData {
	spot_id: string;
	bookingRequestedAt: number;
	floorName: string;
	zoneName: string;
}

declare interface ReportsEntryData extends TokenData{
	fromDate?: number;
	toDate?: number;
	compLocationName?: number;
}

// Model Type For DAO manager
// ALL not required collections will be removed in future build Utkarsh 13/07/2020
declare type ModelNames =
	"users" |
	"admin_notifications" |
	"vehicles" |
	"contents" |
	"login_histories" |
	"notifications" |
	"web_notifications" |
	"users_new" |
	"versions" |
	"vendors" |
	"user_querys" |
	"cabs" |
	"roasters" |
	"roaster_histories" |
	"reschedules" |
	"subscriptions" |
	"cab_routes" |
	"company_types" |
	"permissions" |
	"shift_request" |
	"audit_logs" |
	"company_details" |
	"updated_routes" |
	"UpdateSettings"|
	"entry_log" | "booking_slot"
	| "spot_states";
