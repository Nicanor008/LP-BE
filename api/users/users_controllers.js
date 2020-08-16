const User = require("./users_models");
const statusCode = require("http-status");
const jwt = require('jsonwebtoken')
// all users
exports.fetchAllUsers = (req, res) => {
  User.find()
    .then((users) => {
      if (users.length === 0) {
        res
          .status(statusCode.NOT_FOUND)
          .json({ message: "No users available" });
      }
      return res
        .status(statusCode.OK)
        .json({ message: "All users", data: users });
    })
    .catch((error) => {
      return res
        .status(statusCode.SERVICE_UNAVAILABLE)
        .json({ message: "Something went happen. Try again", error });
    });
};

// get current user, logged in user
exports.getSingleUser = (req, res) => {
  // const email = req.params.token.substr(7).email
  User.findOne({ _id:req.id }).then(user => {
    if(!user) {
      return res.status(404).json({
        message: "No active User"
      })
    }

    // return the user details
    return res.status(200).json({
      message: 'Current User details',
      data: user
    })
  }).catch(error => {
    return res.status(500).json({
      message: "Something went Wrong, try again",
      error
    })
  })
}

// filter all authors
// search users as per users name or role
// exports.fetchOnlyAuthors = (req, res) => {
//   //   User.find({ role: { '$regex': name }})
//   const { name } = req.params;
//   User.aggregate([
//     {
//       $match: {
//         $or: [{ role: { $regex: name } }, { name: { $regex: name } }],
//       },
//     },
//   ])
//     .then((users) => {
//       if (users.length === 0) {
//         res
//           .status(statusCode.NOT_FOUND)
//           .json({ message: "No users available" });
//       }
//       return res.status(statusCode.OK).json({
//         message: `${users.length} users with ${req.params.name}`,
//         data: users,
//       });
//     })
//     .catch((error) => {
//       return res
//         .status(statusCode.SERVICE_UNAVAILABLE)
//         .json({ message: "Something went happen. Try again", error });
//     });
// };
