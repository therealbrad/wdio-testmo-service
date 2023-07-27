import { Options, Services } from "@wdio/types";
import type { TestmoServiceOptions, CsvRow } from "./types";
export default class TestmoService implements Services.ServiceInstance {
    private _options;
    constructor(_options: TestmoServiceOptions);
    beforeSession(config: Options.Testrunner): Promise<void>;
    loadCSV(filePath: string): Promise<CsvRow[]>;
    selectCases(): Promise<string>;
}
