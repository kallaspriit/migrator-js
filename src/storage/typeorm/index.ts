import {
  Column,
  Connection,
  ConnectionOptions,
  createConnection,
  CreateDateColumn,
  Entity,
  getConnection,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { MigrationInfo, MigrationStatus, MigrationStorage } from "../../common";

export interface DatabaseResult {
  [x: string]: string | number;
}

export const DEFAULT_DATABASE_CONNECTION_NAME = "migrator";

@Entity()
export class Migration {
  @PrimaryColumn({ type: "varchar", nullable: false, length: 100 })
  public name!: string;

  @Column({ type: "varchar", nullable: true })
  public filename!: string;

  @Column({ type: "varchar", nullable: false, default: MigrationStatus.RUNNING })
  public status!: MigrationStatus;

  @Column({ type: "int", nullable: true })
  public timeTaken!: number;

  @Column({ type: "text", nullable: true })
  public result!: string;

  @CreateDateColumn()
  public startDate!: Date;

  @UpdateDateColumn()
  public endDate!: Date;

  public getInfo(): MigrationInfo {
    return {
      name: this.name,
      filename: this.filename,
      status: this.status,
      timeTaken: this.timeTaken,
      startDate: this.startDate,
      endDate: this.endDate,
      result: this.result,
    };
  }
}

// tslint:disable-next-line:max-classes-per-file
export default class MigratorTypeormStorage implements MigrationStorage {
  public constructor(private readonly connectionOptions: ConnectionOptions) {}

  public async getPerformedMigrations(): Promise<MigrationInfo[]> {
    const connection = await this.openConnection();

    const migrations = await connection.getRepository(Migration).find({
      where: {
        status: MigrationStatus.COMPLETE,
      },
    });

    return migrations.map(migration => migration.getInfo());
  }

  public async insertMigration(name: string, filename: string): Promise<void> {
    const connection = await this.openConnection();

    await connection.getRepository(Migration).save({
      name,
      filename,
      status: MigrationStatus.RUNNING,
    });
  }

  public async updateMigration(
    name: string,
    status: MigrationStatus,
    result: string,
    timeTaken: number,
  ): Promise<void> {
    const connection = await this.openConnection();

    const migration = await connection.getRepository(Migration).findOne(name);

    if (!migration) {
      throw new Error(`Migration called "${name}" was not found`);
    }

    migration.status = status;
    migration.result = result;
    migration.timeTaken = timeTaken;

    await connection.getRepository(Migration).save(migration);
  }

  public async close(): Promise<void> {
    const name = this.connectionOptions.name || DEFAULT_DATABASE_CONNECTION_NAME;
    const connection = getConnection(name);

    if (!connection || !connection.isConnected) {
      return;
    }

    await connection.close();
  }

  private async openConnection(): Promise<Connection> {
    const name = this.connectionOptions.name || DEFAULT_DATABASE_CONNECTION_NAME;

    // use existing connection if exists
    try {
      const existingConnection = getConnection(name);

      if (existingConnection) {
        return existingConnection;
      }
    } catch (e) {
      // ignore, connection not found
    }

    // create a new connection
    const connection = await createConnection({
      name,
      entities: [Migration],
      synchronize: true,
      ...this.connectionOptions,
    });

    return connection;
  }
}
