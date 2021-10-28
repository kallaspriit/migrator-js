import { MigrationContext } from "../";

export default async (context: MigrationContext): Promise<string> =>
  new Promise<string>((resolve) => {
    // simulate async action
    setTimeout(() => {
      resolve(`version: ${context.version}`);
    }, 1000);
  });
