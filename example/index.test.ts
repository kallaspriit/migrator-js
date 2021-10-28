import { join } from "path";
import del from "del";
import {
  ConnectionOptions,
  MigrationInfo,
  MigrationStatus,
  Migrator,
  MigratorOptions,
  MigratorTypeormStorage,
} from "../src";

interface MigrationContext {
  version: string;
}

interface MigrationSnapshot {
  name: string;
  status: MigrationStatus;
  result?: string;
}

let migratorCount = 0;
const context = {
  version: "1",
};

function getConnectionOptions(): ConnectionOptions {
  return {
    type: "sqlite",
    name: `migrator-test-${++migratorCount}`,
    database: join(__dirname, "..", `migrate-${Date.now()}-${migratorCount}.sqlite3`),
  };
}

function getMigratorOptions(override: Partial<MigratorOptions> = {}): MigratorOptions {
  return {
    pattern: join(__dirname, "migrations", "!(*.spec|*.test|*.d).{ts,js}"),
    storage: new MigratorTypeormStorage(getConnectionOptions()),
    ...override,
  };
}

function preprocessSnapshot(migration: MigrationInfo): MigrationSnapshot {
  return {
    name: migration.name,
    status: migration.status,
    result: migration.result,
  };
}

let migrator: Migrator<MigrationContext> | undefined;

describe("migrator-js", () => {
  // close the migrator after each test
  afterEach(async () => {
    if (migrator) {
      await migrator.close();
    }
  });

  // delete the generated test databases after all tests
  afterAll(async () => {
    await del([join(__dirname, "..", `*.sqlite3`)]);
  });

  it("should provide list of pending migrations", async () => {
    migrator = new Migrator<MigrationContext>(context, getMigratorOptions());

    const pendingMigrations = await migrator.getPendingMigrations();

    await migrator.close();

    expect(preprocessSnapshot(pendingMigrations[0].toJSON())).toMatchSnapshot();
    expect(pendingMigrations.map(preprocessSnapshot)).toMatchSnapshot();
  });

  it("should run a single migration", async () => {
    migrator = new Migrator<MigrationContext>(context, getMigratorOptions());

    const pendingMigrations1 = await migrator.getPendingMigrations();
    expect(pendingMigrations1).toHaveLength(2);
    expect(pendingMigrations1.map(preprocessSnapshot)).toMatchSnapshot();

    const result = await pendingMigrations1[0].run();
    expect(result).toMatchSnapshot();

    const pendingMigrations2 = await migrator.getPendingMigrations();
    expect(pendingMigrations2).toHaveLength(1);
    expect(pendingMigrations2.map(preprocessSnapshot)).toMatchSnapshot();
  });

  it("should handle failing migration", async () => {
    migrator = new Migrator<MigrationContext>(context, getMigratorOptions());

    const pendingMigrations1 = await migrator.getPendingMigrations();
    expect(pendingMigrations1).toHaveLength(2);
    expect(pendingMigrations1.map(preprocessSnapshot)).toMatchSnapshot();
    await expect(pendingMigrations1[1].run()).rejects.toHaveProperty("message", `Example failure message`);

    const pendingMigrations2 = await migrator.getPendingMigrations();
    expect(pendingMigrations2).toHaveLength(2);
    expect(pendingMigrations2.map(preprocessSnapshot)).toMatchSnapshot();
  });

  it("provides interactive migrator", async () => {
    migrator = new Migrator<MigrationContext>(context, getMigratorOptions());

    const results = await migrator.migrate(true);

    expect({
      pendingMigrations: results.pendingMigrations.map(preprocessSnapshot),
      chosenMigrations: results.chosenMigrations.map(preprocessSnapshot),
      performedMigrations: results.performedMigrations.map(preprocessSnapshot),
      failedMigrations: results.failedMigrations.map(preprocessSnapshot),
    }).toMatchSnapshot();
  });

  it("handles empty list of pending migrations", async () => {
    migrator = new Migrator<MigrationContext>(
      context,
      getMigratorOptions({
        pattern: "xxx", // wont find any
      }),
    );

    const results = await migrator.migrate(true);

    expect({
      pendingMigrations: results.pendingMigrations.map(preprocessSnapshot),
      chosenMigrations: results.chosenMigrations.map(preprocessSnapshot),
      performedMigrations: results.performedMigrations.map(preprocessSnapshot),
      failedMigrations: results.failedMigrations.map(preprocessSnapshot),
    }).toMatchSnapshot();
  });
});
