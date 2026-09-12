// ==================== GLOBAL VARIABLES ====================

// ---- API Configuration ----
const apiURL = "http://localhost:5600";

// ---- Calendar Display Configuration ----
const hourIncrement = 90; // Height in pixels for each hour slot in the calendar

// ---- Event Selector Panel ----
const userPanelParent = document.getElementById("userPanelParent");
let eventSelectorPanel = userPanelParent;
let eventButtonsContainer;
const eventSelectorTemplate = document.getElementById("userEventSelectorTemplate");
const mainGrid = document.getElementById("mainGrid");

// ---- Data & State Variables ----
let eventID = ""; // Current event UUID
let eventData = null; // Stores the fetched event data
let currentWeekIndex = 0; // Tracks which week is currently being displayed
let closeUserPanel; // Function reference for closing user panel when clicking outside

// ---- Week Navigation Elements ----
const weekButtonLeft = document.getElementById("weekButtonLeft"); // Button to go to previous week
const weekButtonRight = document.getElementById("weekButtonRight"); // Button to go to next week

// ---- User Panel Elements ----
const userButton = document.getElementById("userButton"); // Button to toggle user panel
const userPanel = document.getElementById("userPanel"); // Panel showing user options
const logoutButton = document.getElementById("logoutButton"); // Button to logout
const selectEventButton = document.getElementById("selectEventButton"); // Button to open event selection

// ---- User Slot Editing Elements ----
let userModulePanel;
let SlotAndModuleEditPanel = userPanelParent;
let dayOfSlotPanel;
let startTimeSlotPanel;
let endTimeSlotPanel;
let saveUserPreference;

// ---- Overlay Element ----
const darkenedSite = document.getElementById("darkenedSite"); // Dark overlay when modals are open

// ---- Lookup Arrays ----
const monthsOfTheYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysOfTheWeek = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

// ---- Calendar & Display Elements ----
const headerTitle = document.getElementById("headerTitle");
const mainCalendar = document.getElementById("mainCalendar");
const calendarColumns = document.getElementById("calendarColumns"); // Container for day columns
const calendarDateRow = document.getElementById("calendarDateRow"); // Displays day names and dates
const calendarTimeColumn = document.getElementById("calendarTimeColumn"); // Displays time slots on left side
const calendarMonth = document.getElementById("calendarMonth"); // Displays current month and year

function showUserPanelParent(template, display) {
    userPanelParent.innerHTML = template.innerHTML;
    userPanelParent.dataset.panel = template.id;
    userPanelParent.style.display = display;
    eventButtonsContainer = document.getElementById("eventButtonsContainer");
    userModulePanel = document.getElementById("userModulePanel");
    SlotAndModuleEditPanel = userPanelParent;
    dayOfSlotPanel = document.getElementById("dayOfSlotPanel");
    startTimeSlotPanel = document.getElementById("startTimeSlotPanel");
    endTimeSlotPanel = document.getElementById("endTimeSlotPanel");
    saveUserPreference = document.getElementById("saveUserPreference");
    bindUserPreferenceSaving();
}

initialize();

async function initialize()  {
    renderEventSelector()
} 


async function getEventData(){
    const response = await fetch(apiURL + "/api/v1/events/event/" + eventID, {
        method: "GET",
        credentials: "include",
        headers:{"Content-Type": "application/json"},
    });
    const responseJson = await response.json();
    return responseJson;
};

async function getEventPreference(){
    const response = await fetch(apiURL + "/api/v1/events/pref/" + eventID, {
        method: "GET",
        credentials: "include",
    });
    const responseJson = await response.json();
    return responseJson.preferences;
};

//currently not fully implemented just gives the first event
//scales the width of the horizontal lines in the calendar
function updateCalendarColumnsWidth() {
    if (!calendarColumns) return
        const width = calendarColumns.offsetWidth
        document.documentElement.style.setProperty('--calendarColumnsWidth', width + 'px')
}
window.addEventListener('load', updateCalendarColumnsWidth)
window.addEventListener('resize', updateCalendarColumnsWidth)

function renderCalendar() {
    if (!eventData) return
    drawCalendarHeader()
    drawCalendarTimeColumn()
    drawDateRow()
    renderWeekChangeButtons()
    if(eventData.isLocked === false){
        drawSlots()
        makeSlotLogic()
    }
    else{

    }
}

function drawCalendarTimeColumn() {
    if (!calendarTimeColumn || !mainCalendar) return
    calendarTimeColumn.innerHTML = ""
    if (!eventData) return

    const startTimeValue = eventData.startDate.split("T")[1].split(":")
    const endTimeValue = eventData.endDate.split("T")[1].split(":")
    const maxTimeSpan = (parseInt(endTimeValue[0]) + 1) - (parseInt(startTimeValue[0]) - 1)
    mainCalendar.style.height = `${(maxTimeSpan * hourIncrement) + 100}px`

    for (let i = 0; i < maxTimeSpan; i++) {
        calendarTimeColumn.innerHTML += `
        <div class="calendarTimeSlot">${parseInt(startTimeValue[0]) + i}:00 </div>
        `
    }

    calendarTimeColumn.style.gridTemplateRows = `repeat(${maxTimeSpan}, 1fr)`
}

function drawSlots() {
    if (!calendarColumns) return

    if (!eventData) return

    for (let i = 0; i < calendarColumns.children.length; i++) {
        calendarColumns.children[i].innerHTML = ""
    }

    for (let i = 0; i < eventData.slots.length; i++) {
        const slotStartDate = new Date(eventData.slots[i].start)
        const columnIndex = (slotStartDate.getDay() + 6) % 7
        const targetColumn = calendarColumns.children[columnIndex]
        if (!targetColumn) continue

        const slotStartHours = slotStartDate.getHours() + 0.5 + (slotStartDate.getMinutes() / 60)
        const eventStartHours = new Date(eventData.startDate).getHours()
        const topPosition = (slotStartHours - eventStartHours) * hourIncrement
        const slotDurationHours = ((new Date(eventData.slots[i].end).getTime() - new Date(eventData.slots[i].start).getTime()) / 3600000) % 24
        const slotHeight = slotDurationHours * hourIncrement

        const eventStartDate = new Date(eventData.startDate)
        const slotWeekIndex = Math.trunc((slotStartDate - eventStartDate) / 604800000)
        if (slotWeekIndex !== currentWeekIndex) continue

        if (!eventData.slots[i].modules.length) {
            targetColumn.innerHTML += `
                <button id="${eventData.slots[i].slotID}" class="CalendarSlot calendarSlotInactive" style="top:${topPosition}px; height:${slotHeight}px">
                    <div>No modules for this time slot</div>
                </button>
            `
        }
        else {
            let modulesHTML = ""
            for (let j = 0; j < eventData.slots[i].modules.length; j++) {
                modulesHTML += `
                    <div class="calendarModule preferenceLevel${eventData.slots[i].modules[j].userPreference}">
                        <div class="moduleName" style="font-size: 1rem;">${eventData.slots[i].modules[j].name}</div>
                        <div class="moduleGeneralInfo">${eventData.slots[i].modules[j].additionalInfo}</div>
                        <div class="moduleLocationShort">${eventData.slots[i].modules[j].locationInfoShort}</div>
                    </div>
                `
            }
            targetColumn.innerHTML += `
                <button id="${eventData.slots[i].slotID}" class="CalendarSlot calendarSlotInactive" style="top:${topPosition}px; height:${slotHeight}px">
                    ${modulesHTML}
                </button>
            `
        }
    }
}

function makeSlotLogic() {
    const slots = document.getElementsByClassName("CalendarSlot")
    for (let i = 0; i < slots.length; i++) {
        slots[i].addEventListener("click", () => {
            if (!eventData) return

            showUserPanelParent(document.getElementById("userSlotEditTemplate"), "grid")
            if (userModulePanel) userModulePanel.style.display = "flex"
            if (darkenedSite) darkenedSite.style.display = "block"

            const selectedSlotID = slots[i].id
            const selectedSlot = eventData.slots.find(slot => slot.slotID === selectedSlotID)

            if (userModulePanel) {
                userModulePanel.innerHTML = ``
                let modulesHTML = ""
                console.log(selectedSlot)
                if (selectedSlot && selectedSlot.modules.length) {
                    for (const module of  selectedSlot.modules) {
                        modulesHTML += `
                            <div class="userModulePanelSlot" id="${module.moduleID}">
                                <textarea readonly class="moduleNamePanel inputStyle2" type="text" placeholder="Module name">${module.name}</textarea>
                                <textarea readonly class="moduleInfoPanel inputStyle2" type="text" placeholder="General info">${module.additionalInfo}</textarea>
                                <textarea readonly class="moduleLocationShortPanel inputStyle2" type="text" placeholder="Short location info">${module.locationInfoShort}</textarea>
                                <div class="preferenceContainer">
                                <div class="minMaxValuesSlider">
                                    <div>1</div>
                                    <div>preference</div>
                                    <div>5</div>
                                    </div>
                                    <div class="sliderContainer">
                                        <input type="range" class="sliderInput" min="1" max="5" value="${module.userPreference || 3}">
                                    </div>
                                </div>
                            </div>
                        `
                    }
                }

                userModulePanel.innerHTML += modulesHTML
                SlotAndModuleEditPanel.dataset.idOfSelectedSlot = String(selectedSlotID);
            }

            if (selectedSlot) {
                if (dayOfSlotPanel) dayOfSlotPanel.value = selectedSlot.start.split("T")[0]
                if (startTimeSlotPanel) startTimeSlotPanel.value = selectedSlot.start.split("T")[1]
                if (endTimeSlotPanel) endTimeSlotPanel.value = selectedSlot.end.split("T")[1]
            }

            bindModulePanelInteractions()
        })
    }
}

function bindModulePanelInteractions() {
    const textAreas = document.querySelectorAll(".moduleLocationShortPanel, .moduleInfoPanel, .moduleNamePanel")
    for (let i = 0; i < textAreas.length; i++) {
        const area = textAreas[i];
        const resizeArea = () => {
            area.style.height = "auto";
            area.style.height = area.scrollHeight + "px";
        };

        area.oninput = resizeArea;
        resizeArea();
    }

    const closeWindowButtons = document.getElementsByClassName("closeModulesWindow")
    for (let i = 0; i < closeWindowButtons.length; i++) {
        closeWindowButtons[i].onclick = () => {
            if (userPanelParent) userPanelParent.style.display = "none"
            if (userModulePanel) userModulePanel.style.display = "none"
            if (darkenedSite) darkenedSite.style.display = "none"
            renderCalendar()
        }
    }
}

function drawDateRow() {
    if (!eventData || !calendarDateRow || !calendarMonth) return

    const startDateValue = new Date(eventData.startDate)
    const weekStart = new Date(startDateValue)
    weekStart.setDate(startDateValue.getDate() - ((startDateValue.getDay() + 6) % 7))
    weekStart.setDate(weekStart.getDate() + (currentWeekIndex * 7))

    for (let i = 0; i < calendarDateRow.children.length; i++) {
        const outputDate = new Date(weekStart)
        outputDate.setDate(weekStart.getDate() + i)
        calendarDateRow.children[i].innerHTML = `
            <div class="calendarDayName">${daysOfTheWeek[i]}</div>
            <div class="calendarDayNumber">${outputDate.getDate()}</div>
        `

        if (i === 0) {
            calendarMonth.innerHTML = `
            <div>${monthsOfTheYear[outputDate.getMonth()]}</div>
            <div>${outputDate.getFullYear()}</div>
            `
        }
    }
}

function drawCalendarHeader() {
    const headerTitle = document.getElementById("headerTitle")
    if (headerTitle) headerTitle.innerHTML = eventData.eventName
}

async function renderEventSelector(){
    //getting the events connected to the user
    const response = await fetch(apiURL + "/api/v1/events/user", {
        method: "GET",
        credentials: "include",
        headers:{"Content-Type": "application/json"},
    });
    const responseJson = await response.json()
    console.log(responseJson)
    //alert if there are no events
    if (responseJson.events.length === 0) alert("error could not find any events connected to this user")
    //automatically redirecting the user if only connected to one event
    else if (responseJson.events.length === 1){
        eventID = responseJson.events[0].eventID;
        const result = await getEventData();
        if (!result.success) {
            console.error(result);
            return;
        }
        eventData = result.event;

        const preferences = await getEventPreference();
        const preferenceMap = new Map(
            preferences.map(pref => [pref.module_id, pref.preference_value])
        );
        for (const slot of eventData.slots) {
            for (const module of slot.modules) {
                module.userPreference = preferenceMap.get(module.moduleID);
            }
        }

        console.log(eventData);
        localStorage.selectedEventID = eventData.eventID;
        eventSelectorPanel.style.display = "none";
        darkenedSite.style.display = "none";
        mainGrid.style.display = "grid";
        selectEventButton.style.display ="none";
        renderCalendar();
        return;
    }
    //rendering the event selector if there are multiple events
    showUserPanelParent(eventSelectorTemplate, "flex");
    const events = responseJson.events
    eventButtonsContainer.innerHTML = "";
    for (const event of events){
        eventButtonsContainer.innerHTML += `
        <div class="eventButtonContainer" id="${event.eventID}">
            <button class="eventButton">${event.eventName}</button>
            <button class="openEventEditorButton">x</button>
        </div>
        `
    }

    eventSelectorPanel.style.display = "flex";
    darkenedSite.style.display = "block"
    mainGrid.style.display = "none";
    for (const child of eventButtonsContainer.children){
        child.children[0].addEventListener("click",async () => {
            eventID = child.id;
            const result = await getEventData();
            if (!result.success) {
                console.error(result);
                return;
            }

            eventData = result.event;

            const preferences = await getEventPreference();
            const preferenceMap = new Map(
                preferences.map(pref => [pref.module_id, pref.preference_value])
            );
            for (const slot of eventData.slots) {
                for (const module of slot.modules) {
                    module.userPreference = preferenceMap.get(module.moduleID);
                }
            }

            console.log(eventData);
            localStorage.selectedEventID = eventData.eventID;
            eventSelectorPanel.style.display = "none";
            darkenedSite.style.display = "none";
            mainGrid.style.display = "grid";
            renderCalendar();
        })
    }
}

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
}
function bindUserPreferenceSaving() {
    if (saveUserPreference) {
        saveUserPreference.addEventListener("click", async () => {
            //getting slotID,slot object and modules
            const selectedSlotID = SlotAndModuleEditPanel.dataset.idOfSelectedSlot;
            if (!selectedSlotID){
                console.error("error slot id is undefined");
                return
            }
            const selectedSlot = eventData.slots.find(slot => slot.slotID === selectedSlotID);
            if (!selectedSlot){
                console.error("Slot not found:" , selectedSlotID);
                return
            }
            const modules = selectedSlot.modules;
            let userPref= [];
            for (const child of userModulePanel.children){
                userPref.push({preferenceValue:child.querySelector(".sliderInput").value, moduleID:child.closest("[id]").id})
            }
            
            const response = await fetch(apiURL + "/api/v1/users/savepref", {
                method: "POST",
                credentials: "include",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify({userPref})
            });

            const responseJson = await response.json()
            console.log(responseJson);
            if (responseJson.success === false) return;

            for (const module of modules) {

                module.userPreference = userPref.find(module2 => module2.moduleID === module.moduleID).preferenceValue;
            }
            if (userPanelParent) userPanelParent.style.display = "none"
            if (userModulePanel) userModulePanel.style.display = "none"
            if (darkenedSite) darkenedSite.style.display = "none"
            console.log(eventData)
            renderCalendar()
        })
    }
}
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
}

if (selectEventButton) {
    selectEventButton.addEventListener("click", () => {
        renderEventSelector();
    })
}
else{
    console.log("error could not find selectEventButton")
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