import {Joi} from "../config/config.js";

export const SiteValidator = Joi.object({
    _id: Joi.string().required(),
    name: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    altitude: Joi.number().required(),

});

