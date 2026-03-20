const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const DEMO_USERS = [
  { email: 'demo@customer.com', password: 'password123', name: 'John Doe', role: 'customer', phone: '9876543210', address: '123 Main St, Delhi' },
  { email: 'demo@delivery.com', password: 'password123', name: 'Raj Kumar', role: 'delivery', phone: '9876543211', address: '456 Oak Ave, Delhi' },
  { email: 'admin@admin.com', password: 'admin123', name: 'Admin User', role: 'admin', phone: '9876543212', address: '789 Pine St, Delhi' }
];

const DEMO_ORDERS = [
  { id: 'ORD-001', customerId: 'demo@customer.com', product: '14.2kg', quantity: 1, status: 'in-progress', address: '123 Main St', date: '2026-03-20', driver: 'John Smith', vehicle: 'MH-01-AB-1234' },
  { id: 'ORD-002', customerId: 'demo@customer.com', product: '5kg', quantity: 2, status: 'pending', address: '123 Main St', date: '2026-03-21', driver: null, vehicle: null },
  { id: 'ORD-003', customerId: 'demo@customer.com', product: '19kg', quantity: 1, status: 'completed', address: '123 Main St', date: '2026-03-18', driver: 'Mike Johnson', vehicle: 'MH-01-CD-5678' }
];

function readJSON(filename, fallback) {
  try {
    if (!fs.existsSync(filename)) {
      fs.writeFileSync(filename, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    const text = fs.readFileSync(filename, 'utf8');
    return JSON.parse(text || '[]');
  } catch (err) {
    console.error('readJSON error:', err);
    return fallback;
  }
}

function writeJSON(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

let users = readJSON(USERS_FILE, DEMO_USERS);
let orders = readJSON(ORDERS_FILE, DEMO_ORDERS);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/register', (req, res) => {
  const { email, password, name, role, phone, address } = req.body;
  if (!email || !password || !name || !role || !phone || !address) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'Email already registered.' });
  }

  const newUser = { email, password, name, role, phone, address };
  users.push(newUser);
  writeJSON(USERS_FILE, users);

  return res.status(201).json({ message: 'User registered successfully.', user: newUser });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing credentials.' });

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

  return res.json({ message: 'Login successful.', user });
});

app.get('/api/users', (req, res) => res.json(users));

app.get('/api/orders', (req, res) => {
  const email = req.query.email;
  const role = req.query.role;
  if (!email || !role) return res.json(orders);

  if (role === 'customer') {
    return res.json(orders.filter(o => o.customerId === email));
  }
  return res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { customerId, product, quantity, address, date } = req.body;
  if (!customerId || !product || !quantity || !address || !date) {
    return res.status(400).json({ message: 'Missing order data.' });
  }

  const nextId = 'ORD-' + String(orders.length + 1).padStart(3, '0');
  const newOrder = { id: nextId, customerId, product, quantity, status: 'pending', address, date, driver: null, vehicle: null };
  orders.push(newOrder);
  writeJSON(ORDERS_FILE, orders);

  return res.status(201).json({ message: 'Order created.', order: newOrder });
});

app.put('/api/orders/:id/assign', (req, res) => {
  const { id } = req.params;
  const { driver, vehicle } = req.body;
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });

  order.driver = driver || order.driver;
  order.vehicle = vehicle || order.vehicle;
  order.status = 'in-progress';
  writeJSON(ORDERS_FILE, orders);

  return res.json({ message: 'Order assigned.', order });
});

app.put('/api/users/:email', (req, res) => {
  const { email } = req.params;
  const { name, phone, address } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  writeJSON(USERS_FILE, users);
  return res.json({ message: 'Profile updated.', user });
});

app.post('/api/reset', (req, res) => {
  users = [...DEMO_USERS];
  orders = [...DEMO_ORDERS];
  writeJSON(USERS_FILE, users);
  writeJSON(ORDERS_FILE, orders);
  res.json({ message: 'Data reset to demo state.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Gas Track backend listening at http://localhost:${PORT}`));
