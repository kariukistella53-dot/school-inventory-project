// STAFF REGISTRATION
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const username = document.getElementById("newUsername").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const message = document.getElementById("registerMessage");

        let staffAccounts =
            JSON.parse(localStorage.getItem("staffAccounts")) || [];

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            return;
        }

        if (password.length < 8) {
            message.textContent = "Password must have at least 8 characters.";
            return;
        }

        const existingUser = staffAccounts.find(function(account) {
            return account.username.toLowerCase() === username.toLowerCase()
                || account.email.toLowerCase() === email.toLowerCase();
        });

        if (existingUser) {
            message.textContent = "Username or email already exists.";
            return;
        }

        const newStaff = {
            fullName: fullName,
            username: username,
            email: email,
            password: password
        };

        staffAccounts.push(newStaff);

        localStorage.setItem(
            "staffAccounts",
            JSON.stringify(staffAccounts)
        );

        message.style.color = "green";
        message.textContent = "Registration successful! Redirecting to login...";

        registerForm.reset();

        setTimeout(function() {
            window.location.href = "staff-dashboard.html";
        }, 1500);
    });
}


// STAFF LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("loginMessage");

        const staffAccounts =
            JSON.parse(localStorage.getItem("staffAccounts")) || [];

        const staff = staffAccounts.find(function(account) {
            return account.username.toLowerCase() === username.toLowerCase()
                && account.password === password;
        });

        if (staff) {
            sessionStorage.setItem("staffLoggedIn", "true");
            sessionStorage.setItem("staffName", staff.fullName);
            window.location.href = "staff-dashboard.html";
        } else {
            message.textContent =
                "Incorrect username or password. Please register first if you do not have an account.";
        }
    });
}


// PROTECT STAFF DASHBOARD
if (window.location.pathname.endsWith("staff-dashboard.html")) {

    if (sessionStorage.getItem("staffLoggedIn") !== "true") {
        window.location.href = "staff-login.html";
    } else {
        document.getElementById("staffName").textContent =
            sessionStorage.getItem("staffName");
    }
}


// LOGOUT
function logout() {
    sessionStorage.removeItem("staffLoggedIn");
    sessionStorage.removeItem("staffName");

    window.location.href = "staff-login.html";
}