import { z } from "zod";

// https://docs.google.com/spreadsheets/d/1Y1e2IONJqSt1jPE4-DNrzGjR4OSXunAMGBKf_Q9DiVU/edit?gid=0#gid=0

// fetcher
export const fetchSheet = <T extends z.ZodType>(name: string, schema: T) => {
  const { GOOGLE_SHEET_ID } = import.meta.env;
  if (!GOOGLE_SHEET_ID) {
    throw new Error("No Google Sheet ID inside environment variables");
  }

  return fetch(`https://opensheet.elk.sh/${GOOGLE_SHEET_ID}/${name}`)
    .then((p) => p.json())
    .then((data) => z.array(schema).parseAsync(data));
};
