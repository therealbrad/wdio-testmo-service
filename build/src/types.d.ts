export interface TestmoServiceOptions {
    /**
     * Location of CSV file
     */
    csv: string;
    /**
     * Array of Priority Short Names
     */
    priorities: string[];
}
export interface CsvRow {
    "Case ID": string;
    "Priority": string;
}
