// ---- CONFIG ----
const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycby4FMMdrwqh8NbYxgAMxM-09qUTLfB04oT8SLyu9ffcNaHdQihlPNk8vzsI0dhRcJy5Kg/exec"; // paste your Apps Script URL

let bookedRanges = [];
let selectedStart = null;
let selectedEnd = null;

// Fetch booked dates from Google Sheets
async function loadBookedDates() {
    try {
        const response = await fetch(GOOGLE_SHEET_API_URL);
        const data = await response.json();
        bookedRanges = data.map(range => ({
            start: new Date(range.start),
            end: new Date(range.end)
        }));

        renderCalendar(currentMonth, currentYear);
    } catch (err) {
        console.error("Error loading booked dates:", err);
    }
}

// ---- Calendar Rendering ----
const calendarEl = document.getElementById("calendar");
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

function renderCalendar(month, year) {
    calendarEl.innerHTML = "";

    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    // Header
    const header = document.createElement("div");
    header.classList.add("calendar-header");
    header.innerHTML = `
        <button id="prevMonth">&#9664;</button>
        <h3>${monthNames[month]} ${year}</h3>
        <button id="nextMonth">&#9654;</button>
    `;
    calendarEl.appendChild(header);

    document.getElementById("prevMonth").onclick = () => changeMonth(-1);
    document.getElementById("nextMonth").onclick = () => changeMonth(1);

    // Weekdays
    const weekdays = document.createElement("div");
    weekdays.classList.add("calendar-weekdays");
    weekdays.innerHTML = `
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
        <div>Thu</div><div>Fri</div><div>Sat</div>
    `;
    calendarEl.appendChild(weekdays);

    // Days grid
    const daysGrid = document.createElement("div");
    daysGrid.classList.add("calendar-days");

    // empty cells
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.classList.add("empty");
        daysGrid.appendChild(empty);
    }

    // fill days
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dayEl = document.createElement("div");
        dayEl.classList.add("day");
        dayEl.textContent = d;

        if (isDateBooked(date)) {
            dayEl.classList.add("booked");
        } else {
            dayEl.onclick = () => handleDateClick(date);
        }

        if (selectedStart && sameDay(date, selectedStart)) {
            dayEl.classList.add("selected-start");
        }
        if (selectedEnd && sameDay(date, selectedEnd)) {
            dayEl.classList.add("selected-end");
        }
        if (selectedStart && selectedEnd && date >= selectedStart && date <= selectedEnd) {
            dayEl.classList.add("selected-range");
        }

        daysGrid.appendChild(dayEl);
    }

    calendarEl.appendChild(daysGrid);
}

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    if (currentMonth > 11) { currentMonth = 0;  currentYear++; }
    renderCalendar(currentMonth, currentYear);
}

// ---- Booking Logic ----

function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
}

function isDateBooked(date) {
    return bookedRanges.some(range => date >= range.start && date <= range.end);
}

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

    renderCalendar(currentMonth, currentYear);
}

// Load booked dates on startup
loadBookedDates();
