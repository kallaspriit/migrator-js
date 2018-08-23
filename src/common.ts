export enum MigrationStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETE = "COMPLETE",
  FAILED = "FAILED",
}

export interface MigrationInfo {
  name: string;
  filename: string;
  status: MigrationStatus;
  timeTaken?: number;
  startDate?: Date;
  endDate?: Date;
  result?: string;
}

export interface MigrationStorage {
  getPerformedMigrations(): Promise<MigrationInfo[]>;
  insertMigration(name: string, filename: string): Promise<void>;
  updateMigration(name: string, status: MigrationStatus, result: string, timeTaken: number): Promise<void>;
  close(): Promise<void>;
}

export type MigrationExecutorFn<Context> = (context: Context) => Promise<string>;

export interface MigratorOptions {
  pattern: string;
  storage: MigrationStorage;
}

export interface MigrationResult {
  pendingMigrations: MigrationInfo[];
  chosenMigrations: MigrationInfo[];
  performedMigrations: MigrationInfo[];
  failedMigrations: MigrationInfo[];
}
