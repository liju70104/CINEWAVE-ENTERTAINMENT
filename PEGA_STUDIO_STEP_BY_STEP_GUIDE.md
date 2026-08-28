# CineWave / BookMyShow Dindigul: Movie Ticket Booking Management
## Pega Platform™ Step-by-Step Configuration & Implementation Guide

---

### Application Overview
- **Application Name:** CineWave Entertainment (BookMyShow Dindigul Regional Deployment)
- **Case Type:** Movie Ticket Booking (`CineWave-Work-BookingRequest`)
- **Target Operator:** `author@uplus` / Password: `pega123!`
- **Development Tool:** Pega App Studio (with Dev Studio where advanced configuration is required)
- **Location Scope:** Dindigul, Tamil Nadu, India (Theatres: Umaa Rajendra Cinemas, Aarthi Grand Cineplex, Vijay Theatre, J Cinemas)

---

## Stage 1: Application Setup & Case Type Creation

### Step 1.1: Log in and Create the Application
1. Log into Pega Platform with `author@uplus` / `pega123!`.
2. In **App Studio**, click the Application dropdown in the top header &rarr; **New Application**.
3. Select **Theme Cosmos** or **Constellation**.
4. Enter Application Name: `CineWave Entertainment`.
5. Click **Create Application** &rarr; click **Go to app**.

### Step 1.2: Create the Case Type
1. In the left navigation menu, click **Case types**.
2. Click **+ Add case type** &rarr; Enter name: `Movie Ticket Booking`.
3. Click **Submit**.

---

## Stage 2: Data Modeling (US-005: Maintain Movie and Show Data - Dindigul Catalog)

### Step 2.1: Create Data Objects
Navigate to **Data** in the left menu &rarr; **Data objects and integrations** &rarr; **+ Add data object**.

#### 1. `Movie` Data Object
- **Name:** `Movie`
- **Fields:**
  - `MovieID` (Text, Required)
  - `Title` (Text, Required)
  - `Genre` (PickList: Action, Sci-Fi, Drama, Thriller, Comedy, Animation)
  - `DurationMinutes` (Integer)
  - `Language` (PickList: Tamil, Telugu, Hindi, English, Malayalam)
  - `Rating` (PickList: U, UA, A, S)
- **Local Data Storage Records:**
  - *MOV-DGL-01* | *Amaran* | Action/Drama | 168 min | Tamil | UA
  - *MOV-DGL-02* | *The Greatest of All Time (GOAT)* | Sci-Fi Action | 179 min | Tamil | UA
  - *MOV-DGL-03* | *Vettaiyan* | Action Drama | 163 min | Tamil | UA
  - *MOV-DGL-04* | *Interstellar (4K Laser Re-Release)* | Sci-Fi | 169 min | English | UA

#### 2. `Theatre` Data Object
- **Name:** `Theatre`
- **Fields:**
  - `TheatreID` (Text, Required)
  - `TheatreName` (Text, Required)
  - `City` (Text - Dindigul)
  - `ScreenCount` (Integer)
  - `SoundSystem` (PickList: Dolby Atmos 7.1, Barco 4K, 2K Dolby)
- **Sample Records:**
  - *TH-DGL-01* | Umaa Rajendra Cinemas 4K RGB Laser Dolby Atmos | Dindigul | 4
  - *TH-DGL-02* | Aarthi Grand Cineplex A/C 2K Dolby | Dindigul | 3
  - *TH-DGL-03* | Vijay Theatre Barco 4K Dolby 7.1 | Dindigul | 2
  - *TH-DGL-04* | J Cinemas 4K Dolby Atmos | Chinnalapatti, Dindigul | 2

#### 3. `Show` Data Object
- **Name:** `Show`
- **Fields:**
  - `ShowID` (Text, Required)
  - `MovieTitle` (Text)
  - `TheatreName` (Text)
  - `ShowDate` (Date)
  - `ShowTime` (PickList: 10:30 AM, 02:00 PM, 06:30 PM, 09:45 PM)
  - `ShowType` (PickList: Standard 2D, 4K RGB Laser Dolby Atmos, VIP Balcony Recliner, RealD 3D)
  - `BaseTicketPrice` (Currency - ₹150 for 2D, ₹190 for 4K Atmos, ₹250 for VIP Recliner)
  - `AvailableSeats` (Integer - e.g., 52)

#### 4. `Customer` Data Object
- **Name:** `Customer`
- **Fields:**
  - `CustomerID` (Text)
  - `FullName` (Text, Required)
  - `EmailAddress` (Email, Required)
  - `PhoneNumber` (Phone, Required)
  - `MembershipTier` (PickList: Regular, Silver, Gold, Platinum)

---

## Stage 3: Case Life Cycle Configuration

```
[ Stage 1: Submission ] (Primary)
  ├── Step 1.1: Collect Customer Profile (Collect information)
  ├── Step 1.2: Select Movie, Dindigul Cinema & Showtime (Collect information)
  └── Step 1.3: Select Seats & Seating Tier (Collect information)

[ Stage 2: Validation & Costing ] (Primary)
  ├── Step 2.1: Check Seat Availability (Validation rule)
  └── Step 2.2: Calculate Fare & GST (Declare Expression / Data transform)

[ Stage 3: Review & Routing ] (Primary)
  └── Step 3.1: Route by Show Format / VIP Tier (Decision table)

[ Stage 4: Customer Confirmation ] (Primary)
  ├── Step 4.1: Review and Confirm Booking (Collect information with SLA)
  └── Step 4.2: Process Payment & Reserve Seats (Automation)

[ Stage 5: Fulfillment & Resolution ] (Primary)
  ├── Step 5.1: Generate M-Ticket Reference (Automation)
  ├── Step 5.2: Send Confirmation Email & SMS (Send email)
  └── Step 5.3: Resolve Case (Resolved-Completed)

[ Alternate Stage: Cancellation ]
  └── Step A1: Release Held Seats (Change stage / Resolved-Cancelled)
```

---

## Stage 4: User Story Configuration (US-001 to US-010)

### US-001: Submit Movie Ticket Request
- **App Studio Click Path:** Open Case Type &rarr; Stage 1 &rarr; Step 1.1 & 1.2 View.
- Configure dropdowns sourcing from `D_MovieList` (Movies in Dindigul) and `D_TheatreList` (Dindigul Multiplexes).
- Add Seat Matrix selector (Silver, Gold, Balcony, VIP Recliner).

### US-002: Check Show Availability
- Add Pega Validate Rule on `.NumberOfTickets`:
  - Condition: `.NumberOfTickets <= .ShowDetails.AvailableSeats`
  - Error: *"Requested number of tickets exceeds available seating capacity in the selected Dindigul auditorium."*

### US-003: Calculate Booking Cost (₹ INR & GST)
- In App Studio / Dev Studio (Declare Expressions):
  - `SubTotal = .NumberOfTickets * .UnitPrice`
  - `ConvenienceFee = .SubTotal * 0.10` (10% BMS Convenience Charge)
  - `GSTAmount = .ConvenienceFee * 0.18` (18% GST)
  - `DiscountAmount = .SubTotal * .DiscountPercentage` (Platinum: 20%, Gold: 10%, Silver: 5%)
  - `TotalAmount = .SubTotal + .ConvenienceFee + .GSTAmount - .DiscountAmount`

### US-004: Confirm Booking Request
- 2-Column summary view displaying Movie poster, Dindigul Theatre address, Showtime slot, seat numbers, itemized ₹ billing, and terms checkbox.

### US-005: Maintain Movie and Show Data
- Populated local data storage with active Tamil & Indian cinema releases (*Amaran*, *GOAT*, *Vettaiyan*, *Interstellar*) across Dindigul theatres.

### US-006: Review Booking Details
- Staff review step conditionally triggered if booking amount exceeds ₹500 or is booked for VIP Balcony.

### US-007: Process Ticket Booking
- Case status updates to `Open-Confirmed` &rarr; `Resolved-Completed`, generates reference ID `BMS-DGL-XXXXX`, and decrements remaining seat inventory.

### US-008: Notify Booking Confirmation
- Automated Send Email correspondence containing M-Ticket pass, QR code, and booking reference sent to customer's email.

### US-009: Define Booking SLA
- Set SLA on Confirmation step: **Goal = 10 minutes** (+15 urgency), **Deadline = 30 minutes** (+30 urgency), **Passed Deadline = Auto-release seats & Advance to Resolved-Cancelled**.

### US-010: Route Booking Request by Show Type
- Decision rule directing *VIP Balcony* to `VIPConciergeQueue@uplus`, *4K Atmos* to `DolbyLaserQueue@uplus`, and *Standard 2D* to automated self-service.
