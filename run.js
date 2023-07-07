import { readFileSync } from "node:fs";
import core from "@actions/core";

import { main } from "./main.js";

/** @type {import("@octokit/webhooks-types").ReleaseCreatedEvent} */
const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));

main(core, event);
