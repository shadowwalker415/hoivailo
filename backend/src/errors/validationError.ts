import CustomError from "./customError";
import { ErrorCode } from "./types";

class ValidationError extends CustomError<ErrorCode> {}

export default ValidationError;
