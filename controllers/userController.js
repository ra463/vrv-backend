const User = require("../models/User");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { oauth2Client } = require("../utils/googleConfig");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config({ path: "../config/config.env" });

const isStrongPassword = (password) => {
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numericRegex = /\d/;
  const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;

  if (
    uppercaseRegex.test(password) &&
    lowercaseRegex.test(password) &&
    numericRegex.test(password) &&
    specialCharRegex.test(password)
  ) {
    return true;
  } else {
    return false;
  }
};

const sendData = async (res, statusCode, user, message) => {
  const token = await user.getToken();
  res.status(statusCode).json({
    success: true,
    user: {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    },
    token,
    message,
  });
};

exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please Enter all the fields", 400));
  }

  const user_exist = await User.findOne(
    { email: email.toLowerCase() },
    { _id: 1 }
  );
  if (user_exist) return next(new ErrorHandler(`Email already exists`, 400));

  if (!isStrongPassword(password)) {
    return next(
      new ErrorHandler(
        "Password must contain one Uppercase, Lowercase, Numeric and Special Character",
        400
      )
    );
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
  });

  sendData(res, 201, user, "User Registered Successfully");
});

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user) return next(new ErrorHandler("Invalid Credentials", 401));

  if (user.is_frozen) {
    const last_attempt = user.last_attempt.getTime();
    const current = Date.now();
    if (current - last_attempt > parseInt(process.env.FROZEN_TIME)) {
      await User.updateOne(
        { _id: user._id },
        { $set: { is_frozen: false, attempts: 0, last_attempt: null } }
      );
    } else {
      return next(
        new ErrorHandler(
          "Your Account is temporary freeze due to too many unsuccessfull attempt, try after 5 minutes",
          423
        )
      );
    }
  }

  const isPasswordMatched = await user.matchPassword(password);

  if (!isPasswordMatched) {
    await User.updateOne(
      { _id: user._id },
      { $set: { attempts: user.attempts + 1 } }
    );

    if (user.attempts === parseInt(process.env.MAX_UNSUCCESSFULL_ATTEMPT)) {
      await User.updateOne(
        { _id: user._id },
        { $set: { is_frozen: true, last_attempt: new Date() } }
      );
      return next(
        new ErrorHandler(
          "Too many unsuccessfull attempt, try again after 5 minutes",
          423
        )
      );
    }
    return next(new ErrorHandler("Invalid Credentials", 401));
  }

  // set unsuccessfull attempts to 0 as user login successfully
  if (user.attempts) {
    await User.updateOne({ _id: user._id }, { $set: { attempts: 0 } });
  }

  sendData(res, 200, user, "User Logged In Successfully");
});

exports.googleLogin = catchAsyncError(async (req, res, next) => {
  const { code: google_code } = req.query;

  const goodleAuth = await oauth2Client.getToken(google_code);
  oauth2Client.setCredentials(goodleAuth.tokens);

  const userAuth = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${goodleAuth.tokens.access_token}`
  );

  const { email, name, picture } = userAuth.data;

  const user = await User.findOne({ email });
  if (user) {
    if (user.is_frozen) {
      const last_attempt = user.last_attempt.getTime();
      const current = Date.now();
      if (current - last_attempt > parseInt(process.env.FROZEN_TIME)) {
        await User.updateOne(
          { _id: user._id },
          { $set: { is_frozen: false, attempts: 0, last_attempt: null } }
        );
      } else {
        return next(
          new ErrorHandler(
            "Your Account is temporary freeze due to too many unsuccessfull attempt, try after 5 minutes",
            423
          )
        );
      }
    }

    // set unsuccessfull attempts to 0 as user login successfully
    if (user.attempts) {
      await User.updateOne({ _id: user._id }, { $set: { attempts: 0 } });
    }

    sendData(res, 200, user, "User Logged In Successfully");
  } else {
    const randomPassword = Math.random().toString(36).slice(-8);
    const newUser = await User.create({
      name,
      email,
      password: randomPassword,
      avatar: picture,
    });
    sendData(res, 200, newUser, "User Logged In Successfully");
  }
});
