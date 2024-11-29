const express = require("express");
const {
  createNote,
  getAllNotes,
  getNote,
  updateNote,
  deleteNote,
  getAdminAllNotes,
} = require("../controllers/noteController.js");
const { userAuth, adminAuth } = require("../middlewares/auth.js");

const router = express.Router();

router.post("/create-note", userAuth, createNote);
router.get("/get-user-notes", userAuth, getAllNotes);
router.get("/get-note/:id", getNote);
router.patch("/update-note/:id", userAuth, updateNote);
router.delete("/delete-note/:id", userAuth, deleteNote);

router.get("/get-admin-all-notes", adminAuth, getAdminAllNotes);

module.exports = router;
