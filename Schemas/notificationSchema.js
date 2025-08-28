import Joi from "joi";

export const notificationSchema = Joi.object({
  user: Joi.string().required(), // userId or adminId
  title: Joi.string().required(),
  message: Joi.string().required(),
  type: Joi.string().valid("info", "warning", "success").default("info"),
  isRead: Joi.boolean().default(false),
});
