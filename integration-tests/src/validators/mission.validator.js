import {Joi} from "../config/config.js";

export const MissionValidator =  Joi.object({
    _id: Joi.string().required(),
    name: Joi.string().required(),
    status: Joi.string().required(),
    site: Joi.string().required(),
    rocket: Joi.string().required(),
});
