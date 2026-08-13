const loginButton = document.getElementById("loginButton!");
const loginPanel = document.getElementById("loginPanel");
const darkenedSite = document.getElementById("darkenedSite");
const userNameInput = document.getElementById("userName");
const organizationInput = document.getElementById("establishmentID");
const passwordInput = document.getElementById("password");
const title = document.getElementById("title");
const apiURL = "http://localhost:5600";
const authSites = ["tempToUser.html", "user.html", "admin.html" , "superUser.html"];

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
            organizationName: organizationInput.value
        })
    })
    const responseJson = await response.json();
    if (responseJson.success !== true){
        alert("could not find user with the given information")
        return;
    }
    console.log(responseJson.success);
    console.log(responseJson.userAuth);

    window.location.href = authSites[responseJson.userAuth];  

})

async function createTempUser(){
    const response = await fetch(apiURL + "/api/v1/users/temp", {
        method: "POST",
        credentials: "include",
        headers:{"Content-Type": "application/json"},
    });
    const responseJson = await response.json();
    console.log(responseJson);
};
createTempUser()