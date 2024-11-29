const Note = require("../models/Note");
const User = require("../models/User");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const objectId = require("mongoose").Types.ObjectId;

exports.createNote = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ _id: req.userId }, { name: 1 }).lean(true);
  if (!user) return next(new ErrorHandler("User not found", 404));

  const { title, description } = req.body;

  await Note.create({
    title,
    description,
    user: user._id,
  });

  res.status(201).json({
    success: true,
    message: "Note created successfully",
  });
});

exports.getAllNotes = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ _id: req.userId }, { name: 1 }).lean(true);
  if (!user) return next(new ErrorHandler("User not found", 404));

  const { title } = req.query;
  const query = {};

  if (title) {
    query.title = { $regex: title, $options: "i" };
  }

  const notes = await Note.aggregate([
    {
      $match: {
        user: user._id,
        ...query,
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    notes,
  });
});

exports.getNote = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ _id: req.userId }, { name: 1 }).lean(true);
  if (!user) return next(new ErrorHandler("User not found", 404));

  const note = await Note.findById(req.params.id);
  if (!note) return next(new ErrorHandler("Note not found", 404));

  res.status(200).json({
    success: true,
    note,
  });
});

exports.updateNote = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ _id: req.userId }, { name: 1 }).lean(true);
  if (!user) return next(new ErrorHandler("User not found", 404));

  const note = await Note.findById(req.params.id);
  if (!note) return next(new ErrorHandler("Note not found", 404));

  const { title, description } = req.body;

  await Note.updateOne(
    {
      user: req.userId,
      _id: req.params.id,
    },
    {
      $set: {
        title,
        description,
      },
    }
  );

  res.status(200).json({
    success: true,
    message: "Note updated successfully",
  });
});

exports.deleteNote = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ _id: req.userId }, { name: 1 }).lean(true);
  if (!user) return next(new ErrorHandler("User not found", 404));

  const note = await Note.findOne({ _id: req.params.id, user: req.userId });
  if (!note) return next(new ErrorHandler("Note not found", 404));

  await note.deleteOne();

  res.status(200).json({
    success: true,
    message: "Note deleted successfully",
  });
});

exports.getAdminAllNotes = catchAsyncError(async (req, res, next) => {
  const admin = await User.findOne({ _id: req.userId }, { role: 1 }).lean(true);
  if (!admin) return next(new ErrorHandler("Admin not found", 404));

  if (admin.role !== "admin")
    return next(new ErrorHandler("You are not authorized", 404));

  const { title } = req.query;
  const query = {};

  if (title) {
    query.title = { $regex: title, $options: "i" };
  }

  const notes = await Note.aggregate([
    {
      $match: {
        ...query,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        name: "$user.name",
        description: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    notes,
  });
});

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const admin = await User.findOne({ _id: req.userId }, { role: 1 }).lean(true);
  if (!admin) return next(new ErrorHandler("Admin not found", 404));

  if (admin.role !== "admin")
    return next(new ErrorHandler("You are not authorized", 404));

  const { title } = req.query;
  const query = {};

  if (title) {
    query.$or = [
      { name: { $regex: title, $options: "i" } },
      { email: { $regex: title, $options: "i" } },
    ];
  }

  const users = await User.aggregate([
    {
      $match: {
        ...query,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    users,
  });
});
