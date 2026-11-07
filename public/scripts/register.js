const form = document.querySelector("form");
const emailInput = form.querySelector('input[name="email"]');
const passwordInput = form.querySelector('input[name="password"]');
const confirmedPasswordInput = form.querySelector('input[name="password2"]');

/**
 * Check whether a value looks like an email accepted by the registration form.
 *
 * @param {string} email - Email value from the form input.
 * @returns {boolean} True when the email has a basic valid shape and length.
 */
function isEmail(email) {
    return /\S+@\S+\.\S+/.test(email) && email.length <= 255;
}

/**
 * Check the same password complexity policy enforced by the PHP backend.
 *
 * @param {string} password - Password value from the form input.
 * @returns {boolean} True when the password satisfies the client-side policy.
 */
function isPasswordStrong(password) {
    return password.length >= 8
        && password.length <= 128
        && /[a-z]/.test(password)
        && /[A-Z]/.test(password)
        && /\d/.test(password);
}

/**
 * Toggle the invalid CSS class on an input based on validation result.
 *
 * @param {HTMLElement} element - Input element being validated.
 * @param {boolean} condition - Validation result.
 * @returns {void}
 */
function markValidation(element, condition) {
    !condition ? element.classList.add('no-valid') : element.classList.remove('no-valid');
}

/**
 * Validate the email field and mark it visually.
 *
 * @returns {void}
 */
function validateEmail() {
    markValidation(emailInput, isEmail(emailInput.value));
}

/**
 * Validate password complexity and confirmation match.
 *
 * @returns {void}
 */
function validatePassword() {
    markValidation(passwordInput, isPasswordStrong(passwordInput.value));
    markValidation(confirmedPasswordInput, passwordInput.value === confirmedPasswordInput.value);
}

emailInput.addEventListener('input', validateEmail);
passwordInput.addEventListener('input', validatePassword);
confirmedPasswordInput.addEventListener('input', validatePassword);
