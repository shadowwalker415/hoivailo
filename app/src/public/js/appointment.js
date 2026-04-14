import {
  displayErrorMessage,
  setErrorMessage,
  isPhoneNumber,
  isName,
  sanitizeText,
  sanitizeEmailAndId
} from "./helper";

document.addEventListener("DOMContentLoaded", () => {
  const formElement = document.querySelector(".appointment-form");
  const nameElement = document.getElementById("name");
  const emailElement = document.getElementById("email");
  const phoneElement = document.getElementById("phone");
  const serviceElement = document.getElementById("service");
  const notesElement = document.getElementById("notes");
  const error = document.getElementById("error-alert");
  const endTimeField = document.getElementById("endTimeField");

  // Delegating a change event on all form elements to listen for change event on radio buttons
  formElement.addEventListener("change", (e) => {
    const target = e.target;

    // Checking if the changed element is one of the startTime radio buttons
    if (target.matches('input[type="radio"][name="startTime"]')) {
      const endTime = target.dataset.endtime;
      if (endTimeField) {
        endTimeField.value = endTime;
      }
    }
  });

  formElement.addEventListener("submit", (e) => {
    // Sanitizing form data
    nameElement.value = sanitizeText(nameElement.value);
    phoneElement.value = sanitizeText(phoneElement.value);
    emailElement.value = sanitizeEmailAndId(emailElement.value);
    serviceElement.value = sanitizeText(serviceElement.value);
    notesElement.value = sanitizeText(notesElement.value);

    if (!isPhoneNumber(phoneElement.value)) {
      setErrorMessage("Puhelin numero ei se hyvä tyyppi");
      displayErrorMessage(error);
      return e.preventDefault();
    }
    if (!isName(nameElement.value)) {
      setErrorMessage("Nimi pitää olla vähintä 3 kirjeitä kiitos");
      displayErrorMessage(error);
      return e.preventDefault();
    }
  });
});
