import CustomError from "./customError";
import { ErrorCode } from "./types";

class InternalServerError extends CustomError<ErrorCode> {}

export default InternalServerError;
