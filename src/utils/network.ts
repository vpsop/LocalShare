import os from "os";

export function getWifiIPv4(): string | null {
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
