import config from "./utils/config";
import app from "./app";
// import mongoose from "mongoose";

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
