declare interface RoasterAddRequest extends TokenData {
	rosterData: [];
	tripType?: string;
	createdAt?: number;
	created?: number;
	status?: number;
	createdBy?: string;
	adminType?: string;
	roasterBadge?: string;
	routeId?: string;
	cabId?: string;
	validFrom?: number;
	validTill?: number;
	companyCode?: string;
	driverId?: string;
	cab?: any;
}
declare interface RoasterContinueRequest extends TokenData {
	rosterData: [];
	tripType?: string;
	createdAt?: number;
	created?: number;
	status?: number;
	createdBy?: string;
	adminType?: string;
	roasterBadge?: string;
	routeId?: string;
	cabId?: string;
	validFrom?: number;
	validTill?: number;
	companyCode?: string;
	driverId?: string;
	cab?: any;
}
declare interface RoasterUpdateRequest extends TokenData {
	rosterId?: string;
	driverId?: string;
	cabId?: string;
	rating?: number;
	avgRating?: number;
	totalRating?: number;
}

declare interface RoasterTripTypeRequest extends TokenData {
	tripType?: number;
}
declare interface RoasterTripCancelRequest extends TokenData {
	rosterId?: string;
	noShowReason?: string;
}