const { Router } = require('express');
const upload = require('../middleware/upload');
const {
  validate,
  productSchema,
  updateProductSchema,
  productsQuerySchema
} = require('../middleware/validate');

const router = Router();

let products = [
  { id: 1, name: 'Laptop', price: 999, category: 'electronics', stock: 5, description: 'Ноутбук', imageUrl: null, createdAt: new Date().toISOString() },
  { id: 2, name: 'T-shirt', price: 20, category: 'clothing', stock: 30, description: '', imageUrl: null, createdAt: new Date().toISOString() },
  { id: 3, name: 'Apple', price: 1.5, category: 'food', stock: 100, description: 'Зелёное яблоко', imageUrl: null, createdAt: new Date().toISOString() }
];
let nextId = 4;

router.get('/', validate(productsQuerySchema, 'query'), (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  let result = [...products];

  if (category) {
    result = result.filter(p => p.category === category);
  }
  if (minPrice) {
    result = result.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    result = result.filter(p => p.price <= parseFloat(maxPrice));
  }

  const start = (page - 1) * limit;
  const data = result.slice(start, start + limit);

  res.json({
    data: data,
    total: result.length,
    page: page,
    limit: limit
  });
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID должен быть числом' });
  }

  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ error: `Товар с ID ${id} не найден` });
  }

  res.json(product);
});

router.post('/', validate(productSchema), (req, res) => {
  const newProduct = {
    id: nextId++,
    ...req.body,
    imageUrl: null,
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

router.put('/:id', validate(productSchema), (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID должен быть числом' });
  }

  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Товар с ID ${id} не найден` });
  }

  products[index] = {
    id: id,
    ...req.body,
    imageUrl: products[index].imageUrl,
    createdAt: products[index].createdAt
  };

  res.json(products[index]);
});

router.patch('/:id', validate(updateProductSchema), (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID должен быть числом' });
  }

  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Товар с ID ${id} не найден` });
  }

  products[index] = { ...products[index], ...req.body, id: id };
  res.json(products[index]);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID должен быть числом' });
  }

  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Товар с ID ${id} не найден` });
  }

  const deleted = products.splice(index, 1)[0];
  res.json({ message: 'Товар удалён', data: deleted });
});

router.post('/:id/image', upload.single('image'), (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID должен быть числом' });
  }

  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ error: `Товар с ID ${id} не найден` });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }

  product.imageUrl = `/uploads/products/${req.file.filename}`;
  res.json(product);
});

module.exports = router;
