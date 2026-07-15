const adminCalendarSettingsPanel = document.getElementById("adminCalendarSettingsPanel")
const darkenedSite =document.getElementById("darkenedSite")
const newTableButton =document.getElementById("newTableButton")
const submitCalendarSettingsButton = document.getElementById("submitCalendarSettingsButton")
const calendarTimeColumn = document.getElementById("calendarTimeColumn")
const newSlotButton = document.getElementById("newSlotButton")
const submitSlotCreationButton = document.getElementById("submitSlotCreationButton")
const mainCalendar = document.getElementById("mainCalendar")
const calendarColumns = document.getElementById("calendarColumns")
const calendarDateRow = document.getElementById("calendarDateRow")
const calendarMonth = document.getElementById("calendarMonth")
const adminModulePanel = document.getElementById("adminModulePanel")

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
const locationInfoSlot = document.getElementById("locationInfoSlot")
const slotInfo = document.getElementById("slotInfo")

//user data
let userName = "testUser"
let userID = "testID"
let userAuthrization = "localAdmin"

const monthsOfTheYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const daysOfTheWeek = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
const currentWeekIndex = 0


let userData =[];
fetch("userData.json")
    .then(response => response.json())
    .then(data => userData = data)


// horizontal lines dynamic sizing  
function updateCalendarColumnsWidth() {
    const width = calendarColumns.offsetWidth;
    document.documentElement.style.setProperty('--calendarColumnsWidth', width + 'px');
}
window.addEventListener('load', updateCalendarColumnsWidth);
window.addEventListener('resize', updateCalendarColumnsWidth);


newTableButton.addEventListener("click", event => {
    adminCalendarSettingsPanel.style.display = "grid";
    darkenedSite.style.display = "block";
    endDate.value = "2024-12-31";
    startDate.value = "2024-01-01";
    startTime.value = "05:30";
    endTime.value = "10:20";
})


submitCalendarSettingsButton.addEventListener("click", event => {
    if (!endDate.value || !startDate.value || !startTime.value || !endTime.value){
        alert("please fill out all information")
    }
    else{
        adminCalendarSettingsPanel.style.display ="none";
        darkenedSite.style.display = "none";
        updateCalendar()
    }
})


function drawCalendar(){

}

function updateCalendar(){
    drawCalendarTimeColumn();
    drawDateRow();
    drawSlots();
    addSlotButtons();
}

function drawCalendarTimeColumn(){
    calendarTimeColumn.innerHTML = ``;
    const startTimeValue = userData[0].events[0].startDate.split("T")[1].split(":");
    const endTimeValue = userData[0].events[0].endDate.split("T")[1].split(":");
    const maxTimeSpan = (parseInt(endTimeValue[0])+ 1) - (parseInt(startTimeValue[0])-1);
    mainCalendar.style.height = `${(maxTimeSpan * hourIncrement)+100}px`;
    for (let i = 0; i < maxTimeSpan; i++){
        calendarTimeColumn.innerHTML += `
        <div class="calendarTimeSlot">${parseInt(startTimeValue[0]) + i}:00 </div>
        `;
    }
    calendarTimeColumn.style.gridTemplateRows = `repeat(${maxTimeSpan}, 1fr)`;
}   

function drawSlots(){
    for (let i = 0; i < userData[0].events[0].slots.length; i++){
        if (userData[0].events[0].slots[i].slotWeekIndex === currentWeekIndex ){
            const slotStartDate = new Date(userData[0].events[0].slots[i].start)
            if (!userData[0].events[0].slots[i].modules){
                calendarColumns.children[slotStartDate.getDay()-1].innerHTML +=`
                    <button class="CalendarSlot calendarSlotActive" style="top:${((slotStartDate.getHours()+0.5+(slotStartDate.getMinutes()/60))-new Date(userData[0].events[0].startDate).getHours())*hourIncrement}px ; height:${((new Date(userData[0].events[0].slots[i].end).getTime()-new Date(userData[0].events[0].slots[i].start).getTime())/3600000)%24*hourIncrement}px">
                        <div>Click to set Modules</div>
                    </button>
                `
            }
            else{
                let modulesHTML ="";
                for(let j = 0; j < userData[0].events[0].slots[i].modules.length; j++){
                    modulesHTML +=`
                        <div class="calendarModule">
                            <div class="moduleName" style="font-size: 1rem;">${userData[0].events[0].slots[i].modules[j].name}</div>
                            <div class="moduleGeneralInfo">${userData[0].events[0].slots[i].modules[j].additionalInfo}</div>
                            <div class="moduleLocation">${userData[0].events[0].slots[i].modules[j].locationInfoShort}</div>
                        </div>
                    `
                }
                calendarColumns.children[slotStartDate.getDay()-1].innerHTML +=`
                    <button class="CalendarSlot calendarSlotInactive" style="top:${((slotStartDate.getHours()+0.5+(slotStartDate.getMinutes()/60))-new Date(userData[0].events[0].startDate).getHours())*hourIncrement}px ; height:${((new Date(userData[0].events[0].slots[i].end).getTime()-new Date(userData[0].events[0].slots[i].start).getTime())/3600000)%24*hourIncrement}px">
                        ${modulesHTML}
                    </button>
                `
            }
        }       
    }
}

function addSlotButtons(){
    let slots = document.getElementsByClassName("CalendarSlot");
    for (let i = 0; i < slots.length ; i++ ){
        slots[i].addEventListener("click",event => {
            adminModulePanel.style.display = "flex";
            darkenedSite.style.display = "block";


        })
    }
}

function drawDateRow(){
    const StartDate = new Date(userData[0].events[0].startDate);
    const EndDate = new Date(userData[0].events[0].endDate);
    for (let i = 0; i < (calendarDateRow.children.length); i++){

        const outputDate = new Date(StartDate);
        outputDate.setDate(StartDate.getDate() + (i - StartDate.getDay() + 1) + currentWeekIndex* 7);
        calendarDateRow.children[i].innerHTML = `
            <div class="calendarDayName">${daysOfTheWeek[i]}</div>
            <div class="calendarDayNumber">${outputDate.getDate()}</div>
        `;
        if (i === 0) {
            calendarMonth.innerHTML = `${monthsOfTheYear[outputDate.getMonth()]} ${outputDate.getFullYear()}`
        }
    }
}

newSlotButton.addEventListener("click", event => {
    adminSlotCreationPanel.style.display = "grid";
    darkenedSite.style.display = "block";
})


submitSlotCreationButton.addEventListener("click", event => {
    if (false){
        alert("please fill out all information")
    }
    else{
        adminSlotCreationPanel.style.display ="none";
        darkenedSite.style.display = "none";
        const slotDay = dayOfSlot.value;
        const slotStartTime = startTimeSlot.value;
        const slotEndTime = endTimeSlot.value;
        const slotLocation = locationInfoSlot.value;
        const slotAdditionalInfo = slotInfo.value;
    }
})