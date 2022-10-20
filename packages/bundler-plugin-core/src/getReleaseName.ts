import * as child_process from "child_process";

function getGitBranchHead(): string | undefined {
  try {
    return child_process.execSync("git rev-parse HEAD").toString().trim();
  } catch (e) {
    // no git installed
    return undefined;
  }
}

export function getReleaseName(releaseName?: string): string {
  if (releaseName) {
    return releaseName;
  }

  // Env var SENTRY_RELEASE takes presendace over other env vars listed below
  // this is why we are looking for it before proceeding with others
  if (process.env["SENTRY_RELEASE"]) {
    return process.env["SENTRY_RELEASE"];
  }

  const ENV_VARS = [
    "SOURCE_VERSION", // Heroku #1 https://devcenter.heroku.com/changelog-items/630
    "HEROKU_SLUG_COMMIT", // Heroku #2: https://docs.sentry.io/product/integrations/deployment/heroku/#configure-releases
    "CODEBUILD_RESOLVED_SOURCE_VERSION", // AWS CodeBuild: https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-env-vars.html
    "CIRCLE_SHA1", // CircleCI: https://circleci.com/docs/2.0/env-vars/
    "VERCEL_GIT_COMMIT_SHA", // Vercel docs: https://vercel.com/docs/concepts/projects/environment-variables#system-environment-variables
  ];

  const releaseFromEnvironmentVar = ENV_VARS.find((key) => Object.keys(process.env).includes(key));

  if (releaseFromEnvironmentVar) {
    return process.env[releaseFromEnvironmentVar] as string;
  }

  const gitBranchHead = getGitBranchHead();

  if (gitBranchHead) {
    return gitBranchHead;
  } else {
    throw new Error("Could not return a release name");
  }
}
