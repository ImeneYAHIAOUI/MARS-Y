import { Joi } from '../config/config.js';

export const CommandDecisionValidator = Joi.object({
    decision: Joi.string().required(),
    rocket: Joi.json().required(),
});