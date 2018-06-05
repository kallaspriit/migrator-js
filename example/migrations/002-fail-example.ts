import { MigrationContext } from "../";

export default async (_context: MigrationContext): Promise<string> => {
  throw new Error("Example failure message");
};
