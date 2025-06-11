// Auth functionality
function initAuth() {
  const profileButton = document.getElementById("profile-button");
  const userMenu = document.getElementById("user-menu");
  const authModal = document.getElementById("auth-modal");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const guestMenu = document.getElementById("guest-menu");
  const userMenuAuthenticated = document.getElementById(
    "user-menu-authenticated"
  );
  const userName = document.getElementById("user-name");
  const profileImage = document.getElementById("profile-image");

  // Check if user is logged in
  function checkAuth() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      profileButton.classList.remove("hidden");
      guestMenu.classList.add("hidden");
      userMenuAuthenticated.classList.remove("hidden");
      userName.textContent = user.username;
      // Set profile image if available, otherwise use default
      if (user.profile_image) {
        profileImage.src = user.profile_image;
      }
    } else {
      profileButton.classList.add("hidden");
      guestMenu.classList.remove("hidden");
      userMenuAuthenticated.classList.add("hidden");
    }
  }

  // Toggle user menu
  profileButton.addEventListener("click", () => {
    userMenu.classList.toggle("show");
  });

  // Close user menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!profileButton.contains(e.target)) {
      userMenu.classList.remove("show");
    }
  });

  // Show auth modal
  window.showAuthModal = function (mode) {
    authModal.classList.add("show");
    userMenu.classList.remove("show");
    switchAuthMode(mode);
  };

  // Close auth modal
  window.closeAuthModal = function () {
    authModal.classList.remove("show");
  };

  // Switch between login and register forms
  window.switchAuthMode = function (mode) {
    if (mode === "login") {
      loginForm.style.display = "flex";
      registerForm.style.display = "none";
    } else {
      loginForm.style.display = "none";
      registerForm.style.display = "flex";
    }
  };

  // Form validation
  function validateForm(form) {
    const inputs = form.querySelectorAll("input[required]");
    let isValid = true;

    inputs.forEach((input) => {
      const errorElement = document.getElementById(`${input.id}-error`);
      if (!input.value.trim()) {
        errorElement.textContent = "This field is required";
        errorElement.classList.add("show");
        isValid = false;
      } else {
        errorElement.classList.remove("show");
      }
    });

    // Additional email validation
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && emailInput.value.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const errorElement = document.getElementById(`${emailInput.id}-error`);
      if (!emailPattern.test(emailInput.value)) {
        errorElement.textContent = "Please enter a valid email address";
        errorElement.classList.add("show");
        isValid = false;
      }
    }

    // Password validation for registration
    if (form.id === "register-form") {
      const password = form.querySelector("#register-password").value;
      const confirmPassword = form.querySelector(
        "#register-password-confirm"
      ).value;
      const passwordError = document.getElementById("register-password-error");
      const confirmError = document.getElementById(
        "register-password-confirm-error"
      );

      if (password.length < 8) {
        passwordError.textContent =
          "Password must be at least 8 characters long";
        passwordError.classList.add("show");
        isValid = false;
      }

      if (password !== confirmPassword) {
        confirmError.textContent = "Passwords do not match";
        confirmError.classList.add("show");
        isValid = false;
      }
    }

    return isValid;
  }

  // Handle login form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm(loginForm)) return;

    const email = loginForm.querySelector("#login-email").value;
    const password = loginForm.querySelector("#login-password").value;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      checkAuth();
      closeAuthModal();
      // Show success notification
      const successMessage = document.createElement("div");
      successMessage.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg";
      successMessage.textContent = "Successfully logged in!";
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = document.getElementById("login-error");
      errorMessage.textContent = error.message;
      errorMessage.classList.add("show");
    }
  });

  // Handle register
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm(registerForm)) {
      return;
    }

    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const passwordConfirm = document.getElementById(
      "register-password-confirm"
    ).value;

    try {
      const response = await fetch("/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          password_confirm: passwordConfirm,
        }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      closeAuthModal();
      checkAuth();
      showToast("Successfully registered!");

      // Reset form
      registerForm.reset();
    } catch (error) {
      showToast("Registration failed. Please try again.", "error");
    }
  });

  // Handle logout
  window.logout = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    checkAuth();
    userMenu.classList.add("hidden");
    window.location.href = "/"; // Redirect to home page
  };

  // Update menu toggle to use proper classes
  profileButton.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!profileButton.contains(e.target) && !userMenu.contains(e.target)) {
      userMenu.classList.add("hidden");
    }
  });

  // Show toast message
  window.showToast = function (message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  // Initialize auth check
  checkAuth();

  // Add input validation listeners
  document.querySelectorAll(".auth-input").forEach((input) => {
    input.addEventListener("input", () => {
      const errorElement = document.getElementById(`${input.id}-error`);
      if (errorElement) {
        errorElement.classList.remove("show");
      }
    });
  });

  // Close modal on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAuthModal();
    }
  });
}

// Initialize auth functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", initAuth);
