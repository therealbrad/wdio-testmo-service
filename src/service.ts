import { Options, Services } from "@wdio/types";
import type { TestmoServiceOptions, CsvRow } from "./types";
import logger from "@wdio/logger";
import * as fs from "fs";
import csvParser from "csv-parser";

const log = logger("wdio-testmo-service");
var mochaOptsGrepOriginal: String | RegExp;
export default class TestmoService implements Services.ServiceInstance {
	constructor(private _options: TestmoServiceOptions) {}

	// If a hook returns a promise, WebdriverIO will wait until that promise is resolved to continue.
	async beforeSession(config: Options.Testrunner) {
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
						const tm_grep = await this.selectCases();
						config.mochaOpts["grep"] = "/^(((?!@)|(" + tags.join("|") + ")).)*(" + tm_grep.substring(1, tm_grep.length - 1) + ")/";
					} else {
						log.debug("Mix of tags and no tags");
						config.mochaOpts["grep"] =
							"/^(((?!@)|(" + tags.join("|") + ")).)*(" + originalGrep.replace(/^(?:\/|\s)*|\B@[a-z0-9_-]+|(?:\/|\s)*$/gi, "").trim() + ")/";
					}
				} else {
					log.debug("mochaOpts.grep supplied without tags. Ignoring CSV file.");
				}
			} else {
				log.debug("No mochaOpts.grep defined. Filtering cases according to CSV file.");
				config.mochaOpts["grep"] = await this.selectCases();
			}
		} else {
			log.debug("No mochaOpts.grep defined. Filtering cases according to CSV file.");
			config.mochaOpts = {
				grep: await this.selectCases(),
			};
		}
		log.info("Testmo Service done");
		log.debug(`Updated mochaOpts.grep: ${config.mochaOpts.grep}`);
	}

	async loadCSV(filePath: string): Promise<CsvRow[]> {
		const rows: CsvRow[] = [];

		return new Promise((resolve, reject) => {
			fs.createReadStream(filePath)
				.pipe(csvParser())
				.on("data", (row: CsvRow) => {
					rows.push(row);
				})
				.on("end", () => {
					resolve(rows);
				})
				.on("error", (error: Error) => {
					reject(error);
				});
		});
	}

	async selectCases(): Promise<string> {
		log.info(`Reading Test Case IDs and Priorities from ${this._options.csv}`);
		try {
			const rows = await this.loadCSV(this._options.csv);
			const caseIDs = rows.filter((row) => this._options.priorities.includes(row.Priority)).map((row) => row["Case ID"]);
			return caseIDs.join("|");
		} catch (error) {
			throw new Error("Error reading CSV and extracting Case IDs: " + error);
		}
	}
}
