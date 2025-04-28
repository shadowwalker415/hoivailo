import config from "./utils/config";
import app from "./app";
import mongoose from "mongoose";

console.log("Connecting to MongoDB");
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
