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
const path = require("path");
const _1 = require("../");
let migratorCount = 0;
function setupMigrator() {
    return __awaiter(this, void 0, void 0, function* () {
        const connectionOptions = {
            type: 'sqlite',
            name: `migrator-test-${++migratorCount}`,
            database: `migrate-${Date.now()}.sqlite3`,
        };
        const connection = yield _1.createConnection(connectionOptions);
        return new _1.default({
            pattern: path.join(__dirname, 'migrations', '!(*.spec|*.test|*.d).{ts,js}'),
            storage: new _1.MigratorTypeormStorage(connectionOptions),
            context: {
                connection,
            },
        });
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
    it('should provide list of pending migrations', () => __awaiter(this, void 0, void 0, function* () {
        const migrator = yield setupMigrator();
        const pendingMigrations = yield migrator.getPendingMigrations();
        expect(pendingMigrations.map(preprocessSnapshot)).toMatchSnapshot();
    }));
    it('should run a single migration', () => __awaiter(this, void 0, void 0, function* () {
        const migrator = yield setupMigrator();
        const pendingMigrations1 = yield migrator.getPendingMigrations();
        expect(pendingMigrations1).toHaveLength(2);
        const result = yield pendingMigrations1[0].run();
        expect(result).toMatchSnapshot();
        const pendingMigrations2 = yield migrator.getPendingMigrations();
        expect(pendingMigrations2).toHaveLength(1);
    }));
    it('should handle failing migration', () => __awaiter(this, void 0, void 0, function* () {
        const migrator = yield setupMigrator();
        const pendingMigrations1 = yield migrator.getPendingMigrations();
        expect(pendingMigrations1).toHaveLength(2);
        yield expect(pendingMigrations1[1].run()).rejects.toHaveProperty('message', `Example failure message`);
        const pendingMigrations2 = yield migrator.getPendingMigrations();
        expect(pendingMigrations2).toHaveLength(2);
    }));
});
//# sourceMappingURL=index.test.js.map