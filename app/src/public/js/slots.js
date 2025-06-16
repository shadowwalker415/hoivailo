import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Finnish } from "flatpickr/dist/l10n/fi.js";

document.addEventListener("DOMContentLoaded", () => {
  // const BASE_URI = "http://localhost:3001/api/v1/availability";
  // const slotsButton = document.querySelector(".slots-btn");

  let selectedDate;

  flatpickr("#datePicker", {
    locale: Finnish,
    minDate: "today", // Disabling all dates prior to current date
    disable: [(date) => date.getDay() === 0 || date.getDay() === 6], // Disabling all weekend dates
    onChange: function (_dateArr, instance) {
      selectedDate = instance;
      console.log(selectedDate);
    }
  });

  // slotsButton.addEventListener("click", (event) => {
  //   event.preventDefault();
  // });
});
