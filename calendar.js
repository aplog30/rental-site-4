/************************************************************
 * CONFIGURATION
 ************************************************************/
const GOOGLE_SHEET_API_URL =
    "https://script.google.com/macros/s/AKfycby4FMMdrwqh8NbYxgAMxM-09qUTLfB04oT8SLyu9ffcNaHdQihlPNk8vzsI0dhRcJy5Kg/exec";

const calendarEl = document.getElementById("calendar");
const loadingEl = document.getElementById("calendar-loading");

/* NEW: Price + form elements */
const priceDisplay = document.getElementById("priceDisplay");
const rangeDisplay = document.getElementById("rangeDisplay");
const emailInput = document.getElementById("emailInput");
const startInput = document.getElementById("startInput");
const endInput = document.getElementById("endInput");
const submitBtn = document.getElementById("submitRequest");

/* Today and upper limit */
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const MAX_DATE = new Date(
    TODAY.getFullYear(),
    TODAY.getMonth() + 12,
    TODAY.getDate()
);

/************************************************************
 * GLOBAL STATE
 ************************************************************/
let bookedRanges = [];
let selectedStart = null;
let selectedEnd = null;

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

/************************************************************
 * LOAD BOOKED DATES FROM GOOGLE SHEET
 ************************************************************/
async function loadBookedDates() {
    try {
        loadingEl.style.display = "block";
        calendarEl.style.display = "none";

        const response = await fetch(GOOGLE_SHEET_API_URL);
        const data = await response.json();

        bookedRanges = data.map(r => ({
            start: new Date(r.start),
            end: new Date(r.end)
        }));

        renderCalendar(currentMonth, currentYear);

        loadingEl.style.display = "none";
        calendarEl.style.display = "block";
    } catch (error) {
        console.error("Error loading booked dates:", error);
        loadingEl.innerText = "Failed to load calendar.";
    }
}

/************************************************************
 * RENDER CALENDAR
 ************************************************************/
function renderCalendar(month, year) {
    calendarEl.innerHTML = "";

    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    /**************** HEADER ****************/
    const header = document.createElement("div");
    header.classList.add("calendar-header");
    header.innerHTML = `
        <button id="prevMonth">&#9664;</button>
        <h3>${monthNames[month]} ${year}</h3>
        <button id="nextMonth">&#9654;</button>
    `;
    calendarEl.appendChild(header);

    /****************************************
     * MONTH NAVIGATION BUTTONS
     ****************************************/
    document.getElementById("prevMonth").onclick = () => {
        let newMonth = month - 1;
        let newYear = newMonth < 0 ? year - 1 : year;
        let targetMonth = (newMonth + 12) % 12;

        const blockPast =
            newYear < TODAY.getFullYear() ||
            (newYear === TODAY.getFullYear() && targetMonth < TODAY.getMonth());

        if (!blockPast) {
            currentMonth = targetMonth;
            currentYear = newYear;
            renderCalendar(currentMonth, currentYear);
        }
    };

    document.getElementById("nextMonth").onclick = () => {
        let newMonth = month + 1;
        let newYear = newMonth > 11 ? year + 1 : year;
        let targetMonth = newMonth % 12;

        if (new Date(newYear, targetMonth, 1) <= MAX_DATE) {
            currentMonth = targetMonth;
            currentYear = newYear;
            renderCalendar(currentMonth, currentYear);
        }
    };

    /**************** WEEKDAY HEADER ****************/
    const weekdays = document.createElement("div");
    weekdays.classList.add("calendar-weekdays");
    weekdays.innerHTML = `
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
        <div>Thu</div><div>Fri</div><div>Sat</div>
    `;
    calendarEl.appendChild(weekdays);

    /**************** DAYS GRID ****************/
    const daysGrid = document.createElement("div");
    daysGrid.classList.add("calendar-days");

    // pad blank cells
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.classList.add("empty");
        daysGrid.appendChild(empty);
    }

    // actual dates
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dayEl = document.createElement("div");
        dayEl.classList.add("day");
        dayEl.textContent = d;

        const isPast = date < TODAY && !sameDay(date, TODAY);
        const isBooked = isDateBooked(date);

        /** NEW: unified unavailable class */
        if (isPast || isBooked) {
            dayEl.classList.add("unavailable");
        } else {
            dayEl.onclick = () => handleDateClick(date);
        }

        // selections
        if (selectedStart && sameDay(date, selectedStart)) {
            dayEl.classList.add("selected-start");
        }
        if (selectedEnd && sameDay(date, selectedEnd)) {
            dayEl.classList.add("selected-end");
        }

        if (selectedStart && selectedEnd &&
            date >= selectedStart && date <= selectedEnd) {
            dayEl.classList.add("selected-range");
        }

        daysGrid.appendChild(dayEl);
    }

    calendarEl.appendChild(daysGrid);
}

/************************************************************
 * HELPERS
 ************************************************************/
function sameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function isDateBooked(date) {
    return bookedRanges.some(r => date >= r.start && date <= r.end);
}

/************************************************************
 * DATE SELECTION + PRICE
 ************************************************************/
function handleDateClick(date) {
    if (!selectedStart) {
        selectedStart = date;
        selectedEnd = null;
    } else if (!selectedEnd) {
        if (date <= selectedStart) return;
        selectedEnd = date;
    } else {
        selectedStart = date;
        selectedEnd = null;
    }

    updatePricingAndForm();
    renderCalendar(currentMonth, currentYear);
}

/************* NEW: seasonal multiplier *************/
function dayMultiplier(date) {
    const m = date.getMonth() + 1;

    if (m <= 3) return 0.9;   // Jan-Mar
    if (m <= 5) return 1.0;   // Apr-May
    if (m <= 8) return 1.3;   // Jun-Aug
    if (m <= 10) return 1.1;  // Sep-Oct
    return 1.0;               // Nov-Dec
}

/************* NEW: price calculator *************/
function calculatePrice(start, end) {
    let price = 0;
    const baseRate = 200;
    let cur = new Date(start);

    while (cur <= end) {
        price += baseRate * dayMultiplier(cur);
        cur.setDate(cur.getDate() + 1);
    }

    return Math.round(price);
}

/************* NEW: update price + form *************/
function updatePricingAndForm() {
    if (selectedStart && selectedEnd) {
        rangeDisplay.textContent =
            `${selectedStart.toDateString()} → ${selectedEnd.toDateString()}`;

        const price = calculatePrice(selectedStart, selectedEnd);
        priceDisplay.textContent = price;

        startInput.value = selectedStart.toDateString();
        endInput.value = selectedEnd.toDateString();
    } else {
        rangeDisplay.textContent = "None";
        priceDisplay.textContent = "0";
        startInput.value = "";
        endInput.value = "";
    }
}

/************************************************************
 * EMAIL REQUEST BUTTON
 ************************************************************/
submitBtn.onclick = function () {
    if (!emailInput.value || !selectedStart || !selectedEnd) {
        alert("Please enter your email and choose valid dates.");
        return;
    }

    // TODO: add EmailJS call here when you’re ready.
    alert("Your booking request has been sent!");
};

/************************************************************
 * INIT
 ************************************************************/
loadBookedDates();
