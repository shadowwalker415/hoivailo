import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import config from "../utils/config";
import { IAppointment } from "../types";
import dateHelper from "../utils/dateHelper";

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
  This is a confirmation email for your appointment on the ${dateHelper.getDateOfficial(
    appointmentInfo.startTime
  )} from ${dateHelper.getHourOfficial(appointmentInfo.startTime)}`;
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
  } catch (err: unknown) {
    let error = undefined;
    if (err instanceof Error) {
      error = err;
    }
    return error as Error;
  }
};

const sendAdminConfirmationEmail = async (
  appointmentInfo: IAppointment
): Promise<any | Error> => {
  try {
    // message sample
    const message = `An appointment was booked for ${dateHelper.getDateOfficial(
      appointmentInfo.startTime
    )} from ${dateHelper.getHourOfficial(
      appointmentInfo.startTime
    )} with an appointment ID of ${
      appointmentInfo.appointmentId
    }.\n Appointment Details\n Customer name: ${
      appointmentInfo.name
    }\n Phone: ${appointmentInfo.phone}\n Email: ${
      appointmentInfo.email
    }\n End Time: ${dateHelper.getHourOfficial(
      appointmentInfo.endTime
    )}\n Service: ${appointmentInfo.service}`;
    // mail options
    const mailOptions: SendMailOptions = {
      from: "No Reply example@myname.io",
      to: "admin_service@yahoo.com",
      subject: "New Pending Appointment",
      text: message
    };
    // sending email
    const responseObj = await transporter.sendMail(mailOptions);
    if (!responseObj) throw new Error("Something went wrong sending email");
    return responseObj;
  } catch (err: unknown) {
    let error = undefined;
    if (err instanceof Error) {
      error = err;
    }
    return error as Error;
  }
};

export default {
  sendUserConfirmationEmail,
  sendAdminConfirmationEmail
};
