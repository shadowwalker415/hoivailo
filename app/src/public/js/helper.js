let message;

export const setErrorMessage = (errorMessage) => {
  message = errorMessage;
};

export const displayErrorMessage = (errorElement) => {
  errorElement.textContent = message;
  errorElement.classList.remove("opacity-0");
  errorElement.classList.add("opacity-100");
};

export const isName = (name) => {
  return name.trim().length > 2 && name.length <= 30;
};

export const isPhoneNumber = (phoneNumber) => {
  // Where valid email format is +3584XXXXXXXX +3585XXXXXXXX
  const phoneRegex =
    /^\+358(4\d|5\d)\d{6,7}$|^\+358[- ]?(4\d|5\d)[- ]?\d{3}[- ]?\d{4}$/;
  return phoneRegex.test(phoneNumber.trim());
};

export const isAppointmentId = (id) => {
  // Where id format is uuidv4 format (f47ac10b-58cc-4372-a567-0e02b2c3d479)
  const idRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return idRegex.test(id.trim());
};

export const sanitizeEmailAndId = (input) => {
  // Removing all HTML tags
  const strippedHTML = input.replace(/<[^>]*>/g, "");
  return strippedHTML;
};

export const sanitizeText = (input) => {
  // Removing HTML and dangerous characters (except safe punctuation)
  const strippedInjectionChars = input
    .replace(/<[^>]*>/g, "")
    .replace(/[${}[\]"'\\;]|--/g, "");
  return strippedInjectionChars;
};
