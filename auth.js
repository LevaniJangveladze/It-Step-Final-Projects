document.addEventListener("DOMContentLoaded", () => {
  checkAuthState();
});

const overlay = document.getElementById("auth-overlay");
const closeBtn = document.getElementById("close-auth");

const signupForm = document.getElementById("signup-form");
const loginWrapper = document.querySelector(".login-wrapper");

window.BASE_URL = "https://api.everrest.educata.dev";

/* =========================
   OPEN SIGNUP
========================= */
document.querySelectorAll(".open-signup").forEach(btn => {
  btn.addEventListener("click", () => {
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    signupForm.style.display = "block";
    loginWrapper.style.display = "none";
  });
});

/* =========================
   OPEN LOGIN
========================= */
document.querySelectorAll(".open-login").forEach(btn => {
  btn.addEventListener("click", () => {
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    signupForm.style.display = "none";
    loginWrapper.style.display = "flex";
  });
});

/* =========================
   CLOSE MODAL
========================= */
closeBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
  document.body.style.overflow = "auto";
});

/* =========================
   SIGN UP
========================= */
signupForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userData = {
    firstName: document.getElementById("signup-firstName").value,
    lastName: document.getElementById("signup-lastName").value,
    age: Number(document.getElementById("signup-age").value),
    email: document.getElementById("signup-email").value,
    password: document.getElementById("signup-password").value,
    address: document.getElementById("signup-address").value,
    phone: document.getElementById("signup-phone").value,
    zipcode: document.getElementById("signup-zipCode").value,
    avatar: document.getElementById("signup-avatar").value,
    gender: document.getElementById("signup-gender").value
  };

  try {
    const res = await fetch(`${BASE_URL}/auth/sign_up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Sign up failed");
      return;
    }

    await verifyEmail(userData.email);

    alert("Account created! Check your email 📩");

    overlay.classList.add("hidden");
    document.body.style.overflow = "auto";

  } catch (error) {
    console.log(error);
  }
});

/* =========================
   SIGN IN
========================= */
document.getElementById("signin-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;

  try {
    const res = await fetch(`${BASE_URL}/auth/sign_in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Sign in failed");
      return;
    }

    localStorage.setItem("accessToken", data.access_token);
    localStorage.setItem("refreshToken", data.refresh_token);

    checkAuthState();

    overlay.classList.add("hidden");
    document.body.style.overflow = "auto";

    alert("Signed in successfully 🎉");

  } catch (error) {
    console.log(error);
  }
});

/* =========================
   VERIFY EMAIL
========================= */
async function verifyEmail(email) {
  try {
    const res = await fetch(`${BASE_URL}/auth/verify_email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    if (!res.ok) return false;
    return true;

  } catch (error) {
    console.log(error);
    return false;
  }
}

//Password Recovery

document.getElementById("forgot-password-btn").addEventListener("click", async () =>{
    const email = prompt("Enter your email to recover password:");

    if (!email) return;

    try {
        const res = await fetch(`${BASE_URL}/auth/recovery`, {
            method: "POST",
            headers: {
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({email})
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Recovery failed");
            return;
        }

        alert("Recovery email sent  📩 Check your inbox.");
    } catch(error){
        console.log(error);
    }
});

function checkAuthState() {
    const token = localStorage.getItem("accessToken");

    const guestElements = document.querySelectorAll(".guest-only");
    const userElements = document.querySelectorAll(".user-only");

    if (token) {
        guestElements.forEach(el => el.style.display = "none");
        userElements.forEach(el => el.style.display = "block");
    } else {
        guestElements.forEach(el => el.style.display = "block");
        userElements.forEach(el => el.style.display = "none");
    }
}

//Logout
document.getElementById("logout-btn").addEventListener("click", function(){
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  checkAuthState();
  alert("Signed out");
});

//Onclick - Fetch prof info

document.getElementById("user-profile-btn").addEventListener("click", async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
        const res = await fetch(`${BASE_URL}/auth`,{
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const user = await res.json();

        showProfileModal(user);
    } catch(error){
        console.log(error);
    }
});

//Profile Modal

function showProfileModal(user) {
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  signupForm.style.display = "none";
  loginWrapper.style.display = "none";

  document.querySelector(".auth-modal").innerHTML = `
    <button id="close-auth" class="close-btn">&times;</button>
    <h2>Your Profile</h2>
    <hr>

    <form id="update-profile-form" class="auth-form">

      <div class="row">
        <div class="input-group">
          <input type="text" id="update-firstName" value="${user.firstName}" required>
        </div>
        <div class="input-group">
          <input type="text" id="update-lastName" value="${user.lastName}" required>
        </div>
      </div>

      <div class="row">
        <div class="input-group">
          <input type="number" id="update-age" value="${user.age}">
        </div>
        <div class="input-group">
          <input type="text" id="update-phone" value="${user.phone || ""}">
        </div>
      </div>

      <div class="input-group full">
        <input type="text" id="update-address" value="${user.address || ""}">
      </div>

      <div class="input-group full">
        <input type="text" id="update-zipcode" value="${user.zipcode || ""}">
      </div>

      <div class="input-group full">
        <input type="text" id="update-avatar" value="${user.avatar || ""}">
      </div>

      <div class="input-group full">
        <select id="update-gender">
          <option value="MALE" ${user.gender === "MALE" ? "selected" : ""}>Male</option>
          <option value="FEMALE" ${user.gender === "FEMALE" ? "selected" : ""}>Female</option>
        </select>
      </div>

      <button type="submit" class="auth-btn">Update Profile</button>

      <hr>

      <h3>Change Password</h3>

      <div class="input-group full">
        <input type="password" id="old-password" placeholder="Old Password" required>
      </div>

      <div class="input-group full">
        <input type="password" id="new-password" placeholder="New Password" required>
      </div>

      <button type="button" id="change-password-btn" class="auth-btn">
        Change Password
      </button>

    </form>
  `;

  document.getElementById("close-auth").addEventListener("click", () => {
    location.reload();
  });

  attachUpdateEvents();
}

//Update info

function attachUpdateEvents() {
  const token = localStorage.getItem("accessToken");

  document.getElementById("update-profile-form")
    .addEventListener("submit", async function (e) {

    e.preventDefault();

    const updatedData = {
      firstName: document.getElementById("update-firstName").value,
      lastName: document.getElementById("update-lastName").value,
      age: Number(document.getElementById("update-age").value),
      address: document.getElementById("update-address").value,
      phone: document.getElementById("update-phone").value,
      zipcode: document.getElementById("update-zipcode").value,
      avatar: document.getElementById("update-avatar").value,
      gender: document.getElementById("update-gender").value
    };

    try {
      const res = await fetch(`${BASE_URL}/auth/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!res.ok) {
        alert("Update failed");
        return;
      }

      alert("Profile updated successfully ✅");

    } catch (error) {
      console.log(error);
    }
  });

  document.getElementById("change-password-btn")
    .addEventListener("click", async () => {

    const oldPassword = document.getElementById("old-password").value;
    const newPassword = document.getElementById("new-password").value;

    try {
      const res = await fetch(`${BASE_URL}/auth/change_password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      if (!res.ok) {
        alert("Password change failed");
        return;
      }

      alert("Password changed successfully 🔐");

    } catch (error) {
      console.log(error);
    }
  });
}

//Refresh Token

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) return;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${refreshToken}`
      }
    });

    const data = await res.json();

    if (!res.ok) return;

    localStorage.setItem("accessToken", data.access_token);

  } catch (error) {
    console.log(error);
  }
}