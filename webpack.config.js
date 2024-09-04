import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: "./client/src/main.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "client/dist"),
  },
  mode: "production",
  experiments: {
    outputModule: true,
  },
};
