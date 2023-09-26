export class CreateMissionsDto{
    constructor(name, site, rocket, status) {
        this.name = name;
        this.status = status;
        this.site = site;
        this.rocket = rocket;
    }



}
