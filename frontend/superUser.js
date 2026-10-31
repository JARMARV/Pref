const body = document.body;
const userButton = document.getElementById("userButton"); // Button to toggle user panel
const panel = document.getElementById("panel"); // panel displaying all kinds of information
const logoutButton = document.getElementById("logoutButton")
let organizations = [];
let selectedOrganizationUUID = "";
let selectedUsers = [];
let savedUserInfo = new Map();

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

async function showPanel(templateID, display, panelData) {
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
            await renderOrganizationPanel(panelData);
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
            selectedOrganizationUUID = button.parentElement.id;
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
            if (responseJson.success === true) {
                const tempUserID = responseJson.userID;
                const tempUserInfo = {
                    password: responseJson.password,
                    name: responseJson.userName,
                    passwordID: responseJson.passwordID,
                    organizationName: responseJson.organizationName
                };
                savedUserInfo.set(tempUserID, tempUserInfo);
            }
            console.log(responseJson);
            showPanel("organizationManagementTemplate","grid",selectedOrganizationUUID);
        })
    }
    else{console.log("error could not find add user button")}

    //creating logic to delete the selected users of the selected users array
    const deleteAdminsButton = document.getElementById("deleteAdminsButton");
    if (deleteAdminsButton){
        deleteAdminsButton.addEventListener("click", async () => {
            if (selectedUsers.length === 0){
                alert("no users to delete selected")
                return
            }
            const response2 = await fetch(apiURL + "/api/v1/users/organization/"+selectedOrganizationUUID, {
                method: "DELETE",
                credentials: "include",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify({selectedUsers})
            })
            const responseJson2 = await response2.json();
            console.log(responseJson2);
            if (responseJson2.success === false){
                alert("an error occured cannot delete users")
                return
            }
            selectedUsers = [];
            showPanel("organizationManagementTemplate","grid",selectedOrganizationUUID);
        })
    }
    else{
        console.log("error could not find delete admin button")
    }

    //making the temp users Buttons add the temp users information to the admins clipboard
    const userEntryButtons = document.getElementsByClassName("userEntryButton");
    for (const button of userEntryButtons){
        button.addEventListener("click", async () => {
            try {
                const userID = button.dataset.userId;


                if (!(savedUserInfo.has(userID))) {
                    const response = await fetch(apiURL + "/api/v1/users/newPassword/"+userID, {
                        method: "POST",
                        credentials: "include",
                    });
                    const responseJson = await response.json();
                    if (responseJson.success === true) {
                        const tempUserID = responseJson.userID;
                        const tempUserInfo = {
                            password: responseJson.password,
                            name: responseJson.userName,
                            passwordID: responseJson.passwordID,
                            organizationName: responseJson.organizationName
                        };
                        savedUserInfo.set(tempUserID, tempUserInfo);
                    }
                    console.log(responseJson)
                }

                const user = savedUserInfo.get(userID);
                await navigator.clipboard.writeText(
                    "Username:" + user.name +
                    "\nPassword:" + user.password +
                    "\norganization:" + user.organizationName
                );

                button.style.backgroundColor="green";
            } catch (error) {
                console.error("Failed to copy:", error);
            }
        });
    }

    const userCheckboxes = document.getElementsByClassName("userCheckbox");
    for (const checkbox of userCheckboxes) {
        checkbox.addEventListener("change", () => {
            const userID = checkbox.dataset.userId;
            if (checkbox.checked) {
                selectedUsers.push(userID);
            } else {
                const index = selectedUsers.findIndex(id => id === userID);
                if (index !== -1) {
                    selectedUsers.splice(index, 1);
                }
            }
        });
    }
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