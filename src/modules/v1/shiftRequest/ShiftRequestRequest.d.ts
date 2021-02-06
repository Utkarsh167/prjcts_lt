
declare interface ShiftRequest {
	employeeId: string;
	shiftName: number;
	weekOff: [number];
	validFrom: number;
	validTill: number;
	createdBy: string;
	createdAt: number;
	created: number;
	adminType: string;
	companyCode: string;
	status: [string];
	userId?: string;
	permission?: string[];
	// Added gender -  Shivakumar A
	gender?: string;
}

declare interface BulkShiftUpdateRequest extends TokenData {
	file: string;
}

declare interface ShiftRequestListing extends Pagination, TokenData {
	searchKey: string;
	sortBy: string;
	sortOrder: number | string;
	status?: string;
	shiftName?: string;
}

declare interface UpdatedGroupListing extends Pagination, TokenData {
	searchKey: string;
	sortBy: string;
	sortOrder: number | string;
	status?: string;
	// fromDate?: number;
	// toDate?: number;
}
declare interface RosterUpdate extends TokenData {
	groups?: string[];
}
declare interface ShiftRequestDelete extends TokenData {
	shiftRequestId: string;
}