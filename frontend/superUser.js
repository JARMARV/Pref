const body = document.body;
const userButton = document.getElementById("userButton"); // Button to toggle user panel
const panel = document.getElementById("panel"); // panel displaying all kinds of information
const logoutButton = document.getElementById("logoutButton")
let organizations = [];
let selectedOrganizationUUID = "";



async function init(){
    await getAllOrganizations();
    showPanel("organizationsTemplate","flex","");
}

if (userButton) {
    userButton.addEventListener("click", () => {

        const closeUserPanel = (event) => {
            if (!userPanel.contains(event.target) && !userButton.contains(event.target)) {
                userPanel.style.display = "none";
                document.removeEventListener("click", closeUserPanel);
            }
        };
        if (userPanel.style.display === "grid") {
            userPanel.style.display = "none";
            document.removeEventListener("click", closeUserPanel);
            return;
        }

        userPanel.style.display = "grid";

        

        document.addEventListener("click", closeUserPanel);
    });
}
else{
    console.log("error could not find user Button")
};

function showPanel(templateID, display, panelData) {
    if (!panel) return;
    const template = document.getElementById(templateID);
    if (!template) return;
    panel.innerHTML = template.innerHTML;
    panel.dataset.panel = templateID;
    panel.style.display = display;
    body.style.overflowY ="hidden";
    switch (templateID) {
        case "organizationsTemplate":{
            renderOrganizationsPanel();
            addOrganizationsPanelLogic();
            break;
        }
        case "organizationManagementTemplate":{
            renderOrganizationPanel(panelData);
            addOrganizationManagementPanelLogic();
            break;
        }
    }
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
};

async function getAllOrganizations(){

    const response = await fetch(apiURL + "/api/v1/organization/organizations", {
        method: "GET",
        credentials: "include"
    });
    const responseJson = await response.json();
    if (!responseJson || !responseJson.success){
        console.warn("cannot get organizations");
        return;
    };
    organizations = responseJson.organizations;

}

function renderOrganizationsPanel(){
    const organizationButtonsContainer = document.getElementById("organizationButtonsContainer")
    organizationButtonsContainer.innerHTML = ``;
    for (const organization of organizations){
        organizationButtonsContainer.innerHTML += `
            <div class="organizationButtonContainer" id="${organization.organization_id}">
                <button class="organizationButton">${organization.organization_name}</button>
            </div>
        `;
    }
}
function addOrganizationsPanelLogic(){
    const organizationButtons = document.getElementsByClassName("organizationButton");
    for(const button of organizationButtons){
        button.addEventListener("click", () => {
            selectedOrganizationUUID = button.parentElement.id;
            showPanel("organizationManagementTemplate", "flex",selectedOrganizationUUID);
        })
    }
}

function renderOrganizationPanel(organizationID){

}

function addOrganizationManagementPanelLogic(){
    const closeOrganizationManagementButton = document.getElementById("closeOrganizationManagementButton");
    if ( closeOrganizationManagementButton){
        closeOrganizationManagementButton.addEventListener("click", () => {
            showPanel("organizationsTemplate","flex","");
        })
    }
    else{
        console.log("error could not find organization panel close button")
    }
    const addAdminButton = document.getElementById("addAdminButton")
    if (addAdminButton){
        addAdminButton.addEventListener("click", async event => {
            const response = await fetch(apiURL + "/api/v1/users/temp/"+selectedOrganizationUUID, {
                method: "POST",
                credentials: "include",
            });
            const responseJson = await response.json();
            console.log(responseJson);
            showAdminPanel("userManagementTemplate", "grid")
        })
    }
    else{console.log("error could not find add user button")}
}









init()