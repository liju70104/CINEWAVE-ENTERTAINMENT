# CineWave Entertainmen

A full-featured, responsive **Movie Ticket Booking & Theatre Management System**

---

## 📁 Project Architecture & Folder Structure

The project is cleanly separated into modular **Frontend**, **Backend**, and **Documentation** layers:

```
CineWave Entertainment/
│
├── frontend/                              # Frontend Client Application
│   ├── index.html                         # SPA Markup (Booking, Wallet, Concessions, Manager)
│   ├── style.css                          # Multi-theme CSS (Dark Cinema, Light Velvet, IMAX Gold)
│   └── app.js                             # Client-side UI Controller & REST API fetcher
│
├── backend/                               # Backend REST API Server & Data Layer
│   ├── data/                              # Local JSON Database
│   │   ├── movies.json                    # Movie Catalog (Amaran, GOAT, Vettaiyan, Interstellar)
│   │   ├── theatres.json                  # Dindigul Multiplex screens & capacities
│   │   ├── bookings.json                  # Active & past ticket reservations ledger
│   │   ├── concessions.json               # F&B Concessions menu & pricing
│   │   └── promos.json                    # Promo & discount voucher rules
│   ├── server.js                          # Lightweight Node.js HTTP REST API & Static Server
│   └── package.json                       # Backend scripts & metadata
│
├── docs/                                  # Project Documentation & Architecture Guides
│   ├── PEGA_STUDIO_STEP_BY_STEP_GUIDE.md  # Comprehensive Pega App Studio guide (US-001 to US-010)
│   ├── CineWave_Movie_Booking_Capstone_Report.md # Architecture & implementation report
│   └── pega_blueprint_spec.json           # Pega Blueprint Case Type specification
│
├── package.json                           # Root package launcher
└── README.md                              # Main project documentation
```

---

## 🚀 How to Run

### 1. Launch Backend Server (Serves REST API + Frontend Client):
```bash
npm start
# OR:
node backend/server.js
```
Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Standalone Frontend (Direct File Open):
You can also open [frontend/index.html](file:///c:/Users/LIJU/Desktop/CineWave%20Entertainment/frontend/index.html) directly in any web browser. The frontend includes automatic offline fallbacks if the backend is not running.

---

## 🎬 Core Features

1. **Multi-Theme Switcher (Top-Right Header):**
   - 🌙 **Dark Cinema** (BookMyShow obsidian & crimson glassmorphic theme)
   - ☀️ **Light Velvet** (Clean daylight counter mode with high-contrast slate aesthetics)
   - ✨ **IMAX Cyber Gold** (Luxury VIP gold & neon cyan highlights)
   - Smooth `0.3s` CSS variable transitions and `localStorage` persistence.

2. **5-Stage Movie Ticket Booking Flow:**
   - Real-time Dindigul multiplex showcase (*Umaa Rajendra Cinemas 4K*, *Aarthi Grand*, *Vijay Theatre*).
   - Interactive curved cinema seat layout with tiered pricing (`SILVER`, `GOLD`, `BALCONY`, `VIP RECLINER`).
   - 10-Minute seat reservation hold countdown timer.
   - Dynamic GST and Loyalty Discount calculations (Platinum VIP 20%, Gold 10%, Silver 5%).

3. **In-Cinema Concessions & F&B Pre-Ordering:**
   - Popcorn Tubs, Nachos Supreme, Fountain Coke Duos, and Dindigul Cold Coffee with 5% Concessions GST.
   - Delivered directly to booked seats during interval.

4. **Promo & Voucher Code Engine:**
   - Instant coupon discount validation (`DIN20` for 20% off, `BMS50` for ₹50 off, `SUPERSTAR` for 15% off).

5. **Customer Ticket Wallet & Pass Management:**
   - View active, attended, and cancelled M-Tickets.
   - High-resolution turnstile QR code passes with print capability.
   - **Live Ticket Cancellation & SLA Refund Engine**: 80% instant refund calculation with real-time seat inventory replenishment.
   - **Showtime Slot Rescheduler**: Change show dates and slots with instant confirmation.

6. **Theatre Manager Console & Live Gate Scanner:**
   - Simulated barcode/QR code gate turnstile scanner with live validation status (`✅ ADMISSION GRANTED`, `⚠️ ALREADY SCANNED`, `⛔ CANCELLED / REFUNDED`).
   - Real-time Gross Box Office Collection (GBOC), Occupancy % gauge, and Gate Entry Audit Logs.

---

## 📡 Backend REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health and uptime |
| `GET` | `/api/movies` | Fetch Dindigul movie catalog |
| `GET` | `/api/theatres` | Fetch multiplex screen formats & capacities |
| `GET` | `/api/concessions` | Fetch snack bar menu & prices |
| `GET` | `/api/wallet` | Fetch customer booking ledger |
| `POST` | `/api/bookings` | Create new ticket booking |
| `GET` | `/api/bookings/:ref` | Lookup digital M-Ticket by reference ID |
| `POST` | `/api/bookings/:ref/cancel` | Cancel booking & execute SLA refund (80%) |
| `POST` | `/api/bookings/:ref/reschedule` | Reschedule showtime slot & date |
| `POST` | `/api/scanner/validate` | Gate turnstile QR scanner verification |
| `GET` | `/api/manager/metrics` | Fetch live GBOC & occupancy analytics |
| `POST` | `/api/promos/validate` | Validate promo & voucher discount codes |
