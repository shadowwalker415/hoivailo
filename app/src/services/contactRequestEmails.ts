import {
  IContactRequestEmail,
  contactRequestEmail
} from "../model/contactRequestEmail";

export async function getOrCreateContactRequestEmail(
  userEmail: string
): Promise<IContactRequestEmail> {
  return contactRequestEmail.findOneAndUpdate(
    { userEmail },
    {
      $setOnInsert: {
        userEmail,
        status: "pending"
      }
    },
    {
      new: true,
      upsert: true
    }
  );
}
