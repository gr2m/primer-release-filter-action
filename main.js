/**
 *
 * @param {core} core
 * @param {import("@octokit/webhooks-types").ReleaseCreatedEvent} event
 */
export function main(core, event) {
  const body = event.release.body;

  // get separate changelogs
  const [ignore_, ...changelogs] = body.split(/^-   /gm);

  const changelogsByComponent = {};

  for (const changelog of changelogs) {
    const lines = changelog.split(/\n\s*/).filter(Boolean);

    const lastLine = lines.at(-1);
    if (!lastLine.startsWith("Changed components:")) {
      // ignore changes that didn'd affect any components
      continue;
    }

    // remove last line
    lines.pop();

    const components = lastLine
      .substring("Changed components:".length)
      .trim()
      .split(/\s*,\s*/g);

    if (components[0] === "_none_") {
      continue;
    }

    for (const component of components) {
      changelogsByComponent[component] = changelogsByComponent[component] || [];
      changelogsByComponent[component].push(lines.join("\n"));
    }
  }

  if (Object.keys(changelogsByComponent).length === 0) {
    return;
  }

  core.setOutput("hasComponentChanges", "true");
  core.setOutput(
    "changelogsByComponent",
    JSON.stringify(changelogsByComponent)
  );
  core.setOutput(
    "changelogsByComponentMarkdown",
    toMarkdown(changelogsByComponent)
  );
}

function toMarkdown(changelogsByComponent) {
  return Object.entries(changelogsByComponent)
    .map(([component, changelogs]) => {
      return `### ${component}

- ${changelogs.join("\n- ")}`;
    })
    .join("\n\n");
}
