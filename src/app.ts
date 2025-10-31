import express from "express";
import fs from "fs/promises";
import { VIEWS_DIR, SHARED_DIR, META_FILE } from "./config/paths";
import fileRoutes from "./routes/fileRoutes";

const app = express();

app.set("view engine", "ejs");
app.set("views", VIEWS_DIR);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", fileRoutes);


(async () => {
	await fs.mkdir(SHARED_DIR, { recursive: true });
	try {
		await fs.access(META_FILE);
	} catch {
		await fs.writeFile(META_FILE, "{}");
	}
})();

export default app;
