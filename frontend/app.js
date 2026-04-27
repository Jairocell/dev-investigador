
let token=""

async function login(){
 const r=await fetch("http://localhost:8000/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:user.value,password:pass.value})})
 const d=await r.json()
 token=d.token
 login.style.display="none"
 showDashboard()
}

async function loadUsers(){
 const r=await fetch("http://localhost:8000/admin/users",{headers:{"Authorization":"Bearer "+token}})
 const d=await r.json()
 users.innerHTML=d.map(u=>`<li>${u[1]} - ${u[2]} buscas</li>`).join("")
 document.getElementById("u").innerText=d.length
 document.getElementById("s").innerText=d.reduce((a,b)=>a+b[2],0)
 document.getElementById("f").innerText=d.reduce((a,b)=>a+b[3],0)
 new Chart(chart,{type:"bar",data:{labels:d.map(u=>u[1]),datasets:[{data:d.map(u=>u[2])}]}})
}

function showDashboard(){
 dashboard.style.display="block"
 usersPage.style.display="none"
 loadUsers()
}

function showUsers(){
 dashboard.style.display="none"
 usersPage.style.display="block"
 loadUsers()
}

if("serviceWorker" in navigator){
 navigator.serviceWorker.register("sw.js")
}
