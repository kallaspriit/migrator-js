import { Connection, ConnectionOptions } from 'typeorm';
import { IMigration, IMigrationStorage, MigrationStatus } from '../../common';
export interface IDatabaseResult {
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
export default class MigratorTypeormStorage implements IMigrationStorage {
    protected connectionOptions: ConnectionOptions;
    protected connectionCount: number;
    constructor(connectionOptions: ConnectionOptions);
    getPerformedMigrations(): Promise<IMigration[]>;
    insertMigration(name: string, filename: string): Promise<void>;
    updateMigration(name: string, status: MigrationStatus, result: string, timeTaken: number): Promise<void>;
    protected getConnection(): Promise<Connection>;
    protected getMigrationInfo(migration: Migration): IMigration;
    protected resolveStatus(statusName: string): MigrationStatus;
}
