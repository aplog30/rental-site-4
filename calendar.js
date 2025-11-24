/************************************************************
 * CONFIGURATION
 ************************************************************/
const GOOGLE_SHEET_API_URL =
    "https://script.google.com/macros/s/AKfycby4FMMdrwqh8NbYxgAMxM-09qUTLfB04oT8SLyu9ffcNaHdQihlPNk8vzsI0dhRcJy5Kg/exec"; // <-- paste your Apps Script URL here

// Get elements
const calendarEl = document.getElementById("calendar");
const loadingEl = document.getElementById("calendar-loading");

// Today and +1 year limit
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
        // Show loader, hide calendar
        loadingEl.style.display = "block";
        calendarEl.style.display = "none";

        const response = await fetch(GOOGLE_SHEET_API_URL);
        const data = await response.json();

        // Convert "start" and "end" into JS Date objects
        bookedRanges = data.map(range => ({
            start: new Date(range.start),
            end: new Date(range.end)
        }));

        // Render calendar NOW that data is available
        renderCalendar(currentMonth, currentYear);

        // Hide loader, show calendar
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

    /************** HEADER **************/
    const header = document.createElement("div");
    header.classList.add("calendar-header");
    header.innerHTML = `
        <button id="prevMonth">&#9664;</button>
        <h3>${monthNames[month]} ${year}</h3>
        <button id="nextMonth">&#9654;</button>
    `;
    calendarEl.appendChild(header);

    /************** BUTTONS **************/
    document.getElementById("prevMonth").onclick = () => {
        let newMonth = month - 1;
        let newYear = newMonth < 0 ? year - 1 : year;
        let targetMonth = (newMonth + 12) % 12;

        // block going into the past
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

        const nextMonthStart = new Date(newYear, targetMonth, 1);

        if (nextMonthStart <= MAX_DATE) {
            currentMonth = targetMonth;
            currentYear = newYear;
            renderCalendar(currentMonth, currentYear);
        }
    };

    /************** WEEKDAYS **************/
    const weekdays = document.createElement("div");
    weekdays.classList.add("calendar-weekdays");
    weekdays.innerHTML = `
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
        <div>Thu</div><div>Fri</div><div>Sat</div>
    `;
    calendarEl.appendChild(weekdays);

    /************** DAYS GRID **************/
    const daysGrid = document.createElement("div");
    daysGrid.classList.add("calendar-days");

    // Empty cells until first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.classList.add("empty");
        daysGrid.appendChild(empty);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dayEl = document.createElement("div");
        dayEl.classList.add("day");
        dayEl.textContent = d;

        const isPast = date < TODAY && !sameDay(date, TODAY);

        if (isDateBooked(date)) {
            dayEl.classList.add("booked"); // booked = light grey
        } else if (isPast) {
            dayEl.classList.add("past-day"); // past = lighter grey
        } else {
            dayEl.onclick = () => handleDateClick(date);
        }

        // Selected markers
        if (selectedStart && sameDay(date, selectedStart)) {
            dayEl.classList.add("selected-start");
        }
        if (selectedEnd && sameDay(date, selectedEnd)) {
            dayEl.classList.add("selected-end");
        }

        // Highlight range
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
    return bookedRanges.some(range => date >= range.start && date <= range.end);
}

/************************************************************
 * DATE SELECTION
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
    renderCalendar(currentMonth, currentYear);
}

/************************************************************
 * INIT
 ************************************************************/
loadBookedDates();
