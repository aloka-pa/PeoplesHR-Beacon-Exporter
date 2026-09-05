# getPayslip

**Task:** getPayslipforEmployee

**Tags:** Payroll, Headers

**Status:** live

## Description

getPayslipforEmployee , show the particular currency symbol of that payslip data amount
-> call the getPaySlipInitialData agent to get the year, schedule, pfcode
-> if the user query mention to download the payslip to return key is "Download" other wise do not mention download return null

## Signature

```
getPayslip
```

## Arguments

- `employeeid` (string, optional) — employeeid , (optional) dont ask user for employee id,Ex:- employeeid  is like "000003"
- `year` (string, required) — year , Ex:- "2025", takes user consent for this 
- `schedule` (string, required) — month , Ex:- "12", takes user consent for this 
- `type` (string, optional) — if the user ask download payslip to return key is "Download" other wise do not mention download return null and dont ask type for user
- `pfCode` (integer, required) — PFCode , Ex:- 1 


## Advanced arguments

_None._


## Assigned agents

- PayRoll (`690dc572931a2d61ba0b1c51`)
