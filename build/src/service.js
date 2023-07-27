"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const logger_1 = __importDefault(require("@wdio/logger"));
const log = (0, logger_1.default)("wdio-testmo-service");
var mochaOptsGrepOriginal;
class TestmoService {
    constructor(_options) {
        this._options = _options;
    }
    // If a hook returns a promise, WebdriverIO will wait until that promise is resolved to continue.
    beforeSession(config) {
        return __awaiter(this, void 0, void 0, function* () {
            log.debug("Starting Testmo Service");
            log.debug(`Testmo Service Options: ${JSON.stringify(this._options)}`);
            if (config.mochaOpts instanceof Object) {
                if (config.mochaOpts.grep) {
                    const originalGrep = config.mochaOpts.grep instanceof RegExp ? config.mochaOpts.grep.source : config.mochaOpts.grep;
                    const tags = originalGrep.split(/[^a-z0-9@]/i).filter((item) => item.includes("@"));
                    const noTags = originalGrep.split(/[^a-z0-9@]/i).filter((item) => !item.includes("@") && item.length > 0);
                    if (tags.length > 0 && !config.mochaOpts.invert) {
                        log.debug("There are tags");
                        if (noTags.length === 0) {
                            log.debug("There are only tags");
                            const tm_grep = yield this.selectCases();
                            config.mochaOpts["grep"] = "/^(((?!@)|(" + tags.join("|") + ")).)*(" + tm_grep.substring(1, tm_grep.length - 1) + ")/";
                        }
                        else {
                            log.debug("Mix of tags and no tags");
                            config.mochaOpts["grep"] =
                                "/^(((?!@)|(" + tags.join("|") + ")).)*(" + originalGrep.replace(/^(?:\/|\s)*|\B@[a-z0-9_-]+|(?:\/|\s)*$/gi, "").trim() + ")/";
                        }
                    }
                    else {
                        log.debug("mochaOpts.grep supplied without tags. Ignoring CSV file.");
                    }
                }
                else {
                    log.debug("No mochaOpts.grep defined. Filtering cases according to CSV file.");
                    config.mochaOpts["grep"] = yield this.selectCases();
                }
            }
            else {
                log.debug("No mochaOpts.grep defined. Filtering cases according to CSV file.");
                config.mochaOpts = {
                    grep: yield this.selectCases(),
                };
            }
            log.debug(`Updated mochaOpts.grep: ${config.mochaOpts.grep}`);
            log.info("Testmo Service done");
        });
    }
    loadCSV(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = [];
            return new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe((0, csv_parser_1.default)())
                    .on("data", (row) => {
                    rows.push(row);
                })
                    .on("end", () => {
                    resolve(rows);
                })
                    .on("error", (error) => {
                    reject(error);
                });
            });
        });
    }
    selectCases() {
        return __awaiter(this, void 0, void 0, function* () {
            log.info(`Reading Test Case IDs and Priorities from ${this._options.csv}`);
            try {
                const rows = yield this.loadCSV(this._options.csv);
                const caseIDs = rows.filter((row) => this._options.priorities.includes(row.Priority)).map((row) => row["Case ID"]);
                return caseIDs.join("|");
            }
            catch (error) {
                throw new Error("Error reading CSV and extracting Case IDs: " + error);
            }
        });
    }
}
exports.default = TestmoService;
