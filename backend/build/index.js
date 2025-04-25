"use strict";
// import config from "./utils/config";
// import app from "./app";
// // import mongoose from "mongoose";
// app.listen(config.PORT, () => {
//   console.log(`Server running on port ${config.PORT}`);
// });
const appointmentDate = new Date("1990-03-22");
const isValidDate = /^(?:(?:19|20)\d{2})-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|02-(?:0[1-9]|1\d|2[0-8])|02-29(?=-(?:19|20)(?:[02468][048]|[13579][26])))$/.test("<script>1990-03-100</script>");
console.log(isValidDate);
