const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { Resend } = require("resend");

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

exports.sendAppointmentEmail = onDocumentCreated({
  document: "bookings/active/list/{appointmentId}",
  secrets: [RESEND_API_KEY],
}, async (event) => {
  const snap = event.data;
  if (!snap) return;

  const data = snap.data();
  
  // Safety check: Resend requires a 'to' field. If patientEmail is missing, log a warning and exit.
  if (!data.patientEmail) {
    console.warn(`[Email Trigger] Skipping: No patientEmail found for appointment ID: ${event.params.appointmentId}`, {
      patientName: data.patientName,
      clinicName: data.clinicName
    });
    return;
  }

  const resend = new Resend(RESEND_API_KEY.value());

  try {
    await resend.emails.send({
      from: "100KClinics <onboarding@resend.dev>",
      to: data.patientEmail,
      subject: `Appointment Confirmed: ${data.clinicName}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(to right, #0284c7, #74C7F8); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: -0.025em;">Booking Confirmed!</h1>
          </div>
          <div style="padding: 30px 25px; background: white;">
            <p style="margin-top: 0;">Hello <strong>${data.patientName}</strong>,</p>
            <p>Your appointment at <span style="color: #0284c7; font-weight: 700;">${data.clinicName}</span> is successfully scheduled. Below are your booking details:</p>
            
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid #f1f5f9;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 600; width: 100px;">Appt ID</td>
                  <td style="padding: 8px 0; color: #0284c7; font-weight: 700; font-family: monospace; font-size: 16px;">${data.bookingCode}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 600;">Doctor</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${data.doctorName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 600;">Date</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${data.date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 600;">Time</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${data.time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 600;">Location</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${data.clinicAddress}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; line-height: 1.6;">Please arrive 10 minutes before your scheduled time. If you need to cancel or reschedule, please use the 100KClinics mobile app.</p>
            
            <div style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">This is an automated message from 100KClinics Network.</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log(`[Email Success] Sent to ${data.patientEmail} for appointment ${event.params.appointmentId}`);
  } catch (error) {
    console.error("[Email Error] Resend API failed:", error);
  }
});