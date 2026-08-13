const userCalendarSettingsPanel = document.getElementById("userCalendarSettingsPanel")
const userSlotCreationPanel = document.getElementById("userSlotCreationPanel")
const darkenedSite = document.getElementById("darkenedSite")
const newTableButton = document.getElementById("newTableButton")
const submitCalendarSettingsButton = document.getElementById("submitCalendarSettingsButton")
const calendarTimeColumn = document.getElementById("calendarTimeColumn")
const newSlotButton = document.getElementById("newSlotButton")
const submitSlotCreationButton = document.getElementById("submitSlotCreationButton")
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


const monthsOfTheYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysOfTheWeek = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const currentWeekIndex = 0;

//fetch the userdata.json (will later be replaced by an actual database)
let userData = [];
fetch("userData.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to load user data")
        }
        return response.json()
    })
    .then(data => {
        userData = data
        updateCalendar()
    })
    .catch(error => {
        console.error("Could not load user data:", error)
    })

//currently not fully implemented just gives the first event
function getCurrentEvent() {
    return userData?.[0]?.events?.[0];
}
//scales the width of the horizontal lines in the calendar
function updateCalendarColumnsWidth() {
    if (!calendarColumns) return
        const width = calendarColumns.offsetWidth
        document.documentElement.style.setProperty('--calendarColumnsWidth', width + 'px')
}
window.addEventListener('load', updateCalendarColumnsWidth)
window.addEventListener('resize', updateCalendarColumnsWidth)

function updateCalendar() {
    const eventData = getCurrentEvent()
    if (!eventData) return
    drawCalendarTimeColumn()
    drawDateRow()
    drawSlots()
    makeSlotLogic()
}

function drawCalendarTimeColumn() {
    if (!calendarTimeColumn || !mainCalendar) return
    calendarTimeColumn.innerHTML = ""
    const eventData = getCurrentEvent()
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

    const eventData = getCurrentEvent()
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
                    <div class="calendarModule preferenceLevel${userData[1].events[0].slots[i].modules[j].userPreference}">
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
            const eventData = getCurrentEvent()
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
                                        <input type="range" class="silderInput" min="1" max="5" value="${userData[1].events[0].slots[selectedSlotID].modules[j].userPreference}">
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
            updateCalendar()
        }
    }
}

function drawDateRow() {
    const eventData = getCurrentEvent()
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
        const event = userData[1].events[0];
        const selectedSlotID = Number(SlotAndModuleEditPanel.dataset.idOfSelectedSlot);
        for (let i = 0; i < event.slots[selectedSlotID].modules.length;i++){
            event.slots[selectedSlotID].modules[i].userPreference = userModulePanel.children[i].querySelector(".silderInput").value;
        }
        if (SlotAndModuleEditPanel) SlotAndModuleEditPanel.style.display = "none"
        if (userModulePanel) userModulePanel.style.display = "none"
        if (darkenedSite) darkenedSite.style.display = "none"
        updateCalendar()
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
