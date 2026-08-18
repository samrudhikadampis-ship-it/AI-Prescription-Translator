const express = require("express");

const router = express.Router();

router.post("/upload", (req, res) => {
    res.json({
        success: true,
        message: "Upload endpoint is working"
    });
});

module.exports = router;