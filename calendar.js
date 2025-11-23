// Placeholder booked dates (YYYY-MM-DD)
// These will be replaced by backend data later
const dummyBookedDates = [
    "2025-03-10",
    "2025-03-11",
    "2025-03-15",
    "2025-04-02",
    "2025-04-03"
];

let bookedDates = dummyBookedDates;

const calendarEl = document.getElementById("calendar");

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function renderCalendar(month, year) {
    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    const firstDay = (new Date(year, month)).getDay();
    const daysInMonth = 32 - new Date(year, month, 32).getDate();

    let html = `
        <div class="cal-header">
            <button onclick="prevMonth()">&lt;</button>
            <h3>${monthNames[month]} ${year}</h3>
            <button onclick="nextMonth()">&gt;</button>
        </div>
        <div class="cal-grid">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
            <div>Thu</div><div>Fri</div><div>Sat</div>
    `;

    // Blank cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += `<div></div>`;
    }

    // Fill dates
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
        const isBooked = bookedDates.includes(dateStr);

        html += `<div class="cal-day ${isBooked ? "booked" : ""}">${day}</div>`;
    }

    html += "</div>";
    calendarEl.innerHTML = html;
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
}

// Initial render
renderCalendar(currentMonth, currentYear);
