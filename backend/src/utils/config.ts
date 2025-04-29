import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;

if (!MONGODB_URI) {
  throw new Error("Missing MongoDB URI in environment variable");
}

if (!PORT) {
  throw new Error("Missing PORT in environment variable");
}

export default {
  MONGODB_URI,
  PORT
};
