
declare interface SosLocation {
	address?: string;
	longitude?: string;
	latitude?: string;
}
declare interface UserQueryRequest extends TokenData {
	query?: string;
	profilePicture?: string;
	userEmpId?: number;
	queryType?: number;
	latitude?: number;
	longitude?: number;
	sosLocation?: SosLocation;
	rosterId?: string;
	pickUpLocation?: string;
	roster: {
		route: {
			_id: string;
		},
		// Added cab object to roaster - Shivakumar A
		cab: {
			routeNo: string;
		}
	};
		// Added newCabBadgeId & gender object to roaster - Shivakumar A
	newCabBadgeId?: string;
	gender?: string;
}