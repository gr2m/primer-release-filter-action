# primer-release-filter-action

> A companion action for the Primer Release Notifier app

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
        uses: primer/filter-release-changelogs-action@v1
        with:
          components: ActionList, ActionMenu

      - if: ${{ needs.filter.outputs.hasComponentChanges }}
        # example release payload for reference:
        # https://github.com/octokit/webhooks/blob/70fafcfab3a6d54e45f3a2a8370c809fe9ee28c0/payload-examples/api.github.com/release/created.payload.json
        run: |
          echo ${{ github.event.client_payload.release.tag_name }}
          echo ${{ steps.filter-release-changelogs.outputs.componentChangelogs }}
```

## License

[MIT](LICENSE)
