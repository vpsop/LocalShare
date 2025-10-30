import os from "os";
import path from "path";
import multer from "multer";
import fs from "fs/promises";
import bcrypt from "bcryptjs";
import express from "express";
import qrcode from "qrcode-terminal";

const app = express();
const port = 4000;
const HOST = "0.0.0.0";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

const SHARED_DIR = path.join(__dirname, "..", "shared");
const META_FILE = path.join(SHARED_DIR, "metadata.json");

// Setup Express Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer Configuration
const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, SHARED_DIR),
	filename: (_req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Helper to read/write metadata ---
async function getMetadata() {
	try {
		const data = await fs.readFile(META_FILE, "utf-8");
		return JSON.parse(data);
	} catch {
		return {};
	}
}
async function saveMetadata(data: any) {
	await fs.writeFile(META_FILE, JSON.stringify(data, null, 2));
}

// Get WiFi IPv4 Address
function getWifiIPv4() {
	const ifaces = os.networkInterfaces();
	const wifi = ifaces["Wi-Fi"] || ifaces["Wireless LAN adapter Wi-Fi"];
	if (wifi) {
		for (const iface of wifi) {
			if (iface.family === "IPv4" && !iface.internal) {
				return iface.address; // e.g., 192.168.42.162
			}
		}
	}
	return null;
}

// Endpoints
app.get("/", async (_req, res) => {
	const allEntries = await fs.readdir(SHARED_DIR, { withFileTypes: true });
	const fileNames = allEntries
		.filter((f) => f.isFile() && f.name !== "metadata.json")
		.map((f) => f.name);
	res.render("index", { files: fileNames });
});

app.get("/files", async (_req, res) => {
	const allEntries = await fs.readdir(SHARED_DIR, { withFileTypes: true });
	const fileNames = allEntries
		.filter((f) => f.isFile() && f.name !== "metadata.json")
		.map((f) => f.name);
	res.json(fileNames);
});

// Upload file + password
app.post("/upload", upload.single("file"), async (req, res) => {
	const { password } = req.body;
	const fileName = req.file?.originalname;

	if (!fileName || !password) {
		return res.status(400).send("Missing file or password.");
	}

	const metadata = await getMetadata();
	const hashed = await bcrypt.hash(password, 10);
	metadata[fileName] = hashed;
	await saveMetadata(metadata);

	res.redirect("/");
});

// Verify password before download
app.post("/verify-password", async (req, res) => {
	const { filename, password } = req.body;
	const metadata = await getMetadata();
	const hash = metadata[filename];
	if (!hash)
		return res.status(404).json({ ok: false, msg: "No password set." });

	const match = await bcrypt.compare(password, hash);
	if (!match)
		return res.status(401).json({ ok: false, msg: "Wrong password." });

	return res.json({ ok: true });
});

// Actual download (after verification)
app.get("/download/:filename", async (req, res) => {
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
});

// Start Server
app.listen(port, HOST, async () => {
	const localUrl = `http://localhost:${port}`;
	const networkIp = getWifiIPv4();
	const networkUrl = networkIp ? `http://${networkIp}:${port}` : null;

	await fs.mkdir(SHARED_DIR, { recursive: true });
	try {
		await fs.access(META_FILE);
	} catch {
		await fs.writeFile(META_FILE, "{}");
	}

	console.log("\nServer is running!");
	console.log(`- Local:   ${localUrl}`);
	if (networkUrl) {
		console.log(`- Network: ${networkUrl}\n`);
		console.log("Scan this QR code with your phone:");
		qrcode.generate(networkUrl, { small: true });
	} else {
		console.log(
			"Could not determine network address. Only accessible locally."
		);
	}
});
