# Beacon tool patterns

Auto-generated from 381 exported tool(s) and 182 function(s) by `npm run beacon:export`. Regenerated on every export — do not hand-edit; add durable notes to README.md instead.

## Permission / menu-access checks

Code that gates behavior on a user permission, role, or menu-access flag before proceeding.

- `tools/adminemployeetrainingneedapplication/transformer.js`: `const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/TrainingNeed/Index?mvc=1&bs=4&App=000007"));`
- `tools/adminemployeetrainingnomination/transformer.js`: `const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/ApplyTraining/Index?mvc=1&bs=4&App=000007"));`
- `tools/getadmintrainingneeds/transformer.js`: `const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/TrainingNeed/Index?mvc=1&bs=4&App=000007"));`
- `tools/getselfemployeeparticipationconfirmation/transformer.js`: `const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/Participation/Index?mvc=1&bs=4&App=000001"));`
- `tools/getselfemployeetraineeevaluationdetails/transformer.js`: `const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/TraineeEvaluation/Index?mvc=1&bs=4"));`

## Authentication headers

Requests attaching an auth/bearer/session header to an outgoing call.

- `tools/getpolicydocs/transformer.js`: `myHeaders.append("x-api-key", "your_secret_key");`

## Request construction

HTTP client usage (fetch/axios/XHR) building outbound requests.

- `tools/adminemployeetrainingneedapplication/transformer.js`: `response = await fetch(url, {`
- `tools/adminemployeetrainingnomination/transformer.js`: `response = await fetch(url, {`
- `tools/createbenefitclearanceheadinformation/transformer.js`: `const initialResponse = await fetch(url, { method: "GET", headers });`
- `tools/createcountry/transformer.js`: `const newResponse = await fetch(url, {`
- `tools/createcurrencytype/transformer.js`: `const newResponse = await fetch(url, {`

## Argument validation

Explicit checks that a required argument/field is present or well-formed.

- `tools/createbenefitclearanceheadinformation/transformer.js`: `// Validate required fields`
- `tools/createcurrencytype/transformer.js`: `// Validate required fields`
- `tools/createqualificationdetails/transformer.js`: `// Validate required fields`
- `tools/createqualificationproperty/transformer.js`: `/* Step 2: Save with all required fields */`
- `tools/createstationinformation/transformer.js`: `// Validate required fields`

## Date formatting

Date/time formatting or parsing utilities.

- `tools/adminemployeetrainingnomination/transformer.js`: `return { iso: new Date(parts.ms).toISOString(), display };`
- `tools/changeorupdateshiftadjustment/transformer.js`: `function formatDate(inputDate) {`
- `tools/getadmintrainingneeds/transformer.js`: `return { iso: new Date(parts.ms).toISOString(), display };`
- `tools/getselftrainingneeds/transformer.js`: `return { iso: new Date(parts.ms).toISOString(), display };`
- `tools/getsupervisortrainingneeds/transformer.js`: `return { iso: new Date(parts.ms).toISOString(), display };`

## Employee / subordinate selection

Logic that selects an employee, subordinate, or reporting-line record.

- `tools/adminemployeetrainingneedapplication/transformer.js`: `// unlike the Supervisor flow (which sends its FULL pre-loaded subordinate roster`
- `tools/bulkemployees/transformer.js`: `const employeeId = cells[1]?.textContent.trim();`
- `tools/createbenefitclearanceheadinformation/transformer.js`: `if (!args.employeeId) {`
- `tools/createoraddcontractextesiondetails/transformer.js`: `const id = BeaconBar.getSharedData('employeeid');`
- `tools/editbenefitclearanceheadinformation/transformer.js`: `if (args.employeeId) {`

## API error handling

try/catch or status-code branching around an API call.

- `tools/adminemployeetrainingneedapplication/transformer.js`: `} catch (networkError) {`
- `tools/adminemployeetrainingnomination/transformer.js`: `} catch (networkError) {`
- `tools/createcountry/transformer.js`: `} catch (err) {`
- `tools/createdistrict/transformer.js`: `} catch (err) {`
- `tools/createdsdivision/transformer.js`: `} catch (err) {`

## Response transformation

Mapping/reshaping a raw API response before returning it (typical Transformer responsibility).

- `tools/changeorupdateshiftadjustment/transformer.js`: `function transformToUpdatePayload(getApiResponse, previousShiftDetails, updateShiftDetails) {`
- `tools/createprovince/transformer.js`: `return rows.map(r => {`
- `tools/createreportinghierarchydetails/transformer.js`: `...Object.fromEntries(window.checkboxNames.map(name => [name, "on"])),`
- `tools/editbenefitclearanceheadinformation/transformer.js`: `message: `Position "${args.positionName}" not found. Available positions are: ${allPositions.map(p => p.positionName).join(', ')}`,`
- `tools/editmanualinandoutbyadmin/transformer.js`: `availableRosters: rosterList.map(function (r) { return { rosterCode: r.RosterCode, rosterName: r.RosterName }; })`

## Pagination

Page/limit/offset/cursor handling for list endpoints.

- `tools/adminemployeetrainingneedapplication/transformer.js`: `// for Training" page (adminEmployeeTrainingNomination) - ASSUMED here to be the same`
- `tools/adminemployeetrainingnomination/transformer.js`: `// "Nominate for Training" (Admin) page embeds it as a hidden input`
- `tools/createbenefitclearanceheadinformation/transformer.js`: `// STEP 1: Get initial page`
- `tools/createcountry/transformer.js`: `/* Initial page state */`
- `tools/createdistrict/transformer.js`: `* 5) Load a page render to obtain current VIEWSTATE`

## Self vs subordinate vs administrator operations

Branches that distinguish acting on your own record vs a subordinate's vs an admin-level operation.

- `tools/getcompanyhierarchydetails/transformer.js`: `administrator: getValue("#ctl00_body_txtAdminName"),`
- `tools/geteimattributelist/transformer.js`: `administrator: doc.querySelector('#ctl00_body_txtAdminName')?.value || "",`
- `tools/getlocation/transformer.js`: `administrator: document.querySelector('#ctl00_body_txtAdminName')?.value || "",`
