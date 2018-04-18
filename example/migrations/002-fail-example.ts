import { IMigrationContext } from "../";

export default async (_context: IMigrationContext): Promise<string> => {
  throw new Error("Example failure message");
};
