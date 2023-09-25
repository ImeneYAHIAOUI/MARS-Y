import { Joi } from '../config/config.js';

export const StageCommandDecisionValidator = Joi.object({
    midStageSeparationSuccess: Joi.boolean().required(),
    rocket : Joi.object({
        _id: Joi.string().required(),
        name: Joi.string().required(),
        status: Joi.string().required(),
    })
});