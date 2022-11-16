import { AxiosError } from "axios";
import { BUNDLERS } from "./bundlers";
import {
  deleteReleaseFromSentry,
  getReleaseFileFromSentry,
  getReleaseFilesFromSentry,
} from "./sentry-api";

type ReleaseFilesData = {
  id: string;
  name: string;
  dist?: string;
  headers: Record<string, string>;
  size: number;
  sha1: string;
  dateCreated: string;
};

type ReleaseFile = {
  name: string;
  content: string;
};

export function deleteAllReleases(release: string) {
  return Promise.all(
    BUNDLERS.map(async (bundler) => {
      const bundlerRelease = `${release}-${bundler}`;
      try {
        const response = await deleteReleaseFromSentry(bundlerRelease);
        return response;
      } catch (e) {
        if ((e as AxiosError).response?.status === 404) {
          return Promise.resolve();
        }
        throw e;
      }
    })
  );
}

export async function getSentryReleaseFiles(release: string): Promise<ReleaseFile[]> {
  const releaseFileEntries = await getReleaseFiles(release);

  const releaseFiles: ReleaseFile[] = await Promise.all(
    releaseFileEntries.map((entry) => getReleaseFile(release, entry))
  );
  return releaseFiles;
}

async function getReleaseFiles(release: string): Promise<ReleaseFilesData[]> {
  const response = await getReleaseFilesFromSentry(release);
  return response.data as ReleaseFilesData[];
}

async function getReleaseFile(release: string, fileEntry: ReleaseFilesData): Promise<ReleaseFile> {
  const response = await getReleaseFileFromSentry(release, fileEntry.id);
  const data = response.data as ReleaseFile;

  return {
    name: fileEntry.name,
    // source maps are JSON and therefore, axios returns them as an object
    // We want them as a string, though, so we convert it
    content: typeof data === "object" ? JSON.stringify(data) : data,
  };
}
