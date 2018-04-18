export declare enum MigrationStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    COMPLETE = "COMPLETE",
    FAILED = "FAILED",
}
export interface IMigration {
    name: string;
    filename: string;
    status: MigrationStatus;
    timeTaken?: number;
    startDate?: Date;
    endDate?: Date;
    result?: string;
}
export interface IMigrationStorage {
    getPerformedMigrations(): Promise<IMigration[]>;
    insertMigration(name: string, filename: string): Promise<void>;
    updateMigration(name: string, status: MigrationStatus, result: string, timeTaken: number): Promise<void>;
}
export declare type MigrationExecutorFn<Context> = (context: Context) => Promise<string>;
export interface IMigratorOptions {
    pattern: string;
    storage: IMigrationStorage;
    autorunAll: boolean;
}
export interface IMigrationResult {
    pendingMigrations: IMigration[];
    chosenMigrations: IMigration[];
    performedMigrations: IMigration[];
    failedMigrations: IMigration[];
}
