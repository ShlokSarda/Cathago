document.addEventListener("DOMContentLoaded", () => {
  fetchUserProfile();
  fetchScanHistory();
});

async function fetchUserProfile() {
  const res = await fetch("http://localhost:5000/auth/profile", {
    headers: { Authorization: `${localStorage.getItem("token")}` },
  });

  const data = await res.json();

  if (res.ok) {
    document.getElementById("username").innerText = data.profile.username;
    document.getElementById("credits").innerText = data.profile.credits;
  } else {
    alert("Session expired! Please log in again.");
    window.location.href = "login.html";
  }
}

async function uploadDocument() {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) {
    alert("Please select a file.");
    return;
  }

  const formData = new FormData();
  formData.append("document", fileInput.files[0]);

  const res = await fetch("http://localhost:5000/scan/upload", {
    method: "POST",
    headers: { Authorization: `${localStorage.getItem("token")}` },
    body: formData,
  });

  const data = await res.json();

  if (res.ok) {
    alert("Document uploaded successfully!");
    console.log(data);
    displayBestMatch(data);
    fetchScanHistory();
  } else {
    alert(data.message || "Upload failed.");
  }
}

async function fetchScanHistory() {
  const res = await fetch("http://localhost:5000/scan/previous-scans", {
    headers: { Authorization: `${localStorage.getItem("token")}` },
  });

  const data = await res.json();
  const scanHistory = document.getElementById("scanHistory");
  scanHistory.innerHTML = "";

  if (!data.lastScans || data.lastScans.length === 0) {
    scanHistory.innerHTML = "<p>No scans found.</p>";
    return;
  }

  // Create table structure
  const table = document.createElement("table");
  table.border = "1";
  table.style.width = "100%";
  table.innerHTML = `
    <thead>
      <tr>
        <th>ID</th>
        <th>Document Name</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  data.lastScans.forEach((scan) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${scan.id}</td>
      <td>${scan.filename}</td>
    `;

    tbody.appendChild(tr);
  });

  scanHistory.appendChild(table);
}

async function displayBestMatch(data) {
  const matchContainer = document.getElementById("matches");
  matchContainer.innerHTML = "";
  console.log("Best match: ", data);

  if (data.bestMatch) {
    const matchInfo = document.createElement("p");
    matchInfo.textContent = `Best Match: ${
      data.bestMatch.filename
    } | Similarity Score: ${(data.bestMatch.similarity * 100).toFixed(2)}%`;
    matchContainer.appendChild(matchInfo);
  } else {
    matchContainer.textContent = "No similar document found.";
  }
}

async function requestCredits() {
  const res = await fetch("http://localhost:5000/credits/request", {
    method: "POST",
    headers: { Authorization: `${localStorage.getItem("token")}` },
  });

  const data = await res.json();
  alert(data.message);
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
