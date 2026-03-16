// ---------- LOGIN SYSTEM ----------

document.addEventListener("DOMContentLoaded", () => {

    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", loginTrainer);
    }

});


async function loginTrainer() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/login", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })

    });

    const data = await res.json();

    if (data.success) {

        localStorage.setItem("trainer", username);

        if (data.success) {

            localStorage.setItem("trainer", username);

            if (data.starter) {
                window.location = "profile.html";
            } else {
                window.location = "dashboard.html";
            }

        } else {
            alert("Invalid login");
        }

    } else {

        alert("Invalid login");

    }

}

async function buyPass(){

const username = localStorage.getItem("trainer");

const res = await fetch("/activatePass",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({username})

});

const data = await res.json();

if(data.success){

alert("Season Pass Activated");

}else{

alert("Error activating pass");

}

}

// ---------- STARTER LIST ----------

const starters = [
    "Bulbasaur", "Charmander", "Squirtle",
    "Chikorita", "Cyndaquil", "Totodile",
    "Treecko", "Torchic", "Mudkip",
    "Turtwig", "Chimchar", "Piplup",
    "Snivy", "Tepig", "Oshawott",
    "Chespin", "Fennekin", "Froakie",
    "Rowlet", "Litten", "Popplio",
    "Pikachu", "Eevee"
];



// ---------- LOAD STARTERS ----------

function loadStarters() {

    const grid = document.getElementById("starterGrid");

    if (!grid) return;

    grid.innerHTML = "";

    starters.forEach(pokemon => {

        const name = pokemon.toLowerCase();

        const div = document.createElement("div");

        div.innerHTML = `
<div class="starter-card">
<img src="/pokemon/${name}.gif" class="poke-img"><br>
<b>${pokemon}</b><br>
<button id="btn-${pokemon}" onclick="selectStarter('${pokemon}')">
Select
</button>
</div>
`;

        grid.appendChild(div);

    });

    checkTaken();

}



// ---------- CHECK TAKEN STARTERS ----------

async function checkTaken() {

    try {

        const res = await fetch("/starters");
        const data = await res.json();

        data.taken.forEach(pokemon => {

            const btn = document.getElementById("btn-" + pokemon);

            if (btn) {
                btn.disabled = true;
                btn.innerText = "Taken";
            }

        });

    } catch (err) {

        console.log("Starter check failed");

    }

}



// ---------- SELECT STARTER ----------

async function selectStarter(pokemon) {

    const username = localStorage.getItem("trainer");

    try {

        const res = await fetch("/selectStarter", {

            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username,
                starter: pokemon
            })

        });

        const data = await res.json();

        if (data.success) {

            alert("Starter selected: " + pokemon);

            // go to profile
            window.location = "profile.html";

        } else {

            alert("Starter already taken or already chosen");

        }

    } catch (e) {

        alert("Server error");

    }

}
async function loadTrainer(){

const username = localStorage.getItem("trainer");

if(!username) return;

const res = await fetch("/trainer/"+username);

const data = await res.json();

if(!data) return;

document.getElementById("trainerName").innerText = data.username;

document.getElementById("badges").innerText = data.badges;

if(data.starter){

document.getElementById("starterName").innerText = data.starter;

const name = data.starter.toLowerCase();

document.getElementById("starterGif").src = "/pokemon/"+name+".gif";

}

if(data.seasonPass==1){
document.getElementById("seasonPassBox").innerHTML="Season Pass Active";
}

}



// ---------- PAGE LOAD ----------

window.onload = loadStarters;
