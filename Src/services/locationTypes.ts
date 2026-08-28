export type LocationData = {
    latitude: number;
    longitude: number;
    address: string;
};

export type SavedLocation = LocationData & {
    id: string;
    title: string;
};