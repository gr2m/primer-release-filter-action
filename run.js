import { readFileSync } from "node:fs";
import core from "@actions/core";

import { main } from "./main.js";

const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));

main(core, event);
