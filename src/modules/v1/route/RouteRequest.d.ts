declare interface RouteAddRequest extends TokenData {
	routeName: string;
	tripType?: string;
	createdAt?: number;
	created?: number;
	status?: number;
	createdBy?: string;
	adminType?: string;
	routeBadge?: string;
	employees?: Empaddroute;
	companyCode?: string;
}
declare interface RouteUpdateRequest extends TokenData {
	routeId: string;
	routeName?: string;
	employeesToAdd?: string[];
	employeesToRemove?: string[];
}

declare interface RoutingAlgoRequest extends TokenData {
	maxGroupSize: number;
	waitTime: number;
	maxTripDuration: number;
}
declare interface VoiceCallRequest extends TokenData {
	callingAgentNumber: number;
	calledPartyNumber: number;
}
declare interface RouteListing extends Pagination, TokenData {
	searchKey: string;
	sortBy: string;
	sortOrder: number | string;
	status?: string;
	fromDate?: number;
	toDate?: number;
	userType?: number;
	routeName?: string;
	shiftType?: string;
	shiftName?: string;
}

declare interface ProcessedRouteListing extends Pagination, TokenData {
	searchKey: string;
	sortBy: string;
	sortOrder: number | string;
	// status?: string;
	fromDate?: number;
	toDate?: number;
	userType?: number;
	routeName?: string;
	shiftType?: string;
	shiftName?: string;
}
declare interface RouteApproveRequest extends TokenData {
	groups?: string[];
	approveAll: boolean;
	approveLogin: boolean;
	approveLogout: boolean;
}
declare interface RouteDissolveRequest extends TokenData {
	groups?: string[];
}
declare interface RouteMergeRequest extends TokenData {
	groups?: string[];
}
declare interface RouteRegenerateRequest extends TokenData {
	groups?: string[];
}
declare interface NewEmpRouteRequest extends TokenData { }
declare interface SwapEmpOrderRequest extends TokenData {
	routeId: string;
	employees: [{
		empId: string;
		empLocation: {
			lat: number;
			long: number;
		};
		weekOff: [number];
		name: string;
		employeeId: string;
		countryCode: string;
		mobileNo: string;
		address: string;
	    // Added gender - Shivakumar A
		gender: string;
	}];
}