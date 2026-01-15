# Release Process

1. Open a PR to update the changelog on `main`
2. After the changelog PR is merged, go to the **Actions** tab and manually trigger the **"Prepare Release"** workflow, entering the version you want to release
3. After the workflow completes, go to [getsentry/publish](https://github.com/getsentry/publish), find the corresponding issue created by the workflow, and add the `accepted` label to finalize the release
