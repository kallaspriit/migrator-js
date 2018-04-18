import { IMigrationContext } from "../";

export default async (context: IMigrationContext): Promise<string> => `version: ${context.version}`;
