import express from "express";
import { upload } from "../utils/upload";
import {
	listFiles,
	listFilesJson,
	uploadFile,
	verifyPassword,
	downloadFile,
} from "../controllers/fileController";

const router = express.Router();

router.get("/", listFiles);
router.get("/files", listFilesJson);
router.post("/upload", upload.single("file"), uploadFile);
router.post("/verify-password", verifyPassword);
router.get("/download/:filename", downloadFile);

export default router;
