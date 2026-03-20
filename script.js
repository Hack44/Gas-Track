const API_BASE = 'http://localhost:5000/api';
const demoUsers = [
  { email: 'demo@customer.com', password: 'password123', name: 'John Doe', role: 'customer', phone: '9876543210', address: '123 Main St, Delhi' },
  { email: 'demo@delivery.com', password: 'password123', name: 'Raj Kumar', role: 'delivery', phone: '9876543211', address: '456 Oak Ave, Delhi' },
  { email: 'admin@admin.com', password: 'admin123', name: 'Admin User', role: 'admin', phone: '9876543212', address: '789 Pine St, Delhi' }
];

let currentUser = null, orders = [], users = [];

async function isBackendAvailable() {
  try {
    const res = await fetch(`${API_BASE}/users`, { method: 'HEAD' });
    return res.ok;
  } catch (_err) {
    return false;
  }
}


function initializeDemoData() {
  if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify(demoUsers));
  if (!localStorage.getItem('orders')) localStorage.setItem('orders', JSON.stringify([
    { id: 'ORD-001', customerId: 'demo@customer.com', product: '14.2kg', quantity: 1, status: 'in-progress', address: '123 Main St', date: '2026-03-20', driver: 'John Smith', vehicle: 'MH-01-AB-1234' },
    { id: 'ORD-002', customerId: 'demo@customer.com', product: '5kg', quantity: 2, status: 'pending', address: '123 Main St', date: '2026-03-21', driver: null, vehicle: null },
    { id: 'ORD-003', customerId: 'demo@customer.com', product: '19kg', quantity: 1, status: 'completed', address: '123 Main St', date: '2026-03-18', driver: 'Mike Johnson', vehicle: 'MH-01-CD-5678' }
  ]));
  loadUserAndOrders();
}

function loadUserAndOrders() {
  users = JSON.parse(localStorage.getItem('users')) || [];
  orders = JSON.parse(localStorage.getItem('orders')) || [];
}

function goTo(page) { window.location.href = page; }

async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const role = document.getElementById('registerRole').value;
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    document.getElementById('regError').textContent = 'Passwords do not match!';
    return;
  }

  loadUserAndOrders();
  if (users.find(u => u.email === email)) {
    document.getElementById('regError').textContent = 'Email already registered!';
    return;
  }

  const userData = { email, password, name, role, phone, address };
  const backendEnabled = await isBackendAvailable();

  if (backendEnabled) {
    try {
      const resp = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const result = await resp.json();
      if (resp.ok) {
        alert('Registration successful! Please login.');
        window.location.href = 'login.html';
        return;
      }
      document.getElementById('regError').textContent = result.message || 'Registration failed.';
      return;
    } catch (error) {
      console.warn('Backend register unavailable, falling back to localStorage', error);
    }
  }

  // Fallback localStorage implementation
  users.push(userData);
  localStorage.setItem('users', JSON.stringify(users));
  alert('Registration successful (local). Please login.');
  window.location.href = 'login.html';
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  loadUserAndOrders();
  const backendEnabled = await isBackendAvailable();

  if (backendEnabled) {
    try {
      const resp = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await resp.json();
      if (resp.ok && result.user) {
        currentUser = result.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.location.href = 'dashboard.html';
        return;
      }
      document.getElementById('loginError').textContent = result.message || 'Invalid email or password!';
      return;
    } catch (error) {
      console.warn('Backend login unavailable, falling back to localStorage', error);
    }
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'dashboard.html';
  } else {
    document.getElementById('loginError').textContent = 'Invalid email or password!';
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

function checkUser() {
  const stored = localStorage.getItem('currentUser');
  if (!stored) {
    window.location.href = 'login.html';
    return false;
  }
  currentUser = JSON.parse(stored);
  loadUserAndOrders();
  return true;
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

  if (sectionId === 'overview') loadDashboardOverview();
  else if (sectionId === 'orders') loadCustomerOrders();
  else if (sectionId === 'manage-orders') loadAllOrders();
  else if (sectionId === 'manage-users') loadAllUsers();
  else if (sectionId === 'analytics') loadAnalytics();
  else if (sectionId === 'profile') loadProfile();
}

function loadDashboardOverview() {
  const userOrders = orders.filter(o => o.customerId === currentUser.email);
  document.getElementById('totalOrders').textContent = userOrders.length;
  document.getElementById('inProgress').textContent = userOrders.filter(o => o.status === 'in-progress').length;
  document.getElementById('completed').textContent = userOrders.filter(o => o.status === 'completed').length;
  document.getElementById('pending').textContent = userOrders.filter(o => o.status === 'pending').length;
}

function loadDashboard() {
  if (!checkUser()) return;
  document.getElementById('userGreeting').textContent = `Welcome, ${currentUser.name}!`;
  if (currentUser.role === 'admin') document.getElementById('adminMenu').style.display = 'block';
  showSection('overview');
}

function loadProfile() {
  document.getElementById('profileName').value = currentUser.name;
  document.getElementById('profileEmail').value = currentUser.email;
  document.getElementById('profilePhone').value = currentUser.phone;
  document.getElementById('profileAddress').value = currentUser.address;
  document.getElementById('profileRole').value = currentUser.role;

  document.getElementById('profileName').readOnly = true;
  document.getElementById('profileEmail').readOnly = true;
  document.getElementById('profilePhone').readOnly = true;
  document.getElementById('profileAddress').readOnly = true;
  document.getElementById('profileRole').readOnly = true;

  document.getElementById('editProfileBtn').style.display = 'inline-block';
  document.getElementById('saveProfileBtn').style.display = 'none';
  document.getElementById('cancelProfileBtn').style.display = 'none';
  document.getElementById('profileStatus').style.display = 'none';
}

function editProfile() {
  document.getElementById('profileName').readOnly = false;
  document.getElementById('profilePhone').readOnly = false;
  document.getElementById('profileAddress').readOnly = false;

  document.getElementById('editProfileBtn').style.display = 'none';
  document.getElementById('saveProfileBtn').style.display = 'inline-block';
  document.getElementById('cancelProfileBtn').style.display = 'inline-block';

  document.getElementById('profileStatus').style.display = 'block';
  document.getElementById('profileStatus').textContent = 'Editing mode enabled. Update your profile then click Save.';
  document.getElementById('profileStatus').style.background = 'rgba(232, 243, 254, 0.85)';
  document.getElementById('profileStatus').style.color = '#0b52a5';
  document.getElementById('profileStatus').style.border = '1px solid #a5d2ff';
}

function saveProfile() {
  const name = document.getElementById('profileName').value.trim();
  const phone = document.getElementById('profilePhone').value.trim();
  const address = document.getElementById('profileAddress').value.trim();

  if (!name || !phone || !address) {
    document.getElementById('profileStatus').textContent = 'Name, Phone and Address are required.';
    document.getElementById('profileStatus').style.background = 'rgba(255, 238, 238, 0.9)';
    document.getElementById('profileStatus').style.color = '#a50000';
    document.getElementById('profileStatus').style.border = '1px solid #ffabab';
    return;
  }

  currentUser.name = name;
  currentUser.phone = phone;
  currentUser.address = address;

  users = users.map(u => u.email === currentUser.email ? currentUser : u);
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  document.getElementById('profileStatus').textContent = 'Profile updated successfully.';
  document.getElementById('profileStatus').style.background = 'rgba(220, 255, 220, 0.9)';
  document.getElementById('profileStatus').style.color = '#1a6b24';
  document.getElementById('profileStatus').style.border = '1px solid #9dcca7';

  cancelProfileEdit();
}

function cancelProfileEdit() {
  loadProfile();
  document.getElementById('profileStatus').textContent = 'Edit canceled.';
  document.getElementById('profileStatus').style.display = 'block';
  document.getElementById('profileStatus').style.background = 'rgba(255, 255, 220, 0.9)';
  document.getElementById('profileStatus').style.color = '#7e5e0a';
  document.getElementById('profileStatus').style.border = '1px solid #f0e3a1';
}

function showOrderForm() { document.getElementById('orderForm').style.display = 'block'; }
function hideOrderForm() { document.getElementById('orderForm').style.display = 'none'; }

async function handlePlaceOrder(event) {
  event.preventDefault();
  const type = document.getElementById('cylinderType').value;
  const quantity = document.getElementById('quantity').value;
  const address = document.getElementById('deliveryAddress').value;
  const date = document.getElementById('deliveryDate').value;

  const orderData = { customerId: currentUser.email, product: type, quantity, address, date };
  const backendEnabled = await isBackendAvailable();

  if (backendEnabled) {
    try {
      const resp = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const result = await resp.json();
      if (resp.ok) {
        orders.push(result.order);
        alert('Order placed! ID: ' + result.order.id);
        hideOrderForm();
        loadCustomerOrders();
        return;
      }
      alert('Cannot place order: ' + (result.message || 'unknown error'));
      return;
    } catch (error) {
      console.warn('Backend order unavailable, falling back to localStorage', error);
    }
  }

  const orderId = 'ORD-' + String(orders.length + 1).padStart(3, '0');
  orders.push({ id: orderId, customerId: currentUser.email, product: type, quantity, status: 'pending', address, date, driver: null, vehicle: null });
  localStorage.setItem('orders', JSON.stringify(orders));
  alert('Order placed! ID: ' + orderId);
  hideOrderForm();
  loadCustomerOrders();
}

async function loadCustomerOrders() {
  const container = document.getElementById('customerOrders');

  const backendEnabled = await isBackendAvailable();
  if (backendEnabled) {
    try {
      const query = `?email=${encodeURIComponent(currentUser.email)}&role=${encodeURIComponent(currentUser.role)}`;
      const resp = await fetch(`${API_BASE}/orders${query}`);
      if (resp.ok) {
        orders = await resp.json();
      }
    } catch (error) {
      console.warn('Could not fetch orders from backend, using localStorage fallback', error);
      loadUserAndOrders();
    }
  } else {
    loadUserAndOrders();
  }

  let userOrders;
  if (currentUser.role === 'delivery' || currentUser.role === 'admin') {
    userOrders = orders;
  } else {
    userOrders = orders.filter(o => o.customerId === currentUser.email);
  }

  container.innerHTML = userOrders.length ? '' : '<p style="color: #666;">No orders found.</p>';

  userOrders.forEach(order => {
    const customer = users.find(u => u.email === order.customerId)?.name || 'Unknown customer';
    const canAssign = currentUser.role === 'delivery' && order.status !== 'completed' && order.status !== 'cancelled';
    const assignBtn = canAssign ? `<button class="btn btn-secondary" style="padding: 6px 12px; margin-top: 0.5rem;" onclick="assignOrder('${order.id}')">Assign to Me</button>` : '';

    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML =
      `<div class="order-details">` +
        `<h4>${order.id} - ${order.product}</h4>` +
        `<p>Customer: ${customer}</p>` +
        `<p>Qty: ${order.quantity} | ${order.date}</p>` +
        `<p>Delivery Address: ${order.address}</p>` +
        `<p>Status: <span class="status-badge status-${order.status}">${order.status.replace('-', ' ').toUpperCase()}</span></p>` +
        `${order.driver ? `<p>Driver: ${order.driver}</p>` : ''}` +
        `${order.vehicle ? `<p>Vehicle: ${order.vehicle}</p>` : ''}` +
        `${assignBtn}` +
      `</div>`;
    container.appendChild(div);
  });
}

async function loadAllOrders() {
  const container = document.getElementById('allOrdersList');
  container.innerHTML = '';

  const backendEnabled = await isBackendAvailable();
  if (backendEnabled) {
    try {
      const resp = await fetch(`${API_BASE}/orders`);
      if (resp.ok) {
        orders = await resp.json();
      }
    } catch (error) {
      console.warn('Could not fetch all orders from backend, using localStorage fallback', error);
      loadUserAndOrders();
    }
  } else {
    loadUserAndOrders();
  }

  orders.forEach(order => {
    const customerName = users.find(u => u.email === order.customerId)?.name || 'Unknown';
    const assignedTo = order.driver ? `<p><strong>Driver:</strong> ${order.driver}</p>` : '';
    const vehicle = order.vehicle ? `<p><strong>Vehicle:</strong> ${order.vehicle}</p>` : '';
    const assignButton = (currentUser.role === 'delivery' && order.status !== 'completed' && order.status !== 'cancelled') ?
      `<button class="btn btn-secondary" style="padding: 6px 12px; margin-left: 0.5rem;" onclick="assignOrder('${order.id}')">Assign to Me</button>` : '';

    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML = `
      <div class="order-details">
        <h4>${order.id} - ${order.product}</h4>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Qty:</strong> ${order.quantity} | <strong>Date:</strong> ${order.date}</p>
        <p><strong>Address:</strong> ${order.address}</p>
        ${assignedTo}
        ${vehicle}
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <select onchange="updateOrderStatus('${order.id}', this.value)">
          <option value="">Change Status</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        ${assignButton}
      </div>
      <span class="status-badge status-${order.status}">${order.status.replace('-', ' ').toUpperCase()}</span>
    `;
    container.appendChild(div);
  });
}

function updateOrderStatus(orderId, newStatus) {
  if (!newStatus) return;
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    if (newStatus === 'assigned' && !order.driver && currentUser.role === 'delivery') {
      order.driver = currentUser.name;
      order.vehicle = currentUser.vehicle || 'Assigned Vehicle';
    }
    localStorage.setItem('orders', JSON.stringify(orders));
    loadAllOrders();
  }
}

function assignOrder(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  if (order.status === 'completed' || order.status === 'cancelled') {
    alert('Cannot assign a completed or cancelled order.');
    return;
  }

  order.status = 'assigned';
  order.driver = currentUser.name;
  order.vehicle = currentUser.vehicle || 'Assigned Vehicle';

  localStorage.setItem('orders', JSON.stringify(orders));
  loadAllOrders();
  alert('Order ' + orderId + ' assigned to you.');
}

function filterOrders() {
  const filter = document.getElementById('statusFilter').value;
  const filtered = filter ? orders.filter(o => o.status === filter) : orders;
  const container = document.getElementById('allOrdersList');
  container.innerHTML = '';

  filtered.forEach(order => {
    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML = `<div class="order-details"><h4>${order.id}</h4><p>${users.find(u => u.email === order.customerId)?.name || 'Unknown'}</p></div><span class="status-badge status-${order.status}">${order.status.replace('-', ' ').toUpperCase()}</span>`;
    container.appendChild(div);
  });
}

function trackOrder() {
  const orderId = document.getElementById('trackOrderId').value;
  const order = orders.find(o => o.id === orderId);
  if (!order) return alert('Order not found!');

  const timeline = getTimelineSteps(order.status);
  let html = `<h2>${order.id}</h2><span class="status-badge status-${order.status}">${order.status.replace('-', ' ').toUpperCase()}</span><div style="margin-top: 2rem; padding: 1.5rem; background: white; border-radius: 12px;"><p><strong>Product:</strong> ${order.product}</p><p><strong>Date:</strong> ${order.date}</p><p><strong>Address:</strong> ${order.address}</p></div><div class="timeline">`;
  
  timeline.forEach(step => {
    html += `<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><h4>${step.title}</h4><p>${step.description}</p></div></div>`;
  });
  
  html += '</div>';
  if (order.driver) html += `<div style="margin-top: 2rem; padding: 1.5rem; background: white; border-radius: 12px;"><h3>Driver</h3><p><strong>Name:</strong> ${order.driver}</p><p><strong>Vehicle:</strong> ${order.vehicle}</p></div>`;

  document.getElementById('trackResult').innerHTML = html;
  document.getElementById('trackResult').style.display = 'block';
}

function pageTrack() {
  const orderId = document.getElementById('pageTrackOrderId').value;
  if (!orderId) {
    document.getElementById('pageTrackResult').style.display = 'none';
    document.getElementById('noOrderMessage').style.display = 'block';
    document.getElementById('orderNotFoundMessage').style.display = 'none';
    return;
  }

  const order = orders.find(o => o.id === orderId);
  if (!order) {
    document.getElementById('pageTrackResult').style.display = 'none';
    document.getElementById('noOrderMessage').style.display = 'none';
    document.getElementById('orderNotFoundMessage').style.display = 'block';
    document.getElementById('notFoundText').textContent = `Order "${orderId}" not found!`;
    return;
  }

  trackOrder();
}

function getTimelineSteps(status) {
  const steps = [
    { title: 'Order Confirmed', description: 'Order received' },
    { title: 'Driver Assigned', description: 'Delivery agent assigned' },
    { title: 'Out for Delivery', description: 'On the way' },
    { title: 'Delivered', description: 'Successfully delivered' }
  ];
  const statusMap = { 'pending': 0, 'assigned': 1, 'in-progress': 2, 'completed': 3 };
  return steps.slice(0, (statusMap[status] || 0) + 1);
}

function showAddUserForm() { document.getElementById('addUserForm').style.display = 'block'; }
function hideAddUserForm() { document.getElementById('addUserForm').style.display = 'none'; }

function handleAddUser(event) {
  event.preventDefault();
  const newUser = {
    email: document.getElementById('newUserEmail').value,
    password: document.getElementById('newUserPassword').value,
    name: document.getElementById('newUserName').value,
    role: document.getElementById('newUserRole').value,
    phone: document.getElementById('newUserPhone').value,
    address: ''
  };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  alert('User added!');
  hideAddUserForm();
  loadAllUsers();
}

function loadAllUsers() {
  const container = document.getElementById('usersList');
  container.innerHTML = '';
  users.forEach(user => {
    const div = document.createElement('div');
    div.className = 'user-item';
    div.innerHTML = `<div class="user-details"><h4>${user.name}</h4><p>${user.email}</p><p>${user.role}</p></div><button class="btn btn-secondary" onclick="deleteUser('${user.email}')">Delete</button>`;
    container.appendChild(div);
  });
}

function deleteUser(email) {
  if (confirm('Delete this user?')) {
    users = users.filter(u => u.email !== email);
    localStorage.setItem('users', JSON.stringify(users));
    loadAllUsers();
  }
}

function loadAnalytics() {
  document.getElementById('totalCustomers').textContent = users.filter(u => u.role === 'customer').length;
  document.getElementById('totalDelivery').textContent = users.filter(u => u.role === 'delivery').length;
  document.getElementById('analyticsTotal').textContent = orders.length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const rate = orders.length > 0 ? Math.round((completed / orders.length) * 100) : 0;
  document.getElementById('completionRate').textContent = rate + '%';
  document.getElementById('monthlyRevenue').textContent = '₹' + (orders.length * 1000);
}

function contactSupport() { alert('Support: 1800-123-456 or support@lpgdelivery.com'); }

window.addEventListener('DOMContentLoaded', function() {
  initializeDemoData();
  if (window.location.pathname.includes('dashboard')) loadDashboard();
});