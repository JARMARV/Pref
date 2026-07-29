const loginButton = document.getElementById("loginButton!");
const loginPanel = document.getElementById("loginPanel");
const darkenedSite = document.getElementById("darkenedSite");
const userNameInput = document.getElementById("userName");
const establishmentIDInput = document.getElementById("establishmentID");
const passwordInput = document.getElementById("password");


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
loginButton.addEventListener("click", event => {
    //checking if we find the needed inputs are even there
    if (!(passwordInput && establishmentIDInput && userNameInput)){
        console.log("could not find html objects");
        return;
    }
    //checking if the user has assigned information to each input
    if (!(passwordInput.value && establishmentIDInput.value && userNameInput.value)){
        alert("Please fill out all information");
        return;
    }
    //checking if the user exists
    const matchingUsers = userData.filter(user => user.userName === userNameInput.value);
    if (!matchingUsers.length){
        alert("could not find user");
        return;
    }
    //checking if password and organisation id match any user of the given username
    let fullyMatchingUsers = [];
    for (let i = 0; i < matchingUsers.length; i++) {
        if (matchingUsers[i].password ==  passwordInput.value && matchingUsers[i].organization == establishmentIDInput.value){
            fullyMatchingUsers.push(matchingUsers[i])
        }
    }
    //checking if the for loop found any matching users
    if (fullyMatchingUsers.length == 0){
        alert("could not find user");
        return;
    }
    //checking if there are more than one user with exactly the same user information
    if (!fullyMatchingUsers.length == 1){
        alert("Database error : multiple users with the same user information please contact your administrator");
        return;
    }
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
})
