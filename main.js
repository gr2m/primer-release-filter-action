// @ts-check

/**
 *
 * @param {import("@actions/core")} core
 * @param {{client_payload: import("@octokit/webhooks-types").ReleaseCreatedEvent}} event
 */
export function main(core, event) {
  const body = event.client_payload.release.body;

  // get separate changelogs
  const [ignore_, ...changelogs] = body.split(/^-   /gm);

  const changelogsByComponent = {};

  for (const changelog of changelogs) {
    const lines = changelog.split(/\n\s*/).filter(Boolean);

    const lastLine = lines.at(-1);
    if (!lastLine?.startsWith("<!-- Changed components:")) {
      // ignore changes that didn'd affect any components
      continue;
    }

    // remove last line
    lines.pop();

    const components = lastLine
      .slice("<!-- Changed components:".length, "-->".length * -1)
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
    yamlEscape(toMarkdown(changelogsByComponent))
  );
}

function toMarkdown(changelogsByComponent) {
  return Object.entries(changelogsByComponent)
    .map(([component, changelogs]) => {
      return `### ${component}

- ${changelogs.map(escapeGitHubUsername).join("\n- ")}`;
    })
    .join("\n\n");
}

function escapeGitHubUsername(string) {
  return string.replace(/@([\w-]+)/g, "[@$1](https://github.com/$1)");
}

function yamlEscape(string) {
  return string.replace(/"/g, '""');
}
