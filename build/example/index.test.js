"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const del = require("del");
const path = require("path");
const _1 = require("../");
let migratorCount = 0;
const context = {
    version: '1',
};
function getConnectionOptions() {
    return {
        type: 'sqlite',
        name: `migrator-test-${++migratorCount}`,
        database: path.join(__dirname, '..', '..', `migrate-${Date.now()}-${migratorCount}.sqlite3`),
    };
}
function getMigratorOptions() {
    return {
        pattern: path.join(__dirname, 'migrations', '!(*.spec|*.test|*.d).{ts,js}'),
        storage: new _1.MigratorTypeormStorage(getConnectionOptions()),
        autorunAll: false,
    };
}
function setupMigrator() {
    return __awaiter(this, void 0, void 0, function* () {
        return new _1.Migrator(context, getMigratorOptions());
    });
}
function preprocessSnapshot(migration) {
    return {
        name: migration.name,
        status: migration.status,
        result: migration.result,
    };
}
describe('migrator-js', () => {
    // delete generated sqlite databases
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        yield del([path.join(__dirname, '..', '..', `*.sqlite3`)]);
    }));
    it('should provide list of pending migrations', () => __awaiter(this, void 0, void 0, function* () {
        const migrator = yield setupMigrator();
        const pendingMigrations = yield migrator.getPendingMigrations();
        expect(preprocessSnapshot(pendingMigrations[0].toJSON())).toMatchSnapshot();
        expect(pendingMigrations.map(preprocessSnapshot)).toMatchSnapshot();
    }));
    it('should run a single migration', () => __awaiter(this, void 0, void 0, function* () {
        const migrator = yield setupMigrator();
        const pendingMigrations1 = yield migrator.getPendingMigrations();
        expect(pendingMigrations1).toHaveLength(2);
        expect(pendingMigrations1.map(preprocessSnapshot)).toMatchSnapshot();
        const result = yield pendingMigrations1[0].run();
        expect(result).toMatchSnapshot();
        const pendingMigrations2 = yield migrator.getPendingMigrations();
        expect(pendingMigrations2).toHaveLength(1);
        expect(pendingMigrations2.map(preprocessSnapshot)).toMatchSnapshot();
    }));
    it('should handle failing migration', () => __awaiter(this, void 0, void 0, function* () {
        const migrator = yield setupMigrator();
        const pendingMigrations1 = yield migrator.getPendingMigrations();
        expect(pendingMigrations1).toHaveLength(2);
        expect(pendingMigrations1.map(preprocessSnapshot)).toMatchSnapshot();
        yield expect(pendingMigrations1[1].run()).rejects.toHaveProperty('message', `Example failure message`);
        const pendingMigrations2 = yield migrator.getPendingMigrations();
        expect(pendingMigrations2).toHaveLength(2);
        expect(pendingMigrations2.map(preprocessSnapshot)).toMatchSnapshot();
    }));
    it('provides interactive migrator', () => __awaiter(this, void 0, void 0, function* () {
        const results = yield _1.default(context, Object.assign({}, getMigratorOptions(), { autorunAll: true }));
        expect({
            pendingMigrations: results.pendingMigrations.map(preprocessSnapshot),
            chosenMigrations: results.chosenMigrations.map(preprocessSnapshot),
            performedMigrations: results.performedMigrations.map(preprocessSnapshot),
            failedMigrations: results.failedMigrations.map(preprocessSnapshot),
        }).toMatchSnapshot();
    }));
    it('handles empty list of pending migrations', () => __awaiter(this, void 0, void 0, function* () {
        const results = yield _1.default(context, Object.assign({}, getMigratorOptions(), { autorunAll: true, pattern: 'xxx' }));
        expect({
            pendingMigrations: results.pendingMigrations.map(preprocessSnapshot),
            chosenMigrations: results.chosenMigrations.map(preprocessSnapshot),
            performedMigrations: results.performedMigrations.map(preprocessSnapshot),
            failedMigrations: results.failedMigrations.map(preprocessSnapshot),
        }).toMatchSnapshot();
    }));
});
//# sourceMappingURL=index.test.js.map