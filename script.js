const loginButton = document.getElementById("loginButton!")
const loginPanel = document.getElementById("loginPanel")
const adminCalendarSettingsPanel = document.getElementById("adminCalendarSettingsPanel")
const darkenedSite =document.getElementById("darkenedSite")
const openLoginPanelButton =document.getElementById("openLoginPanelButton")

loginButton.addEventListener("click", event => {
    window.location.href = "admin.html"
})

openLoginPanelButton.addEventListener("click",event => {
    loginPanel.style.display = "grid"
})