# moreDetailsBenefitApplicationHistoryDetails

**Task:** More Details For Benefit History Details

**Tags:** BenefitManagement, Headers

**Status:** live

## Description

Before executing the "moreDetailsBenefitApplicationHistoryDetails" tool, determine whether the user’s query is related to benefit history for themselves or another employee. Retrieve the relevant benefit history response first.  
If the user specifically requests additional details such as **Entitlement Amount**, **Amount in Bills**, or **Utilized Amount** etc.., then and only then execute the "moreDetailsBenefitApplicationHistoryDetails" tool.  
This tool must always be executed **after** either the **selfEmployeeBenefitHistory** tool or the **getSingleEmployeeBenefitHistory** tool, depending on the user’s context.

## Signature

```
moreDetailsBenefitApplicationHistoryDetails
```

## Arguments

- `ENCRYPT_EMP_NUMBER` (string, required) — based before api benefit history Benefit_Type corresponding ENCRYPT_EMP_NUMBER will be take
- `BET_APP_ID` (string, required) — based before api benefit history Benefit_Type corresponding BET_APP_ID will be take ex : 20, 17 etc..
- `BET_CODE` (string, required) — based before api benefit history Benefit_Type corresponding BET_CODE will be take ex : '200000'
- `fromDate` (string, required) — before user given from date.
- `toDate` (string, required) — before user given to date will be take.
- `BET_APPY_DATE` (string, required) — based before api benefit history Applied Date Benefit_Type corresponding BET_APPY_DATE will be take. 


## Advanced arguments

_None._


## Assigned agents

- BenefitManagement (`690dc571931a2d61ba0b1be9`)
