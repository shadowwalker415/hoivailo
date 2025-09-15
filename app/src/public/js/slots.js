import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Finnish } from "flatpickr/dist/l10n/fi.js";

document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL = "http://localhost:3001/oleva-aikaa";
  const slotsButton = document.querySelector(".slots-btn");

  let selectedDate;

  flatpickr("#datePicker", {
    locale: Finnish,
    minDate: "today", // Disabling all dates prior to current date
    disable: [(date) => date.getDay() === 0 || date.getDay() === 6], // Disabling all weekend dates
    onChange: function (_dateArr, instance) {
      selectedDate = instance;
    }
  });

  slotsButton.addEventListener("click", () => {
    if (!selectedDate) {
      return;
    }

    const url = `${BASE_URL}?date=${encodeURIComponent(selectedDate)}`;

    window.location.href = url; // Navigating to the new url
  });
});
