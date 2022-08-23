import SentryCli from "@sentry/cli";
import { Options } from "./types";

/** Creates a new Sentry CLI instance. */
export function makeSentryCli(options: Options) {
  //TODO: pass config file instead of null
  const cli = new SentryCli(options.configFile, {
    silent: false, //TODO read from options
    org: options.org,
    project: options.project,
    authToken: options.authToken,
    url: options.url,
    vcsRemote: "origin", //TODO set from options,
  });

  // Let's not worry about dry run for now
  //   if (this.isDryRun()) {
  //   this.outputDebug("DRY Run Mode");

  //     return {
  //       releases: {
  //         proposeVersion: () =>
  //           cli.releases.proposeVersion().then((version) => {
  //             this.outputDebug("Proposed version:\n", version);
  //             return version;
  //           }),
  //         new: (release) => {
  //           this.outputDebug("Creating new release:\n", release);
  //           return Promise.resolve(release);
  //         },
  //         uploadSourceMaps: (release, config) => {
  //           this.outputDebug("Calling upload-sourcemaps with:\n", config);
  //           return Promise.resolve(release, config);
  //         },
  //         finalize: (release) => {
  //           this.outputDebug("Finalizing release:\n", release);
  //           return Promise.resolve(release);
  //         },
  //         setCommits: (release, config) => {
  //           this.outputDebug("Calling set-commits with:\n", config);
  //           return Promise.resolve(release, config);
  //         },
  //         newDeploy: (release, config) => {
  //           this.outputDebug("Calling deploy with:\n", config);
  //           return Promise.resolve(release, config);
  //         },
  //       },
  //     };
  //   }

  return cli;
}
