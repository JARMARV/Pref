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
const hourIncrement = 90

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
    drawCalendarTimeColumn()
    drawDateRow()
    drawModules()
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

function drawModules(){

    //get the starting hour of the event
    //alert(new Date(userData[0].events[0].startDate).getHours())
    //get the time range of the event
    //alert(((new Date(userData[0].events[0].endDate).getTime()-new Date(userData[0].events[0].startDate).getTime())/3600000)%24)
    for (let i = 0; i < userData[0].events[0].modules.length; i++){
        if (userData[0].events[0].modules[i].moduleWeekIndex === currentWeekIndex ){
            const ModuleStartDate = new Date(userData[0].events[0].modules[i].start)
            calendarColumns.children[ModuleStartDate.getDay()-1].innerHTML +=`
                <div class="CalendarModule" style="top:${((ModuleStartDate.getHours()+0.5+(ModuleStartDate.getMinutes()/60))-new Date(userData[0].events[0].startDate).getHours())*hourIncrement}px ; height:${((new Date(userData[0].events[0].modules[i].end).getTime()-new Date(userData[0].events[0].modules[i].start).getTime())/3600000)%24*hourIncrement}px"> </div>     
             `
        }       
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