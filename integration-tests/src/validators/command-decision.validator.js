import { Joi } from '../config/config.js';

export const CommandDecisionValidator = Joi.object({
    decision: Joi.string().required(),
    rocket:  Joi.object({
        _id: Joi.string().required(),
        name: Joi.string().required(),
        status: Joi.string().required(),
    }).required(),
});