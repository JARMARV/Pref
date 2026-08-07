const loginButton = document.getElementById("loginButton!");
const loginPanel = document.getElementById("loginPanel");
const darkenedSite = document.getElementById("darkenedSite");
const userNameInput = document.getElementById("userName");
const organizationInput = document.getElementById("establishmentID");
const passwordInput = document.getElementById("password");
const title = document.getElementById("title");
const apiURL = "http://localhost:5600";
const authSites = ["tempToUser.html", "user.html", "admin.html" , "superUser.html"];

//fetch the userdata.json (will later be replaced by an actual database)
let userData = [];
fetch("userData.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to load user data");
        }
        return response.json();
    })
    .then(data => {
        userData = data
        //updateCalendar()
    })
    .catch(error => {
        console.error("Could not load user data:", error);
    })


//defining the behaviour of the login button
loginButton.addEventListener("click", async event => {
    //checking if we find the needed inputs are even there
    if (!(passwordInput && organizationInput && userNameInput)){
        console.log("could not find html objects");
        return;
    }
    //checking if the user has assigned information to each input
    if (!(passwordInput.value && organizationInput.value && userNameInput.value)){
        alert("Please fill out all information");
        return;
    }

    const response = await fetch(apiURL + "/api/v1/auth/sign-in", {
        method: "POST",
        credentials: "include",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify({
            name: userNameInput.value,
            password: passwordInput.value,
            organization: organizationInput.value
        })
    })
    const responseJson = await response.json();
    console.log(responseJson.success);
    console.log(responseJson.userAuth);
    window.location.href = authSites[responseJson.userAuth];
    /*
    //sending user to the right html page according to their authorization level
    if (fullyMatchingUsers[0].authorizationLevel === "localAdmin"){
        window.location.href = "admin.html";
        return;
    }
    if (fullyMatchingUsers[0].authorizationLevel === "standartUser"){
        window.location.href = "user.html";
        return;
    }
    alert("error could not load new page");
    */
    
})

async function test(response){
    const test = await fetch(apiURL + "/api/v1/users/temp", {method: "POST"});
    const test2 = await test.json();
    return test2;
};
async function loadTitle(){
    const users = await test();
    console.log(users);
}

loadTitle();