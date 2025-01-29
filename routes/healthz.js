const express = require("express");
const router = express.Router();
const { healthCheck } = require("../controllers/healthzController");

const allowedMethods = ["GET"];

router.use(express.json(), (req, res, next) => {
    if (req.body == {} || Object.keys(req.body).length > 0)
        return res.status(400).send();

    if (Object.keys(req.query).length > 0)
        return res.status(400).send();

    if (!allowedMethods.includes(req.method))
        return res.status(405).send();

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    next();
});
router.get("/", healthCheck);

module.exports = router;
