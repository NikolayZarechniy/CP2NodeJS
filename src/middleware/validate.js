const Joi = require('joi');
const config = require('../config');

const productSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().valid(...config.categories).required(),
  stock: Joi.number().integer().min(0).default(0),
  description: Joi.string().max(500).allow('')
});

const updateProductSchema = productSchema.fork(
  ['name', 'price', 'category'],
  field => field.optional()
);

const productsQuerySchema = Joi.object({
  category: Joi.string().valid(...config.categories),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100)
});

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = source === 'body' ? req.body : req.query;

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        error: 'Ошибка валидации',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }

    if (source === 'body') {
      req.body = value;
    }

    next();
  };
}

module.exports = { validate, productSchema, updateProductSchema, productsQuerySchema };
