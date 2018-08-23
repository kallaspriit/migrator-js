"use strict";
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var chalk_1 = require("chalk");
var path = require("path");
var src_1 = require("../src");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var migrator, _a, pendingMigrations, chosenMigrations, performedMigrations, failedMigrations, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // show an empty line between previous content
                    console.log("");
                    migrator = new src_1.Migrator(
                    // this is the custom context matching MigrationContext
                    {
                        version: "1",
                    }, 
                    // migrator configuration
                    {
                        // pattern for finding the migration scripts
                        pattern: path.join(__dirname, "migrations", "!(*.spec|*.test|*.d).{ts,js}"),
                        // you can use MySQL / MariaDB / Postgres / SQLite / Microsoft SQL Server / Oracle / WebSQL
                        // see http://typeorm.io
                        storage: new src_1.MigratorTypeormStorage({
                            type: "sqlite",
                            database: path.join(__dirname, "..", "..", "migrate.sqlite3"),
                        }),
                    });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 6]);
                    return [4 /*yield*/, migrator.migrate()];
                case 2:
                    _a = _b.sent(), pendingMigrations = _a.pendingMigrations, chosenMigrations = _a.chosenMigrations, performedMigrations = _a.performedMigrations, failedMigrations = _a.failedMigrations;
                    // print results to console
                    if (pendingMigrations.length === 0) {
                        console.error(chalk_1.default.black.bgWhite(" NOTHING TO MIGRATE ") + " ");
                    }
                    else if (chosenMigrations.length === 0) {
                        console.error(chalk_1.default.black.bgWhite(" NO MIGRATIONS CHOSEN ") + " ");
                    }
                    else if (performedMigrations.length > 0 && failedMigrations.length === 0) {
                        console.error(chalk_1.default.black.bgGreen(" ALL MIGRATIONS SUCCEEDED ") + " - " + performedMigrations.length + " total");
                    }
                    else if (performedMigrations.length === 0 && failedMigrations.length > 0) {
                        console.error(chalk_1.default.black.bgRed(" ALL MIGRATIONS FAILED ") + " - " + failedMigrations.length + " total");
                    }
                    else {
                        console.error(chalk_1.default.black.bgYellow(" SOME MIGRATIONS FAILED ") + " - " + performedMigrations.length + " succeeded, " + failedMigrations.length + " failed");
                    }
                    // exit with a non-zero code if any of the migrations failed
                    if (failedMigrations.length === 0) {
                        process.exit(0);
                    }
                    else {
                        process.exit(1);
                    }
                    return [3 /*break*/, 6];
                case 3:
                    e_1 = _b.sent();
                    console.error("" + chalk_1.default.black.bgRed(" RUNNING MIGRATOR FAILED "), e_1.stack);
                    return [3 /*break*/, 6];
                case 4: 
                // gracefully close the connection
                return [4 /*yield*/, migrator.close()];
                case 5:
                    // gracefully close the connection
                    _b.sent();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
run().catch(function (e) { return console.error(chalk_1.default.black.bgRed(" RUNNING MIGRATOR FAILED "), e.stack); });
//# sourceMappingURL=index.js.map