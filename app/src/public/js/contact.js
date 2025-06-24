import {
  sanitizeEmailAndId,
  sanitizeText,
  isName,
  isPhoneNumber,
  setErrorMessage,
  displayErrorMessage
} from "./helper";

document.addEventListener("DOMContentLoaded", () => {
  const formElement = document.querySelector(".form-contact-us");
  const nameElement = document.getElementById("name");
  const emailElement = document.getElementById("email");
  const phoneElement = document.getElementById("phone");
  const messageElement = document.getElementById("message");
  const errorElement = document.getElementById("error-alert");

  formElement.addEventListener("submit", (e) => {
    // Sanitizing form input data
    nameElement.value = sanitizeText(nameElement.value);
    phoneElement.value = sanitizeText(phoneElement.value);
    emailElement.value = sanitizeEmailAndId(emailElement.value);
    messageElement.value = sanitizeText(messageElement.value);

    if (!isName(nameElement.value)) {
      setErrorMessage("Nimi pitä olla vahintä 3 kirjetä");
      displayErrorMessage(errorElement);
      return e.preventDefault();
    }
    if (!isPhoneNumber(phoneElement.value)) {
      setErrorMessage(
        "Puhelin numero pitää olla esim +3584XXXXXXXX tai +3585XXXXXXXX"
      );
      displayErrorMessage(errorElement);
      return e.preventDefault();
    }
  });
});
