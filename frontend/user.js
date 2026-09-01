const darkenedSite = document.getElementById("darkenedSite")
const calendarTimeColumn = document.getElementById("calendarTimeColumn")
const mainCalendar = document.getElementById("mainCalendar")
const calendarColumns = document.getElementById("calendarColumns")
const calendarDateRow = document.getElementById("calendarDateRow")
const calendarMonth = document.getElementById("calendarMonth")
const userModulePanel = document.getElementById("userModulePanel")
const SlotAndModuleEditPanel = document.getElementById("SlotAndModuleEditPanel")
const addModuleButton = document.getElementById("addModuleButton")
const saveSlotAndModuleSettings = document.getElementById("saveSlotAndModuleSettings")
const dayOfSlotPanel = document.getElementById("dayOfSlotPanel");
const startTimeSlotPanel = document.getElementById("startTimeSlotPanel");
const endTimeSlotPanel = document.getElementById("endTimeSlotPanel");
const userButton = document.getElementById("userButton");
const userPanel = document.getElementById("userPanel");
const saveUserPreference = document.getElementById("saveUserPreference");
const logoutButton = document.getElementById("logoutButton");
const hourIncrement = 90;
const apiURL = "http://localhost:5600"
let eventID = "";
let eventData = null;

// ---- Event selector panel ----
const eventSelectorPanel = document.getElementById("eventSelectorPanel");
const eventButtonsContainer = document.getElementById("eventButtonsContainer");
const createEventButton = document.getElementById("createEventButton")
const mainGrid = document.getElementById("mainGrid");

const monthsOfTheYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysOfTheWeek = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const currentWeekIndex = 0;

initialize();

async function initialize()  {
    if (!localStorage.selectedEventID) renderEventSelector();
    else {
        eventID = localStorage.selectedEventID;
        const result = await getEventData();
        if (result.success === false) {
            console.error(result);
            renderEventSelector()
            return;
        }
        eventData = result.event;
        console.log(eventData);
        renderCalendar();
    }

} 


async function getEventData(){
    const response = await fetch(apiURL + "/api/v1/events/" + eventID, {
        method: "GET",
        credentials: "include",
        headers:{"Content-Type": "application/json"},
    });
    const responseJson = await response.json();
    return responseJson;
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
    drawCalendarTimeColumn()
    drawDateRow()
    drawSlots()
    makeSlotLogic()
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
        if (eventData.slots[i].slotWeekIndex !== currentWeekIndex) continue

        const slotStartDate = new Date(eventData.slots[i].start)
        const columnIndex = (slotStartDate.getDay() + 6) % 7
        const targetColumn = calendarColumns.children[columnIndex]
        if (!targetColumn) continue

        const slotStartHours = slotStartDate.getHours() + 0.5 + (slotStartDate.getMinutes() / 60)
        const eventStartHours = new Date(eventData.startDate).getHours()
        const topPosition = (slotStartHours - eventStartHours) * hourIncrement
        const slotDurationHours = ((new Date(eventData.slots[i].end).getTime() - new Date(eventData.slots[i].start).getTime()) / 3600000) % 24
        const slotHeight = slotDurationHours * hourIncrement

        if (!eventData.slots[i].modules.length) {
            targetColumn.innerHTML += `
                <button id="${i}" class="CalendarSlot calendarSlotInactive" style="top:${topPosition}px; height:${slotHeight}px">
                    <div>No modules for this time slot</div>
                </button>
            `
        }
        else {
            let modulesHTML = ""
            for (let j = 0; j < eventData.slots[i].modules.length; j++) {
                modulesHTML += `
                    <div class="calendarModule preferenceLevel${eventData[1].events[0].slots[i].modules[j].userPreference}">
                        <div class="moduleName" style="font-size: 1rem;">${eventData.slots[i].modules[j].name}</div>
                        <div class="moduleGeneralInfo">${eventData.slots[i].modules[j].additionalInfo}</div>
                        <div class="moduleLocationShort">${eventData.slots[i].modules[j].locationInfoShort}</div>
                    </div>
                `
            }
            targetColumn.innerHTML += `
                <button id="${i}" class="CalendarSlot calendarSlotInactive" style="top:${topPosition}px; height:${slotHeight}px">
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

            if (SlotAndModuleEditPanel) SlotAndModuleEditPanel.style.display = "grid"
            if (userModulePanel) userModulePanel.style.display = "flex"
            if (darkenedSite) darkenedSite.style.display = "block"

            const selectedSlotID = slots[i].id
            const selectedSlot = eventData.slots[selectedSlotID]

            if (userModulePanel) {
                userModulePanel.innerHTML = ``
                let modulesHTML = ""

                if (selectedSlot && selectedSlot.modules.length) {
                    for (let j = 0; j < selectedSlot.modules.length; j++) {
                        modulesHTML += `
                            <div class="userModulePanelSlot">
                                <textarea readonly class="moduleNamePanel inputStyle2" type="text" placeholder="Module name">${selectedSlot.modules[j].name}</textarea>
                                <textarea readonly class="moduleInfoPanel inputStyle2" type="text" placeholder="General info">${selectedSlot.modules[j].additionalInfo}</textarea>
                                <textarea readonly class="moduleLocationShortPanel inputStyle2" type="text" placeholder="Short location info">${selectedSlot.modules[j].locationInfoShort}</textarea>
                                <div class="preferenceContainer">
                                <div class="minMaxValuesSlider">
                                    <div>1</div>
                                    <div>preference</div>
                                    <div>5</div>
                                    </div>
                                    <div class="sliderContainer">
                                        <input type="range" class="silderInput" min="1" max="5" value="${eventData[1].events[0].slots[selectedSlotID].modules[j].userPreference}">
                                    </div>
                                </div>
                            </div>
                        `
                    }
                }

                userModulePanel.innerHTML += modulesHTML
                SlotAndModuleEditPanel.dataset.idOfSelectedSlot = String(selectedSlotID);
            }

            const dayOfSlotPanel = document.getElementById("dayOfSlotPanel")
            const startTimeSlotPanel = document.getElementById("startTimeSlotPanel")
            const endTimeSlotPanel = document.getElementById("endTimeSlotPanel")

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
        textAreas[i].oninput = () => {
            textAreas[i].style.height = "auto"
            textAreas[i].style.height = textAreas[i].scrollHeight + "px"
        }
    }

    const closeWindowButtons = document.getElementsByClassName("closeModulesWindow")
    for (let i = 0; i < closeWindowButtons.length; i++) {
        closeWindowButtons[i].onclick = () => {
            if (SlotAndModuleEditPanel) SlotAndModuleEditPanel.style.display = "none"
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
let closeUserPanel;

async function renderEventSelector(){

    const response = await fetch(apiURL + "/api/v1/events/", {
        method: "GET",
        credentials: "include",
        headers:{"Content-Type": "application/json"},
    });
    const responseJson = await response.json()
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
    const openEventEditorButtons = document.getElementsByClassName("openEventEditorButton");
    for (const button of openEventEditorButtons){
        button.addEventListener("click", async () => {

            eventID = button.parentElement.id
            const res = await getEventData()
            eventData = res.event

            const start = eventData.startDate.split("T");
            const end = eventData.endDate.split("T");

            editEventName.value = eventData.eventName;
            editStartDate.value = start[0];
            editEndDate.value = end[0];
            editStartTime.value = start[1];
            editEndTime.value = end[1];
            eventEditingPanel.dataset.eventID = eventData.eventID

            eventEditingPanel.style.display = "grid"
            eventSelectorPanel.style.display ="none"
        })
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
if (saveUserPreference) {
    saveUserPreference.addEventListener("click", () => {
        const event = eventData[1].events[0];
        const selectedSlotID = Number(SlotAndModuleEditPanel.dataset.idOfSelectedSlot);
        for (let i = 0; i < event.slots[selectedSlotID].modules.length;i++){
            event.slots[selectedSlotID].modules[i].userPreference = userModulePanel.children[i].querySelector(".silderInput").value;
        }
        if (SlotAndModuleEditPanel) SlotAndModuleEditPanel.style.display = "none"
        if (userModulePanel) userModulePanel.style.display = "none"
        if (darkenedSite) darkenedSite.style.display = "none"
        renderCalendar()
    })
}
else{
    console.log("error could not find save button")
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
