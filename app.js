/**
 * Mule Account Money-Trail Hunter — Editorial Case File Access Gateway
 * 
 * Interactions:
 * - Password visibility toggle ("Show" / "Hide")
 * - Inline plain-language field validation in vermilion
 * - Failed sign-in message ("Those details don't match our records.")
 * - Tactile button loading state ("Checking..." + bottom progress bar)
 * - Placeholder submit handler for backend integration
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('dossier-form');
  const emailInput = document.getElementById('work-email');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const authFailureNotice = document.getElementById('auth-failure');
  const ssoBtn = document.getElementById('sso-btn');
  const forgotLink = document.getElementById('forgot-link');

  // =========================================================================
  // 1. Password Visibility Toggle
  // =========================================================================
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      togglePasswordBtn.textContent = isPassword ? 'Hide' : 'Show';
      togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      passwordInput.focus();
    });
  }

  // =========================================================================
  // 2. Inline Error Helpers
  // =========================================================================
  function showFieldError(input, errorElement, message) {
    input.setAttribute('aria-invalid', 'true');
    errorElement.textContent = message;
    errorElement.classList.add('visible');
  }

  function clearFieldError(input, errorElement) {
    input.removeAttribute('aria-invalid');
    errorElement.textContent = '';
    errorElement.classList.remove('visible');
  }

  function clearAuthFailure() {
    if (authFailureNotice) {
      authFailureNotice.classList.remove('visible');
    }
    emailInput.removeAttribute('aria-invalid');
    passwordInput.removeAttribute('aria-invalid');
  }

  // Clear errors when the user begins typing
  emailInput.addEventListener('input', () => {
    clearFieldError(emailInput, emailError);
    clearAuthFailure();
  });

  passwordInput.addEventListener('input', () => {
    clearFieldError(passwordInput, passwordError);
    clearAuthFailure();
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // =========================================================================
  // 3. Form Submission & Authentication Handler
  // =========================================================================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    clearFieldError(emailInput, emailError);
    clearFieldError(passwordInput, passwordError);
    clearAuthFailure();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let hasError = false;

    if (!email) {
      showFieldError(emailInput, emailError, 'Enter your work email.');
      hasError = true;
    } else if (!isValidEmail(email)) {
      showFieldError(emailInput, emailError, 'Enter a valid work email address.');
      hasError = true;
    }

    if (!password) {
      showFieldError(passwordInput, passwordError, 'Enter your password.');
      hasError = true;
    }

    if (hasError) {
      if (!email || !isValidEmail(email)) {
        emailInput.focus();
      } else {
        passwordInput.focus();
      }
      return;
    }

    // Set Loading State: "Checking..." + progress bar
    setLoadingState(true);

    try {
      /**
       * =====================================================================
       * BACKEND AUTHENTICATION INTEGRATION POINT
       * =====================================================================
       * Replace this placeholder with your production authentication endpoint:
       * 
       * const response = await fetch('/api/v1/auth/session', {
       *   method: 'POST',
       *   headers: { 'Content-Type': 'application/json' },
       *   body: JSON.stringify({ email, password, keepSignedIn: document.getElementById('keep-signed-in').checked })
       * });
       * if (!response.ok) throw new Error('AUTH_FAILED');
       * window.location.href = '/investigations/case-dossier';
       * =====================================================================
       */
      const result = await mockAuthenticate(email, password);

      if (result.success) {
        btnText.textContent = 'Verified';
        setTimeout(() => {
          alert('Access authorized. Opening investigative case dossier...');
          setLoadingState(false);
        }, 400);
      } else {
        throw new Error('AUTH_FAILED');
      }

    } catch (err) {
      setLoadingState(false);
      // Display required plain failure message
      authFailureNotice.classList.add('visible');
      emailInput.setAttribute('aria-invalid', 'true');
      passwordInput.setAttribute('aria-invalid', 'true');
      passwordInput.focus();
    }
  });

  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      btnText.textContent = 'Checking...';
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      btnText.textContent = 'Continue';
    }
  }

  /**
   * Dummy Credentials Configuration
   * Accepted: yit09@gmail.com / 123456
   * Any other combination is rejected with an invalid credentials error.
   */
  const VALID_EMAIL = 'yit09@gmail.com';
  const VALID_PASSWORD = '123456';

  function mockAuthenticate(email, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isEmailMatch = email.trim().toLowerCase() === VALID_EMAIL.toLowerCase();
        const isPasswordMatch = password === VALID_PASSWORD;

        if (isEmailMatch && isPasswordMatch) {
          resolve({ success: true });
        } else {
          resolve({ success: false });
        }
      }, 850);
    });
  }

  // =========================================================================
  // 4. Secondary Actions (SSO & Password Recovery)
  // =========================================================================
  if (ssoBtn) {
    ssoBtn.addEventListener('click', () => {
      ssoBtn.textContent = 'Redirecting to SSO...';
      ssoBtn.disabled = true;
      setTimeout(() => {
        alert('SSO Gateway: Redirecting to organization identity provider (OIDC/SAML)...');
        ssoBtn.textContent = 'Sign in with SSO';
        ssoBtn.disabled = false;
      }, 500);
    });
  }

  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Password Recovery:\nContact your lead fraud investigator or submit a credential recovery ticket through SecOps.');
    });
  }
});
