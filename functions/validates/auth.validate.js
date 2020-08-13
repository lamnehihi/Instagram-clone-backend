const { isEmptyString, isEmail } = require("./inputField.validate");

// ANCHOR: check user input signin field
module.exports.validateSignInData = (newUser) => {
  let errors = {};
  
  if (isEmptyString(newUser.email)) {
    errors.email = "email is required!";
  } else if (!isEmail(newUser.email)) {
    errors.email = "invalid email!";
  }

  if (isEmptyString(newUser.password)) {
    errors.password = "password is required!";
  }
  if (newUser.password !== newUser.confirmPassword) {
    errors.password = "password must match!";
  }
  if (isEmptyString(newUser.handle)) {
    errors.handle = "handle is required!";
  }
  return errors;
};

module.exports.validateLogInData = (user) => {
  let errors = {};
  
  if (isEmptyString(user.email)) errors.email = "email is require!";
  if (!isEmail(user.email)) errors.email = "invalid email!";
  if (isEmptyString(user.password)) errors.password = "password is require!";
  
  return errors;
}