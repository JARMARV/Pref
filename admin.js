const adminCalendarSettingsPanel = document.getElementById("adminCalendarSettingsPanel")
const darkenedSite =document.getElementById("darkenedSite")
const newTableButton =document.getElementById("newTableButton")
const submitCalendarSettingsButton = document.getElementById("submitCalendarSettingsButton")
const calendarTimeColumn = document.getElementById("calendarTimeColumn")
const newModuleButton = document.getElementById("newModuleButton")
const submitModuleCreationButton = document.getElementById("submitModuleCreationButton")
const mainCalendar = document.getElementById("mainCalendar")
const calendarColumns = document.getElementById("calendarColumns")
const calendarDateRow = document.getElementById("calendarDateRow")
const calendarMonth = document.getElementById("calendarMonth")

//data for the calendar creation
const startTime = document.getElementById("startTime")
const endTime = document.getElementById("endTime")
const startDate = document.getElementById("startDate")
const endDate = document.getElementById("endDate")

//data for the module creation
const dayOfModule = document.getElementById("dayOfModule")
const startTimeModule = document.getElementById("startTimeModule")
const endTimeModule = document.getElementById("endTimeModule")
const locationInfoModule = document.getElementById("locationInfoModule")
const moduleInfo = document.getElementById("moduleInfo")

//user data
var userName = "testUser"
var userID = "testID"
var userAuthrization = "localAdmin"

const monthsOfTheYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const daysOfTheWeek = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
const weekOffsetIndex = 0


let userData =[];
fetch("userData.json")
    .then(response => response.json())
    .then(data => userData = data)

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
    drawCalendarTimeColumn()
    drawDateRow()
}

function drawCalendarTimeColumn(){
    calendarTimeColumn.innerHTML = ``;
    const startTimeValue = startTime.value.split(":");
    const endTimeValue = endTime.value.split(":");
    const maxTimeSpan = (parseInt(endTimeValue[0])+ 1) - (parseInt(startTimeValue[0])-1);
    mainCalendar.style.height = `${(maxTimeSpan * 90)+100}px`;
    for (let i = 0; i < maxTimeSpan; i++){
        calendarTimeColumn.innerHTML += `
        <div class="calendarTimeSlot">${parseInt(startTimeValue[0]) + i}:00 </div>
        `;
    }
    calendarTimeColumn.style.gridTemplateRows = `repeat(${maxTimeSpan}, 1fr)`;
}   

function drawModules(){

}

function drawDateRow(){
    const StartDate = new Date(userData[0].events[0].startDate);
    const EndDate = new Date(userData[0].events[0].endDate);
    
    for (let i = 0; i < (calendarDateRow.children.length); i++){

        const outputDate = new Date(StartDate);
        outputDate.setDate(StartDate.getDate() + (i - StartDate.getDay() + 1) + weekOffsetIndex * 7);

        calendarDateRow.children[i].innerHTML = `
            <div class="calendarDayName">${daysOfTheWeek[i]}</div>
            <div class="calendarDayNumber">${outputDate.getDate()}</div>
        `;
        if (i === 0) {
            calendarMonth.innerHTML = `${monthsOfTheYear[outputDate.getMonth()]} ${outputDate.getFullYear()}`
        }
    }
}




newModuleButton.addEventListener("click", event => {
    adminModuleCreationPanel.style.display = "grid";
    darkenedSite.style.display = "block";
})
submitModuleCreationButton.addEventListener("click", event => {
    if (false){
        alert("please fill out all information")
    }
    else{
        adminModuleCreationPanel.style.display ="none";
        darkenedSite.style.display = "none";
        const moduleDay = dayOfModule.value;
        const moduleStartTime = startTimeModule.value;
        const moduleEndTime = endTimeModule.value;
        const moduleLocation = locationInfoModule.value;
        const moduleAdditionalInfo = moduleInfo.value;




    }
})