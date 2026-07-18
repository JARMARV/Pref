//unsorted html objects
const adminCalendarSettingsPanel = document.getElementById("adminCalendarSettingsPanel")
const adminSlotCreationPanel = document.getElementById("adminSlotCreationPanel")
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
const adminModulePanel = document.getElementById("adminModulePanel")
const SlotAndModuleEditPanel = document.getElementById("SlotAndModuleEditPanel")
const addModuleButton = document.getElementById("addModuleButton")



//data for the calendar creation
const startTime = document.getElementById("startTime")
const endTime = document.getElementById("endTime")
const startDate = document.getElementById("startDate")
const endDate = document.getElementById("endDate")
const hourIncrement = 90

//data for the slot creation
const dayOfSlot = document.getElementById("dayOfSlot")
const startTimeSlot = document.getElementById("startTimeSlot")
const endTimeSlot = document.getElementById("endTimeSlot")

//user data
let userName = "testUser"
let userID = "testID"
let userAuthrization = "localAdmin"

const monthsOfTheYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const daysOfTheWeek = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
const currentWeekIndex = 0


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
    return userData?.[0]?.events?.[0]
}
//scales the width of the horizontal line sin the calendar
function updateCalendarColumnsWidth() {
    if (!calendarColumns) return
        const width = calendarColumns.offsetWidth
        document.documentElement.style.setProperty('--calendarColumnsWidth', width + 'px')
}
window.addEventListener('load', updateCalendarColumnsWidth)
window.addEventListener('resize', updateCalendarColumnsWidth)

if (newTableButton) {
    newTableButton.addEventListener("click", event => {
        if (adminCalendarSettingsPanel) adminCalendarSettingsPanel.style.display = "grid"
        if (darkenedSite) darkenedSite.style.display = "block"
        if (endDate) endDate.value = "2024-12-31"
        if (startDate) startDate.value = "2024-01-01"
        if (startTime) startTime.value = "05:30"
        if (endTime) endTime.value = "10:20"
    })
}
else{
    console.log("error could not find newTableButton")
}
if (submitCalendarSettingsButton) {
    submitCalendarSettingsButton.addEventListener("click", event => {
        if (!endDate?.value || !startDate?.value || !startTime?.value || !endTime?.value) {
            alert("please fill out all information")
            return
        }

        if (adminCalendarSettingsPanel) adminCalendarSettingsPanel.style.display = "none"
        if (darkenedSite) darkenedSite.style.display = "none"

        const eventData = getCurrentEvent()
        if (eventData) {
            eventData.startDate = startDate.value + "T" + startTime.value
            eventData.endDate = endDate.value + "T" + endTime.value
        }

        updateCalendar()
    })
}
else{
    console.log("error could not find submitCalendarSettingsButton")
}
if (newSlotButton) {
    newSlotButton.addEventListener("click", () => {
        if (adminSlotCreationPanel) adminSlotCreationPanel.style.display = "grid"
        if (darkenedSite) darkenedSite.style.display = "block"
    })
}
else{
    console.log("error could not find newSlotButton")
}
if (submitSlotCreationButton) {
    submitSlotCreationButton.addEventListener("click", () => {
        const slotDay = dayOfSlot?.value
        const slotStartTime = startTimeSlot?.value
        const slotEndTime = endTimeSlot?.value

        if (!slotDay || !slotStartTime || !slotEndTime) {
            alert("please fill out all information")
            return
        }

        if (adminSlotCreationPanel) adminSlotCreationPanel.style.display = "none"
        if (darkenedSite) darkenedSite.style.display = "none"

        const eventData = getCurrentEvent()
        if (eventData) {
            eventData.slots.push({
                start: slotDay + "T" + slotStartTime,
                end: slotDay + "T" + slotEndTime,
                slotWeekIndex: 0,
                slotID: eventData.slots.length,
                modules: []
            })
        }

        updateCalendar()
    })
}
else{
    console.log("error could not find submitSlotCreationButton")
}
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
                <button id="${i}" class="CalendarSlot calendarSlotActive" style="top:${topPosition}px; height:${slotHeight}px">
                    <div>Click to set Modules</div>
                </button>
            `
        }
        else {
            let modulesHTML = ""
            for (let j = 0; j < eventData.slots[i].modules.length; j++) {
                modulesHTML += `
                    <div class="calendarModule">
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
            if (adminModulePanel) adminModulePanel.style.display = "flex"
            if (darkenedSite) darkenedSite.style.display = "block"

            const selectedSlotID = slots[i].id
            const selectedSlot = eventData.slots[selectedSlotID]

            if (adminModulePanel) {
                adminModulePanel.innerHTML = `<button class="closeModulesWindow"></button>`
                let modulesHTML = ""

                if (selectedSlot && selectedSlot.modules.length) {
                    for (let j = 0; j < selectedSlot.modules.length; j++) {
                        modulesHTML += `
                            <div class="adminModulePanelSlot">
                                <textarea class="moduleNamePanel inputStyle2" type="text" placeholder="Module name">${selectedSlot.modules[j].name}</textarea>
                                <textarea class="moduleInfoPanel inputStyle2" type="text" placeholder="General info">${selectedSlot.modules[j].additionalInfo}</textarea>
                                <textarea class="moduleLocationShortPanel inputStyle2" type="text" placeholder="Short location info">${selectedSlot.modules[j].locationInfoShort}</textarea>
                            </div>
                        `
                    }
                }

                adminModulePanel.innerHTML += modulesHTML
            }

            const dayOfSlotPanel = document.getElementById("dayOfSlotPanel")
            const startTimeSlotPanel = document.getElementById("startTimeSlotPanel")
            const endTimeSlotPanel = document.getElementById("endTimeSlotPanel")

            if (selectedSlot) {
                if (dayOfSlotPanel) dayOfSlotPanel.value = selectedSlot.start.split("T")[0]
                if (startTimeSlotPanel) startTimeSlotPanel.value = selectedSlot.start.split("T")[1]
                if (endTimeSlotPanel) endTimeSlotPanel.value = selectedSlot.end.split("T")[1]
            }

            addSlotEditingPanelLogic()
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
            if (adminModulePanel) adminModulePanel.style.display = "none"
            if (darkenedSite) darkenedSite.style.display = "none"
            updateCalendar()
        }
    }
}

function addSlotEditingPanelLogic() {
    bindModulePanelInteractions()

    if (addModuleButton && adminModulePanel) {
        addModuleButton.onclick = () => {
            adminModulePanel.innerHTML += `
                <div class="adminModulePanelSlot">
                    <textarea class="moduleNamePanel inputStyle2" type="text" placeholder="Module name"></textarea>
                    <textarea class="moduleInfoPanel inputStyle2" type="text" placeholder="General info"></textarea>
                    <textarea class="moduleLocationShortPanel inputStyle2" type="text" placeholder="Short location info"></textarea>
                </div>
            `
            bindModulePanelInteractions()
        }
    }
    else {
        console.log("error could not find addModuleButton")
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