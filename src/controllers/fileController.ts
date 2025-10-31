import fs from "fs/promises";
import bcrypt from "bcryptjs";
import path from "path";
import { Request, Response } from "express";
import { getMetadata, saveMetadata } from "../utils/metadata";
import { METADATA_FILE_NAME, SHARED_DIR } from "../config/paths";

export async function listFiles(req: Request, res: Response) {
	const entries = await fs.readdir(SHARED_DIR, { withFileTypes: true });
	const fileNames = entries
		.filter((f) => f.isFile() && f.name !== METADATA_FILE_NAME)
		.map((f) => f.name);
	res.render("index", { files: fileNames });
}

export async function listFilesJson(_req: Request, res: Response) {
	const entries = await fs.readdir(SHARED_DIR, { withFileTypes: true });
	const fileNames = entries
		.filter((f) => f.isFile() && f.name !== "metadata.json")
		.map((f) => f.name);
	res.json(fileNames);
}

export async function uploadFile(req: Request, res: Response) {
	const { password } = req.body;
	const fileName = req.file?.originalname;

	if (!fileName || !password)
		return res.status(400).send("Missing file or password.");

	const metadata = await getMetadata();
	const hashed = await bcrypt.hash(password, 10);
	metadata[fileName] = hashed;
	await saveMetadata(metadata);

	res.redirect("/");
}

export async function verifyPassword(req: Request, res: Response) {
	const { filename, password } = req.body;
	const metadata = await getMetadata();
	const hash = metadata[filename];
	if (!hash)
		return res.status(404).json({ ok: false, msg: "No password set." });

	const match = await bcrypt.compare(password, hash);
	if (!match)
		return res.status(401).json({ ok: false, msg: "Wrong password." });

	res.json({ ok: true });
}

export async function downloadFile(req: Request, res: Response) {
	const filePath = path.join(SHARED_DIR, req.params.filename);
	if (!filePath.startsWith(SHARED_DIR))
		return res.status(403).send("Forbidden");

	res.download(filePath, (err) => {
		if (err) {
			if ((err as any).code === "ENOENT")
				res.status(404).send("File not found");
			else res.status(500).send("Server error");
		}
	});
}
