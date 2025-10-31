import fs from "fs/promises";
import { META_FILE } from "../config/paths";

export async function getMetadata(): Promise<Record<string, string>> {
	try {
		const data = await fs.readFile(META_FILE, "utf-8");
		return JSON.parse(data);
	} catch {
		return {};
	}
}

export async function saveMetadata(
	data: Record<string, string>
): Promise<void> {
	await fs.writeFile(META_FILE, JSON.stringify(data, null, 2));
}
