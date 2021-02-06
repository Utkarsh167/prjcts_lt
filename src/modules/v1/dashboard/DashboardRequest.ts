declare interface LoginHistoryRequest extends Device {
    isLogin?: boolean;
    lastLogout?: number;
    lastLogin?: number;
}

declare interface ScopeRequest {
    buildingUrl?: string;
    user: string;
    password: string;
}

declare interface SnapshotRequest {
    camera_ids: [string];
    with_image: boolean;
    with_crops: boolean;
    block_id: string;
    klass: string;
    timestamp: number;
    spot_states?: [SpotStates];
    user: string;
    password: string;
    buildingUrl: string;
}

declare interface SpotStates {

    "spot_id": string;
    "camera_id": string;
    "occupied": boolean;
    "vehicle_id": string;
    "crop": string;
    "vehicleDetails": [string];

}

declare interface PlanImageRequest {
    id: string;
    spot_id?: string;
    camera_id?: string;
    to_timestamp?: string;
    from_timestamp?: string;
}

declare interface TimeTrackVideoFromFormRequest {
    spot_id: string;
    camera_id: string;
    to_timestamp: number;
    from_timestamp: number;
}

declare interface TimeTrackOccupiersRequest {
    spot_id?: string;
    camera_ids?: string;
    block_id?: string;
    klass?: string;
    max_age?: number;
}

declare interface HistoricalAgregateRequest extends ScopeRequest {
    camera_ids?: [string];
    range_from?: string;
    range_to?: string;
    spot_id?: string;
    block_id?: string;
    list_aggregation_granularity?: string;
    week_aggregation_granularity?: number;
}
