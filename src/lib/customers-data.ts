import fs from "fs";
import path from "path";
import type { CustomerRow } from "./customers";

export function loadCustomers(): CustomerRow[] {
  const csvPath = path.join(process.cwd(), "data", "helix_customers.csv");
  const csv = fs.readFileSync(csvPath, "utf-8").trim();
  const [headerLine, ...lines] = csv.split("\n");
  const headers = headerLine.split(",");
  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(
      headers.map((header, i) => [header, values[i] ?? ""]),
    );
  });
}
