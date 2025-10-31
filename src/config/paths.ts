import path from "path";

export const METADATA_FILE_NAME = "localshare_metadata.json";
export const SHARED_DIR = path.join(__dirname, "..", "..", "shared");
export const META_FILE = path.join(SHARED_DIR, METADATA_FILE_NAME);
export const VIEWS_DIR = path.join(__dirname, "..", "views");
