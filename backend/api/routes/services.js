const express = require("express");
const store = require("../services/dataStore");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(store.services);
});

module.exports = router;
