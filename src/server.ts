import qrcode from "qrcode-terminal";
import app from "./app";
import { getWifiIPv4 } from "./utils/network";

const PORT = 4000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
	const localUrl = `http://localhost:${PORT}`;
	const networkIp = getWifiIPv4();
	const networkUrl = networkIp ? `http://${networkIp}:${PORT}` : null;

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
