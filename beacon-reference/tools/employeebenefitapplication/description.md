# employeeBenefitApplication

**Task:** Save Benefit Application

**Tags:** BenefitManagement

**Status:** unlive

## Description

in this tool apply the employee benefit application. such benefit types "Data Reimbursement","Fuel Reimbursements","Health Plan","Medical Reimbursement","Parking Reimbursement","Telephone Bill Reimbursement" and "Vehicle Number Registration".  first the employee is available then next step proceed if there is no employee just return no employee information. date format api data format will be take do not take any generate format, must and should data format api date format will be take format.

## Signature

```
employeeBenefitApplication
```

## Arguments

_None._


## Advanced arguments

- `dataReimbursement` (object, optional) — First, execute the 'getApplicationStructure' tool to retrieve and display effective years and months. The user selects a year and month, and their corresponding values (e.g., year '2025' corresponds to '1') are taken from the 'getApplicationStructure' response and used when applying the benefit.
- `fuelReimbursements` (object, optional) — First, execute the 'getApplicationStructure' tool to retrieve related data.
- `medicalReimbursement` (object, optional) — First, execute the 'getApplicationStructure' tool to retrieve related data.
- `parkingReimbursement` (object, optional)
- `telephoneBillReimbursement` (object, optional) — First, execute the 'getApplicationStructure' tool to retrieve related data. if the user any format you convert in this format dd/mm/yyy example '27/05/2025'
- `vehicleNumberRegistration` (object, optional) — First, execute the 'getApplicationStructure' tool to retrieve related data. if the user any format you convert in this format dd/mm/yyy example '27/05/2025'
- `healthPlan` (object, optional) — First, execute the 'healthPlanDependentDetails' tool to retrieve related data.


## Assigned agents

- BenefitManagement (`690dc571931a2d61ba0b1be9`)
