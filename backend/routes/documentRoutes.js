const express = require("express");
const router = express.Router();

const {
  createDocument,
  getDocuments,
  getDocumentById,
} = require("../controllers/documentController");

router.post("/", createDocument);
router.get("/", getDocuments);
router.get("/:id", getDocumentById);


module.exports = router;