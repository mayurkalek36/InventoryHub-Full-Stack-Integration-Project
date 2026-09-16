const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// In-memory data store (swap for a real database in production)
// ---------------------------------------------------------------------------
let items = [
  { id: 1, name: 'Wireless Mouse', sku: 'WM-1001', quantity: 42, price: 19.99 },
  { id: 2, name: 'Mechanical Keyboard', sku: 'MK-2002', quantity: 17, price: 79.5 },
  { id: 3, name: 'USB-C Hub', sku: 'UH-3003', quantity: 65, price: 24.99 },
  { id: 4, name: '27" Monitor', sku: 'MN-4004', quantity: 8, price: 229.0 },
];
let nextId = items.length + 1;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function findItemIndex(id) {
  return items.findIndex((item) => item.id === Number(id));
}

function validateItemPayload(body, { partial = false } = {}) {
  const errors = [];
  const { name, sku, quantity, price } = body;

  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      errors.push('name is required and must be a non-empty string');
    }
  }
  if (!partial || sku !== undefined) {
    if (typeof sku !== 'string' || !sku.trim()) {
      errors.push('sku is required and must be a non-empty string');
    }
  }
  if (!partial || quantity !== undefined) {
    if (typeof quantity !== 'number' || Number.isNaN(quantity) || quantity < 0) {
      errors.push('quantity is required and must be a non-negative number');
    }
  }
  if (!partial || price !== undefined) {
    if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
      errors.push('price is required and must be a non-negative number');
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// List all items
app.get('/api/items', (req, res) => {
  res.json(items);
});

// Get a single item
app.get('/api/items/:id', (req, res) => {
  const index = findItemIndex(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: `Item ${req.params.id} not found` });
  }
  res.json(items[index]);
});

// Create a new item
app.post('/api/items', (req, res) => {
  const errors = validateItemPayload(req.body);
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  const { name, sku, quantity, price } = req.body;
  const newItem = { id: nextId++, name: name.trim(), sku: sku.trim(), quantity, price };
  items.push(newItem);
  res.status(201).json(newItem);
});

// Update an existing item (partial updates allowed)
app.put('/api/items/:id', (req, res) => {
  const index = findItemIndex(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: `Item ${req.params.id} not found` });
  }

  const errors = validateItemPayload(req.body, { partial: true });
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  items[index] = { ...items[index], ...req.body, id: items[index].id };
  res.json(items[index]);
});

// Delete an item
app.delete('/api/items/:id', (req, res) => {
  const index = findItemIndex(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: `Item ${req.params.id} not found` });
  }

  const [removed] = items.splice(index, 1);
  res.json(removed);
});

// Fallback for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`InventoryHub backend listening on http://localhost:${PORT}`);
});
