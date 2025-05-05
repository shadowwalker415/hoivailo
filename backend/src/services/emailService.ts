import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import config from "../utils/config";
import { IAppointment } from "../types";

// creating email transporter
const transporter: Transporter = nodemailer.createTransport(
  config.MAIL_OPTIONS
);

const sendUserConfirmationEmail = async (
  appointmentInfo: IAppointment
): Promise<any | Error> => {
  try {
    // message sample
    const message = `Hi ${appointmentInfo.name},\n 
  This is a confirmation email for your appointment`;

    // mail options
    const mailOptions: SendMailOptions = {
      from: "Admin Jay example@myname.io",
      to: "your_name@yahoo.com",
      subject: "Example email",
      text: message
    };

    // sending email
    const responseObj = await transporter.sendMail(mailOptions);

    if (!responseObj) throw new Error("Something went wrong sending email");

    return responseObj;
  } catch (err) {
    let error = undefined;
    if (err instanceof Error) {
      error = err;
    }
    return error as Error;
  }
};

export default {
  sendUserConfirmationEmail
};
