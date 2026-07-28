const Joi = require("joi");

exports.createCampaignSchema = Joi.object({
  business_user_id: Joi.string().uuid().required(),

  type: Joi.string()
    .valid("sales", "awareness", "growth")
    .required(),

  title: Joi.string().max(200).required(),

  description: Joi.string().allow("", null),

  start_date: Joi.date().required(),

  end_date: Joi.date().greater(Joi.ref("start_date")).required(),

  locations: Joi.array().items(Joi.string()).default([]),

  ethiopia_locations: Joi.array()
    .items(Joi.string())
    .default([]).optional(),

  platforms: Joi.object({
    tiktok: Joi.boolean().default(true),
    facebook: Joi.boolean().default(false),
    instagram: Joi.boolean().default(false),
  }),

  run_type: Joi.string()
    .valid("manual", "automatic", "both")
    .default("manual"),

  fund_type: Joi.string()
    .valid("conversion", "fixed")
    .allow(null),

  conversion_rate: Joi.number().empty('').allow(null),

  amount: Joi.number().empty('').allow(null),

  total_budget: Joi.number().empty('').allow(null),

  total_views: Joi.number().empty('').allow(null),

  followers: Joi.number().empty('').allow(null),

  follower_price: Joi.number().empty('').allow(null),

  conversion_event: Joi.string()
    .valid(
      "purchase",
      "signup",
      "lead",
      "pageview"
    )
    .default("purchase"),

  target_type: Joi.string()
    .valid("community", "influencer")
    .required(),

  target_id: Joi.string().uuid().required(),

  status: Joi.string()
    .valid(
      'draft', 'pending', 'approved', 'rejected', 'accepted', 'onbudget', 'active', 'paused', 'completed', 'cancelled'
    )
    .default("draft"),
});

exports.updateCampaignSchema =
  exports.createCampaignSchema.fork(
    [
      "business_user_id",
      "type",
      "title",
      "start_date",
      "end_date",
      "target_type",
      "target_id",
    ],
    (schema) => schema.optional()
  );