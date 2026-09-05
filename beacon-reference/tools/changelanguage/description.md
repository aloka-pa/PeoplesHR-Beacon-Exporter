# changeLanguage

**Task:** Change The Language

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

If the user requests a change in the assigned language, first execute the "getAssignLanguageDetails" tool. Then, after execute for "updateLanguagesDetails" tool.proceed with the then execute for "changeLanguage" tool, execute the "updateEmployeeInformationDetails" tool to complete the update.Before calling the APIs, reset the existing grade values. Prompt the user to provide new Reading, Writing, and Speaking grade selections. Display the list of available grades, and allow the user to choose one grade for each skill. in the api payload fields get to before api data get "updateEmployeeInformationDetails" tool. if the user change the language fields do not take grade values for "updateEmployeeInformationDetails" tool. display the all grade values prove by "changeLanguage" tool. select new grades don not take for old grades.

## Signature

```
changeLanguage
```

## Arguments

_None._


## Advanced arguments

- `languageCode` (string, required) — The selected language code. Example: '000001' for English. to get before api example value as return
- `readingEnabled` (string, required) — Checkbox indicating if READING is selected. Value is 'on' if checked. to get before api value do not dynamically filled
- `readingRating` (string, required) — Rating selected for READING. Examples: '5' = Excellent, '8' = Average. to get before api value what user select corresponding value return
- `writingEnabled` (string, required) — Checkbox indicating if WRITING is selected. Value is 'on' if checked.
- `writingRating` (string, required) — Rating selected for WRITING. Examples: '5' = Excellent, '8' = Average.to get before api value what user select corresponding value return
- `speakingEnabled` (string, required) — Checkbox indicating if SPEAKING is selected. Value is 'on' if checked.
- `speakingRating` (string, required) — Rating selected for SPEAKING. Examples: '5' = Excellent, '8' = Average.to get before api value what user select corresponding value return
- `employeeNumber` (string, required) — Unique identifier assigned to the employee. Example: '000001'.


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
