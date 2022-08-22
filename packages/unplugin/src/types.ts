//TODO: JsDoc for all properties
export type Options = {
  debugLogging?: boolean;

  /* --- authentication/identification: */
  org?: string;
  project?: string;
  authToken?: string;
  url?: string;
  // configFile: string

  /* --- release properties: */
  release?: string;
  // dist: string,
  // entries: string[] | RegExp | ((key: string) => boolean);

  /* --- source maps properties: */
  //TODO: make this required
  include?: string; //| string[] | IncludeEntry[];
  // ignoreFile: string
  // ignore: string | string[]
  // ext: string[]
  // urlPrefix: string,
  // urlSuffix: string,
  // validate: boolean
  // stripPrefix?: boolean,
  // stripCommonPrefix?: boolean,
  // sourceMapReference?: boolean,
  // rewrite?: boolean,

  /* --- other unimportant (for now) stuff- properties: */
  // vcsRemote: string,
  // customHeader: string,

  // finalize?: boolean,
  // dryRun?: boolean,
  debug?: boolean;
  // silent?: boolean,
  // cleanArtifacts?: boolean,
  // errorHandler?: (err: Error, invokeErr: function(): void, compilation: unknown) => void,
  // setCommits?: {
  //   repo?: string,
  //   commit?: string,
  //   previousCommit?: string,
  //   auto?: boolean,
  //   ignoreMissing?: boolean
  // },
  // deploy?: {
  //   env: string,
  //   started?: number,
  //   finished?: number,
  //   time?: number,
  //   name?: string,
  //   url?: string,
  // }
};

/*
type IncludeEntry = {
  paths: string[];
  //TODO: what about the other entries??
};
*/
