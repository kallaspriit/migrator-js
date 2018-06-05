"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var typeorm_1 = require("typeorm");
var common_1 = require("../../common");
var Migration = /** @class */ (function () {
    function Migration() {
    }
    __decorate([
        typeorm_1.PrimaryColumn({ type: "varchar", nullable: false, length: 100 }),
        __metadata("design:type", String)
    ], Migration.prototype, "name", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", nullable: true }),
        __metadata("design:type", String)
    ], Migration.prototype, "filename", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", nullable: false, default: common_1.MigrationStatus.RUNNING }),
        __metadata("design:type", String)
    ], Migration.prototype, "status", void 0);
    __decorate([
        typeorm_1.Column({ type: "int", nullable: true }),
        __metadata("design:type", Number)
    ], Migration.prototype, "timeTaken", void 0);
    __decorate([
        typeorm_1.Column({ type: "text", nullable: true }),
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
    return Migration;
}());
exports.Migration = Migration;
exports.DATABASE_CONNECTION_NAME = "migrator";
// tslint:disable-next-line:max-classes-per-file
var MigratorTypeormStorage = /** @class */ (function () {
    function MigratorTypeormStorage(connectionOptions) {
        this.connectionOptions = connectionOptions;
    }
    MigratorTypeormStorage.getMigrationInfo = function (migration) {
        return {
            name: migration.name,
            filename: migration.filename,
            status: migration.status,
            timeTaken: migration.timeTaken,
            startDate: migration.startDate,
            endDate: migration.endDate,
            result: migration.result,
        };
    };
    MigratorTypeormStorage.prototype.getPerformedMigrations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection, repository, migrations, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        repository = connection.getRepository(Migration);
                        return [4 /*yield*/, repository.find({
                                where: {
                                    status: common_1.MigrationStatus.COMPLETE,
                                },
                            })];
                    case 3:
                        migrations = _a.sent();
                        return [2 /*return*/, migrations.map(function (migration) { return MigratorTypeormStorage.getMigrationInfo(migration); })];
                    case 4:
                        e_1 = _a.sent();
                        console.error("Fetching performed migrations failed", e_1.stack);
                        return [2 /*return*/, []];
                    case 5: return [4 /*yield*/, connection.close()];
                    case 6:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    MigratorTypeormStorage.prototype.insertMigration = function (name, filename) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, repository, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        repository = connection.getRepository(Migration);
                        return [4 /*yield*/, repository.save({
                                name: name,
                                filename: filename,
                                status: common_1.MigrationStatus.RUNNING,
                            })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        e_2 = _a.sent();
                        console.error("Inserting migration failed", e_2.stack);
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, connection.close()];
                    case 6:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    MigratorTypeormStorage.prototype.updateMigration = function (name, status, result, timeTaken) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, repository, migration, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConnection()];
                    case 1:
                        connection = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, 6, 8]);
                        repository = connection.getRepository(Migration);
                        return [4 /*yield*/, repository.findOne(name)];
                    case 3:
                        migration = _a.sent();
                        if (!migration) {
                            throw new Error("Migration called \"" + name + "\" was not found");
                        }
                        migration.status = status;
                        migration.result = result;
                        migration.timeTaken = timeTaken;
                        return [4 /*yield*/, repository.save(migration)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 5:
                        e_3 = _a.sent();
                        console.error("Updating migration failed", e_3.stack);
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, connection.close()];
                    case 7:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    MigratorTypeormStorage.prototype.getConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var existingConnection, e_4, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        existingConnection = typeorm_1.getConnection(exports.DATABASE_CONNECTION_NAME);
                        return [4 /*yield*/, existingConnection.close()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_4 = _a.sent();
                        return [3 /*break*/, 3];
                    case 3: return [4 /*yield*/, typeorm_1.createConnection(__assign({}, this.connectionOptions, { name: exports.DATABASE_CONNECTION_NAME, entities: [Migration], synchronize: true }))];
                    case 4:
                        connection = _a.sent();
                        // throw error if failed to actually connect
                        if (!connection.isConnected) {
                            throw new Error("Connecting to migrator-js database failed (" + JSON.stringify(this.connectionOptions) + ")");
                        }
                        return [2 /*return*/, connection];
                }
            });
        });
    };
    return MigratorTypeormStorage;
}());
exports.default = MigratorTypeormStorage;
//# sourceMappingURL=index.js.map