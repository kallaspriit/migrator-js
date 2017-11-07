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
function preprocessSnapshot(migration) {
    return {
        name: migration.name,
        status: migration.status,
        result: migration.result,
    };
}
describe('migrator-js', () => {
    it('should provide list of pending migrations', () => __awaiter(this, void 0, void 0, function* () {
        const connectionOptions = {
            type: 'sqlite',
            database: `migrate-${Date.now()}.sqlite3`,
        };
        const migrator = new _1.default({
            pattern: path.join(__dirname, 'migrations', '!(*.spec|*.test|*.d).{ts,js}'),
            storage: new _1.MigratorTypeormStorage(connectionOptions),
            context: {
                version: '1.0.0',
            },
        });
        const pendingMigrations = yield migrator.getPendingMigrations();
        expect(pendingMigrations.map(preprocessSnapshot)).toMatchSnapshot();
    }));
});
//# sourceMappingURL=index.test.js.map