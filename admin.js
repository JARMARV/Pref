const adminCalendarSettingsPanel = document.getElementById("adminCalendarSettingsPanel")
const darkenedSite =document.getElementById("darkenedSite")
const newTableButton =document.getElementById("newTableButton")
const submitCalendarSettingsButton = document.getElementById("submitCalendarSettingsButton")
const calendarTimeColumn = document.getElementById("calendarTimeColumn")
const newModuleButton = document.getElementById("newModuleButton")
const submitModuleCreationButton = document.getElementById("submitModuleCreationButton")
const mainCalendar = document.getElementById("mainCalendar")

//data for the calendar
const startTime = document.getElementById("startTime")
const endTime = document.getElementById("endTime")
const startDate = document.getElementById("startDate")
const endDate = document.getElementById("endDate")


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
}

function drawCalendarTimeColumn(){
    calendarTimeColumn.innerHTML = ``;
    const startTimeValue = startTime.value.split(":");
    const endTimeValue = endTime.value.split(":");
    const maxTimeSpan = (parseInt(endTimeValue[0])+ 1) - (parseInt(startTimeValue[0])-1);
    alert(maxTimeSpan);
    mainCalendar.style.height = `${(maxTimeSpan * 90)+100}px`;
    for (let i = 0; i < maxTimeSpan; i++){
        calendarTimeColumn.innerHTML += `
        <div class="calendarTimeSlot">${parseInt(startTimeValue[0]) + i}:00 </div>
        `;
    }
    calendarTimeColumn.style.gridTemplateRows = `repeat(${maxTimeSpan}, 1fr)`;
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
    }
})