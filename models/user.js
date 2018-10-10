var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
   username: String,
   password: String,
   avatar: {type: String, default: "http://res.cloudinary.com/time2hack/image/upload/fa-user.png"},
   firstName: String,
   lastName: String,
   email: {type: String, required: true},
   isAdmin: {type: Boolean, default: false}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);