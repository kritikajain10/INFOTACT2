const express = require("express");
const router = express.Router();

const {
  createDocument,
  getDocuments,
} = require("../controllers/documentController");

router.post("/", createDocument);
router.get("/", getDocuments);

module.exports = router;