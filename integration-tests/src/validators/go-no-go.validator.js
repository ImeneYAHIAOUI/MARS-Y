import { Joi } from '../config/config.js';

export const GoNoGoValidator = Joi.object({
    go: Joi.boolean().required(),
});