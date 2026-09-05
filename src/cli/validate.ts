#!/usr/bin/env node
import "dotenv/config";
import { runValidate } from "../export/validate.js";

runValidate().catch((err) => {
  console.error("Validation failed:", err);
  process.exitCode = 1;
});
