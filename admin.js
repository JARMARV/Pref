const adminCalenderSettingsPanel = document.getElementById("adminCalenderSettingsPanel")
const darkenedSite =document.getElementById("darkenedSite")
const newTableButton =document.getElementById("newTableButton")
const submitCalenderSettingsButton = document.getElementById("submitCalenderSettingsButton")
const startTime = document.getElementById("startTime")
const endTime = document.getElementById("endTime")
const startDate = document.getElementById("startDate")
const endDate = document.getElementById("endDate")


newTableButton.addEventListener("click", event => {
    adminCalenderSettingsPanel.style.display = "grid";
    darkenedSite.style.display = "block";
    endDate.value = null;
    startDate.value = null;
    startTime.value = "00:00";
    endTime.value = "23:59";
})
submitCalenderSettingsButton.addEventListener("click", event => {
    if (!endDate.value || !startDate.value || !startTime.value || !endTime.value){
        alert("please fill out all information")
    }
    else{
        adminCalenderSettingsPanel.style.display ="none";
        darkenedSite.style.display = "none";
        drawCalender()
    }
})

function drawCalender(){
    alert(endTime.value)
}