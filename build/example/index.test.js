"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const del_1 = __importDefault(require("del"));
const src_1 = require("../src");
let migratorCount = 0;
const context = {
    version: "1",
};
function getConnectionOptions() {
    return {
        type: "sqlite",
        name: `migrator-test-${++migratorCount}`,
        database: (0, path_1.join)(__dirname, "..", `migrate-${Date.now()}-${migratorCount}.sqlite3`),
    };
}
function getMigratorOptions(override = {}) {
    return Object.assign({ pattern: (0, path_1.join)(__dirname, "migrations", "!(*.spec|*.test|*.d).{ts,js}"), storage: new src_1.MigratorTypeormStorage(getConnectionOptions()) }, override);
}
function preprocessSnapshot(migration) {
    return {
        name: migration.name,
        status: migration.status,
        result: migration.result,
    };
}
let migrator;
describe("migrator-js", () => {
    // close the migrator after each test
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        if (migrator) {
            yield migrator.close();
        }
    }));
    // delete the generated test databases after all tests
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, del_1.default)([(0, path_1.join)(__dirname, "..", `*.sqlite3`)]);
    }));
    it("should provide list of pending migrations", () => __awaiter(void 0, void 0, void 0, function* () {
        migrator = new src_1.Migrator(context, getMigratorOptions());
        const pendingMigrations = yield migrator.getPendingMigrations();
        yield migrator.close();
        expect(preprocessSnapshot(pendingMigrations[0].toJSON())).toMatchSnapshot();
        expect(pendingMigrations.map(preprocessSnapshot)).toMatchSnapshot();
    }));
    it("should run a single migration", () => __awaiter(void 0, void 0, void 0, function* () {
        migrator = new src_1.Migrator(context, getMigratorOptions());
        const pendingMigrations1 = yield migrator.getPendingMigrations();
        expect(pendingMigrations1).toHaveLength(2);
        expect(pendingMigrations1.map(preprocessSnapshot)).toMatchSnapshot();
        const result = yield pendingMigrations1[0].run();
        expect(result).toMatchSnapshot();
        const pendingMigrations2 = yield migrator.getPendingMigrations();
        expect(pendingMigrations2).toHaveLength(1);
        expect(pendingMigrations2.map(preprocessSnapshot)).toMatchSnapshot();
    }));
    it("should handle failing migration", () => __awaiter(void 0, void 0, void 0, function* () {
        migrator = new src_1.Migrator(context, getMigratorOptions());
        const pendingMigrations1 = yield migrator.getPendingMigrations();
        expect(pendingMigrations1).toHaveLength(2);
        expect(pendingMigrations1.map(preprocessSnapshot)).toMatchSnapshot();
        yield expect(pendingMigrations1[1].run()).rejects.toHaveProperty("message", `Example failure message`);
        const pendingMigrations2 = yield migrator.getPendingMigrations();
        expect(pendingMigrations2).toHaveLength(2);
        expect(pendingMigrations2.map(preprocessSnapshot)).toMatchSnapshot();
    }));
    it("provides interactive migrator", () => __awaiter(void 0, void 0, void 0, function* () {
        migrator = new src_1.Migrator(context, getMigratorOptions());
        const results = yield migrator.migrate(true);
        expect({
            pendingMigrations: results.pendingMigrations.map(preprocessSnapshot),
            chosenMigrations: results.chosenMigrations.map(preprocessSnapshot),
            performedMigrations: results.performedMigrations.map(preprocessSnapshot),
            failedMigrations: results.failedMigrations.map(preprocessSnapshot),
        }).toMatchSnapshot();
    }));
    it("handles empty list of pending migrations", () => __awaiter(void 0, void 0, void 0, function* () {
        migrator = new src_1.Migrator(context, getMigratorOptions({
            pattern: "xxx", // wont find any
        }));
        const results = yield migrator.migrate(true);
        expect({
            pendingMigrations: results.pendingMigrations.map(preprocessSnapshot),
            chosenMigrations: results.chosenMigrations.map(preprocessSnapshot),
            performedMigrations: results.performedMigrations.map(preprocessSnapshot),
            failedMigrations: results.failedMigrations.map(preprocessSnapshot),
        }).toMatchSnapshot();
    }));
});
//# sourceMappingURL=index.test.js.map