const sendGrid = require("@sendgrid/mail");
sendGrid.setApiKey(process.env.SEND_GRID_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL;
module.exports = async (mailDetails) => {
  sendGrid
    .send({
      to: mailDetails.Email,
      from: FROM_EMAIL,
      subject: mailDetails.Subject,
      text: mailDetails.Message,
    })
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.log("Sendgrign error", error.response.body);
    });
};
