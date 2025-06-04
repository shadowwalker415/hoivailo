import CustomError from "./customError";
import { ErrorCode } from "./types";

class EntityNotFoundError extends CustomError<ErrorCode> {}

export default EntityNotFoundError;
