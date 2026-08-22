const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

async function sendEmail(to, subject, htmlContent) {
    return brevo.transactionalEmails.sendTransacEmail({
        subject,
        htmlContent,
        sender: { name: "Kamlaba Garden Sport Club", email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email: to }],
    });
}

module.exports = sendEmail;