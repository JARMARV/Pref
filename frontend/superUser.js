const userButton = document.getElementById("userButton"); // Button to toggle user panel
const panel = document.getElementById("panel"); // panel displaying all kinds of information
let organizations = [];

function init(){

    let organizations = getAllOrganizations();
    showPanel("organizationManagementTemplate","flex");
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

function showPanel(templateID, display) {
    if (!panel) return;
    const template = document.getElementById(templateID);
    if (!template) return;
    panel.innerHTML = template.innerHTML;
    panel.dataset.panel = templateID;
    panel.style.display = display;
    body.style.overflowY ="hidden";
    switch (templateID) {
        case "organizationManagementTemplate":{
            getAllOrganizations()
            break;
        }
        case "adminAccountManagementTemplate":{
            
            break;
        }
    }

}

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

