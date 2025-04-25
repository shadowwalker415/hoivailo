"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
if (!MONGODB_URI || !PORT) {
    throw new Error("Missing MongoDB URI in environment variable");
}
exports.default = {
    MONGODB_URI,
    PORT
};
