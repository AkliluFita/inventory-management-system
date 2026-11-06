#!/usr/bin/env node
const os = require("node:os");
const { spawn } = require("node:child_process");

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 13)) {
  console.error(`Expo SDK 57 needs Node 22.13 or newer; found ${process.version}. Run "nvm use" in this project, then try again.`);
  process.exit(1);
}

const privateAddress = (address) => /^192\.168\./.test(address) || /^10\./.test(address) || /^172\.(1[6-9]|2\d|3[01])\./.test(address);
const requestedAddress = process.env.EXPO_LAN_IP || process.env.REACT_NATIVE_PACKAGER_HOSTNAME;
let interfaces = [];
if (!requestedAddress) {
  try {
    interfaces = Object.entries(os.networkInterfaces());
  } catch {
    console.error("Could not inspect network interfaces. Set EXPO_LAN_IP to the laptop's Wi-Fi address, then try again.");
    process.exit(1);
  }
}
const candidates = interfaces.flatMap(([name, addresses]) => (addresses || [])
  .filter((item) => item.family === "IPv4" && !item.internal && !/^(docker|br-|veth|virbr|tun|lo)/i.test(name))
  .map((item) => item.address));
const address = requestedAddress || candidates.find((item) => /^192\.168\./.test(item)) || candidates.find(privateAddress) || candidates[0];
if (!address) {
  console.error("No LAN address found. Connect the laptop and phone to the same Wi-Fi network, or set EXPO_LAN_IP to the laptop's address.");
  process.exit(1);
}

console.log(`Expo Go LAN address: ${address}`);
const cli = require.resolve("expo/bin/cli");
const child = spawn(process.execPath, [cli, "start", "--lan", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, REACT_NATIVE_PACKAGER_HOSTNAME: address },
});
child.on("exit", (code, signal) => { if (signal) process.kill(process.pid, signal); else process.exit(code ?? 1); });
