// CineWave Entertainment - Pan-India Movie Ticket Booking & Management System
// Frontend Client Controller with Glassmorphism UI, Live Search, Trailer Modal, Pan-India City Selector, Razorpay & Confetti

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const showDateInput = document.getElementById('show-date');
  if (showDateInput) showDateInput.value = today;

  // ================= THEME SWITCHER ENGINE =================
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const themeIconBox = document.getElementById('theme-icon-box');
  const themeNameTag = document.getElementById('theme-name-tag');
  
  const themes = [
    { id: 'dark', label: 'Dark Cinema', icon: 'moon' },
    { id: 'light', label: 'Light Velvet', icon: 'sun' },
    { id: 'cyber', label: 'IMAX Cyber Gold', icon: 'sparkles' }
  ];

  let currentThemeIndex = 0;
  const savedTheme = localStorage.getItem('cinewave_theme') || 'dark';
  const foundIdx = themes.findIndex(t => t.id === savedTheme);
  if (foundIdx !== -1) currentThemeIndex = foundIdx;

  function applyTheme(themeObj) {
    document.documentElement.setAttribute('data-theme', themeObj.id);
    localStorage.setItem('cinewave_theme', themeObj.id);
    if (themeNameTag) themeNameTag.innerText = themeObj.label;
    if (themeIconBox) {
      themeIconBox.innerHTML = `<i data-lucide="${themeObj.icon}"></i>`;
      if (window.lucide) lucide.createIcons();
    }
  }

  // Initial Theme Load
  applyTheme(themes[currentThemeIndex]);

  themeToggleBtn?.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    applyTheme(themes[currentThemeIndex]);
  });

  // ================= AUTHENTICATION & ORIGINAL USER CREDENTIALS =================
  const authState = {
    isLoggedIn: false,
    username: '',
    fullName: '',
    email: '',
    phone: '+91 98421 78901',
    role: 'Platinum VIP Member',
    tier: 'Platinum'
  };

  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const tabSignIn = document.getElementById('tab-sign-in');
  const tabRegister = document.getElementById('tab-register');
  const authTitle = document.getElementById('auth-title');
  const authSub = document.getElementById('auth-sub');
  const btnLoginText = document.getElementById('btn-login-text');
  const btnLogout = document.getElementById('btn-logout');

  tabSignIn?.addEventListener('click', () => {
    tabSignIn.classList.add('active');
    tabRegister?.classList.remove('active');
    if (authTitle) authTitle.innerText = 'Sign In to CineWave';
    if (authSub) authSub.innerText = 'Enter your credentials to book movie tickets across India, view digital passes, and claim member discounts.';
    if (btnLoginText) btnLoginText.innerText = 'Sign In & Continue Booking';
  });

  tabRegister?.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabSignIn?.classList.remove('active');
    if (authTitle) authTitle.innerText = 'Create Your CineWave Account';
    if (authSub) authSub.innerText = 'Register with your original credentials for instant M-Tickets and loyalty discounts across all Indian cities.';
    if (btnLoginText) btnLoginText.innerText = 'Create Account & Continue';
  });

  // Load saved credentials from localStorage if available
  const savedUserJson = localStorage.getItem('cinewave_active_user');
  if (savedUserJson) {
    try {
      const u = JSON.parse(savedUserJson);
      document.getElementById('login-fullname').value = u.fullName || '';
      document.getElementById('login-username').value = u.username || '';
      document.getElementById('login-password').value = u.password || '';
      if (u.role) document.getElementById('login-role').value = u.role;
    } catch (e) {}
  } else {
    document.getElementById('login-fullname').value = 'Liju';
    document.getElementById('login-username').value = 'liju@cinewave.in';
    document.getElementById('login-password').value = 'cinewave2026';
  }

  function updateUserProfileDisplay(name, username, role) {
    document.getElementById('header-user-name').innerText = name;
    document.getElementById('header-user-id').innerText = username;
    const tierShort = role.split('(')[0].replace('Member', '').replace('CineWave', '').trim();
    document.getElementById('header-role-badge').innerText = tierShort || 'VIP';

    const nameInput = document.getElementById('cust-name');
    const emailInput = document.getElementById('cust-email');
    const phoneInput = document.getElementById('cust-phone');
    if (nameInput) nameInput.value = name;
    if (emailInput) emailInput.value = username.includes('@') ? username : `${username.toLowerCase()}@example.com`;
    if (phoneInput && !phoneInput.value) phoneInput.value = '+91 98421 78901';

    const rzpCardName = document.getElementById('rzp-card-name');
    if (rzpCardName) rzpCardName.value = name;
    const scanPatron = document.getElementById('scan-patron-name');
    if (scanPatron) scanPatron.innerText = name;
  }

  // Handle Login Submit
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const fullName = document.getElementById('login-fullname').value.trim() || 'Cinema Enthusiast';
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;
    const rememberMe = document.getElementById('chk-remember-user').checked;

    let tier = 'Platinum';
    if (role.includes('Gold')) tier = 'Gold';
    else if (role.includes('Silver')) tier = 'Silver';
    else if (role.includes('Standard')) tier = 'Regular';

    authState.isLoggedIn = true;
    authState.username = username;
    authState.fullName = fullName;
    authState.email = username.includes('@') ? username : `${username.toLowerCase()}@example.com`;
    authState.role = role;
    authState.tier = tier;

    state.customer.name = fullName;
    state.customer.email = authState.email;
    state.customer.tier = tier;

    const custTierSelect = document.getElementById('cust-tier');
    if (custTierSelect) custTierSelect.value = tier;

    if (rememberMe) {
      localStorage.setItem('cinewave_active_user', JSON.stringify({
        fullName,
        username,
        password,
        role,
        tier
      }));
    }

    updateUserProfileDisplay(fullName, username, role);
    recalculatePricing();

    loginModal.classList.add('hidden');
    if (window.lucide) lucide.createIcons();
  });

  btnLogout?.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  });

  // ================= PAN-INDIA THEATRES DATA =================
  const panIndiaTheatres = {
    'Mumbai': [
      { id: 'TH-MUM-01', name: 'PVR INOX Palladium & IMAX, Lower Parel', format: 'IMAX Laser & Dolby Atmos' },
      { id: 'TH-MUM-02', name: 'Cinepolis Viviana Megaplex 4DX & VIP, Thane', format: '4DX 3D & Dolby Atmos' },
      { id: 'TH-MUM-03', name: 'PVR Superplex IMAX Phoenix Marketcity, Kurla', format: 'IMAX Laser 4K' }
    ],
    'Delhi-NCR': [
      { id: 'TH-DEL-01', name: 'PVR Director\'s Cut & Gold Class, Vasant Kunj', format: 'Meyer Sound Dolby Atmos' },
      { id: 'TH-DEL-02', name: 'Cinepolis DLF Avenue 4K Laser, Saket', format: 'RealD 3D Dolby Atmos' },
      { id: 'TH-DEL-03', name: 'PVR Superplex Logix City Centre, Noida', format: 'IMAX & 4DX 4K Laser' }
    ],
    'Bengaluru': [
      { id: 'TH-BLR-01', name: 'PVR Superplex & IMAX, Forum South Bengaluru', format: 'IMAX with Laser & Atmos' },
      { id: 'TH-BLR-02', name: 'INOX Mantri Square 4K Insignia, Malleswaram', format: 'Dolby Atmos 7.1' },
      { id: 'TH-BLR-03', name: 'Cinepolis Nexus Shantiniketan 4K, Whitefield', format: 'RealD 3D Barco' }
    ],
    'Hyderabad': [
      { id: 'TH-HYD-01', name: 'Prasads Multiplex Large Screen 4K, Necklace Road', format: 'Dual Barco 4K Dolby Atmos' },
      { id: 'TH-HYD-02', name: 'AMB Cinemas Superplex VIP, Gachibowli', format: 'Dolby Atmos & Laser RGB' },
      { id: 'TH-HYD-03', name: 'PVR Next Galleria Mall, Panjagutta', format: '4K Dolby Atmos 7.1' }
    ],
    'Chennai': [
      { id: 'TH-CHN-01', name: 'Sathyam Cinemas (SPI), Royapettah', format: 'Dolby Atmos 64-Channel RDX' },
      { id: 'TH-CHN-02', name: 'PVR IMAX & 4DX, VR Mall Anna Nagar', format: 'IMAX Laser 12-Channel' },
      { id: 'TH-CHN-03', name: 'Palazzo Cinepolis The Forum Vijaya Mall, Vadapalani', format: 'RealD 3D VIP Suite' }
    ],
    'Kochi': [
      { id: 'TH-KOC-01', name: 'PVR Superplex & 4DX, LuLu International Mall', format: '4DX Dolby Atmos 7.1' },
      { id: 'TH-KOC-02', name: 'Shenoys 4K Laser Christie Cineplex, MG Road', format: 'Christie 4K Laser Atmos' },
      { id: 'TH-KOC-03', name: 'Cinepolis Centre Square Mall, MG Road', format: 'VIP RealD 3D' }
    ],
    'Kolkata': [
      { id: 'TH-KOL-01', name: 'INOX Quest Mall Insignia & IMAX, Park Circus', format: 'IMAX Laser & Dolby Atmos' },
      { id: 'TH-KOL-02', name: 'PVR Mani Square 4K Laser, EM Bypass', format: 'Dolby Atmos 7.1' }
    ],
    'Pune': [
      { id: 'TH-PUN-01', name: 'PVR Icon & Gold Class, The Pavillion Mall', format: 'Dolby Atmos 7.1' },
      { id: 'TH-PUN-02', name: 'Cinepolis Seasons Megaplex 4DX, Magarpatta', format: '4DX VIP Atmos' }
    ],
    'Ahmedabad': [
      { id: 'TH-AHM-01', name: 'Cinepolis Ahmedabad One 4DX & VIP, Vastrapur', format: '4DX 3D RealD Dolby' },
      { id: 'TH-AHM-02', name: 'PVR Acropolis Mall 4K Laser, Thaltej', format: 'Dolby Atmos 7.1' }
    ],
    'Coimbatore': [
      { id: 'TH-CBE-01', name: 'Broadway Mega Multiplex IMAX & EPIQ, Aerodrome Rd', format: 'IMAX with Laser & EPIQ' },
      { id: 'TH-CBE-02', name: 'The Cinema Brookefields Mall, Sukrawarpet', format: 'SPI 4K Dolby Atmos' }
    ],
    'Madurai': [
      { id: 'TH-MDU-01', name: 'INOX Vishaal de Mal 4K Laser, Gokhale Road', format: 'Barco 4K Dolby Atmos' },
      { id: 'TH-MDU-02', name: 'Jazz Cinemas Cine City 4K, Mattuthavani', format: 'Dolby Atmos 7.1' }
    ],
    'Dindigul': [
      { id: 'TH-DGL-01', name: 'Umaa Rajendra Cinemas 4K RGB Laser Dolby Atmos', format: 'Dolby Atmos 7.1' },
      { id: 'TH-DGL-02', name: 'Aarthi Grand Cineplex A/C 2K Dolby', format: '2K Dolby Surround' },
      { id: 'TH-DGL-03', name: 'Vijay Theatre Barco 4K Dolby 7.1', format: 'Barco 4K Dolby 7.1' },
      { id: 'TH-DGL-04', name: 'J Cinemas 4K Dolby Atmos, Chinnalapatti', format: '4K Dolby Atmos' }
    ],
    'Jaipur': [
      { id: 'TH-JAI-01', name: 'INOX G-T Central Insignia & IMAX, Malviya Nagar', format: 'IMAX Laser & Dolby Atmos' },
      { id: 'TH-JAI-02', name: 'Cinepolis World Trade Park 4K, JLN Marg', format: 'Dolby Atmos 7.1' }
    ],
    'Chandigarh': [
      { id: 'TH-CHD-01', name: 'PVR Elante Mall 4DX & Gold Class, Industrial Area', format: '4DX 3D Dolby Atmos' },
      { id: 'TH-CHD-02', name: 'Cinepolis Jagat Mall 4K Laser, Sector 17', format: 'RealD 3D Atmos' }
    ]
  };

  function populateTheatresForCity(cityName) {
    const theatreSelect = document.getElementById('theatre-select');
    if (!theatreSelect) return;

    const list = panIndiaTheatres[cityName] || panIndiaTheatres['Mumbai'];
    theatreSelect.innerHTML = list.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    
    if (list.length > 0) {
      state.movie.theatre = list[0].name;
    }
  }

  // ================= BOOKING & WALLET STATE =================
  const state = {
    bookingRef: `CW-MUM-${Math.floor(1000 + Math.random() * 9000)}`,
    razorpayPaymentId: '',
    razorpayOrderId: '',
    status: 'In-Progress',
    currentStage: 1,
    city: 'Mumbai',
    totalSeatsCapacity: 60,
    availableSeats: 54,
    selectedSeats: ['E5', 'E6'],
    ticketQty: 2,
    baseUnitPrice: 190.00,
    subtotal: 380.00,
    convenienceFee: 38.00,
    taxAmount: 6.84,
    discountAmount: 76.00,
    promoCode: '',
    promoDiscount: 0,
    concessions: {
      'snack-01': { name: 'Jumbo Caramel Popcorn', price: 220, qty: 0 },
      'snack-02': { name: 'Nachos Supreme & Cheese', price: 180, qty: 0 },
      'snack-03': { name: 'Duo Chilled Coke', price: 140, qty: 0 },
      'snack-04': { name: 'CineWave Cold Coffee', price: 120, qty: 0 }
    },
    concessionsTotal: 0,
    totalAmount: 348.84,
    customer: {
      name: 'User',
      email: 'user@example.com',
      phone: '+91 98421 78901',
      tier: 'Platinum'
    },
    movie: {
      id: 'MOV-DGL-01',
      title: 'Amaran',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=60',
      theatre: 'PVR INOX Palladium & IMAX, Lower Parel',
      date: today,
      time: '06:30 PM',
      type: 'Dolby Atmos 4K',
      seatClass: 'GOLD FIRST CLASS'
    },
    holdSecondsRemaining: 600,
    holdInterval: null,
    
    walletTickets: [
      {
        ref: 'CW-MUM-9281',
        movie: 'Amaran',
        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=60',
        theatre: 'PVR INOX Palladium & IMAX, Mumbai',
        date: today,
        time: '06:30 PM',
        format: 'PAN-INDIA • 4K RGB LASER DOLBY ATMOS',
        seats: ['E5', 'E6'],
        seatClass: 'GOLD FIRST CLASS',
        qty: 2,
        paid: 348.84,
        status: 'Confirmed',
        customerName: 'Senthil Kumar',
        customerEmail: 'senthil.kumar@gmail.com',
        customerPhone: '+91 98421 78901',
        snacks: 'Jumbo Caramel Popcorn (x1)',
        paymentMethod: 'Razorpay UPI (Google Pay)',
        rzpId: 'pay_RP_IND_94821',
        scanned: false
      },
      {
        ref: 'CW-BLR-7714',
        movie: 'GOAT - The Greatest Of All Time',
        poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=60',
        theatre: 'PVR Superplex IMAX, Forum South Bengaluru',
        date: tomorrow,
        time: '02:00 PM',
        format: 'TAMIL/HINDI • 4K IMAX LASER',
        seats: ['H8', 'H9'],
        seatClass: 'BALCONY / DIAMOND',
        qty: 2,
        paid: 418.00,
        status: 'Confirmed',
        customerName: 'Senthil Kumar',
        customerEmail: 'senthil.kumar@gmail.com',
        customerPhone: '+91 98421 78901',
        snacks: 'None',
        paymentMethod: 'Razorpay Cards (Visa)',
        rzpId: 'pay_RP_IND_63112',
        scanned: false
      },
      {
        ref: 'CW-CHN-4520',
        movie: 'Vettaiyan',
        poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&auto=format&fit=crop&q=60',
        theatre: 'Sathyam Cinemas (SPI), Royapettah, Chennai',
        date: '2026-08-27',
        time: '09:45 PM',
        format: 'TAMIL • DOLBY ATMOS 64-CH',
        seats: ['D4'],
        seatClass: 'GOLD CLASS',
        qty: 1,
        paid: 165.00,
        status: 'Attended',
        customerName: 'Senthil Kumar',
        customerEmail: 'senthil.kumar@gmail.com',
        customerPhone: '+91 98421 78901',
        snacks: 'None',
        paymentMethod: 'Razorpay UPI (PhonePe)',
        rzpId: 'pay_RP_IND_10940',
        scanned: true
      }
    ]
  };

  // Initial theatre populate
  populateTheatresForCity('Mumbai');

  // Sync wallet from backend API if available
  async function syncWalletFromBackend() {
    try {
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          state.walletTickets = json.data;
          updateWalletBadge();
        }
      }
    } catch (e) {}
  }
  syncWalletFromBackend();

  // ================= LIVE REAL-TIME MOVIE SEARCH & GENRE FILTER =================
  const headerSearchInput = document.getElementById('header-search');
  const genrePills = document.querySelectorAll('.genre-pill');
  const movieCards = document.querySelectorAll('.movie-card');

  function filterMovies() {
    const query = (headerSearchInput?.value || '').trim().toLowerCase();
    const activeGenrePill = document.querySelector('.genre-pill.active');
    const selectedGenre = activeGenrePill ? activeGenrePill.dataset.genre : 'all';

    movieCards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const genre = (card.dataset.genre || '').toLowerCase();
      const lang = (card.dataset.lang || '').toLowerCase();
      const synopsis = (card.dataset.synopsis || '').toLowerCase();

      const matchesQuery = !query || title.includes(query) || genre.includes(query) || lang.includes(query) || synopsis.includes(query);
      
      let matchesGenre = true;
      if (selectedGenre === 'Action') matchesGenre = genre.includes('action');
      else if (selectedGenre === 'Tamil') matchesGenre = lang.includes('tamil') || lang.includes('hindi');
      else if (selectedGenre === 'Sci-Fi') matchesGenre = genre.includes('sci-fi');
      else if (selectedGenre === 'Laser') matchesGenre = lang.includes('laser') || lang.includes('atmos') || lang.includes('imax');

      if (matchesQuery && matchesGenre) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  headerSearchInput?.addEventListener('input', () => {
    switchView('booking');
    filterMovies();
  });

  genrePills.forEach(pill => {
    pill.addEventListener('click', () => {
      genrePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      filterMovies();
    });
  });

  // Header Logo click returns to Booking
  document.getElementById('header-logo-btn')?.addEventListener('click', () => {
    switchView('booking');
    setStage(1, 'Select Movie & Seats');
  });

  // ================= PAN-INDIA CITY SELECTOR MODAL & SEARCH =================
  const cityModal = document.getElementById('city-modal');
  const btnCityPicker = document.getElementById('btn-city-picker');
  const btnCloseCityModal = document.getElementById('btn-close-city-modal');
  const cityCards = document.querySelectorAll('.city-card');
  const citySearchInput = document.getElementById('city-search-input');
  const currentCityText = document.getElementById('current-city');
  const bannerCityLabel = document.getElementById('banner-city-label');
  const tktCityBadge = document.getElementById('tkt-city-badge');

  btnCityPicker?.addEventListener('click', () => {
    cityModal?.classList.remove('hidden');
    if (citySearchInput) {
      citySearchInput.value = '';
      citySearchInput.focus();
    }
    cityCards.forEach(c => c.style.display = 'block');
    if (window.lucide) lucide.createIcons();
  });

  btnCloseCityModal?.addEventListener('click', () => {
    cityModal?.classList.add('hidden');
  });

  citySearchInput?.addEventListener('input', () => {
    const q = citySearchInput.value.trim().toLowerCase();
    cityCards.forEach(card => {
      const cityName = (card.dataset.city || '').toLowerCase();
      const stateName = (card.dataset.state || '').toLowerCase();
      if (!q || cityName.includes(q) || stateName.includes(q)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });

  cityCards.forEach(card => {
    card.addEventListener('click', () => {
      cityCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const selectedCity = card.dataset.city;

      state.city = selectedCity;
      if (currentCityText) currentCityText.innerText = selectedCity;
      if (bannerCityLabel) bannerCityLabel.innerText = `In Cinemas in ${selectedCity}`;
      if (tktCityBadge) tktCityBadge.innerText = `${selectedCity.toUpperCase()} MULTIPLEX`;

      populateTheatresForCity(selectedCity);

      cityModal?.classList.add('hidden');
    });
  });

  // ================= MOVIE TRAILER & DETAILS MODAL =================
  const movieDetailModal = document.getElementById('movie-detail-modal');
  const btnCloseMovieModal = document.getElementById('btn-close-movie-modal');
  const btnDismissMovieModal = document.getElementById('btn-dismiss-movie-modal');
  const btnModalBookThisMovie = document.getElementById('btn-modal-book-this-movie');
  let activeModalMovie = null;

  const movieDetailsData = {
    'MOV-DGL-01': {
      title: 'Amaran',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=60',
      genre: 'Action / Biography / Drama',
      lang: 'Tamil, Hindi, Telugu (2D, Dolby Atmos)',
      rating: '9.4/10 (128K Votes)',
      cert: 'UA 16+',
      cast: ['Sivakarthikeyan', 'Sai Pallavi', 'Bhuvan Arora', 'Rahul Bose'],
      synopsis: 'The heroic life and supreme sacrifice of Major Mukund Varadarajan of the Rajput Regiment, who led the anti-terror operation in Shopian, Kashmir. A high-octane emotional action drama.'
    },
    'MOV-DGL-02': {
      title: 'The Greatest of All Time (GOAT)',
      poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=60',
      genre: 'Action / Sci-Fi / Thriller',
      lang: 'Tamil, Hindi, Telugu',
      rating: '8.9/10 (95K Votes)',
      cert: 'UA',
      cast: ['Thalapathy Vijay', 'Prashanth', 'Prabhu Deva', 'Sneha', 'Meenakshi'],
      synopsis: 'A retired elite Special Anti-Terrorist Squad operative is drawn back into a high-stakes conspiracy across Thailand and Moscow when a rogue adversary from his past threatens his family.'
    },
    'MOV-DGL-03': {
      title: 'Vettaiyan',
      poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&auto=format&fit=crop&q=60',
      genre: 'Action / Police Drama',
      lang: 'Tamil, Hindi, Telugu (Dolby Atmos)',
      rating: '8.6/10 (81K Votes)',
      cert: 'UA',
      cast: ['Superstar Rajinikanth', 'Amitabh Bachchan', 'Fahadh Faasil', 'Rana Daggubati', 'Manju Warrier'],
      synopsis: 'A fearless encounter specialist IPS officer takes on corruption and crime cartels while confronting the moral questions of judicial encounters and systemic justice.'
    },
    'MOV-DGL-04': {
      title: 'Interstellar (Re-Release 4K)',
      poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&auto=format&fit=crop&q=60',
      genre: 'Sci-Fi / Adventure',
      lang: 'English, Hindi (4K Laser IMAX)',
      rating: '9.6/10 (240K Votes)',
      cert: 'UA',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
      synopsis: 'When Earth becomes uninhabitable in the future, a former NASA pilot and team of researchers travel through a wormhole across the galaxy in an attempt to find a new home for humanity.'
    }
  };

  function openMovieDetailModal(movieId) {
    const data = movieDetailsData[movieId];
    if (!data) return;

    activeModalMovie = { id: movieId, ...data };
    document.getElementById('mdm-title').innerHTML = `<i data-lucide="film" style="color: var(--bms-primary);"></i> ${data.title}`;
    document.getElementById('mdm-poster').src = data.poster;
    document.getElementById('mdm-name').innerText = data.title;
    document.getElementById('mdm-genre').innerText = data.genre;
    document.getElementById('mdm-rating').innerText = data.rating;
    document.getElementById('mdm-lang').innerText = data.lang;
    document.getElementById('mdm-cert').innerText = data.cert;
    document.getElementById('mdm-synopsis').innerText = data.synopsis;

    const castContainer = document.getElementById('mdm-cast-pills');
    if (castContainer) {
      castContainer.innerHTML = data.cast.map(actor => `<span class="cast-pill">${actor}</span>`).join('');
    }

    movieDetailModal?.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  document.querySelectorAll('.btn-open-trailer-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openMovieDetailModal(btn.dataset.movieId);
    });
  });

  btnCloseMovieModal?.addEventListener('click', () => movieDetailModal?.classList.add('hidden'));
  btnDismissMovieModal?.addEventListener('click', () => movieDetailModal?.classList.add('hidden'));

  btnModalBookThisMovie?.addEventListener('click', () => {
    if (!activeModalMovie) return;
    
    movieCards.forEach(c => {
      if (c.dataset.movieId === activeModalMovie.id) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });

    state.movie.id = activeModalMovie.id;
    state.movie.title = activeModalMovie.title;
    state.movie.poster = activeModalMovie.poster;

    const inputSel = document.getElementById('selected-movie-name');
    if (inputSel) inputSel.value = activeModalMovie.title;

    movieDetailModal?.classList.add('hidden');
    document.getElementById('ticket-request-form')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Movie Card Direct Selection
  movieCards.forEach(card => {
    card.addEventListener('click', () => {
      movieCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const title = card.dataset.title;
      const movieId = card.dataset.movieId;
      const img = card.dataset.img;
      state.movie.id = movieId;
      state.movie.title = title;
      if (img) state.movie.poster = img;

      const inputSel = document.getElementById('selected-movie-name');
      if (inputSel) inputSel.value = title;
    });
  });

  // ================= SUBNAV VIEW NAVIGATION =================
  const navTabButtons = document.querySelectorAll('.nav-tab-btn');
  const appViews = document.querySelectorAll('.app-view');

  function switchView(viewName) {
    navTabButtons.forEach(btn => {
      if (btn.dataset.view === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    appViews.forEach(v => v.classList.add('hidden'));

    if (viewName === 'booking') {
      document.getElementById('view-booking')?.classList.remove('hidden');
    } else if (viewName === 'wallet') {
      document.getElementById('view-my-bookings')?.classList.remove('hidden');
      renderTicketWallet();
    } else if (viewName === 'concessions') {
      document.getElementById('view-concessions')?.classList.remove('hidden');
      renderStandaloneConcessions();
    } else if (viewName === 'manager') {
      document.getElementById('view-manager')?.classList.remove('hidden');
      updateManagerMetrics();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) lucide.createIcons();
  }

  navTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
    });
  });

  document.getElementById('btn-view-wallet-after-booking')?.addEventListener('click', () => {
    switchView('wallet');
  });

  document.getElementById('btn-wallet-new-booking')?.addEventListener('click', () => {
    switchView('booking');
    setStage(1, 'Select Movie & Seats');
  });

  // Render Auditorium Seat Matrix
  const seatGrid = document.getElementById('seat-grid');
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cols = 10;
  const occupiedSeats = ['B3', 'B4', 'C7', 'C8', 'D1', 'D2', 'F9', 'F10'];

  function initSeatMatrix() {
    if (!seatGrid) return;
    seatGrid.innerHTML = '';
    rows.forEach(r => {
      for (let c = 1; c <= cols; c++) {
        const seatId = `${r}${c}`;
        const seatEl = document.createElement('div');
        seatEl.classList.add('seat-item');
        seatEl.innerText = seatId;
        seatEl.dataset.seat = seatId;
        seatEl.title = `Row ${r} • Seat ${c}`;

        if (occupiedSeats.includes(seatId)) {
          seatEl.classList.add('occupied');
        } else if (state.selectedSeats.includes(seatId)) {
          seatEl.classList.add('selected');
        }

        seatEl.addEventListener('click', () => handleSeatClick(seatId, seatEl));
        seatGrid.appendChild(seatEl);
      }
    });
  }

  function handleSeatClick(seatId, seatEl) {
    if (seatEl.classList.contains('occupied')) return;

    const maxQty = parseInt(document.getElementById('ticket-qty').value, 10) || 1;

    if (state.selectedSeats.includes(seatId)) {
      state.selectedSeats = state.selectedSeats.filter(s => s !== seatId);
      seatEl.classList.remove('selected');
    } else {
      if (state.selectedSeats.length >= maxQty) {
        const removed = state.selectedSeats.shift();
        const prevEl = seatGrid.querySelector(`[data-seat="${removed}"]`);
        if (prevEl) prevEl.classList.remove('selected');
      }
      state.selectedSeats.push(seatId);
      seatEl.classList.add('selected');
    }
  }

  initSeatMatrix();

  // ================= CONCESSIONS & F&B INTERACTION =================
  function setupConcessionsControls() {
    const snackCards = document.querySelectorAll('.snack-card');
    snackCards.forEach(card => {
      const itemId = card.dataset.itemId;
      const btnInc = card.querySelector('.btn-inc');
      const btnDec = card.querySelector('.btn-dec');
      const qtyEl = card.querySelector('.qty-val');

      btnInc?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.concessions[itemId]) {
          state.concessions[itemId].qty++;
          if (qtyEl) qtyEl.innerText = state.concessions[itemId].qty;
          updateConcessionsTotal();
        }
      });

      btnDec?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.concessions[itemId] && state.concessions[itemId].qty > 0) {
          state.concessions[itemId].qty--;
          if (qtyEl) qtyEl.innerText = state.concessions[itemId].qty;
          updateConcessionsTotal();
        }
      });
    });
  }

  function updateConcessionsTotal() {
    let total = 0;
    const selectedList = [];

    for (const key in state.concessions) {
      const item = state.concessions[key];
      if (item.qty > 0) {
        total += item.price * item.qty;
        selectedList.push(`${item.name} (${item.qty})`);
      }
    }

    state.concessionsTotal = total;
    const summaryBar = document.getElementById('concessions-summary-bar');
    const summaryText = document.getElementById('concessions-summary-text');
    
    if (selectedList.length > 0) {
      summaryBar?.classList.remove('hidden');
      if (summaryText) summaryText.innerText = `${selectedList.join(', ')} • Concessions Total: ₹${total.toFixed(2)}`;
    } else {
      summaryBar?.classList.add('hidden');
    }

    recalculatePricing();
  }

  setupConcessionsControls();

  function renderStandaloneConcessions() {
    const container = document.getElementById('standalone-concessions-grid');
    if (!container) return;
    container.innerHTML = `
      <div class="snack-card">
        <div class="snack-img-wrap">
          <img src="https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=300&auto=format&fit=crop&q=60" alt="Caramel Popcorn" class="snack-img"/>
          <span class="snack-tag veg">Veg</span>
        </div>
        <div class="snack-info">
          <h4>Jumbo Caramel Popcorn Tub</h4>
          <p>Buttery crispy caramel crunch popped fresh for moviegoers.</p>
          <div class="snack-footer">
            <span class="snack-price">₹220</span>
            <span class="badge badge-green"><i data-lucide="check"></i> In Stock</span>
          </div>
        </div>
      </div>
      <div class="snack-card">
        <div class="snack-img-wrap">
          <img src="https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300&auto=format&fit=crop&q=60" alt="Nachos" class="snack-img"/>
          <span class="snack-tag veg">Veg</span>
        </div>
        <div class="snack-info">
          <h4>Nachos Supreme & Melted Cheddar</h4>
          <p>Corn nachos with Mexican jalapenos and rich creamy hot cheese dip.</p>
          <div class="snack-footer">
            <span class="snack-price">₹180</span>
            <span class="badge badge-green"><i data-lucide="check"></i> Fresh Prepared</span>
          </div>
        </div>
      </div>
      <div class="snack-card">
        <div class="snack-img-wrap">
          <img src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=60" alt="Coke" class="snack-img"/>
          <span class="snack-tag veg">Beverage</span>
        </div>
        <div class="snack-info">
          <h4>Duo Chilled Fountain Coke (500ml x 2)</h4>
          <p>Two ice-cold fizzy glasses of Coca-Cola.</p>
          <div class="snack-footer">
            <span class="snack-price">₹140</span>
            <span class="badge badge-blue"><i data-lucide="snowflake"></i> Ice Chilled</span>
          </div>
        </div>
      </div>
      <div class="snack-card">
        <div class="snack-img-wrap">
          <img src="https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300&auto=format&fit=crop&q=60" alt="Coffee" class="snack-img"/>
          <span class="snack-tag veg">Beverage</span>
        </div>
        <div class="snack-info">
          <h4>CineWave Special Iced Coffee</h4>
          <p>Traditional degree decoction blend with creamy milk & chocolate dust.</p>
          <div class="snack-footer">
            <span class="snack-price">₹120</span>
            <span class="badge badge-green"><i data-lucide="coffee"></i> Premium Brew</span>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }

  // ================= PROMO CODE ENGINE =================
  const promoInput = document.getElementById('promo-code-input');
  const btnApplyPromo = document.getElementById('btn-apply-promo');
  const promoMsg = document.getElementById('promo-msg');
  const promoMsgText = document.getElementById('promo-msg-text');
  const promoRow = document.getElementById('promo-discount-row');
  const quickPromoPills = document.querySelectorAll('.quick-promo-pill');

  async function applyPromoCode(code) {
    code = code.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.promo) {
          const promo = json.promo;
          if (promo.discountPercent) {
            state.promoCode = `${code} (${(promo.discountPercent * 100)}% OFF)`;
            state.promoDiscount = state.subtotal * promo.discountPercent;
          } else if (promo.flatDiscount) {
            state.promoCode = `${code} (₹${promo.flatDiscount} Flat)`;
            state.promoDiscount = Math.min(promo.flatDiscount, state.subtotal);
          }
          showPromoSuccess(`Coupon '${code}' Applied! Saved ₹${state.promoDiscount.toFixed(2)}`);
          recalculatePricing();
          return;
        }
      }
    } catch (e) {}

    // Fallback
    if (code === 'DIN20') {
      state.promoCode = 'DIN20 (20% OFF)';
      state.promoDiscount = state.subtotal * 0.20;
      showPromoSuccess(`Coupon 'DIN20' Applied! Saved ₹${state.promoDiscount.toFixed(2)} (20% Off)`);
    } else if (code === 'BMS50') {
      state.promoCode = 'BMS50 (₹50 Flat)';
      state.promoDiscount = Math.min(50.00, state.subtotal);
      showPromoSuccess(`Coupon 'BMS50' Applied! Saved ₹${state.promoDiscount.toFixed(2)}`);
    } else if (code === 'SUPERSTAR') {
      state.promoCode = 'SUPERSTAR (15% OFF)';
      state.promoDiscount = state.subtotal * 0.15;
      showPromoSuccess(`Coupon 'SUPERSTAR' Applied! Saved ₹${state.promoDiscount.toFixed(2)}`);
    } else {
      if (promoMsg) {
        promoMsg.className = 'alert-box error';
        promoMsg.style.marginTop = '0.5rem';
        promoMsg.classList.remove('hidden');
        if (promoMsgText) promoMsgText.innerText = `Invalid coupon code '${code}'.`;
      }
      state.promoCode = '';
      state.promoDiscount = 0;
      if (promoRow) promoRow.classList.add('hidden');
    }

    recalculatePricing();
  }

  function showPromoSuccess(text) {
    if (promoMsg) {
      promoMsg.className = 'promo-applied-msg';
      promoMsg.classList.remove('hidden');
      if (promoMsgText) promoMsgText.innerText = text;
    }
    if (promoRow) promoRow.classList.remove('hidden');
    const calcPromoName = document.getElementById('calc-promo-code-name');
    const calcPromoDiscount = document.getElementById('calc-promo-discount');
    if (calcPromoName) calcPromoName.innerText = state.promoCode;
    if (calcPromoDiscount) calcPromoDiscount.innerText = `-₹${state.promoDiscount.toFixed(2)}`;
  }

  btnApplyPromo?.addEventListener('click', () => {
    applyPromoCode(promoInput?.value || '');
  });

  quickPromoPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const code = pill.dataset.code;
      if (code) {
        if (promoInput) promoInput.value = code;
        applyPromoCode(code);
      }
    });
  });

  // ================= PRICE CALCULATION ENGINE (₹ INR) =================
  function recalculatePricing() {
    const showTypeSelect = document.getElementById('show-type');
    const selectedOption = showTypeSelect ? showTypeSelect.options[showTypeSelect.selectedIndex] : null;
    const basePrice = parseFloat(selectedOption?.dataset.base || '190');
    const qty = parseInt(document.getElementById('ticket-qty')?.value, 10) || 1;
    const tier = document.getElementById('cust-tier')?.value || state.customer.tier || 'Platinum';

    const subtotal = basePrice * qty;
    const fee = subtotal * 0.10;
    const gst = fee * 0.18;

    let discountPercent = 0;
    if (tier === 'Platinum') discountPercent = 0.20;
    else if (tier === 'Gold') discountPercent = 0.10;
    else if (tier === 'Silver') discountPercent = 0.05;

    const loyaltyDiscount = subtotal * discountPercent;
    const foodCost = state.concessionsTotal;
    const foodGst = foodCost * 0.05;

    if (state.promoCode.includes('20%')) {
      state.promoDiscount = subtotal * 0.20;
    } else if (state.promoCode.includes('15%')) {
      state.promoDiscount = subtotal * 0.15;
    }

    const total = subtotal + fee + gst + foodCost + foodGst - loyaltyDiscount - state.promoDiscount;

    state.baseUnitPrice = basePrice;
    state.subtotal = subtotal;
    state.convenienceFee = fee;
    state.taxAmount = gst + foodGst;
    state.discountAmount = loyaltyDiscount;
    state.totalAmount = Math.max(0, total);
    state.ticketQty = qty;

    // Update UI elements
    const calcShowType = document.getElementById('calc-show-type');
    const calcUnitPrice = document.getElementById('calc-unit-price');
    const calcQty = document.getElementById('calc-qty');
    const calcSubtotal = document.getElementById('calc-subtotal');
    const calcFee = document.getElementById('calc-fee');
    const calcTax = document.getElementById('calc-tax');
    const calcTierName = document.getElementById('calc-tier-name');
    const calcDiscount = document.getElementById('calc-discount');
    const calcTotal = document.getElementById('calc-total');
    const btnPayAmount = document.getElementById('btn-pay-amount');

    if (calcShowType) calcShowType.innerText = `${showTypeSelect?.value} (₹${basePrice.toFixed(2)} each)`;
    if (calcUnitPrice) calcUnitPrice.innerText = `₹${basePrice.toFixed(2)}`;
    if (calcQty) calcQty.innerText = qty;
    if (calcSubtotal) calcSubtotal.innerText = `₹${subtotal.toFixed(2)}`;
    if (calcFee) calcFee.innerText = `+₹${fee.toFixed(2)}`;
    if (calcTax) calcTax.innerText = `+₹${(gst + foodGst).toFixed(2)}`;
    if (calcTierName) calcTierName.innerText = `${tier} (${(discountPercent * 100)}%)`;
    if (calcDiscount) calcDiscount.innerText = `-₹${loyaltyDiscount.toFixed(2)}`;
    if (calcTotal) calcTotal.innerText = `₹${state.totalAmount.toFixed(2)}`;
    if (btnPayAmount) btnPayAmount.innerText = state.totalAmount.toFixed(2);
  }

  document.getElementById('show-type')?.addEventListener('change', recalculatePricing);
  document.getElementById('ticket-qty')?.addEventListener('input', () => {
    recalculatePricing();
    const qty = parseInt(document.getElementById('ticket-qty').value, 10);
    while (state.selectedSeats.length > qty) {
      const removed = state.selectedSeats.pop();
      const prevEl = seatGrid?.querySelector(`[data-seat="${removed}"]`);
      if (prevEl) prevEl.classList.remove('selected');
    }
  });
  document.getElementById('cust-tier')?.addEventListener('change', (e) => {
    state.customer.tier = e.target.value;
    recalculatePricing();
  });

  // Stage Controller
  function setStage(stageNum, statusName) {
    state.currentStage = stageNum;
    state.status = statusName;

    const caseBadge = document.getElementById('case-status-badge');
    if (caseBadge) caseBadge.innerText = `Step ${stageNum}: ${statusName}`;

    for (let i = 1; i <= 5; i++) {
      const node = document.getElementById(`stage-${i}-node`);
      const line = document.getElementById(`line-${i}`);
      if (!node) continue;

      if (i < stageNum) {
        node.className = 'stage-node completed';
        if (line) line.className = 'stage-line active';
      } else if (i === stageNum) {
        node.className = 'stage-node active';
        if (line) line.className = 'stage-line';
      } else {
        node.className = 'stage-node';
        if (line) line.className = 'stage-line';
      }
    }

    document.querySelectorAll('#view-booking .bms-card').forEach(c => c.classList.add('hidden'));

    if (stageNum === 1) document.getElementById('step-1-card')?.classList.remove('hidden');
    else if (stageNum === 2) document.getElementById('step-2-card')?.classList.remove('hidden');
    else if (stageNum === 3) document.getElementById('step-3-card')?.classList.remove('hidden');
    else if (stageNum === 4) document.getElementById('step-4-card')?.classList.remove('hidden');
    else if (stageNum === 5) document.getElementById('step-5-card')?.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) lucide.createIcons();
  }

  // STEP 1 SUBMIT
  document.getElementById('ticket-request-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const qty = parseInt(document.getElementById('ticket-qty').value, 10);
    const alertBox = document.getElementById('validation-alert');
    const alertMsg = document.getElementById('validation-alert-msg');

    if (qty > state.availableSeats) {
      alertBox?.classList.remove('hidden');
      if (alertMsg) alertMsg.innerText = `Requested tickets (${qty}) exceed available capacity (${state.availableSeats}).`;
      return;
    }

    if (state.selectedSeats.length === 0) {
      alertBox?.classList.remove('hidden');
      if (alertMsg) alertMsg.innerText = `Please select your preferred seats on the layout.`;
      return;
    }

    alertBox?.classList.add('hidden');

    state.customer.name = document.getElementById('cust-name').value;
    state.customer.email = document.getElementById('cust-email').value;
    state.customer.phone = document.getElementById('cust-phone').value;
    state.customer.tier = document.getElementById('cust-tier').value;

    const theatreSel = document.getElementById('theatre-select');
    state.movie.theatre = theatreSel.options[theatreSel.selectedIndex].text;
    state.movie.date = document.getElementById('show-date').value;

    const checkedTimeRadio = document.querySelector('input[name="showtime_radio"]:checked');
    state.movie.time = checkedTimeRadio ? checkedTimeRadio.value : '06:30 PM';
    state.movie.type = document.getElementById('show-type').value;

    const seatTierSel = document.getElementById('seat-tier');
    state.movie.seatClass = seatTierSel.options[seatTierSel.selectedIndex].text;

    recalculatePricing();

    const calcAvailText = document.getElementById('calc-avail-text');
    if (calcAvailText) {
      calcAvailText.innerText = `Requested ${qty} tickets verified against ${state.availableSeats} available slots at ${state.movie.theatre}.`;
    }

    setStage(2, 'Fare Breakdown');
  });

  // STEP 2 -> STEP 1 BACK
  document.getElementById('btn-back-step2')?.addEventListener('click', () => {
    setStage(1, 'Select Movie & Seats');
  });

  // STEP 2 -> STEP 3
  document.getElementById('btn-proceed-step3')?.addEventListener('click', () => {
    const routeHeadline = document.getElementById('route-headline');
    const routeDesc = document.getElementById('route-desc');
    const routeDetails = document.getElementById('route-details');
    const icon = document.getElementById('route-icon');

    if (state.movie.type.includes('VIP') || state.totalAmount > 500) {
      if (routeHeadline) routeHeadline.innerText = 'VIP Balcony & Recliner Hospitality Experience';
      if (routeDesc) routeDesc.innerText = 'Premium lounge seating with push-back recliners, in-seat food ordering, and express turnstile check-in.';
      if (icon) icon.innerHTML = '<i data-lucide="crown"></i>';
      if (routeDetails) {
        routeDetails.innerHTML = `
          <p><strong>Auditorium Area:</strong> <code>VIP Balcony Suite (Row K)</code></p>
          <p><strong>Perks Included:</strong> Dedicated usher, pillow & blanket on request, snack counter priority access.</p>
          <p><strong>Audio-Visual:</strong> 4K RGB Laser + Custom Dolby Surround calibration.</p>
        `;
      }
    } else if (state.movie.type.includes('IMAX') || state.movie.type.includes('4K') || state.movie.type.includes('Atmos')) {
      if (routeHeadline) routeHeadline.innerText = 'IMAX Laser & Dolby Atmos 7.1 Immersive Sound';
      if (routeDesc) routeDesc.innerText = 'Multi-channel overhead surround speakers and high-contrast Barco laser projection.';
      if (icon) icon.innerHTML = '<i data-lucide="volume-2"></i>';
      if (routeDetails) {
        routeDetails.innerHTML = `
          <p><strong>Screen Type:</strong> <code>IMAX 4K RGB Curved Laser Screen</code></p>
          <p><strong>Sound Format:</strong> <code>64-Channel Dolby Atmos 3D Audio</code></p>
          <p><strong>Auditorium:</strong> ${state.movie.theatre}.</p>
        `;
      }
    } else {
      if (routeHeadline) routeHeadline.innerText = 'Standard 2D Screening Experience';
      if (routeDesc) routeDesc.innerText = 'Crystal clear digital projection with standard comfortable cushioned seating.';
      if (icon) icon.innerHTML = '<i data-lucide="film"></i>';
      if (routeDetails) {
        routeDetails.innerHTML = `
          <p><strong>Screen Type:</strong> <code>2K Digital Cinema Projection</code></p>
          <p><strong>Sound Format:</strong> <code>Dolby 7.1 Surround Sound</code></p>
          <p><strong>Check-in:</strong> Direct M-Ticket barcode turnstile scan.</p>
        `;
      }
    }

    if (window.lucide) lucide.createIcons();
    setStage(3, 'Experience & F&B');
  });

  // STEP 3 -> STEP 2 BACK
  document.getElementById('btn-back-step3')?.addEventListener('click', () => {
    setStage(2, 'Fare Breakdown');
  });

  // STEP 3 -> STEP 4 (REVIEW & PAYMENT HOLD TIMER)
  document.getElementById('btn-proceed-step4')?.addEventListener('click', () => {
    document.getElementById('rev-movie').innerText = state.movie.title;
    document.getElementById('rev-theatre').innerText = state.movie.theatre;
    document.getElementById('rev-datetime').innerText = `${state.movie.date} at ${state.movie.time}`;
    document.getElementById('rev-type').innerText = state.movie.type;
    document.getElementById('rev-seats').innerText = `${state.selectedSeats.join(', ')} (${state.ticketQty} Tickets - ${state.movie.seatClass.split('(')[0]})`;

    const snacksList = [];
    for (const k in state.concessions) {
      if (state.concessions[k].qty > 0) {
        snacksList.push(`${state.concessions[k].name} (x${state.concessions[k].qty})`);
      }
    }
    const revSnacks = document.getElementById('rev-snacks');
    if (revSnacks) revSnacks.innerText = snacksList.length > 0 ? snacksList.join(', ') : 'None';

    document.getElementById('rev-name').innerText = state.customer.name;
    document.getElementById('rev-email').innerText = state.customer.email;
    document.getElementById('rev-phone').innerText = state.customer.phone;
    
    let discountStr = `Loyalty ${state.customer.tier} Discount Applied`;
    if (state.promoCode) discountStr += ` + Promo ${state.promoCode}`;
    document.getElementById('rev-discount-total').innerText = discountStr;
    document.getElementById('rev-total').innerText = `₹${state.totalAmount.toFixed(2)}`;

    startHoldTimer();
    setStage(4, 'Review & Razorpay');
  });

  // 10-Minute Seat Hold Countdown Timer
  function startHoldTimer() {
    if (state.holdInterval) clearInterval(state.holdInterval);
    state.holdSecondsRemaining = 600;

    const countdownText = document.getElementById('sla-countdown-text');
    const barFill = document.getElementById('sla-bar-fill');

    state.holdInterval = setInterval(() => {
      state.holdSecondsRemaining--;
      if (state.holdSecondsRemaining <= 0) {
        clearInterval(state.holdInterval);
        handleHoldTimeout();
        return;
      }

      const mins = Math.floor(state.holdSecondsRemaining / 60);
      const secs = state.holdSecondsRemaining % 60;
      if (countdownText) countdownText.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      
      const pct = (state.holdSecondsRemaining / 600) * 100;
      if (barFill) barFill.style.width = `${pct}%`;
    }, 1000);
  }

  function handleHoldTimeout() {
    alert('Seat Hold Expired: The 10-minute hold window has timed out. Seats have been released.');
    document.querySelectorAll('#view-booking .bms-card').forEach(c => c.classList.add('hidden'));
    document.getElementById('cancelled-card')?.classList.remove('hidden');
    document.getElementById('case-status-badge').innerText = 'Status: Cancelled / Expired';
  }

  document.getElementById('btn-cancel-booking')?.addEventListener('click', () => {
    if (confirm('Cancel this movie ticket booking? Held seats will be released back to the seating pool.')) {
      if (state.holdInterval) clearInterval(state.holdInterval);
      document.querySelectorAll('#view-booking .bms-card').forEach(c => c.classList.add('hidden'));
      document.getElementById('cancelled-card')?.classList.remove('hidden');
      document.getElementById('case-status-badge').innerText = 'Status: Cancelled';
    }
  });

  document.getElementById('btn-restart-from-cancel')?.addEventListener('click', () => {
    setStage(1, 'Select Movie & Seats');
  });

  // ================= RAZORPAY PAYMENT GATEWAY INTEGRATION =================
  const razorpayModal = document.getElementById('razorpay-modal');
  const btnOpenRazorpay = document.getElementById('btn-open-razorpay');
  const btnCloseRzpModal = document.getElementById('btn-close-rzp-modal');
  const btnRzpSubmitPayment = document.getElementById('btn-rzp-submit-payment');
  const rzpLoader = document.getElementById('rzp-loader');
  const rzpTabButtons = document.querySelectorAll('.rzp-tab-btn');
  const rzpTabContents = document.querySelectorAll('.rzp-tab-content');

  let selectedPaymentMethod = 'UPI (Google Pay)';

  // Open Razorpay Checkout Modal
  btnOpenRazorpay?.addEventListener('click', async () => {
    if (!document.getElementById('chk-policy').checked) {
      alert('Please agree to the CineWave Entertainment admission terms.');
      return;
    }

    let orderId = `order_RP_IND_${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: state.totalAmount, movie: state.movie.title })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.orderId) orderId = json.orderId;
      }
    } catch (e) {}

    state.razorpayOrderId = orderId;
    document.getElementById('rzp-order-ref').innerText = `Order: ${orderId}`;
    document.getElementById('rzp-display-amount').innerText = `₹${state.totalAmount.toFixed(2)}`;
    document.getElementById('rzp-btn-amt').innerText = state.totalAmount.toFixed(2);

    razorpayModal?.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  });

  btnCloseRzpModal?.addEventListener('click', () => {
    razorpayModal?.classList.add('hidden');
  });

  // Switch Razorpay Tabs
  rzpTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.rzpTab;
      rzpTabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      rzpTabContents.forEach(content => content.classList.add('hidden'));
      document.getElementById(`rzp-tab-${tabId}`)?.classList.remove('hidden');

      if (tabId === 'upi') selectedPaymentMethod = 'UPI (Google Pay)';
      else if (tabId === 'cards') selectedPaymentMethod = 'Credit/Debit Card';
      else if (tabId === 'netbanking') selectedPaymentMethod = 'Net Banking (SBI)';
      else if (tabId === 'wallets') selectedPaymentMethod = 'Digital Wallet (Amazon Pay)';

      if (window.lucide) lucide.createIcons();
    });
  });

  // UPI App Selection
  document.querySelectorAll('.upi-app-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.upi-app-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const upiType = card.dataset.upi;
      if (upiType === 'gpay') selectedPaymentMethod = 'UPI (Google Pay)';
      else if (upiType === 'phonepe') selectedPaymentMethod = 'UPI (PhonePe)';
      else if (upiType === 'paytm') selectedPaymentMethod = 'UPI (Paytm)';
      else if (upiType === 'cred') selectedPaymentMethod = 'UPI (CRED)';
    });
  });

  // Bank Selection
  document.querySelectorAll('.bank-item').forEach(item => {
    item.addEventListener('click', () => {
      const parent = item.parentElement;
      parent.querySelectorAll('.bank-item').forEach(b => b.classList.remove('selected'));
      item.classList.add('selected');
      const bank = item.dataset.bank || item.dataset.wallet;
      selectedPaymentMethod = bank ? `Net Banking (${bank})` : 'Digital Wallet';
    });
  });

  // Execute Razorpay Payment
  btnRzpSubmitPayment?.addEventListener('click', async () => {
    rzpLoader?.classList.remove('hidden');

    const loaderTitle = document.getElementById('rzp-loader-title');
    const loaderDesc = document.getElementById('rzp-loader-desc');

    if (loaderTitle) loaderTitle.innerText = 'Connecting to Razorpay Gateway...';
    if (loaderDesc) loaderDesc.innerText = `Authorizing ₹${state.totalAmount.toFixed(2)} via ${selectedPaymentMethod}`;

    setTimeout(async () => {
      if (loaderTitle) loaderTitle.innerText = 'Verifying 256-bit Security Signature...';
      if (loaderDesc) loaderDesc.innerText = 'Payment verified with RBI-approved Banking Switch';

      const paymentId = `pay_RP_IND_${Math.floor(100000 + Math.random() * 900000)}`;
      state.razorpayPaymentId = paymentId;

      try {
        await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: paymentId,
            orderId: state.razorpayOrderId,
            method: selectedPaymentMethod
          })
        });
      } catch (e) {}

      setTimeout(() => {
        rzpLoader?.classList.add('hidden');
        razorpayModal?.classList.add('hidden');
        completeBookingFlow(paymentId, selectedPaymentMethod);
      }, 700);

    }, 1200);
  });

  // ================= CELEBRATORY CONFETTI ANIMATION =================
  function fireConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#f84464', '#10b981', '#f59e0b', '#3b82f6', '#06b6d4', '#a855f7', '#ec4899'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 7 + 4,
        d: Math.random() * 120,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleInc: (Math.random() * 0.07) + 0.05,
        tiltAngle: 0
      });
    }

    let animationFrame;
    let duration = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.d);
        p.tilt = Math.sin(p.tiltAngle - (p.r / 3)) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      duration++;
      if (duration < 180) {
        animationFrame = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    draw();
  }

  // Complete Booking & Generate M-Ticket
  async function completeBookingFlow(paymentId, payMethod) {
    if (state.holdInterval) clearInterval(state.holdInterval);

    const cityPrefix = (state.city.slice(0, 3)).toUpperCase();
    const refCode = `CW-${cityPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    document.getElementById('tkt-movie').innerText = state.movie.title;
    document.getElementById('tkt-type').innerText = `PAN-INDIA • ${state.movie.type.toUpperCase()}`;
    document.getElementById('tkt-theatre').innerText = state.movie.theatre;
    document.getElementById('tkt-datetime').innerText = `${state.movie.date} | ${state.movie.time}`;
    document.getElementById('tkt-seats').innerText = `${state.selectedSeats.join(', ')} (${state.movie.seatClass.split('(')[0]})`;
    document.getElementById('tkt-name').innerText = state.customer.name;
    document.getElementById('tkt-price').innerText = `₹${state.totalAmount.toFixed(2)}`;
    document.getElementById('tkt-ref-code').innerText = refCode;

    const tktRzpId = document.getElementById('tkt-rzp-id');
    if (tktRzpId) tktRzpId.innerText = paymentId;

    document.getElementById('email-preview-sub').innerText = `Sent to: ${state.customer.email}`;
    document.getElementById('email-ref-id').innerText = refCode;
    document.getElementById('email-cust-name').innerText = state.customer.name;
    document.getElementById('email-movie-name').innerText = state.movie.title;
    document.getElementById('email-theatre-name').innerText = state.movie.theatre.split(',')[0];

    state.availableSeats -= state.ticketQty;
    document.getElementById('live-inventory-tag').innerHTML = `Available Seats: <strong>${state.availableSeats} / ${state.totalSeatsCapacity}</strong>`;

    const snacksList = [];
    for (const k in state.concessions) {
      if (state.concessions[k].qty > 0) {
        snacksList.push(`${state.concessions[k].name} (x${state.concessions[k].qty})`);
      }
    }

    const newWalletTicket = {
      ref: refCode,
      movie: state.movie.title,
      poster: state.movie.poster,
      theatre: state.movie.theatre,
      date: state.movie.date,
      time: state.movie.time,
      format: `PAN-INDIA • ${state.movie.type.toUpperCase()}`,
      seats: [...state.selectedSeats],
      seatClass: state.movie.seatClass,
      qty: state.ticketQty,
      paid: state.totalAmount,
      status: 'Confirmed',
      customerName: state.customer.name,
      customerEmail: state.customer.email,
      customerPhone: state.customer.phone,
      snacks: snacksList.length > 0 ? snacksList.join(', ') : 'None',
      paymentMethod: payMethod,
      rzpId: paymentId,
      scanned: false
    };

    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWalletTicket)
      });
    } catch (e) {}

    state.walletTickets.unshift(newWalletTicket);
    updateWalletBadge();

    setStage(5, 'Booking Confirmed');
    fireConfetti();
    if (window.lucide) lucide.createIcons();
  }

  // START NEW BOOKING
  document.getElementById('btn-start-new-case')?.addEventListener('click', () => {
    const cityPrefix = (state.city.slice(0, 3)).toUpperCase();
    state.bookingRef = `CW-${cityPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    document.getElementById('case-id-display').innerText = state.bookingRef;
    setStage(1, 'Select Movie & Seats');
  });

  // ================= TICKET WALLET & TICKET MANAGEMENT =================
  function updateWalletBadge() {
    const activeCount = state.walletTickets.filter(t => t.status === 'Confirmed').length;
    const badge = document.getElementById('wallet-count-badge');
    if (badge) badge.innerText = activeCount;
  }

  function renderTicketWallet() {
    const container = document.getElementById('ticket-wallet-container');
    if (!container) return;

    if (state.walletTickets.length === 0) {
      container.innerHTML = `<div class="audit-summary-box"><p>No tickets found in your wallet.</p></div>`;
      return;
    }

    container.innerHTML = state.walletTickets.map(tkt => {
      const isConfirmed = tkt.status === 'Confirmed';
      const isCancelled = tkt.status.includes('Cancelled') || tkt.status.includes('Refunded');
      
      let statusBadge = `<span class="badge badge-green"><i data-lucide="check-circle-2"></i> ${tkt.status}</span>`;
      if (isCancelled) {
        statusBadge = `<span class="badge badge-danger"><i data-lucide="x-circle"></i> ${tkt.status}</span>`;
      } else if (tkt.status === 'Attended') {
        statusBadge = `<span class="badge badge-blue"><i data-lucide="check"></i> Completed / Attended</span>`;
      }

      return `
        <div class="wallet-ticket-card ${isCancelled ? 'cancelled' : ''}" data-ref="${tkt.ref}">
          <div class="ticket-poster-thumb">
            <img src="${tkt.poster}" alt="${tkt.movie}"/>
          </div>

          <div class="ticket-details-main">
            <div class="ticket-ref-strip">
              <span class="ticket-id-tag">${tkt.ref}</span>
              ${statusBadge}
            </div>
            <h3>${tkt.movie}</h3>
            <div class="ticket-meta-row">
              <span><i data-lucide="building"></i> ${tkt.theatre}</span>
              <span><i data-lucide="calendar"></i> ${tkt.date} &bull; ${tkt.time}</span>
              <span><i data-lucide="armchair"></i> Seats: <strong>${tkt.seats.join(', ')}</strong> (${tkt.qty} Tickets)</span>
            </div>
            ${tkt.paymentMethod ? `<p style="font-size: 0.75rem; color: #60a5fa;"><i data-lucide="credit-card"></i> ${tkt.paymentMethod} &bull; Ref: ${tkt.rzpId || 'pay_RP_IND_94821'}</p>` : ''}
            ${tkt.snacks && tkt.snacks !== 'None' ? `<p style="font-size: 0.78rem; color: var(--accent-amber);"><i data-lucide="popcorn"></i> Snacks: ${tkt.snacks}</p>` : ''}
          </div>

          <div class="ticket-actions-col">
            <div class="ticket-price-total">₹${tkt.paid.toFixed(2)}</div>
            <button type="button" class="btn btn-secondary btn-view-pass" data-ref="${tkt.ref}">
              <i data-lucide="qr-code"></i> View Pass
            </button>
            ${isConfirmed ? `
              <button type="button" class="btn btn-warning btn-resched-ticket" data-ref="${tkt.ref}">
                <i data-lucide="calendar"></i> Reschedule
              </button>
              <button type="button" class="btn btn-danger btn-cancel-ticket" data-ref="${tkt.ref}">
                <i data-lucide="x-circle"></i> Cancel & Refund
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    attachWalletListeners();
  }

  function attachWalletListeners() {
    document.querySelectorAll('.btn-view-pass').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.ref;
        const tkt = state.walletTickets.find(t => t.ref === ref);
        if (tkt) openPassModal(tkt);
      });
    });

    document.querySelectorAll('.btn-resched-ticket').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.ref;
        const tkt = state.walletTickets.find(t => t.ref === ref);
        if (tkt) openRescheduleModal(tkt);
      });
    });

    document.querySelectorAll('.btn-cancel-ticket').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.ref;
        const tkt = state.walletTickets.find(t => t.ref === ref);
        if (tkt) openCancelModal(tkt);
      });
    });
  }

  // ================= MODAL HANDLERS: CANCEL & SLA REFUND =================
  let selectedTicketToCancel = null;
  const cancelModal = document.getElementById('cancel-modal');

  function openCancelModal(tkt) {
    selectedTicketToCancel = tkt;
    document.getElementById('cancel-modal-ref').innerText = tkt.ref;
    document.getElementById('cancel-modal-paid').innerText = `₹${tkt.paid.toFixed(2)}`;
    
    const deduction = tkt.paid * 0.20;
    const netRefund = tkt.paid * 0.80;

    document.getElementById('cancel-modal-deduct').innerText = `-₹${deduction.toFixed(2)}`;
    document.getElementById('cancel-modal-refund').innerText = `₹${netRefund.toFixed(2)}`;
    document.getElementById('cancel-btn-refund-val').innerText = netRefund.toFixed(2);

    cancelModal?.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  document.getElementById('btn-close-cancel-modal')?.addEventListener('click', () => cancelModal?.classList.add('hidden'));
  document.getElementById('btn-abort-cancel')?.addEventListener('click', () => cancelModal?.classList.add('hidden'));

  document.getElementById('btn-confirm-cancel-action')?.addEventListener('click', async () => {
    if (!selectedTicketToCancel) return;

    try {
      await fetch(`/api/bookings/${selectedTicketToCancel.ref}/cancel`, { method: 'POST' });
    } catch (e) {}

    selectedTicketToCancel.status = 'Cancelled - Refunded';
    state.availableSeats += selectedTicketToCancel.qty;
    document.getElementById('live-inventory-tag').innerHTML = `Available Seats: <strong>${state.availableSeats} / ${state.totalSeatsCapacity}</strong>`;

    const gateLog = document.getElementById('gate-audit-log');
    if (gateLog) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const entry = document.createElement('div');
      entry.style.color = '#fca5a5';
      entry.innerText = `[${timeStr}] ${selectedTicketToCancel.ref} • CANCELLED & REFUNDED (₹${(selectedTicketToCancel.paid * 0.8).toFixed(2)}) • Seats Released: ${selectedTicketToCancel.seats.join(', ')}`;
      gateLog.prepend(entry);
    }

    cancelModal?.classList.add('hidden');
    updateWalletBadge();
    renderTicketWallet();
    alert(`Cancellation Confirmed: Booking ${selectedTicketToCancel.ref} has been cancelled. Razorpay Refund of ₹${(selectedTicketToCancel.paid * 0.8).toFixed(2)} initiated to original source.`);
  });

  // ================= MODAL HANDLERS: RESCHEDULE SHOWTIME =================
  let selectedTicketToResched = null;
  const reschedModal = document.getElementById('reschedule-modal');

  function openRescheduleModal(tkt) {
    selectedTicketToResched = tkt;
    document.getElementById('resched-movie-title').innerText = tkt.movie;
    document.getElementById('resched-ref-id').innerText = tkt.ref;
    const reschedDate = document.getElementById('resched-new-date');
    if (reschedDate) reschedDate.value = tkt.date;

    reschedModal?.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  document.getElementById('btn-close-reschedule-modal')?.addEventListener('click', () => reschedModal?.classList.add('hidden'));
  document.getElementById('btn-abort-resched')?.addEventListener('click', () => reschedModal?.classList.add('hidden'));

  document.getElementById('btn-confirm-resched-action')?.addEventListener('click', async () => {
    if (!selectedTicketToResched) return;

    const newDate = document.getElementById('resched-new-date')?.value || selectedTicketToResched.date;
    const newTime = document.getElementById('resched-new-time')?.value || selectedTicketToResched.time;

    try {
      await fetch(`/api/bookings/${selectedTicketToResched.ref}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, time: newTime })
      });
    } catch (e) {}

    selectedTicketToResched.date = newDate;
    selectedTicketToResched.time = newTime;

    reschedModal?.classList.add('hidden');
    renderTicketWallet();
    alert(`Show Rescheduled! Your tickets for ${selectedTicketToResched.movie} have been moved to ${newDate} at ${newTime}.`);
  });

  // ================= MODAL HANDLERS: PASS VIEWER =================
  const passModal = document.getElementById('pass-modal');
  
  function openPassModal(tkt) {
    const container = document.getElementById('modal-pass-container');
    if (!container) return;

    container.innerHTML = `
      <div class="bms-m-ticket" style="margin-bottom: 0;">
        <div class="ticket-top-banner">
          <div class="bms-tkt-logo">Cine<span>Wave</span> ENTERTAINMENT</div>
          <span class="tkt-badge-city">${state.city.toUpperCase()} MULTIPLEX</span>
        </div>

        <div class="ticket-body">
          <div class="tkt-info-left">
            <h1 class="tkt-movie-title">${tkt.movie}</h1>
            <span class="tkt-lang-badge">${tkt.format}</span>
            
            <div class="tkt-grid-details">
              <div class="tkt-field">
                <span class="field-lbl">CINEMA THEATRE</span>
                <span class="field-val">${tkt.theatre}</span>
              </div>
              <div class="tkt-field">
                <span class="field-lbl">DATE & TIME</span>
                <span class="field-val">${tkt.date} | ${tkt.time}</span>
              </div>
              <div class="tkt-field">
                <span class="field-lbl">SEATS</span>
                <span class="field-val highlight">${tkt.seats.join(', ')} (${tkt.seatClass.split('(')[0]})</span>
              </div>
              <div class="tkt-field">
                <span class="field-lbl">BOOKED FOR</span>
                <span class="field-val">${tkt.customerName}</span>
              </div>
            </div>

            <div class="tkt-total-strip">
              <span>TOTAL AMOUNT: <strong>₹${tkt.paid.toFixed(2)}</strong></span>
              <span class="bms-verified"><i data-lucide="shield-check"></i> ${tkt.status}</span>
            </div>

            <div class="razorpay-verified-stamp">
              <i data-lucide="check-circle"></i>
              <span>Paid via Razorpay (${tkt.paymentMethod || 'UPI/Card'} &bull; ${tkt.rzpId || 'pay_RP_IND_94821'})</span>
            </div>
          </div>

          <div class="tkt-qr-side">
            <div class="qr-box">
              <i data-lucide="qr-code"></i>
            </div>
            <span class="tkt-code">${tkt.ref}</span>
            <span class="scan-label">Gate Turnstile QR</span>
          </div>
        </div>
      </div>
    `;

    passModal?.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  document.getElementById('btn-close-pass-modal')?.addEventListener('click', () => passModal?.classList.add('hidden'));
  document.getElementById('btn-dismiss-pass-modal')?.addEventListener('click', () => passModal?.classList.add('hidden'));

  // ================= GATE SCANNER & THEATRE MANAGER TOOLS =================
  const scanInputRef = document.getElementById('scan-input-ref');
  const btnTriggerScan = document.getElementById('btn-trigger-scan');
  const scanResultDisplay = document.getElementById('scanner-result-display');
  const scanResIcon = document.getElementById('scan-res-icon');
  const scanResTitle = document.getElementById('scan-res-title');
  const scanResDetails = document.getElementById('scan-res-details');
  const sampleScanPills = document.querySelectorAll('[data-scan]');

  async function executeGateScan(ticketRef) {
    ticketRef = ticketRef.trim().toUpperCase();
    if (!ticketRef) return;

    try {
      const res = await fetch('/api/scanner/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: ticketRef })
      });
      if (res.ok) {
        const json = await res.json();
        const gateLog = document.getElementById('gate-audit-log');
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        if (json.status === 'VALID') {
          const tkt = json.data;
          if (scanResultDisplay) scanResultDisplay.className = 'scanner-result-card valid';
          if (scanResTitle) scanResTitle.innerText = `✅ ADMISSION GRANTED • ${tkt.qty} ${tkt.qty > 1 ? 'PERSONS' : 'PERSON'}`;
          if (scanResDetails) {
            scanResDetails.innerHTML = `
              Patron: <strong>${tkt.customerName}</strong> | Seats: <strong>${tkt.seats.join(', ')}</strong><br>
              Movie: <strong>${tkt.movie} (${tkt.time})</strong> | Cinema: <strong>${tkt.theatre.split(',')[0]}</strong><br>
              Status: <strong style="color: var(--accent-green);">Verified & Turnstile Unlocked (Razorpay Verified)</strong>
            `;
          }
          if (scanResIcon) scanResIcon.style.color = 'var(--accent-green)';
          if (gateLog) {
            const entry = document.createElement('div');
            entry.style.color = '#6ee7b7';
            entry.innerText = `[${timeStr}] ${tkt.ref} • ADMIT ${tkt.qty} (${tkt.seats.join(', ')}) • ${tkt.movie} • Gate Turnstile A • OK`;
            gateLog.prepend(entry);
          }
          if (window.lucide) lucide.createIcons();
          return;
        } else if (json.status === 'ALREADY_SCANNED') {
          if (scanResultDisplay) scanResultDisplay.className = 'scanner-result-card invalid';
          if (scanResTitle) scanResTitle.innerText = '⚠️ ALREADY SCANNED / DUPLICATE PASS';
          if (scanResDetails) scanResDetails.innerHTML = `Pass <strong>${ticketRef}</strong> was already validated at the gate earlier.`;
          if (scanResIcon) scanResIcon.style.color = 'var(--accent-amber)';
          if (window.lucide) lucide.createIcons();
          return;
        } else if (json.status === 'REFUNDED') {
          if (scanResultDisplay) scanResultDisplay.className = 'scanner-result-card invalid';
          if (scanResTitle) scanResTitle.innerText = '⛔ CANCELLED / REFUNDED PASS';
          if (scanResDetails) scanResDetails.innerHTML = `Booking <strong>${ticketRef}</strong> was cancelled and refunded. Admission denied.`;
          if (scanResIcon) scanResIcon.style.color = 'var(--bms-primary)';
          if (window.lucide) lucide.createIcons();
          return;
        }
      }
    } catch (e) {}

    // Fallback
    const tkt = state.walletTickets.find(t => t.ref.toUpperCase() === ticketRef);
    const gateLog = document.getElementById('gate-audit-log');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (!tkt) {
      if (scanResultDisplay) scanResultDisplay.className = 'scanner-result-card invalid';
      if (scanResTitle) scanResTitle.innerText = '❌ INVALID PASS / NOT FOUND';
      if (scanResDetails) scanResDetails.innerHTML = `Reference <strong>${ticketRef}</strong> was not found in the ticketing ledger.`;
      if (scanResIcon) scanResIcon.style.color = 'var(--bms-primary)';

      if (gateLog) {
        const entry = document.createElement('div');
        entry.style.color = '#fca5a5';
        entry.innerText = `[${timeStr}] ${ticketRef} • DENIED • Invalid Pass ID • Gate 1`;
        gateLog.prepend(entry);
      }
    } else if (tkt.status.includes('Cancelled') || tkt.status.includes('Refunded')) {
      if (scanResultDisplay) scanResultDisplay.className = 'scanner-result-card invalid';
      if (scanResTitle) scanResTitle.innerText = '⛔ CANCELLED / REFUNDED PASS';
      if (scanResDetails) scanResDetails.innerHTML = `Booking <strong>${tkt.ref}</strong> for <strong>${tkt.movie}</strong> was cancelled and refunded. Admission denied.`;
      if (scanResIcon) scanResIcon.style.color = 'var(--bms-primary)';

      if (gateLog) {
        const entry = document.createElement('div');
        entry.style.color = '#fca5a5';
        entry.innerText = `[${timeStr}] ${ticketRef} • DENIED • Refunded Ticket Attempt • Gate 1`;
        gateLog.prepend(entry);
      }
    } else if (tkt.scanned) {
      if (scanResultDisplay) scanResultDisplay.className = 'scanner-result-card invalid';
      if (scanResTitle) scanResTitle.innerText = '⚠️ ALREADY SCANNED / DUPLICATE PASS';
      if (scanResDetails) scanResDetails.innerHTML = `Pass <strong>${tkt.ref}</strong> was already validated at the gate earlier.`;
      if (scanResIcon) scanResIcon.style.color = 'var(--accent-amber)';

      if (gateLog) {
        const entry = document.createElement('div');
        entry.style.color = '#fde68a';
        entry.innerText = `[${timeStr}] ${ticketRef} • DUPLICATE • Already Scanned • Gate 1`;
        gateLog.prepend(entry);
      }
    } else {
      tkt.scanned = true;
      if (scanResultDisplay) scanResultDisplay.className = 'scanner-result-card valid';
      if (scanResTitle) scanResTitle.innerText = `✅ ADMISSION GRANTED • ${tkt.qty} ${tkt.qty > 1 ? 'PERSONS' : 'PERSON'}`;
      if (scanResDetails) {
        scanResDetails.innerHTML = `
          Patron: <strong>${tkt.customerName}</strong> | Seats: <strong>${tkt.seats.join(', ')}</strong><br>
          Movie: <strong>${tkt.movie} (${tkt.time})</strong> | Cinema: <strong>${tkt.theatre.split(',')[0]}</strong><br>
          Status: <strong style="color: var(--accent-green);">Verified & Turnstile Unlocked</strong>
        `;
      }
      if (scanResIcon) scanResIcon.style.color = 'var(--accent-green)';

      if (gateLog) {
        const entry = document.createElement('div');
        entry.style.color = '#6ee7b7';
        entry.innerText = `[${timeStr}] ${tkt.ref} • ADMIT ${tkt.qty} (${tkt.seats.join(', ')}) • ${tkt.movie} • Gate Turnstile A • OK`;
        gateLog.prepend(entry);
      }
    }

    if (window.lucide) lucide.createIcons();
  }

  btnTriggerScan?.addEventListener('click', () => {
    executeGateScan(scanInputRef?.value || '');
  });

  sampleScanPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const code = pill.dataset.scan;
      if (code) {
        if (scanInputRef) scanInputRef.value = code;
        executeGateScan(code);
      }
    });
  });

  async function updateManagerMetrics() {
    try {
      const res = await fetch('/api/manager/metrics');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.metrics) {
          const m = json.metrics;
          document.getElementById('metric-gboc').innerText = m.gboc;
          document.getElementById('metric-tickets-sold').innerText = m.ticketsSold;
          document.getElementById('metric-occupancy').innerText = m.occupancy;
          document.getElementById('metric-fb').innerText = m.fbSales;
          return;
        }
      }
    } catch (e) {}

    let totalPaid = 0;
    let soldTickets = 0;

    state.walletTickets.forEach(t => {
      if (t.status === 'Confirmed' || t.status === 'Attended') {
        totalPaid += t.paid;
        soldTickets += t.qty;
      }
    });

    const baseGboc = 148920 + totalPaid;
    const gbocEl = document.getElementById('metric-gboc');
    if (gbocEl) gbocEl.innerText = `₹${baseGboc.toLocaleString('en-IN')}`;

    const totalSold = 684 + soldTickets;
    const soldEl = document.getElementById('metric-tickets-sold');
    if (soldEl) soldEl.innerText = `${totalSold} / 780`;

    const occPct = ((totalSold / 780) * 100).toFixed(1);
    const occEl = document.getElementById('metric-occupancy');
    if (occEl) occEl.innerText = `${occPct}%`;
  }

  updateWalletBadge();
});
