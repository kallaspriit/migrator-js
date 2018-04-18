import { IMigrationContext } from "../";

export default async (context: IMigrationContext): Promise<string> =>
  new Promise<string>(resolve => {
    // simulate async action
    setTimeout(() => {
      resolve(`version: ${context.version}`);
    }, 1000);
  });
