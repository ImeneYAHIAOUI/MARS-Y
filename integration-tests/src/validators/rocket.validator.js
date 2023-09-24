import { Joi } from '../config/config.js';

export const RocketValidator = Joi.object({
    _id: Joi.string().required(),
    name: Joi.string().required(),
    status: Joi.string().required(),
});