import { Connection, ConnectionOptions } from 'typeorm';
import { IMigrationInfo, IMigrationStorage, MigrationStatus } from '../../';
export interface IDatabaseResult {
    [x: string]: string | number;
}
export declare class Migration {
    name: string;
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
    getPerformedMigrations(): Promise<IMigrationInfo[]>;
    insertMigration(name: string): Promise<void>;
    updateMigration(name: string, status: MigrationStatus, result: string, timeTaken: number): Promise<void>;
    protected getConnection(): Promise<Connection>;
    protected resolveStatus(statusName: string): MigrationStatus;
}
