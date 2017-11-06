import { Connection } from 'typeorm';
import MigratorTypeormStorage from '../storage/typeorm';
export { MigratorTypeormStorage };
export interface IMigrationContext {
    connection: Connection;
}
