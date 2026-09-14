const { spawn } = require("child_process");
const path = require("path");

const nodeBinDir = "/Users/felixivance/.nvm/versions/node/v22.13.1/bin";
const env = { ...process.env, PATH: `${nodeBinDir}:${process.env.PATH}` };

const child = spawn(
  process.execPath,
  [path.join(__dirname, "node_modules", ".bin", "next"), "dev", "--webpack"],
  { cwd: __dirname, env, stdio: "inherit" }
);

child.on("exit", (code) => process.exit(code ?? 0));
