import { ConnectionOptions } from "typeorm";
import { MigrationInfo, MigrationStatus, MigrationStorage } from "../../common";
export interface DatabaseResult {
    [x: string]: string | number;
}
export declare class Migration {
    name: string;
    filename: string;
    status: MigrationStatus;
    timeTaken: number;
    result: string;
    startDate: Date;
    endDate: Date;
}
export declare const DATABASE_CONNECTION_NAME = "migrator";
export default class MigratorTypeormStorage implements MigrationStorage {
    private readonly connectionOptions;
    constructor(connectionOptions: ConnectionOptions);
    private static getMigrationInfo;
    getPerformedMigrations(): Promise<MigrationInfo[]>;
    insertMigration(name: string, filename: string): Promise<void>;
    updateMigration(name: string, status: MigrationStatus, result: string, timeTaken: number): Promise<void>;
    private getConnection;
}
