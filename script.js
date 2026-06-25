const loginButton = document.getElementById("loginButton<")
const loginPanel = document.getElementById("loginPanel")
const adminCalenderSettingsPanel = document.getElementById("adminCalenderSettingsPanel")
const darkenedSite =document.getElementById("darkenedSite")
const newTableButton =document.getElementById("newTableButton")
const submitCalenderSettingsButton = document.getElementById("submitCalenderSettingsButton")

loginButton.addEventListener("click", event => {
    loginPanel.style.display = "none";
    darkenedSite.style.display = "none";
})
newTableButton.addEventListener("click", event => {
    adminCalenderSettingsPanel.style.display = "grid";
    darkenedSite.style.display = "block";
    
})
submitCalenderSettingsButton.addEventListener("click", event => {
    adminCalenderSettingsPanel.style.display ="none";
    darkenedSite.style.display = "none";
})