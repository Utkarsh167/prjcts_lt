declare interface CabAddRequest extends TokenData {
	cabModel: string;
	type?: string;
	seatingCapacity?: number;
	registrationNo?: string;
	createdAt?: number;
	created?: number;
	countrypermitNumber?: string;
	statePermitNumber?: string;
	createdBy?: string;
	adminType?: string;
	cabBadge?: string;
	vendorId?: string;
	driverId?: string;
	vendor?: object;
	assigned?: boolean;
	companyCode?: string;
	file?: string;
}
declare interface CabUpdateRequest extends TokenData {
	cabModel: string;
	type?: string;
	seatingCapacity?: number;
	registrationNo?: string;
	countryPermitNumber?: string;
	statePermitNumber?: string;
	vendorId?: string;
	driverId?: string;
	cabId?: string;
	vendor?: object;
}
declare interface CabDriverMappRequest extends TokenData {
	driverId?: string;
	mappedType?: string;
	cabId?: string;
	shiftId?: string;
	startShift?: number;
	endShift?: number;
	shift?: string;
	shiftType?: string;
}

declare interface CabListingRequest extends Pagination, Filter, TokenData {
	shift?: string;
	shiftType?: string;
	vendorId?: string;
}

declare interface CabDriverListingRequest extends Pagination, Filter, TokenData {
	shift?: string;
	shiftType?: string;
	shiftTime?: string;
	totalTripTime?: number;
	vendorId?: string;
}

declare interface IsRegistrationNoUnique {
	registrationNo?: string;
}
declare interface IsCabBadgeNoUnique {
	routeNo?: string;
}