# updateEmployeeInformationDetails

**Task:** Update Employee Information Details

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

When a user submits a query, it should be analyzed to determine the specific update category, such as 'educationalAndProfessionalQualifications' or any other relevant type. All required fields in the schema must be fully populated—none should be left blank. If any required information is missing, it must be retrieved using the appropriate API. The user should only be prompted if the data is still unavailable, and the AI must not auto-fill these fields. Before fetching API data, ensure that effective dates are captured specifically for qualifications. Do not include or use effective dates related to reimbursements. date format must be take dd/mm/yyyy if the user update date execute date format api get format date and using api response format will be take. do not execute more then two time execute in the api "getEmployeeInformationDetails" api.

## Signature

```
updateEmployeeInformationDetails
```

## Arguments

_None._


## Advanced arguments

- `updateType` (string, required) — Specifies the entity based on the query. This is used to determine the update feature.
- `educationalAndProfessionalQualifications` (object, optional) — Before proceeding with the update, if the user ask query qualificationd details first qualification type exist record or not the after update. no qualification type record no update.first check whether the user is invoking the 'next qualification' API. If so, execute the 'qualificationTypesandQualification' API to fetch the relevant data. The AI must not generate any random dates during this process. The fields 'qualificationEffectStartDate' and 'qualificationEffectEndDate' must be derived solely from qualification data and must not be taken from any reimbursement-related records. All dates should follow the 'dd/mm/yyyy' format.
- `workExperienceDetails` (object, optional) — To populate this schema, first execute the 'workExpDetails' API to fetch all existing work experience data. If the user does not update a specific field, use the corresponding value from the 'workExpDetails' API. must should analize what is human update message or what is before api get data to analize the date range corresponding data types return.
- `membershipDetails` (object, optional) — Before execute in the membership details api, first execute the 'getMembershipDetails' api, then next execute the 'updateMemberShipDetails' api, then finl execute in the api.Schema for validating data submitted to the 'updateMemberShipDetails' api. 'updateMemberShipDetails' api is used to update only the fields explicitly provided by the user. If any field is missing, the API will use corresponding existing values — do not generate or assume dynamic/default values. and some fields are hiden fields cant not update membership type and membership if the user update for check and return validation message return. Note : in the particular use cased no need execute the 'getEmployeeInformationDetails' api.
- `bankDetails` (object, optional) — if the user update credit card details must be updateType value is 'bankDetails'.First, execute the 'specificBankEmployeeDetails' tool to retrieve the initial set of bank details for the employee. If the user does not provide an updated value for a particular field, retain the existing value from the 'specificBankEmployeeDetails' response. No dynamic or inferred data should be added to the schema—only explicitly provided or existing values should be used. If the user requests or refers to an order number (e.g., 1, 2, 3, etc.) that does not match any records, the system should still store the request as a reference but flag that the order number does not match the available records. Additionally, whenever the user intends to update any bank detail fields, they must be prompted to provide a valid order number to ensure accurate record identification and update.
- `creditCardDetails` (object, optional) — if the user update credit card details must be updateType value is 'creditCardDetails'. if the user update the credit card update related query updateType name is 'creditCardDetails'. execute the dateFormat api using date format. First, execute the 'specificCreditCardDetails' tool to retrieve the initial data. If the user does not provide an updated value for any field, use the value from the 'specificCreditCardDetails' response. Do not include any dynamically generated or inferred data. all data schema get then execute finall execute in this tool 'updateEmployeeInformationDetails' tool.
- `passportAndOtherArticles` (object, optional) — Before executing this API, you must first run the 'specificPassportAndOtherArticlesDetails' tool to retrieve the necessary data. If any fields are missing in the user's input, fetch the corresponding values from that tool. After ensuring all required fields are populated, proceed to call the 'updateEmployeeInformationDetails' tool.
- `assigendNonCashBenefit` (object, optional) — Before using this API, must be take updateType value is 'assigendNonCashBenefit' first call the 'specificAssignNonCashBenefitDetails' tool to fetch existing data. If any field is missing from the user’s input, retrieve its value from that tool. Once all required fields are filled, call the 'updateEmployeeInformationDetails' tool.
- `assignLanguage` (object, optional) — if the user update assign language will be take entity value is 'assignLanguage'.if the user any value missing update data value to get for 'updateLanguagesDetails' tool to get all related data. and first execute in this tool 'updateLanguagesDetails' then after related data get after in this tool execute 'updateEmployeeInformationDetails' tool. and if the user change or update language,dont take for before api date gardes. new language gardes are provide for 'languagechange' tool then display new language grades and user selected new grades.


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
