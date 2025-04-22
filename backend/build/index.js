"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./utils/config"));
const mongoose_1 = __importDefault(require("mongoose"));
if (!config_1.default.MONGODB_URI) {
    throw new Error("Missing MongoDB URI in environment variable");
}
console.log("Connecting to MongoDB");
mongoose_1.default
    .connect(config_1.default.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
    console.log(err.message);
    process.exit(1);
});
