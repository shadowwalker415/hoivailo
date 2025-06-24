import {
  sanitizeText,
  sanitizeEmailAndId,
  setErrorMessage,
  displayErrorMessage,
  isAppointmentId
} from "./helper";

document.addEventListener("DOMContentLoaded", () => {
  const formElement = document.querySelector(".appointment-cancelling");
  const errorElement = document.getElementById("error-alert");
  const idElement = document.getElementById("appointmentId");
  const reasonElement = document.getElementById("reason");

  formElement.addEventListener("submit", (e) => {
    // Sanitizing form data
    idElement.value = sanitizeEmailAndId(idElement.value);
    reasonElement.value = sanitizeText(reasonElement.value);
    if (!isAppointmentId(idElement.value)) {
      setErrorMessage("Koodi on vaarin");
      displayErrorMessage(errorElement);
      return e.preventDefault();
    }
  });
});
