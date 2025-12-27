import { registerQueue } from "./registry";
import { adminMessageRequestedWorker } from "./workers/admin-message-requested.worker";
export const ADMIN_MESSAGE_REQUESTED_QUEUE = "admin_message_requested";

export const registerAdminMessageRequestedQueue = () => {
  registerQueue(ADMIN_MESSAGE_REQUESTED_QUEUE, {
    worker: adminMessageRequestedWorker
  });
};
