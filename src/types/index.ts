export interface Station {
    id: string;
    name: string;
    location: {
        lat: number;
        lng: number;
    };
    pricePerWatt: number;
}

export interface ApiResponse {
    station: {
        id: string;
        name: string;
        location: {
            lat: number;
            lng: number;
        };
        pricePerWatt: number;
    };
    distance: {
        value: number;
        text: string;
    };
    start_time: string;
    end_time: string;
    bookedTimes: any[];
} 