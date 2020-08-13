const nodemailer = require("nodemailer");

const from = `\"LP\" ${process.env.EMAIL_USER}`;

// function setup() {
  // return nodemailer.createTransport({
  //   host: "smtp.gmail.com",
  //   port: 587,
  //   auth: {
  //     user: '',
  //     pass: '',
  //   },
  // });

//   const setUp = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "",
//       pass: ""
//     }
//   });
// // }

// exports.sendConfirmEmail = (data) => {
//   // const transport = setup();
//   const userEmail = data.email;
//   const generateConfirmationUrl = `http://localhost:4001/v1/auth/verify/${userEmail}`;

//   const msg = {
//     from,
//     to: userEmail,
//     subject: "Activate your account",
//     text: `
//     Welcome to LP. We are very happy to have you here. Activate your account.
//     `,
//     html: `
//       <h2 style="display: flex; align-items: center;">Welcome to ShopMerc</h2>
//         <p>Please activate your account using <a href=${generateConfirmationUrl}>this link</a>
//          🎊 🎉 🚀</p>
//     `,
//   };
//   console.log(">>>>>>>>>>>>...............got here but not sure what's happening..........>>>>>>>>>>>>...")
//   setUp.sendMail(msg, (err, data) => {
//     if (err) {
//       return console.log("Error occurs>>>>>>>....", err);
//     }
//     return console.log("Email sent!!!..............>>>>........");
//   })
// };


exports.sendConfirmEmail = async data => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const link = `https://lp-prod.herokuapp.com/auth/verify/${data.email}`;

  // let link = `${data.domain}/verify-email?token=${jwt.jwtSignature(
  //   data.toMail
  // )}`;

  // Step 2
  let mailOptions = {
    from: "newmailer137@gmail.com",
    to: data.email,
    subject: "Activate your account",
    text: "Welcome to LP",
    generateTextFromHTML: true,
    html: `<div><h4>Thank you${data.email} and welcome to the Shoman Mentorship Program where we help you levelup  your Skills</h4></div>
    <div><h5>To get started click on the button below to have your email verified 😊😊😊.</h5></div>
   <div> <a href=${link}><button>Verify</button></a></div>`
  };

  // Step 3
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      return console.log("Error occurs................>>>>>.............>>.....", err);
    }
    return console.log("Email sent!!...................`11!!!!!!!!!");
  });
};
