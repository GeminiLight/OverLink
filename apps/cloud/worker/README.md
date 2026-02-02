# Worker Component

This is the engine of the OverLink Platform. It is designed to run on GitHub Actions.

## Setup

1.  Create a separate GitHub Repository (e.g. `overlink-worker`) or use the main one.
2.  Add this code to the repository.
3.  Add the following **Repository Secrets**:
    -   `R2_ACCESS_KEY`
    -   `R2_SECRET_KEY`
    -   `R2_BUCKET`
    -   `R2_ENDPOINT`

## Triggering

The worker listens for `repository_dispatch` events.

```bash
curl -X POST https://api.github.com/repos/:owner/:repo/dispatches \
  -H 'Accept: application/vnd.github.everest-preview+json' \
  -u :user :token \
  --data '{"event_type": "sync_job", "client_payload": { "username": "foo", "email": "...", "password": "...", "project_id": "..." }}'
```

## Workflow File (`.github/workflows/worker.yml`)

```yaml
name: Worker
on: [repository_dispatch]
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: pip install -r platform/worker/requirements.txt && playwright install chromium
      - run: python platform/worker/worker.py
        env:
          payload: ${{ toJSON(github.event.client_payload) }}
          R2_ACCESS_KEY: ${{ secrets.R2_ACCESS_KEY }}
          R2_SECRET_KEY: ${{ secrets.R2_SECRET_KEY }}
          R2_BUCKET: ${{ secrets.R2_BUCKET }}
          R2_ENDPOINT: ${{ secrets.R2_ENDPOINT }}
```
