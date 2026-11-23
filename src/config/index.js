require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  uploadDir: process.env.UPLOAD_DIR || 'uploads/products',
  maxFileSize: 2 * 1024 * 1024,
  categories: ['electronics', 'clothing', 'food', 'other']
};

module.exports = config;
