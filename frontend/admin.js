// ==================== GLOBAL VARIABLES ====================

// ---- API Configuration ----
const apiURL = "http://localhost:5600";

// ---- Calendar Display Configuration ----
const hourIncrement = 90; // Height in pixels for each hour slot in the calendar

// ---- Data & State Variables ----
let eventID = "d1b45280-755d-498e-95f7-47bbdecd43fc"; // Current event UUID
let eventData = null; // Stores the fetched event data (contains slots, modules, dates)
let currentWeekIndex = 0; // Tracks which week is currently being displayed
let closeUserPanel; // Function reference for closing user panel when clicking outside

// ---- Lookup Arrays ----
const monthsOfTheYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysOfTheWeek = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

// ---- Calendar & Display DOM Elements ----
const mainCalendar = document.getElementById("mainCalendar");
const calendarColumns = document.getElementById("calendarColumns"); // Container for day columns
const calendarDateRow = document.getElementById("calendarDateRow"); // Displays day names and dates
const calendarTimeColumn = document.getElementById("calendarTimeColumn"); // Displays time slots on left
const calendarMonth = document.getElementById("calendarMonth"); // Displays current month and year

// ---- Calendar Settings Panel Elements ----
const adminCalendarSettingsPanel = document.getElementById("adminCalendarSettingsPanel"); // Modal for creating new event
const newTableButton = document.getElementById("newTableButton"); // Button to open calendar creation
const submitCalendarSettingsButton = document.getElementById("submitCalendarSettingsButton"); // Button to submit calendar settings
const startTime = document.getElementById("startTime"); // Input for event start time
const endTime = document.getElementById("endTime"); // Input for event end time
const startDate = document.getElementById("startDate"); // Input for event start date
const endDate = document.getElementById("endDate"); // Input for event end date

// ---- Slot Creation Panel Elements ----
const adminSlotCreationPanel = document.getElementById("adminSlotCreationPanel"); // Modal for creating slots
const newSlotButton = document.getElementById("newSlotButton"); // Button to open slot creation
const submitSlotCreationButton = document.getElementById("submitSlotCreationButton"); // Button to submit slot creation
const dayOfSlot = document.getElementById("dayOfSlot"); // Input for slot day
const startTimeSlot = document.getElementById("startTimeSlot"); // Input for slot start time
const endTimeSlot = document.getElementById("endTimeSlot"); // Input for slot end time

// ---- Slot & Module Editing Panel Elements ----
const SlotAndModuleEditPanel = document.getElementById("SlotAndModuleEditPanel"); // Panel for editing slots and modules
const dayOfSlotPanel = document.getElementById("dayOfSlotPanel"); // Display/edit slot day
const startTimeSlotPanel = document.getElementById("startTimeSlotPanel"); // Display/edit slot start time
const endTimeSlotPanel = document.getElementById("endTimeSlotPanel"); // Display/edit slot end time
const adminModulePanel = document.getElementById("adminModulePanel"); // Container for module input fields
const addModuleButton = document.getElementById("addModuleButton"); // Button to add module to slot
const saveSlotAndModuleSettings = document.getElementById("saveSlotAndModuleSettings"); // Button to save slot/module changes

// ---- Week Navigation Elements ----
const weekButtonLeft = document.getElementById("weekButtonLeft"); // Button to go to previous week
const weekButtonRight = document.getElementById("weekButtonRight"); // Button to go to next week

// ---- User Panel Elements ----
const userButton = document.getElementById("userButton"); // Button to toggle user panel
const userPanel = document.getElementById("userPanel"); // Panel showing user options
const logoutButton = document.getElementById("logoutButton"); // Button to logout

// ---- Overlay Element ----
const darkenedSite = document.getElementById("darkenedSite"); // Dark overlay when modals are open

// ==================== INITIALIZATION ==================== 
// ==================== INITIALIZATION ====================

// Initialize the app on page load
initialize();

/**
 * Fetches event data from the server and renders the calendar
 */
async function initialize() {
    const result = await getEventData();
    if (!result.success) {
        console.error(result.message);
        return;
    }
    eventData = result.event;
    console.log(eventData);
    renderCalendar();
}
/**
 * Fetches event data from the server API
 * @returns {Promise<object>} Response object with success status, event data, and message
 */
async function getEventData(){
    const response = await fetch(apiURL + "/api/v1/events/" + eventID, {
        method: "GET",
        credentials: "include",
        headers:{"Content-Type": "application/json"},
    });
    const responseJson = await response.json();
    return responseJson;
};

// ==================== CALENDAR RENDERING ==================== 

/**
 * Main calendar rendering function - orchestrates all calendar updates
 * Redraws the entire calendar with current event and week data
 */
function renderCalendar() {
    if (!eventData) return;
    drawCalendarTimeColumn(); // Draw time labels on left side
    drawDateRow(); // Draw date/day headers
    drawSlots(); // Draw all slots with modules
    makeSlotLogic(); // Add click handlers to slots
    renderWeekChangeButtons(); // Show/hide navigation buttons based on current week
}

/**
 * Updates CSS custom property for calendar width - keeps visual lines aligned
 * Called on page load and window resize
 */
function updateCalendarColumnsWidth() {
    if (!calendarColumns) return;
    const width = calendarColumns.offsetWidth;
    document.documentElement.style.setProperty('--calendarColumnsWidth', width + 'px');
}

// Update calendar width on load and resize
window.addEventListener('load', updateCalendarColumnsWidth);
window.addEventListener('resize', updateCalendarColumnsWidth);

// ==================== EVENT LISTENERS ==================== 

// ---- Calendar Creation ----
/**
 * Opens the calendar settings panel and sets default date/time values
 */
if (newTableButton) {
    newTableButton.addEventListener("click", event => {
        if (adminCalendarSettingsPanel) adminCalendarSettingsPanel.style.display = "grid";
        if (darkenedSite) darkenedSite.style.display = "block";
        if (endDate) endDate.value = "2026-07-31";
        if (startDate) startDate.value = "2026-07-31";
        if (startTime) startTime.value = "00:00";
        if (endTime) endTime.value = "23:59";
    })
}
else{
    console.log("error could not find newTableButton")
};

/**
 * Submits the calendar settings and creates a new event on the server
 * Updates local eventData with new dates and re-renders calendar
 */
if (submitCalendarSettingsButton) {
    submitCalendarSettingsButton.addEventListener("click",async event => {
        if (!endDate?.value || !startDate?.value || !startTime?.value || !endTime?.value) {
            alert("please fill out all information")
            return
        }
        const response = await fetch(apiURL + "/api/v1/events/event", {
            method: "POST",
            credentials: "include",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify({
                endDate: endDate.value + "T" + endTime.value,
                startDate: startDate.value + "T" + startTime.value,
                eventName: "testEvent"
            })
        });
        console.log(await response.json())
        if (adminCalendarSettingsPanel) adminCalendarSettingsPanel.style.display = "none"
        if (darkenedSite) darkenedSite.style.display = "none"

        if (eventData) {
            eventData.startDate = startDate.value + "T" + startTime.value
            eventData.endDate = endDate.value + "T" + endTime.value
        }

        renderCalendar()
    });
}
else{
    console.log("error could not find submitCalendarSettingsButton")
};

// ---- Slot Creation ----
/**
 * Opens the slot creation panel
 */
if (newSlotButton) {
    newSlotButton.addEventListener("click", () => {
        if (adminSlotCreationPanel) adminSlotCreationPanel.style.display = "grid"
        if (darkenedSite) darkenedSite.style.display = "block"
    })
}
else{
    console.log("error could not find newSlotButton")
};

/**
 * Submits new slot creation with validation
 * Checks for overlapping slots and invalid time ranges
 * Adds slot to eventData and re-renders calendar
 */
if (submitSlotCreationButton) {
    submitSlotCreationButton.addEventListener("click",async () => {
        const slotDay = dayOfSlot?.value
        const slotStartTime = startTimeSlot?.value
        const slotEndTime = endTimeSlot?.value
        
        // Check for overlapping slots
        for (let i = 0; i < eventData?.slots?.length; i++) {
            if (!(new Date(eventData.slots[i].start) > new Date(slotDay +"T"+ slotEndTime) || new Date(eventData.slots[i].end) < new Date(slotDay +"T"+ slotStartTime))){
                alert("The slot you are trying to create seems to overlap with an already existing slot")
                return
            }
        }
        
        if (!slotStartTime < slotEndTime ) {
            alert("It seems the slot should start after it ends with the current specifications")
            return
        }
        
        if (!slotDay || !slotStartTime || !slotEndTime) {
            alert("please fill out all information")
            return
        }
        
        const response = await fetch(apiURL + "/api/v1/events/event/slot", {
            method: "POST",
            credentials: "include",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify({
                endDate: slotDay + "T" + slotEndTime,
                startDate: slotDay + "T" + slotStartTime,
                eventID: eventID
            })
        });
        const responseJson = await response.json()
        const slotID = responseJson.slotID;
        if (adminSlotCreationPanel) adminSlotCreationPanel.style.display = "none"
        if (darkenedSite) darkenedSite.style.display = "none"
        
        if (eventData) {
            eventData.slots.push({
                start: slotDay + "T" + slotStartTime,
                end: slotDay + "T" + slotEndTime,
                slotID: slotID,
                modules: []
            })
        }
        renderCalendar()
    })
}
else{
    console.log("error could not find submitSlotCreationButton")
};

// ---- Slot & Module Editing ----
/**
 * Saves modifications to slot timing and module information
 * Updates both server database and local eventData
 * Creates new modules if they were added in the panel
 */
if (saveSlotAndModuleSettings){
    saveSlotAndModuleSettings.addEventListener("click",async () => {
        const selectedSlotUUID = SlotAndModuleEditPanel.dataset.idOfSelectedSlot
        const selectedSlotID = eventData.slots.findIndex(slot => slot.slotID === selectedSlotUUID);
        const startTime = String(dayOfSlotPanel.value + "T" + startTimeSlotPanel.value);
        const endTime = String(dayOfSlotPanel.value + "T" + endTimeSlotPanel.value)

        // Save the slot settings to database
        const response = await fetch(apiURL + "/api/v1/events/"+eventID+"/"+selectedSlotUUID, {
            method: "PATCH",
            credentials: "include",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify({
                slotID: selectedSlotUUID,
                eventId: eventID,
                startTime: startTime,
                endTime: endTime
            })
        });

        // Update local data with new slot times
        eventData.slots[selectedSlotID].start = startTime;
        eventData.slots[selectedSlotID].end = endTime;

        const moduleCount = eventData.slots[selectedSlotID].modules.length;
        
        // Add empty module entries for new modules added in the panel
        for (let i = 0; i < adminModulePanel.children.length - moduleCount; i++){
            eventData.slots[selectedSlotID].modules.push({
                "locationInfoShort": "",
                "additionalInfo": "",
                "name": "",
                "moduleID": NaN,
            })
            continue;
        }
        
        // Update all module information for the selected slot
        for (let i = 0; i < adminModulePanel.children.length; i++){
            const locationInfo = adminModulePanel.children[i].querySelector(".moduleLocationShortPanel").value;
            const moduleInfo = adminModulePanel.children[i].querySelector(".moduleInfoPanel").value;
            const moduleName = adminModulePanel.children[i].querySelector(".moduleNamePanel").value;
            const moduleID = adminModulePanel.children[i].id;

            // Save module to database
            const response = await fetch(apiURL + "/api/v1/events/event/slot/module", {
                method: "PATCH",
                credentials: "include",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify({
                    slotID: selectedSlotUUID,
                    locationInfo: locationInfo,
                    generalInfo: moduleInfo,
                    moduleName: moduleName,
                    moduleID: moduleID
                })
            });
            const responseJson = await response.json();
            
            // Update local data with module information
            eventData.slots[selectedSlotID].modules[i].locationInfoShort = adminModulePanel.children[i].querySelector(".moduleLocationShortPanel").value;
            eventData.slots[selectedSlotID].modules[i].additionalInfo = adminModulePanel.children[i].querySelector(".moduleInfoPanel").value;
            eventData.slots[selectedSlotID].modules[i].name = adminModulePanel.children[i].querySelector(".moduleNamePanel").value;
            eventData.slots[selectedSlotID].modules[i].moduleID = responseJson.moduleID;
        }
        
        if (SlotAndModuleEditPanel) SlotAndModuleEditPanel.style.display = "none"
        if (adminModulePanel) adminModulePanel.style.display = "none"
        if (darkenedSite) darkenedSite.style.display = "none"
        adminModulePanel.dataset.idOfSelectedSlot = "null";

        renderCalendar()
    })
}
else{
    console.log("could not find saveSlotAndModuleSettings button")
};

// ---- User Panel & Authentication ----
/**
 * Opens/closes the user panel and handles clicking outside to close
 */
if (userButton) {
    userButton.addEventListener("click", () => {

        if (userPanel.style.display === "grid") {
            userPanel.style.display = "none";
            document.removeEventListener("click", closeUserPanel);
            return;
        }

        userPanel.style.display = "grid";

        closeUserPanel = (event) => {
            if (!userPanel.contains(event.target) && event.target !== userButton) {
                userPanel.style.display = "none";
                document.removeEventListener("click", closeUserPanel);
            }
        };

        document.addEventListener("click", closeUserPanel);
    });
}
else{
    console.log("error could not find user Button")
};

/**
 * Logs out the user and redirects to login page
 */
if (logoutButton){
    logoutButton.addEventListener("click", async () => {
        const response = await fetch(apiURL + "/api/v1/auth/sign-out", {
            method:"POST",
            credentials:"include"
        });
        console.log(await response.json())
        window.location.href = "index.html";

    })
}
else{
    console.log("error could not find logout button")
};

// ---- Week Navigation ----
/**
 * Handles previous/next week navigation
 * Updates currentWeekIndex and re-renders calendar
 */
if (weekButtonLeft && weekButtonRight){
    weekButtonLeft.addEventListener("click", () => {
        currentWeekIndex -= 1;
        renderCalendar();     
    });
    weekButtonRight.addEventListener("click", () => {
        currentWeekIndex += 1;
        renderCalendar();
    });
    
}
else{
    console.log("error could not find week change buttons")
};

// ==================== CALENDAR DRAWING FUNCTIONS ==================== 

/**
 * Renders the time column on the left side of the calendar
 * Calculates height based on event duration
 * Creates hourly time slots (e.g., "09:00", "10:00", etc.)
 */
function drawCalendarTimeColumn() {
    if (!calendarTimeColumn || !mainCalendar) return;

    calendarTimeColumn.innerHTML = "";
    if (!eventData){
        console.log("eventData not found");
        return;
    }
    
    // Extract hours from event start/end times
    const startTimeValue = eventData.startDate.split("T")[1].split(":");
    const endTimeValue = eventData.endDate.split("T")[1].split(":");
    const maxTimeSpan = (parseInt(endTimeValue[0]) + 1) - (parseInt(startTimeValue[0]) - 1);
    
    // Set calendar height based on number of hours
    mainCalendar.style.height = `${(maxTimeSpan * hourIncrement) + 100}px`;

    // Create a time slot for each hour
    for (let i = 0; i < maxTimeSpan; i++) {
        calendarTimeColumn.innerHTML += `
        <div class="calendarTimeSlot">${parseInt(startTimeValue[0]) + i}:00 </div>
        `;
    }

    calendarTimeColumn.style.gridTemplateRows = `repeat(${maxTimeSpan}, 1fr)`;
};

/**
 * Renders all slots and their modules in the calendar grid
 * Places slots in the correct column and position based on date/time
 * Filters slots to only show those in the current week
 * Shows empty placeholder for slots without modules
 */
function drawSlots() {
    if (!calendarColumns) return;

    if (!eventData) return;

    // Clear all columns
    for (let i = 0; i < calendarColumns.children.length; i++) {
        calendarColumns.children[i].innerHTML = "";
    }

    // Render each slot
    for (let i = 0; i < eventData.slots.length; i++) {
        const slotStartDate = new Date(eventData.slots[i].start);
        const columnIndex = (slotStartDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
        const targetColumn = calendarColumns.children[columnIndex];
        if (!targetColumn) continue;

        // Calculate vertical position and height
        const slotStartHours = slotStartDate.getHours() + 0.5 + (slotStartDate.getMinutes() / 60);
        const eventStartHours = new Date(eventData.startDate).getHours();
        const topPosition = (slotStartHours - eventStartHours) * hourIncrement;
        const slotDurationHours = ((new Date(eventData.slots[i].end).getTime() - new Date(eventData.slots[i].start).getTime()) / 3600000) % 24;
        const slotHeight = slotDurationHours * hourIncrement;

        // Calculate which week this slot belongs to and skip if not current week
        const eventStartDate = new Date(eventData.startDate);
        const slotWeekIndex = Math.trunc(((slotStartDate - eventStartDate)/604800000));
        if (slotWeekIndex !== currentWeekIndex) continue;
        
        // Create slot display - different styling for empty vs filled slots
        if (!eventData.slots[i].modules.length) {
            // Empty slot - show placeholder
            targetColumn.innerHTML += `
                <button id="${eventData.slots[i].slotID}" class="CalendarSlot calendarSlotActive" style="top:${topPosition}px; height:${slotHeight}px">
                    <div>Click to set Modules</div>
                </button>
            `;
        }
        else {
            // Slot with modules - display module information
            let modulesHTML = "";
            for (let j = 0; j < eventData.slots[i].modules.length; j++) {
                modulesHTML += `
                    <div class="calendarModule" id="${eventData.slots[i].modules[j].moduleID}">
                        <div class="moduleName" style="font-size: 1rem;">${eventData.slots[i].modules[j].name}</div>
                        <div class="moduleGeneralInfo">${eventData.slots[i].modules[j].additionalInfo}</div>
                        <div class="moduleLocationShort">${eventData.slots[i].modules[j].locationInfoShort}</div>
                    </div>
                `;
            }
            targetColumn.innerHTML += `
                <button id="${eventData.slots[i].slotID}" class="CalendarSlot calendarSlotInactive" style="top:${topPosition}px; height:${slotHeight}px">
                    ${modulesHTML}
                </button>
            `;
        }
    }
};

/**
 * Adds click handlers to all slots in the calendar
 * Opens the slot editing panel and populates module information
 */
function makeSlotLogic() {
    const slots = document.getElementsByClassName("CalendarSlot");
    for (let i = 0; i < slots.length; i++) {
        slots[i].addEventListener("click", () => {
            if (!eventData) return;

            // Show editing panels
            if (SlotAndModuleEditPanel) SlotAndModuleEditPanel.style.display = "grid";
            if (adminModulePanel) adminModulePanel.style.display = "flex";
            if (darkenedSite) darkenedSite.style.display = "block";

            const selectedSlotID = slots[i].id;
            const selectedSlot = eventData.slots.find(slot => slot.slotID === selectedSlotID);

            // Populate module editing panel with existing modules
            if (adminModulePanel) {
                adminModulePanel.innerHTML = ``;
                let modulesHTML = "";
                if (selectedSlot && selectedSlot.modules.length) {
                    for (let j = 0; j < selectedSlot.modules.length; j++) {
                        modulesHTML += `
                            <div class="adminModulePanelSlot" id="${selectedSlot.modules[j].moduleID}">
                                <textarea class="moduleNamePanel inputStyle2" type="text" placeholder="Module name">${selectedSlot.modules[j].name}</textarea>
                                <textarea class="moduleInfoPanel inputStyle2" type="text" placeholder="General info">${selectedSlot.modules[j].additionalInfo}</textarea>
                                <textarea class="moduleLocationShortPanel inputStyle2" type="text" placeholder="Short location info">${selectedSlot.modules[j].locationInfoShort}</textarea>
                            </div>
                        `;
                    }
                }

                adminModulePanel.innerHTML += modulesHTML;
                SlotAndModuleEditPanel.dataset.idOfSelectedSlot = String(selectedSlotID);
            }

            // Populate slot timing fields
            const dayOfSlotPanel = document.getElementById("dayOfSlotPanel");
            const startTimeSlotPanel = document.getElementById("startTimeSlotPanel");
            const endTimeSlotPanel = document.getElementById("endTimeSlotPanel");

            if (selectedSlot) {
                if (dayOfSlotPanel) dayOfSlotPanel.value = selectedSlot.start.split("T")[0];
                if (startTimeSlotPanel) startTimeSlotPanel.value = selectedSlot.start.split("T")[1];
                if (endTimeSlotPanel) endTimeSlotPanel.value = selectedSlot.end.split("T")[1];
            }

            addSlotEditingPanelLogic();
        });
    }
};

/**
 * Binds input interactions to module panel elements
 * - Auto-expands textarea height as content grows
 * - Handles close button to dismiss editing panel
 */
function bindModulePanelInteractions() {
    // Auto-expand textareas to fit content
    const textAreas = document.querySelectorAll(".moduleLocationShortPanel, .moduleInfoPanel, .moduleNamePanel");
    for (let i = 0; i < textAreas.length; i++) {
        textAreas[i].oninput = () => {
            textAreas[i].style.height = "auto";
            textAreas[i].style.height = textAreas[i].scrollHeight + "px";
        };
    }

    // Handle close button clicks
    const closeWindowButtons = document.getElementsByClassName("closeModulesWindow");
    for (let i = 0; i < closeWindowButtons.length; i++) {
        closeWindowButtons[i].onclick = () => {
            if (SlotAndModuleEditPanel) SlotAndModuleEditPanel.style.display = "none";
            if (adminModulePanel) adminModulePanel.style.display = "none";
            if (darkenedSite) darkenedSite.style.display = "none";
            renderCalendar();
        };
    }
};

/**
 * Sets up interactions for the slot editing panel
 * Binds the "Add Module" button to create new modules in the current slot
 */
function addSlotEditingPanelLogic() {
    bindModulePanelInteractions();

    if (addModuleButton && adminModulePanel) {
        addModuleButton.onclick = async () => {
            const selectedSlotUUID = SlotAndModuleEditPanel.dataset.idOfSelectedSlot;

            // Create a new module on the server
            const response = await fetch(apiURL + "/api/v1/events/event/slot/module", {
                method: "POST",
                credentials: "include",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify({
                    slotID: selectedSlotUUID,
                    locationInfo: "Location info",
                    generalInfo: "General information",
                    moduleName: "Module name"
                })
            }); 
            const responseJson = await response.json();

            // Add the new module to the panel if creation was successful
            if (responseJson.success === true){
                adminModulePanel.innerHTML += `
                    <div class="adminModulePanelSlot" id="${responseJson.moduleID}">
                        <textarea class="moduleNamePanel inputStyle2" type="text" placeholder="Module name"></textarea>
                        <textarea class="moduleInfoPanel inputStyle2" type="text" placeholder="General information"></textarea>
                        <textarea class="moduleLocationShortPanel inputStyle2" type="text" placeholder="Location info"></textarea>
                    </div>
                `;
            }
            else{
                console.log("could not add module");
            }
            
            bindModulePanelInteractions();
        };
    }
    else {
        console.log("error could not find addModuleButton");
    }
};

/**
 * Renders the date row showing day names and dates
 * Calculates which dates to show based on currentWeekIndex
 * Updates month/year display
 */
function drawDateRow() {
    if (!eventData || !calendarDateRow || !calendarMonth){
        console.log("error data needed to draw the calendar is missing");
        return;
    } 

    const eventStart = new Date(eventData.startDate);
    const weekStart = new Date(eventStart);

    // Set weekStart to Monday of eventStart week
    weekStart.setDate(eventStart.getDate() - ((eventStart.getDay() + 6) % 7));
    // Adjust weekStart to the currentWeek selected using currentWeekIndex
    weekStart.setDate(weekStart.getDate() + (currentWeekIndex * 7));

    // Populate each day column in the header
    for (let i = 0; i < calendarDateRow.children.length; i++) {
        const outputDate = new Date(weekStart);
        outputDate.setDate(weekStart.getDate() + i);
        calendarDateRow.children[i].innerHTML = `
            <div class="calendarDayName">${daysOfTheWeek[i]}</div>
            <div class="calendarDayNumber">${outputDate.getDate()}</div>
        `;

        // Update month display for the first day of the week
        if (i === 0) {
            calendarMonth.innerHTML = `
            <div>${monthsOfTheYear[outputDate.getMonth()]}</div>
            <div>${outputDate.getFullYear()}</div>
            `;
        }
    }
};

/**
 * Shows or hides week navigation buttons based on current position
 * Hides "previous" button on first week
 * Hides "next" button on last week
 * Shows both buttons if there are multiple weeks
 */
function renderWeekChangeButtons() {
    const maxWeekIndex = (Math.ceil((new Date(eventData.endDate)-new Date(eventData.startDate))/604800000))-1;
    
    if (maxWeekIndex === 0){
        // Only one week - hide both buttons
        weekButtonLeft.style.display = "none";
        weekButtonRight.style.display = "none";
    }  
    else if (currentWeekIndex === 0){
        // First week - hide left button
        weekButtonLeft.style.display = "none";
        weekButtonRight.style.display = "block";
    }
    else if (currentWeekIndex === maxWeekIndex){
        // Last week - hide right button
        weekButtonLeft.style.display = "block";
        weekButtonRight.style.display = "none";
    }
    else{
        // Middle weeks - show both buttons
        weekButtonLeft.style.display = "block";
        weekButtonRight.style.display = "block";
    }      
};