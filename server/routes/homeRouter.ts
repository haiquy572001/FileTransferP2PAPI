import express from "express";
import authCtrl from "../controllers/authCtrl";
import homeCtrl from "../controllers/homeCtrl";

const router = express.Router();

router.get("/home/id", homeCtrl.getID);

export default router;
