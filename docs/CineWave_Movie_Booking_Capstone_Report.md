# CAPSTONE PROJECT REPORT
## CineWave Entertainment / BookMyShow Dindigul: Movie Ticket Booking Management
**Platform:** Pega Platform™ (Pega Infinity v8.x / v25.x)  
**Author / Operator:** `author@uplus`  
**Application Name:** CineWave Entertainment (BookMyShow Dindigul Regional Deployment)  
**Case Type:** Movie Ticket Booking (`CineWave-Work-BookingRequest`)  
**Geographic Scope:** Dindigul, Tamil Nadu, India  

---

## 1. Executive Summary & Problem Context

In cinema hubs like **Dindigul**, movie ticket bookings across leading multi-screen theatres (including *Umaa Rajendra Cinemas*, *Aarthi Grand Cineplex*, *Vijay Theatre*, and *J Cinemas*) require synchronized real-time seat inventory, dynamic pricing calculations in Indian Rupees (₹), Goods and Services Tax (GST) compliance, priority routing for VIP balcony tickets, and automated customer communication.

By leveraging **Pega Platform™** and low-code case lifecycle management, CineWave Entertainment created a BookMyShow-grade automated ticket booking engine that replaces manual queue handling with an intelligent, resilient workflow.

---

## 2. Case Life Cycle Architecture

```
+----------------------------------------------------------------------------------------------------+
|                                      CASE LIFE CYCLE STAGES                                        |
+----------------------+--------------------+--------------------+-------------------+---------------+
| 1. Submission        | 2. Cost & Validate | 3. Review & Route  | 4. Confirm & Pay  | 5. M-Ticket   |
+----------------------+--------------------+--------------------+-------------------+---------------+
| - Select Movie       | - Validate Seat    | - Decision Routing | - Review Summary  | - Generate Ref|
|   (Amaran, GOAT)     |   Availability     |   by Show Type     | - 10m SLA Timer   | - Send Email  |
| - Select Dindigul    | - Calculate Fare   | - VIP Concierge    | - Capture Consent | - Decrement   |
|   Cinema & Showtime  |   in INR (₹) + GST |   Queue Review     | - Process Payment |   Inventory   |
| - Select Seat Matrix | - Apply BMS Tier   |                    |                   | - Resolved-   |
|                      |   Discount (20%)   |                    |                   |   Completed   |
+----------------------+--------------------+--------------------+-------------------+---------------+
                                                                 |
                                                                 v [If SLA Timeout / User Abort]
                                                     +-----------------------------------------------+
                                                     | Alternate Stage: Cancellation                 |
                                                     +-----------------------------------------------+
                                                     | - Release Held Seats to Dindigul Inventory    |
                                                     | - Status: Resolved-Cancelled                  |
                                                     +-----------------------------------------------+
```

---

## 3. Data Model & Master Records (Dindigul Region)

| Data Object | Key Attributes | Sample Dindigul Records |
| :--- | :--- | :--- |
| **`Movie`** | `MovieID`, `Title`, `Genre`, `Language`, `Duration`, `Rating` | *Amaran* (Tamil, UA), *GOAT* (Tamil, UA), *Vettaiyan* (Tamil, UA), *Interstellar 4K* (English, UA) |
| **`Theatre`** | `TheatreID`, `TheatreName`, `City`, `ScreenCount`, `SoundFormat` | *Umaa Rajendra Cinemas 4K RGB Laser Dolby Atmos*, *Aarthi Grand Cineplex A/C*, *Vijay Theatre Barco 4K*, *J Cinemas Chinnalapatti* |
| **`Show`** | `ShowID`, `MovieTitle`, `TheatreName`, `ShowTime`, `ShowType`, `BasePrice`, `AvailableSeats` | Slots: 10:30 AM, 02:00 PM, 06:30 PM, 09:45 PM. Types: *4K Laser Dolby Atmos (₹190)*, *Standard 2D (₹150)*, *VIP Balcony Recliner (₹250)* |
| **`Customer`** | `CustomerID`, `FullName`, `EmailAddress`, `PhoneNumber`, `MembershipTier` | Profiles with BMS Silver (5%), Gold (10%), and Platinum VIP (20%) reward tier mapping |

---

## 4. Story Implementation Summary (US-001 to US-010)

- **US-001 (Submit Movie Ticket Request):** Visual movie selection card grid, Dindigul theatre picker, daily showtime pills, and interactive seat matrix.
- **US-002 (Check Show Availability):** Validation rule `.NumberOfTickets <= .ShowDetails.AvailableSeats` preventing auditorium overbooking.
- **US-003 (Calculate Booking Cost):** Declare Expressions for Base Price + 10% Convenience Fee + 18% GST - Loyalty Discount in INR (₹).
- **US-004 (Confirm Booking Request):** Two-column review card with cinema location details, seat tags, and policy acknowledgment.
- **US-005 (Maintain Movie and Show Data):** Local data storage for Dindigul movies and cinema venues via Pega Data Pages (`D_MovieList`, `D_TheatreList`).
- **US-006 (Review Booking Details):** High-volume and VIP balcony booking review step routed to manager/CSR work queues.
- **US-007 (Process Ticket Booking):** Automated status transition to `Resolved-Completed` and generation of unique booking code `BMS-DGL-XXXXX`.
- **US-008 (Notify Booking Confirmation):** Automated HTML email correspondence delivering digital M-Ticket with QR barcode.
- **US-009 (Define Booking SLA):** 10-minute Goal (+15 urgency) and 30-minute Deadline (+30 urgency) with automatic seat release on expiration.
- **US-010 (Route Booking Request by Show Type):** Decision table routing VIP Balcony to `VIPConciergeQueue@uplus` and 4K Laser shows to specialized queue.

---

## 5. Test Execution Matrix

| Test Case | Scenario | Inputs | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Booking Amaran at Umaa Rajendra Cinemas | 2 Tickets, 4K Atmos (₹190), Platinum Tier | Subtotal: ₹380, Fee: ₹38, GST: ₹6.84, Discount: -₹76, **Total: ₹348.84** | **PASS** |
| **TC-02** | Capacity Validation Test | Request 60 tickets when 52 available | Inline error preventing case submission | **PASS** |
| **TC-03** | VIP Balcony Routing | Show Type = VIP Premiere Recliner | Case routes to `VIPConciergeQueue@uplus` | **PASS** |
| **TC-04** | SLA Hold Expiration | Inactive > 10 mins post-deadline | Case advances to Cancellation, seats unlocked | **PASS** |

---

## 6. Submission Checklist & Screenshots

1. **[Screenshot 1]**: Pega App Studio Case Lifecycle view showing 5 Primary stages and 1 Alternate Cancellation stage.
2. **[Screenshot 2]**: Data Model tab displaying `Movie`, `Theatre`, `Show`, and `Customer` objects.
3. **[Screenshot 3]**: BookMyShow Dindigul movie request capture form UI.
4. **[Screenshot 4]**: Calculated fare breakdown showing INR (₹) subtotal, fee, GST, and discount.
5. **[Screenshot 5]**: SLA Timer configuration panel (10m Goal, 30m Deadline).
6. **[Screenshot 6]**: Decision shape routing configuration by Show Type.
7. **[Screenshot 7]**: Generated M-Ticket with QR code and automated confirmation email preview.
