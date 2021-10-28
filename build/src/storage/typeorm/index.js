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
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration = exports.DEFAULT_DATABASE_CONNECTION_NAME = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("../../common");
exports.DEFAULT_DATABASE_CONNECTION_NAME = "migrator";
let Migration = class Migration {
    getInfo() {
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
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: "varchar", nullable: false, length: 100 }),
    __metadata("design:type", String)
], Migration.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Migration.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: false, default: common_1.MigrationStatus.RUNNING }),
    __metadata("design:type", String)
], Migration.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Migration.prototype, "timeTaken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Migration.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Migration.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Migration.prototype, "endDate", void 0);
Migration = __decorate([
    (0, typeorm_1.Entity)()
], Migration);
exports.Migration = Migration;
class MigratorTypeormStorage {
    constructor(connectionOptions) {
        this.connectionOptions = connectionOptions;
    }
    getPerformedMigrations() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.openConnection();
            const migrations = yield connection.getRepository(Migration).find({
                where: {
                    status: common_1.MigrationStatus.COMPLETE,
                },
            });
            return migrations.map((migration) => migration.getInfo());
        });
    }
    insertMigration(name, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.openConnection();
            yield connection.getRepository(Migration).save({
                name,
                filename,
                status: common_1.MigrationStatus.RUNNING,
            });
        });
    }
    updateMigration(name, status, result, timeTaken) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.openConnection();
            const migration = yield connection.getRepository(Migration).findOne(name);
            if (!migration) {
                throw new Error(`Migration called "${name}" was not found`);
            }
            migration.status = status;
            migration.result = result;
            migration.timeTaken = timeTaken;
            yield connection.getRepository(Migration).save(migration);
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            const name = this.connectionOptions.name || exports.DEFAULT_DATABASE_CONNECTION_NAME;
            const connection = (0, typeorm_1.getConnection)(name);
            if (!connection || !connection.isConnected) {
                return;
            }
            yield connection.close();
        });
    }
    openConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const name = this.connectionOptions.name || exports.DEFAULT_DATABASE_CONNECTION_NAME;
            // use existing connection if exists
            try {
                const existingConnection = (0, typeorm_1.getConnection)(name);
                if (existingConnection && existingConnection.isConnected) {
                    return existingConnection;
                }
            }
            catch (e) {
                // ignore, connection not found
            }
            // create a new connection
            const connection = yield (0, typeorm_1.createConnection)(Object.assign({ name, entities: [Migration], synchronize: true }, this.connectionOptions));
            return connection;
        });
    }
}
exports.default = MigratorTypeormStorage;
//# sourceMappingURL=index.js.map