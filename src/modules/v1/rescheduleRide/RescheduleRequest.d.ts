
declare interface TripCancelRequest extends TokenData {
	rescheduleId?: string;
	// Added newCabBadgeId & gender - Shivakumar A
	newCabBadgeId: string;
	gender: string;
}
declare interface TripAcceptRequest extends TokenData {
	rescheduleId: string;
	cabId?: string;
	driverId?: string;
	rescheduleData?: {
		userId?: string;
		newGroupFormed?: string;
		scheduleTime?: number;
	};
	// scheduleTime?: number;
	createdAt?: number;
}
declare interface RescheduleRequest extends TokenData {
	reason?: string;
	noShowReason?: string;
	scheduleTime?: number;
	requestType?: number;
	shiftName: string;
	shiftType: string;
	shiftTime: string;
	rosterId: string;
	oldGroupFormed: object;
	newGroupFormed: object;
	newRosterId: string;
	rosterFound: boolean;
	pickUpLocation: string;
	roster: {
		route: {
			_id: string;
		}
	};
	// Added newCabBadgeId & gender - Shivakumar A
	newCabBadgeId: string;
	gender: string;

}