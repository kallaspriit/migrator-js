import * as del from "del";
import * as path from "path";
import migrate, {
  ConnectionOptions,
  IMigration,
  IMigratorOptions,
  MigrationStatus,
  Migrator,
  MigratorTypeormStorage,
} from "../src";

interface IMigrationContext {
  version: string;
}

interface IMigrationSnapshot {
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
    database: path.join(__dirname, "..", `migrate-${Date.now()}-${migratorCount}.sqlite3`),
  };
}

function getMigratorOptions(): IMigratorOptions {
  return {
    pattern: path.join(__dirname, "migrations", "!(*.spec|*.test|*.d).{ts,js}"),
    storage: new MigratorTypeormStorage(getConnectionOptions()),
    autorunAll: false,
  };
}

async function setupMigrator(): Promise<Migrator<IMigrationContext>> {
  return new Migrator<IMigrationContext>(context, getMigratorOptions());
}

function preprocessSnapshot(migration: IMigration): IMigrationSnapshot {
  return {
    name: migration.name,
    status: migration.status,
    result: migration.result,
  };
}

describe("migrator-js", () => {
  // delete generated sqlite databases
  afterEach(async () => {
    await del([path.join(__dirname, "..", `*.sqlite3`)]);
  });

  it("should provide list of pending migrations", async () => {
    const migrator = await setupMigrator();
    const pendingMigrations = await migrator.getPendingMigrations();

    expect(preprocessSnapshot(pendingMigrations[0].toJSON())).toMatchSnapshot();
    expect(pendingMigrations.map(preprocessSnapshot)).toMatchSnapshot();
  });

  it("should run a single migration", async () => {
    const migrator = await setupMigrator();
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
    const migrator = await setupMigrator();
    const pendingMigrations1 = await migrator.getPendingMigrations();
    expect(pendingMigrations1).toHaveLength(2);
    expect(pendingMigrations1.map(preprocessSnapshot)).toMatchSnapshot();
    await expect(pendingMigrations1[1].run()).rejects.toHaveProperty("message", `Example failure message`);

    const pendingMigrations2 = await migrator.getPendingMigrations();
    expect(pendingMigrations2).toHaveLength(2);
    expect(pendingMigrations2.map(preprocessSnapshot)).toMatchSnapshot();
  });

  it("provides interactive migrator", async () => {
    const results = await migrate<IMigrationContext>(context, {
      ...getMigratorOptions(),
      autorunAll: true,
    });

    expect({
      pendingMigrations: results.pendingMigrations.map(preprocessSnapshot),
      chosenMigrations: results.chosenMigrations.map(preprocessSnapshot),
      performedMigrations: results.performedMigrations.map(preprocessSnapshot),
      failedMigrations: results.failedMigrations.map(preprocessSnapshot),
    }).toMatchSnapshot();
  });

  it("handles empty list of pending migrations", async () => {
    const results = await migrate<IMigrationContext>(context, {
      ...getMigratorOptions(),
      autorunAll: true,
      pattern: "xxx", // won't find any migrations
    });

    expect({
      pendingMigrations: results.pendingMigrations.map(preprocessSnapshot),
      chosenMigrations: results.chosenMigrations.map(preprocessSnapshot),
      performedMigrations: results.performedMigrations.map(preprocessSnapshot),
      failedMigrations: results.failedMigrations.map(preprocessSnapshot),
    }).toMatchSnapshot();
  });
});
