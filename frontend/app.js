let token = ""

// pega elementos corretamente
const userInput = document.getElementById("user")
const passInput = document.getElementById("pass")
const loginBox = document.getElementById("login")
const dashboard = document.getElementById("dashboard")
const usersPage = document.getElementById("usersPage")
const usersList = document.getElementById("users")

async function loginUser() {
    const r = await fetch("https://dev-investigador.onrender.com/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: userInput.value,
            password: passInput.value
        })
    })

    const d = await r.json()

    if (!d.token) {
        alert("Login inválido")
        return
    }

    token = d.token
    loginBox.style.display = "none"
    showDashboard()
}

async function loadUsers() {
    const r = await fetch("https://dev-investigador.onrender.com/admin/users", {
        headers: {"Authorization": "Bearer " + token}
    })

    const d = await r.json()

    usersList.innerHTML = d.map(u =>
        `<li>${u[1]} - ${u[2]} buscas</li>`
    ).join("")

    document.getElementById("u").innerText = d.length
    document.getElementById("s").innerText = d.reduce((a,b)=>a+b[2],0)
    document.getElementById("f").innerText = d.reduce((a,b)=>a+b[3],0)

    new Chart(document.getElementById("chart"), {
        type: "bar",
        data: {
            labels: d.map(u => u[1]),
            datasets: [{
                label: "Buscas",
                data: d.map(u => u[2])
            }]
        }
    })
}

function showDashboard() {
    dashboard.style.display = "block"
    usersPage.style.display = "none"
    loadUsers()
}

function showUsers() {
    dashboard.style.display = "none"
    usersPage.style.display = "block"
    loadUsers()
}

// Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
}
