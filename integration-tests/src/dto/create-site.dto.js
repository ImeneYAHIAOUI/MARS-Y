export class CreateSiteDto{
    constructor(name, latitude, longitude, altitude) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude;
    }
}