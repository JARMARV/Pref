const createAccountButton = document.getElementById("createAccountButton");
const userNameInput = document.getElementById("userName");
const passwordInput = document.getElementById("password");
const apiURL = "http://localhost:5600";
createAccountButton.addEventListener("click", async event => {
    if (!(passwordInput && userNameInput)){
        console.log("could not find html objects");
        return;
    }
    //checking if the user has assigned information to each input
    if (!(passwordInput.value && userNameInput.value)){
        alert("Please fill out all information");
        return;
    }

    const response = await fetch(apiURL + "/api/v1/users/user", {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            name: userNameInput.value,
            password: passwordInput.value
        })
    })
    const res = await response.json();
    console.log(res);

});