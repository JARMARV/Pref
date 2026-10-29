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
    if (!panel) {
        console.log("panel not found")
        return
    }

    const template = document.getElementById(templateID);
    if (!template) {
        console.log("template not found")
        return
    }
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
            addOrganizationManagementPanelLogic(panelData);
            break;
        }
        case "createOrganizationTemplate":{

            addOrganizationCreationPanelLogic()
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
            showPanel("organizationManagementTemplate", "flex",button.parentElement.id);
        })
    }

    const createOrganizationButton = document.getElementById("createOrganizationButton");
    createOrganizationButton.addEventListener("click", () => {
        showPanel("createOrganizationTemplate", "flex","");
    })
}




async function renderOrganizationPanel(organizationID){
    const organizationManagementPanel = document.getElementById("organizationManagementPanel");
    organizationManagementPanel.dataset.organizationid = organizationID;

    const response = await fetch(apiURL + "/api/v1/users/organization/"+organizationID, {
        method: "GET",
        credentials: "include",
    });
    const responseJson = await response.json();
    for (const user of responseJson){
        if (user.authorization_level === 2){
            const userEntryHTML = `
                <div class="userEntry">
                    <button
                        class="userEntryButton userName"
                        data-username="${user.name}"
                        data-user-id="${user.user_id}"
                        data-password="${user.password_hash}">
                        ${user.name}
                    </button>

                    <input
                        type="checkbox"
                        class="userCheckbox standardUserCheckbox"
                        data-user-id="${user.user_id}">
                </div>
            `;
            standardUserList.innerHTML += userEntryHTML;
        }
        else{
            const userEntryHTML = `
                <div class="userEntry">
                    <button
                        class="userEntryButton userName"
                        data-username="${user.name}"
                        data-user-id="${user.user_id}"
                        data-password="${user.password_hash}">
                        ${user.name}
                    </button>

                    <input
                        type="checkbox"
                        class="userCheckbox tempUserCheckbox"
                        data-user-id="${user.user_id}">
                </div>
            `;
            tempUserList.innerHTML += userEntryHTML;
        }
    }
    console.log(responseJson)





}
function addOrganizationManagementPanelLogic(organizationID){
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
            const response = await fetch(apiURL + "/api/v1/users/temp/"+organizationID, {
                method: "POST",
                credentials: "include",
            });
            const responseJson = await response.json();
            console.log(responseJson);
            const organizationManagementPanel = document.getElementById("organizationManagementPanel");
            //showPanel("organizationManagementTemplate", "grid",organizationManagementPanel.dataset.organizationid);
        })
    }
    else{console.log("error could not find add user button")}
}




function addOrganizationCreationPanelLogic(){
    const closeOrganizationCreationButton = document.getElementById("closeOrganizationCreationButton");
    if ( closeOrganizationCreationButton){
        closeOrganizationCreationButton.addEventListener("click", () => {
            showPanel("organizationsTemplate","flex","");
        })
    }
    else{
        console.log("error could not find organization panel close button")
    }

    const submitOrganizationCreationButton = document.getElementById("submitOrganizationCreationButton");
    const organizationnameInput = document.getElementById("organizationnameInput");
    if (submitOrganizationCreationButton){
        submitOrganizationCreationButton.addEventListener("click", async () => {
            const organizationName = organizationnameInput.value;

            if (!organizationName){
                alert("please set a name organization name");
                return;
            }
            const response = await fetch(apiURL + "/api/v1/organization/organization/"+organizationName, {
                method: "POST",
                credentials: "include"
            });
            const responseJson = await response.json()
            console.log(responseJson)
            if (!responseJson.success){
                alert("error could not create organization with name: organizationName");
                return;
            }
            organizations.push(responseJson.organization);
            showPanel("organizationsTemplate","flex","");
        })
    }
    else{
        console.log("error could not find submit org creation button")
    }
}







init()