async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("error-message");

  errorMessage.innerText = ""; // Clear any previous error messages

  const res = await fetch("http://localhost:5000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    window.location.href = "dashboard.html"; // Redirect to dashboard
  } else {
    errorMessage.innerText = "Invalid login credentials. Try again!";
  }
}
async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const errorMessage = document.getElementById("error-message");

  errorMessage.innerText = ""; // Clear previous errors

  if (password !== confirmPassword) {
    errorMessage.innerText = "Passwords do not match!";
    return;
  }

  const res = await fetch("http://localhost:5000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (res.ok) {
    alert("Registration successful! Please log in.");
    window.location.href = "login.html"; // Redirect to login page
  } else {
    errorMessage.innerText = data.message || "Registration failed. Try again!";
  }
}
