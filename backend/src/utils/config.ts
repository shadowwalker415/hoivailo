import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;

if (!MONGODB_URI || !PORT) {
  throw new Error("Missing MongoDB URI in environment variable");
}

export default {
  MONGODB_URI,
  PORT
};
