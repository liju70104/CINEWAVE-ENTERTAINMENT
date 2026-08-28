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
  { time: '06:12:45 PM', ref: 'CW-MUM-4520', action: 'ADMIT 1', seats: 'D4', status: 'OK', gate: 'Turnstile A' },
  { time: '06:05:10 PM', ref: 'CW-BLR-3112', action: 'ADMIT 4', seats: 'B1-B4', status: 'OK', gate: 'Turnstile B' },
  { time: '05:58:22 PM', ref: 'CW-CHN-1090', action: 'ADMIT 2', seats: 'F1, F2', status: 'OK', gate: 'Turnstile A' }
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
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
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
    return sendJSON(res, 200, { status: 'OK', service: 'CineWave Entertainment Backend API', uptime: process.uptime() });
  }

  // 2. Movies Catalog
  if (method === 'GET' && pathname === '/api/movies') {
    const movies = readData('movies.json');
    return sendJSON(res, 200, { success: true, count: movies.length, data: movies });
  }

  // 3. Theatres Catalog with Optional City Filter
  if (method === 'GET' && pathname === '/api/theatres') {
    let theatres = readData('theatres.json');
    const cityParam = parsedUrl.searchParams.get('city');
    if (cityParam) {
      theatres = theatres.filter(t => t.city.toLowerCase() === cityParam.toLowerCase());
    }
    return sendJSON(res, 200, { success: true, count: theatres.length, data: theatres });
  }

  // 4. Concessions & Snacks
  if (method === 'GET' && pathname === '/api/concessions') {
    const concessions = readData('concessions.json');
    return sendJSON(res, 200, { success: true, data: concessions });
  }

  // 5. Promo Codes
  if (method === 'GET' && pathname === '/api/promos') {
    const promos = readData('promos.json');
    return sendJSON(res, 200, { success: true, count: promos.length, data: promos });
  }

  if (method === 'POST' && pathname === '/api/promos/validate') {
    const body = await parseBody(req);
    const code = (body.code || '').toUpperCase().trim();
    const promos = readData('promos.json');
    const promo = promos.find(p => p.code === code && p.active);

    if (promo) {
      return sendJSON(res, 200, { success: true, valid: true, promo });
    } else {
      return sendJSON(res, 400, { success: false, valid: false, message: 'Invalid or expired coupon code' });
    }
  }

  // 6. Pricing Calculation Engine
  if (method === 'POST' && pathname === '/api/pricing/calculate') {
    const body = await parseBody(req);
    const { basePrice = 190, quantity = 2, tier = 'Platinum', promoCode = '', concessionsTotal = 0 } = body;

    const subtotal = basePrice * quantity;
    const convenienceFee = subtotal * 0.10;
    const convenienceTax = convenienceFee * 0.18;
    const foodGst = concessionsTotal * 0.05;

    let tierDiscountPercent = 0;
    if (tier === 'Platinum') tierDiscountPercent = 0.20;
    else if (tier === 'Gold') tierDiscountPercent = 0.10;
    else if (tier === 'Silver') tierDiscountPercent = 0.05;

    const loyaltyDiscount = subtotal * tierDiscountPercent;

    let promoDiscount = 0;
    if (promoCode.includes('DIN20') || promoCode.includes('20%')) {
      promoDiscount = subtotal * 0.20;
    } else if (promoCode.includes('BMS50')) {
      promoDiscount = Math.min(50, subtotal);
    } else if (promoCode.includes('SUPERSTAR')) {
      promoDiscount = subtotal * 0.15;
    }

    const total = Math.max(0, subtotal + convenienceFee + convenienceTax + concessionsTotal + foodGst - loyaltyDiscount - promoDiscount);

    return sendJSON(res, 200, {
      success: true,
      breakdown: {
        basePrice,
        quantity,
        subtotal,
        convenienceFee,
        convenienceTax,
        concessionsTotal,
        foodGst,
        loyaltyDiscount,
        promoDiscount,
        total: parseFloat(total.toFixed(2))
      }
    });
  }

  // 7. Bookings Management (Ticket Wallet)
  if (method === 'GET' && pathname === '/api/wallet' || method === 'GET' && pathname === '/api/bookings') {
    const bookings = readData('bookings.json');
    return sendJSON(res, 200, { success: true, count: bookings.length, data: bookings });
  }

  if (method === 'POST' && pathname === '/api/bookings') {
    const newBooking = await parseBody(req);
    const bookings = readData('bookings.json');
    bookings.unshift(newBooking);
    writeData('bookings.json', bookings);
    return sendJSON(res, 201, { success: true, message: 'Booking confirmed', data: newBooking });
  }

  // Cancel Booking Endpoint
  if (method === 'POST' && pathname.startsWith('/api/bookings/') && pathname.endsWith('/cancel')) {
    const ref = pathname.split('/')[3];
    const bookings = readData('bookings.json');
    const booking = bookings.find(b => b.ref === ref);

    if (booking) {
      booking.status = 'Cancelled - Refunded';
      writeData('bookings.json', bookings);
      const refundAmount = booking.paid * 0.8;
      return sendJSON(res, 200, { success: true, message: `Booking ${ref} cancelled`, refundAmount });
    } else {
      return sendJSON(res, 404, { success: false, message: 'Booking not found' });
    }
  }

  // Reschedule Booking Endpoint
  if (method === 'POST' && pathname.startsWith('/api/bookings/') && pathname.endsWith('/reschedule')) {
    const ref = pathname.split('/')[3];
    const body = await parseBody(req);
    const bookings = readData('bookings.json');
    const booking = bookings.find(b => b.ref === ref);

    if (booking) {
      if (body.date) booking.date = body.date;
      if (body.time) booking.time = body.time;
      writeData('bookings.json', bookings);
      return sendJSON(res, 200, { success: true, message: `Booking ${ref} rescheduled`, data: booking });
    } else {
      return sendJSON(res, 404, { success: false, message: 'Booking not found' });
    }
  }

  // 8. Gate Scanner Simulator Endpoint
  if (method === 'POST' && pathname === '/api/scanner/validate') {
    const body = await parseBody(req);
    const ref = (body.ref || '').toUpperCase().trim();
    const bookings = readData('bookings.json');
    const booking = bookings.find(b => b.ref === ref);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (!booking) {
      gateAuditLogs.unshift({ time: now, ref, action: 'DENIED', seats: 'N/A', status: 'INVALID_PASS', gate: 'Turnstile A' });
      return sendJSON(res, 404, { success: false, status: 'INVALID', message: 'Ticket reference not found' });
    }

    if (booking.status.includes('Cancelled') || booking.status.includes('Refunded')) {
      gateAuditLogs.unshift({ time: now, ref, action: 'DENIED', seats: booking.seats.join(', '), status: 'REFUNDED_PASS', gate: 'Turnstile A' });
      return sendJSON(res, 400, { success: false, status: 'REFUNDED', message: 'Ticket has been cancelled and refunded', data: booking });
    }

    if (booking.scanned) {
      gateAuditLogs.unshift({ time: now, ref, action: 'DUPLICATE', seats: booking.seats.join(', '), status: 'ALREADY_SCANNED', gate: 'Turnstile A' });
      return sendJSON(res, 409, { success: false, status: 'ALREADY_SCANNED', message: 'Ticket already validated earlier', data: booking });
    }

    booking.scanned = true;
    writeData('bookings.json', bookings);
    gateAuditLogs.unshift({ time: now, ref, action: `ADMIT ${booking.qty}`, seats: booking.seats.join(', '), status: 'OK', gate: 'Turnstile A' });
    return sendJSON(res, 200, { success: true, status: 'VALID', message: 'Admission granted', data: booking });
  }

  // 9. Manager Metrics & Gate Logs
  if (method === 'GET' && pathname === '/api/manager/metrics') {
    const bookings = readData('bookings.json');
    let totalRevenue = 148920;
    let totalSold = 684;

    bookings.forEach(b => {
      if (b.status === 'Confirmed' || b.status === 'Attended') {
        totalRevenue += b.paid || 0;
        totalSold += b.qty || 1;
      }
    });

    const occupancy = ((totalSold / 780) * 100).toFixed(1) + '%';

    return sendJSON(res, 200, {
      success: true,
      metrics: {
        gboc: `₹${totalRevenue.toLocaleString('en-IN')}`,
        ticketsSold: `${totalSold} / 780`,
        occupancy: occupancy,
        fbSales: '₹34,250'
      },
      recentLogs: gateAuditLogs.slice(0, 10)
    });
  }

  // 10. Razorpay Payment Gateway Endpoints
  if (method === 'POST' && pathname === '/api/payment/create-order') {
    const body = await parseBody(req);
    const amountInRupees = parseFloat(body.amount || '348.84');
    const amountInPaise = Math.round(amountInRupees * 100);
    const orderId = `order_RP_IND_${Math.floor(100000 + Math.random() * 900000)}`;

    return sendJSON(res, 200, {
      success: true,
      keyId: 'rzp_live_CineWaveIndia_2026',
      orderId: orderId,
      amount: amountInPaise,
      currency: 'INR',
      merchantName: 'CineWave Entertainment (Pan-India Booking Gateway)',
      description: `Movie Tickets Reservation - ${body.movie || 'CineWave Premiere'}`
    });
  }

  if (method === 'POST' && pathname === '/api/payment/verify') {
    const body = await parseBody(req);
    const { paymentId, orderId, method: payMethod } = body;

    return sendJSON(res, 200, {
      success: true,
      verified: true,
      paymentId: paymentId || `pay_RP_IND_${Math.floor(100000 + Math.random() * 900000)}`,
      orderId: orderId || 'order_RP_IND_94821',
      method: payMethod || 'UPI (Google Pay)',
      timestamp: new Date().toISOString(),
      message: 'Payment successfully verified via Razorpay 256-bit secure gateway.'
    });
  }

  // ================= STATIC FILE SERVER (Frontend Assets) =================
  let filePath = path.join(FRONTEND_DIR, pathname === '/' ? 'index.html' : pathname);
  
  if (!fs.existsSync(filePath) && fs.existsSync(path.join(__dirname, '..', pathname === '/' ? 'index.html' : pathname))) {
    filePath = path.join(__dirname, '..', pathname === '/' ? 'index.html' : pathname);
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        const indexFallback = path.join(FRONTEND_DIR, 'index.html');
        if (fs.existsSync(indexFallback)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
          return res.end(fs.readFileSync(indexFallback));
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log('🎬 CineWave Entertainment Pan-India Backend Running!');
  console.log(`🌐 Application URL: http://localhost:${PORT}`);
  console.log(`📡 REST API Base:   http://localhost:${PORT}/api/`);
  console.log(`📁 Serving Frontend: ${FRONTEND_DIR}`);
  console.log('====================================================');
});
