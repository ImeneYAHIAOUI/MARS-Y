export class CreateMissionsDto{
    constructor(name, status, site, rocket) {
        this.name = name;
        this.status = status;
        this.site = site;
        this.rocket = rocket;
    }

}
