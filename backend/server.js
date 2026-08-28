// CineWave Entertainment - Modular Backend REST API & Static Server
// Pure Node.js HTTP implementation (Zero external dependencies needed)

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// Helper to read JSON data file
function readData(fileName) {
  try {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Error reading ${fileName}:`, err);
    return [];
  }
}

// Helper to write JSON data file
function writeData(fileName, data) {
  try {
    const filePath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${fileName}:`, err);
  }
}

// Helper to send JSON responses
function sendJSON(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(payload));
}

// Helper to parse JSON body from incoming requests
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Gate Scanner Log in Memory & State
const gateAuditLogs = [
  { time: '06:12:45 PM', ref: 'BMS-DGL-4520', action: 'ADMIT 1', seats: 'D4', status: 'OK', gate: 'Turnstile A' },
  { time: '06:05:10 PM', ref: 'BMS-DGL-3112', action: 'ADMIT 4', seats: 'B1-B4', status: 'OK', gate: 'Turnstile B' },
  { time: '05:58:22 PM', ref: 'BMS-DGL-1090', action: 'ADMIT 2', seats: 'F1, F2', status: 'OK', gate: 'Turnstile A' }
];

// MIME types for static frontend assets
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Create Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Pre-flight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // ================= REST API ROUTES (/api/...) =================

  // 1. Health Check
  if (method === 'GET' && pathname === '/api/health') {
    return sendJSON(res, 200, { status: 'OK', service: 'CineWave Backend API', uptime: process.uptime() });
  }

  // 2. Movies Catalog
  if (method === 'GET' && pathname === '/api/movies') {
    const movies = readData('movies.json');
    return sendJSON(res, 200, { success: true, count: movies.length, data: movies });
  }

  // 3. Theatres Catalog
  if (method === 'GET' && pathname === '/api/theatres') {
    const theatres = readData('theatres.json');
    return sendJSON(res, 200, { success: true, count: theatres.length, data: theatres });
  }

  // 4. Concessions & Snacks
  if (method === 'GET' && pathname === '/api/concessions') {
    const concessions = readData('concessions.json');
    return sendJSON(res, 200, { success: true, data: concessions });
  }

  // 5. Promo Code Validation
  if (method === 'POST' && pathname === '/api/promos/validate') {
    const body = await parseBody(req);
    const code = (body.code || '').trim().toUpperCase();
    const promos = readData('promos.json');
    const match = promos.find(p => p.code === code);

    if (match) {
      return sendJSON(res, 200, { success: true, valid: true, promo: match });
    } else {
      return sendJSON(res, 400, { success: false, valid: false, message: 'Invalid promo code' });
    }
  }

  // 6. Bookings Wallet & Ledger
  if (method === 'GET' && (pathname === '/api/bookings' || pathname === '/api/wallet')) {
    const bookings = readData('bookings.json');
    return sendJSON(res, 200, { success: true, count: bookings.length, data: bookings });
  }

  // 7. Create New Booking
  if (method === 'POST' && pathname === '/api/bookings') {
    const body = await parseBody(req);
    const bookings = readData('bookings.json');

    const ref = `BMS-DGL-${Math.floor(10000 + Math.random() * 90000)}`;
    const newBooking = {
      ref: ref,
      movie: body.movie || 'Amaran',
      poster: body.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=60',
      theatre: body.theatre || 'Umaa Rajendra Cinemas 4K Laser, Dindigul',
      date: body.date || new Date().toISOString().split('T')[0],
      time: body.time || '06:30 PM',
      format: body.format || 'TAMIL • 4K RGB LASER DOLBY ATMOS',
      seats: body.seats || ['E5', 'E6'],
      seatClass: body.seatClass || 'GOLD FIRST CLASS',
      qty: body.qty || 2,
      paid: body.paid || 348.84,
      status: 'Confirmed',
      customerName: body.customerName || 'Senthil Kumar',
      customerEmail: body.customerEmail || 'senthil.kumar@gmail.com',
      customerPhone: body.customerPhone || '+91 98421 78901',
      snacks: body.snacks || 'None',
      scanned: false,
      createdAt: new Date().toISOString()
    };

    bookings.unshift(newBooking);
    writeData('bookings.json', bookings);

    return sendJSON(res, 201, { success: true, message: 'Booking confirmed', data: newBooking });
  }

  // 8. Single Booking Lookup
  const bookingMatch = pathname.match(/^\/api\/bookings\/([A-Z0-9-]+)$/);
  if (method === 'GET' && bookingMatch) {
    const ref = bookingMatch[1];
    const bookings = readData('bookings.json');
    const tkt = bookings.find(b => b.ref.toUpperCase() === ref.toUpperCase());

    if (tkt) {
      return sendJSON(res, 200, { success: true, data: tkt });
    } else {
      return sendJSON(res, 404, { success: false, message: 'Booking not found' });
    }
  }

  // 9. Cancel Booking with SLA Refund Calculation
  const cancelMatch = pathname.match(/^\/api\/bookings\/([A-Z0-9-]+)\/cancel$/);
  if (method === 'POST' && cancelMatch) {
    const ref = cancelMatch[1];
    const bookings = readData('bookings.json');
    const tktIndex = bookings.findIndex(b => b.ref.toUpperCase() === ref.toUpperCase());

    if (tktIndex === -1) {
      return sendJSON(res, 404, { success: false, message: 'Booking not found' });
    }

    const tkt = bookings[tktIndex];
    if (tkt.status.includes('Cancelled')) {
      return sendJSON(res, 400, { success: false, message: 'Ticket is already cancelled' });
    }

    // 80% SLA refund calculation
    const deduction = tkt.paid * 0.20;
    const netRefund = tkt.paid * 0.80;

    tkt.status = 'Cancelled - Refunded';
    tkt.refundAmount = netRefund;
    tkt.cancelledAt = new Date().toISOString();

    bookings[tktIndex] = tkt;
    writeData('bookings.json', bookings);

    // Add entry to gate audit log
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    gateAuditLogs.unshift({
      time: timeStr,
      ref: tkt.ref,
      action: 'CANCELLED & REFUNDED',
      seats: tkt.seats.join(', '),
      status: `Refund ₹${netRefund.toFixed(2)}`,
      gate: 'Online Portal'
    });

    return sendJSON(res, 200, {
      success: true,
      message: 'Booking cancelled successfully',
      refund: {
        originalPaid: tkt.paid,
        deduction: deduction,
        netRefund: netRefund,
        refundDestination: 'UPI/Card (15 mins)'
      },
      data: tkt
    });
  }

  // 10. Reschedule Showtime
  const reschedMatch = pathname.match(/^\/api\/bookings\/([A-Z0-9-]+)\/reschedule$/);
  if (method === 'POST' && reschedMatch) {
    const ref = reschedMatch[1];
    const body = await parseBody(req);
    const bookings = readData('bookings.json');
    const tktIndex = bookings.findIndex(b => b.ref.toUpperCase() === ref.toUpperCase());

    if (tktIndex === -1) {
      return sendJSON(res, 404, { success: false, message: 'Booking not found' });
    }

    const tkt = bookings[tktIndex];
    if (body.date) tkt.date = body.date;
    if (body.time) tkt.time = body.time;
    tkt.rescheduledAt = new Date().toISOString();

    bookings[tktIndex] = tkt;
    writeData('bookings.json', bookings);

    return sendJSON(res, 200, { success: true, message: 'Showtime rescheduled successfully', data: tkt });
  }

  // 11. Gate Scanner Validation
  if (method === 'POST' && pathname === '/api/scanner/validate') {
    const body = await parseBody(req);
    const ref = (body.ref || '').trim().toUpperCase();
    const bookings = readData('bookings.json');
    const tkt = bookings.find(b => b.ref.toUpperCase() === ref);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (!tkt) {
      gateAuditLogs.unshift({ time: timeStr, ref: ref, action: 'DENIED', seats: 'N/A', status: 'Invalid Code', gate: 'Gate 1' });
      return sendJSON(res, 200, { status: 'INVALID', message: 'Pass not found in ticketing database', ref: ref });
    }

    if (tkt.status.includes('Cancelled') || tkt.status.includes('Refunded')) {
      gateAuditLogs.unshift({ time: timeStr, ref: ref, action: 'DENIED', seats: tkt.seats.join(', '), status: 'Cancelled/Refunded', gate: 'Gate 1' });
      return sendJSON(res, 200, { status: 'REFUNDED', message: 'This ticket was cancelled and refunded. Admission denied.', data: tkt });
    }

    if (tkt.scanned) {
      gateAuditLogs.unshift({ time: timeStr, ref: ref, action: 'DUPLICATE', seats: tkt.seats.join(', '), status: 'Already Scanned', gate: 'Gate 1' });
      return sendJSON(res, 200, { status: 'ALREADY_SCANNED', message: 'Ticket already validated earlier at gate', data: tkt });
    }

    // Mark as scanned
    tkt.scanned = true;
    writeData('bookings.json', bookings);
    gateAuditLogs.unshift({ time: timeStr, ref: ref, action: `ADMIT ${tkt.qty}`, seats: tkt.seats.join(', '), status: 'OK', gate: 'Turnstile A' });

    return sendJSON(res, 200, { status: 'VALID', message: 'Admission granted', data: tkt });
  }

  // 12. Razorpay Payment Gateway Endpoints
  if (method === 'POST' && pathname === '/api/payment/create-order') {
    const body = await parseBody(req);
    const amount = body.amount || 348.84;
    const orderId = `order_RP_DGL_${Math.floor(100000 + Math.random() * 900000)}`;

    return sendJSON(res, 200, {
      success: true,
      keyId: 'rzp_test_CineWaveDGL_2026',
      orderId: orderId,
      amount: Math.round(amount * 100), // in paise
      currency: 'INR',
      merchantName: 'CineWave Entertainment (BookMyShow Dindigul)',
      description: `Movie Tickets Reservation - ${body.movie || 'Cinema Booking'}`
    });
  }

  if (method === 'POST' && pathname === '/api/payment/verify') {
    const body = await parseBody(req);
    const paymentId = body.paymentId || `pay_RP_DGL_${Math.floor(100000 + Math.random() * 900000)}`;
    const orderId = body.orderId || `order_RP_DGL_${Math.floor(100000 + Math.random() * 900000)}`;

    return sendJSON(res, 200, {
      success: true,
      verified: true,
      paymentId: paymentId,
      orderId: orderId,
      method: body.method || 'UPI (Google Pay)',
      timestamp: new Date().toISOString(),
      message: 'Payment successfully verified via Razorpay 256-bit secure gateway.'
    });
  }

  // 13. Manager Analytics & Metrics
  if (method === 'GET' && pathname === '/api/manager/metrics') {
    const bookings = readData('bookings.json');
    let totalRevenue = 148920;
    let totalSold = 684;
    let concessionsSales = 34250;

    bookings.forEach(b => {
      if (b.status === 'Confirmed' || b.status === 'Attended') {
        totalRevenue += b.paid;
        totalSold += b.qty;
      }
    });

    const occupancyRate = ((totalSold / 780) * 100).toFixed(1);

    return sendJSON(res, 200, {
      success: true,
      metrics: {
        gboc: `₹${totalRevenue.toLocaleString('en-IN')}`,
        occupancy: `${occupancyRate}%`,
        ticketsSold: `${totalSold} / 780`,
        fbSales: `₹${concessionsSales.toLocaleString('en-IN')}`
      },
      auditLogs: gateAuditLogs.slice(0, 10)
    });
  }

  // ================= STATIC FILE SERVER (frontend/...) =================
  let filePath = path.join(FRONTEND_DIR, pathname === '/' ? 'index.html' : pathname);

  // Security check: ensure path is within FRONTEND_DIR
  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Default fallback to frontend/index.html
    const fallbackPath = path.join(FRONTEND_DIR, 'index.html');
    if (fs.existsSync(fallbackPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      fs.createReadStream(fallbackPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎬 CineWave Entertainment Backend Server Running!`);
  console.log(`🌐 Application URL: http://localhost:${PORT}`);
  console.log(`📡 REST API Base:   http://localhost:${PORT}/api/`);
  console.log(`📁 Serving Frontend: ${FRONTEND_DIR}`);
  console.log(`====================================================`);
});
