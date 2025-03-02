// Fetch Analytics Data
async function fetchAnalytics() {
  try {
    const response = await fetch("http://localhost:5000/admin/analytics", {
      headers: {
        Authorization: `${localStorage.getItem("Admintoken")}`,
      },
    });
    const data = await response.json();
    console.log(data);
    document.getElementById("totalScans").textContent = data.totalScans;
    document.getElementById("topUsers").innerHTML =
      data.topUser.username +
      " is a top user with " +
      data.topUser.totalScans +
      " number of scans.";
    document.getElementById("creditUsage").innerHTML = data.creditUsage
      .map((user) => `<li>${user.username}: ${user.totalCreditsUsed} </li>`)
      .join("");
  } catch (error) {
    console.error("❌ Error fetching analytics:", error);
  }
}

// Fetch Credit Requests
async function fetchCreditRequests() {
  try {
    const response = await fetch(
      "http://localhost:5000/admin/credit-requests",
      {
        headers: {
          Authorization: `${localStorage.getItem("Admintoken")}`,
        },
      }
    );

    const requests = await response.json();
    console.log(requests);
    const creditRequestsTable = document.getElementById("creditRequests");
    creditRequestsTable.innerHTML = requests.pendingCreditRequests
      .map(
        (request) =>
          `<tr>
                <td>${request.id}</td>
                <td>${request.username}</td>
                <td>
                    <button class="approve-btn" onclick="approveRequest(${request.id},${request.userId})">✅ Approve</button>
                    <button class="reject-btn" onclick="rejectRequest(${request.id},${request.userId})">❌ Reject</button>
                </td>
            </tr>`
      )
      .join("");
  } catch (error) {
    console.error("❌ Error fetching credit requests:", error);
  }
}

// // Approve Credit Request
async function approveRequest(requestId, userId) {
  await fetch("http://localhost:5000/admin/credits/approve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${localStorage.getItem("Admintoken")}`,
    },
    body: JSON.stringify({ requestId, approve: true, userId }),
  });

  fetchCreditRequests(); // Refresh data
}

// Reject Credit Request
async function rejectRequest(requestId, userId) {
  await fetch("http://localhost:5000/admin/credits/deny", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${localStorage.getItem("Admintoken")}`,
    },
    body: JSON.stringify({ requestId, approve: false, userId }),
  });

  fetchCreditRequests(); // Refresh data
}

// Load data on page load
fetchAnalytics();
fetchCreditRequests();
