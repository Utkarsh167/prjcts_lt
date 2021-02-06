declare interface VehicleRegistered {
	regNo: string;
}

declare interface EntryLog extends TokenData{
	regNo: string;
	vehcileId?: string;
	entryType?: string;
	inTime?: number;
	outTime?: number;
	companyCode?: string;
	companyId: string;
	vehicleInfo?: VehicleInfoManual;
	fromDate?: number;
	toDate?: number;
	guestValidity?: string;
	purposeOfVisit?: string;
	companyLocationName?: string;
}
declare interface EntryLogId extends EntryLog{
	entryLogId: string;
	vehicleData?: VehicleUpdateRequest;
}
