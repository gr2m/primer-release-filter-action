# primer-release-filter-action

> A companion action for the Primer Release Notifier app

## Setup

1. Install https://github.com/apps/primer-release-notifier in your repository
2. Add `.github/workflows/handle-primer-release.yml` with content as shown below

## Usage

```yaml
name: Primer Release
"on":
  repository_dispatch:
    types:
      - release:primer/react

jobs:
  filter:
    runs-on: ubuntu-latest
    steps:
      - id: filter-release-changelogs
        uses: gr2m/primer-release-filter-action@v2
        with:
          components: ActionList, ActionMenu

      # Example: When either `ActionList` or `ActionMenu` was changed, create a new issue with the change logs
      - if: ${{ steps.filter-release-changelogs.outputs.hasComponentChanges }}
        uses: octokit/request-action@v2.x
        with:
          # https://docs.github.com/en/rest/issues/issues#create-an-issue
          route: POST /repos/{repository}/issues
          repository: ${{ github.repository }}
          # example release payload for reference:
          # https://github.com/octokit/webhooks/blob/70fafcfab3a6d54e45f3a2a8370c809fe9ee28c0/payload-examples/api.github.com/release/created.payload.json
          title: "primer/react ${{ github.event.client_payload.release.tag_name }}"
          body: |
            "${{ steps.filter-release-changelogs.outputs.changelogsByComponentMarkdown }}"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Inputs

The only supported input is `components`. Pass the names of the components you are interested in separated by comma. For `primer/react`, find the names [here](https://github.com/primer/react/blob/main/generated/components.json). For `primer/view_components` find the names (`id`s) [here](https://primer.github.io/view_components/components.json).

### Outputs

- `hasComponentChanges` set to `"true"` or undefined
- `changelogsByComponent` set to a JSON string of `{[componentName]: changelogsString}`, based on the `components` input
- `changelogsByComponentMarkdown` set to a a markdown string of changelogs grouped by component, based on the `components` input

## License

[MIT](LICENSE)
