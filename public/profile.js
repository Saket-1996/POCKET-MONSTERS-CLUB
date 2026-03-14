if (!localStorage.getItem("trainer")) {
    window.location = "login.html";
}
async function loadProfile() {

    const username = localStorage.getItem("trainer");

    const res = await fetch("/trainer/" + username);

    const data = await res.json();

    document.getElementById("trainerName").innerText = data.username;
    document.getElementById("trainerStarter").innerText = data.starter;
    document.getElementById("starterSprite").src =
        "/pokemon/" + data.starter.toLowerCase() + ".gif";
    document.getElementById("trainerPhone").innerText = data.phone;
    document.getElementById("trainerInsta").innerText = data.instagram;
    document.getElementById("trainerBadges").innerText = data.badges || 0;

}

window.onload = loadProfile;