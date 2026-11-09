const { spawn } = require("child_process");
const path = require("path");

const backend = spawn("npm", ["run", "dev"], {
  cwd: path.join(__dirname, "back-end"),
  stdio: "inherit",
  shell: true
});

const frontend = spawn("npm", ["run", "dev"], {
  cwd: path.join(__dirname, "front-end"),
  stdio: "inherit",
  shell: true
});

process.on("SIGINT", () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
