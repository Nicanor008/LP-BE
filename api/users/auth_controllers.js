const User = require("./users_models");
const bcrypt = require("bcryptjs");
const sendMail = require("../../utils/sendMail");
const statusCode = require("http-status");
const jwt = require("jsonwebtoken");

// register new user
exports.registerUser = (req, res, next) => {
  const { password, email, name, role } = req.body;
  // const image = req.file;
  // const pictureUrl = image.path;
  User.findOne({ email }).then((userExists) => {
    if (userExists) {
      return res
        .status(statusCode.CONFLICT)
        .json({ message: "Email already exist" });
    }
    return bcrypt
      .hash(password, 12)
      .then((encryptedPassword) => {
        const user = new User({
          password: encryptedPassword,
          email,
          name,
          role,
        });
        return user.save();
      })
      .then((response) => {
        sendMail.sendConfirmEmail(response);
        return res.status(statusCode.OK).json({
          messages: "Account created. Check your email to activate account",
          data: response,
        });
      })
      .catch((error) => {
        return res
          .status(statusCode.INTERNAL_SERVER_ERROR)
          .json({ message: "Something went wrong. Try again", error });
      });
  });
};

// login user
exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((response) => {
      if (!response) {
        return res.status(404).json({ message: "Email does not exist" });
      }
      if (!response.active) {
        return res.status(404).json({ message: "Email does not exist" });
      }
      if (!response.verified) {
        return res
          .status(statusCode.FORBIDDEN)
          .json({ message: "Account has not been verified" });
      }
      bcrypt.compare(password, response.password).then((decrptedPassword) => {
        if (!decrptedPassword) {
          return res
            .status(statusCode.NOT_FOUND)
            .json({ message: "Wrong password" });
        }
        const payload = {
          id: response.id,
          email: response.email,
        };
        jwt.sign(payload, process.env.SECRET_KEY, (err, token) => {
          if (err) {
            return res
              .status(statusCode.SERVICE_UNAVAILABLE)
              .json({ message: "Something went happen. Try again.", err });
          }
          req.session.isLoggedIn = true;
          req.session.user = response._id;
          req.session.save((err) => {
            console.log(err);
            return res.status(statusCode.OK).json({
              message: "Login successful",
              token: "Bearer " + token,
              data: response,
            });
          });
        });
      });
    })
    .catch((error) => {
      return res
        .status(statusCode.SERVICE_UNAVAILABLE)
        .json({ message: "Something went happen. Try again", error });
    });
};

// Logout
exports.Logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(statusCode.SERVICE_UNAVAILABLE)
        .json({ message: "Something went wrong. Try again" });
    }
    return res.status(statusCode.OK).json({ message: "Logout successful" });
  });
};

// verify account
exports.verifyAccount = (req, res) => {
  const { email } = req.params;
  User.findOneAndUpdate({ email }, { verified: true })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ message: `Account ${email} does not exist` });
      }
      return res
        .status(200)
        .json({ message: "Account has been verified", data: user });
    })
    .catch((error) => {
      return res
        .status(500)
        .json({ message: "Something went happen. Try again", error });
    });
};
