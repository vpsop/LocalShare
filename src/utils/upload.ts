import multer from "multer";
import { SHARED_DIR } from "../config/paths";

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, SHARED_DIR),
	filename: (_req, file, cb) => cb(null, file.originalname),
});

export const upload = multer({ storage });
