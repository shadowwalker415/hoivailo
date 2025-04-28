"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAvailableSlots = exports.getAppointDate = void 0;
const dateHelper_1 = __importDefault(require("../utils/dateHelper"));
const date_fns_1 = require("date-fns");
const availability_config_1 = require("../utils/availability.config");
const getAppointDate = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // converting data type of the request requery date to a string type
        const dateParam = request.query.date;
        // Checking if date is a valid date string
        if (!dateParam || !dateHelper_1.default.isValidDate(dateParam)) {
            throw new Error("Invalid date format!");
        }
        // Setting the date query to the request availabilityDate property
        request.availabilityDate = dateParam;
        next();
    }
    catch (err) {
        response.status(401).json({ error: "Invalid date format" });
    }
});
exports.getAppointDate = getAppointDate;
// Slot generation helper function
const generateSlots = (date_string, workHours, durationMinutes) => {
    const startTime = (0, date_fns_1.parse)(`${date_string} ${workHours.start}`, "yyyy-MM-dd HH:mm", new Date());
    const endTime = (0, date_fns_1.parse)(`${date_string} ${workHours.end}`, "yyyy-MM-dd HH:mm", new Date());
    const slots = [];
    let current = startTime;
    while ((0, date_fns_1.isBefore)((0, date_fns_1.addMinutes)(current, durationMinutes), (0, date_fns_1.addMinutes)(endTime, 1))) {
        const slotStart = (0, date_fns_1.format)(current, "HH:mm");
        const slotEnd = (0, date_fns_1.format)((0, date_fns_1.addMinutes)(current, durationMinutes), "HH:mm");
        slots.push(`${slotStart} - ${slotEnd}`);
        current = (0, date_fns_1.addMinutes)(current, durationMinutes);
    }
    return slots;
};
const generateAvailableSlots = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // checking if requested date is a previous date.
        if (dateHelper_1.default.isPastDate(req.availabilityDate)) {
            req.availableSlots = [];
            // checking if requested date is a working day
        }
        else if (!dateHelper_1.default.isWorkingDay(req.availabilityDate)) {
            req.availableSlots = [];
        }
        else {
            const slots = generateSlots(req.availabilityDate, availability_config_1.WORKING_HOURS, availability_config_1.SLOT_DURATION_MINUTES);
            req.availableSlots = slots;
        }
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Invalid date" });
    }
});
exports.generateAvailableSlots = generateAvailableSlots;
