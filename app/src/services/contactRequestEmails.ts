import {
  IServiceInquiryEmail,
  serviceInquiryEmail
} from "../model/serviceInquiryEmail";

export async function getOrCreateContactRequestEmail(
  userEmail: string
): Promise<IServiceInquiryEmail> {
  return serviceInquiryEmail.findOneAndUpdate(
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
