import { Slot } from "../types";

interface AvailabilityResponse {
  success: boolean;
  code: number;
  data: {
    slots: Slot[];
  };
}
