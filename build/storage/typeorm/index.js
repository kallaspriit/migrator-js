"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const common_1 = require("../../common");
let Migration = class Migration {
};
__decorate([
    typeorm_1.PrimaryColumn({ type: 'varchar', nullable: false, length: 256 }),
    __metadata("design:type", String)
], Migration.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({ type: 'varchar', nullable: false, default: common_1.MigrationStatus.RUNNING }),
    __metadata("design:type", String)
], Migration.prototype, "status", void 0);
__decorate([
    typeorm_1.Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Migration.prototype, "timeTaken", void 0);
__decorate([
    typeorm_1.Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Migration.prototype, "result", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Migration.prototype, "startDate", void 0);
__decorate([
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], Migration.prototype, "endDate", void 0);
Migration = __decorate([
    typeorm_1.Entity()
], Migration);
exports.Migration = Migration;
// tslint:disable-next-line:max-classes-per-file
class MigratorTypeormStorage {
    constructor(connectionOptions) {
        this.connectionOptions = connectionOptions;
        this.connectionCount = 0;
    }
    getPerformedMigrations() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.getConnection();
            try {
                const repository = connection.getRepository(Migration);
                const migrations = yield repository.find({
                    where: {
                        status: common_1.MigrationStatus.COMPLETE,
                    },
                });
                console.log('migrations', migrations);
                return migrations;
            }
            catch (e) {
                console.error('Fetching performed migrations failed', e.stack);
                return [];
            }
            finally {
                yield connection.close();
            }
        });
    }
    insertMigration(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.getConnection();
            try {
                connection.getRepository(Migration).save({
                    name,
                    status: common_1.MigrationStatus.RUNNING,
                });
            }
            catch (e) {
                console.error('Inserting migration failed', e.stack);
            }
            finally {
                yield connection.close();
            }
        });
    }
    updateMigration(name, status, result, timeTaken) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.getConnection();
            try {
                const repository = connection.getRepository(Migration);
                const migration = yield repository.findOneById(name);
                if (!migration) {
                    throw new Error(`Migration called "${name}" was not found`);
                }
                migration.status = status;
                migration.result = result;
                migration.timeTaken = timeTaken;
                repository.save(migration);
            }
            catch (e) {
                console.error('Updating migration failed', e.stack);
            }
            finally {
                yield connection.close();
            }
        });
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield typeorm_1.createConnection(Object.assign({}, this.connectionOptions, { name: `migrator-${++this.connectionCount}`, entities: [Migration], synchronize: true }));
            if (!connection.isConnected) {
                throw new Error(`Connecting to migrator-js database failed (${JSON.stringify(this.connectionOptions)})`);
            }
            return connection;
        });
    }
    resolveStatus(statusName) {
        switch (statusName) {
            case common_1.MigrationStatus.RUNNING:
                return common_1.MigrationStatus.RUNNING;
            case common_1.MigrationStatus.COMPLETE:
                return common_1.MigrationStatus.COMPLETE;
            case common_1.MigrationStatus.FAILED:
                return common_1.MigrationStatus.FAILED;
            default:
                return common_1.MigrationStatus.FAILED;
        }
    }
}
exports.default = MigratorTypeormStorage;
//# sourceMappingURL=index.js.map