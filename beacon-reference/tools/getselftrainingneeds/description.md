# getSelfTrainingNeeds

**Task:** Displaying Existing Training Needs (Self)

**Tags:** T&D, Aloka, phase3

**Status:** live

## Description

Lists the training needs already on file for the logged-in employee: the master list of company-wide existing need categories (e.g. 'DevOps & Development Practices') plus every individual need record visible in the employee's own scope, each with status/objective/relevance/benefit fields. Covers displaying Existing Training Needs) for the Applicant persona - shown before/while logging a new training need so the user can see what's already on record instead of duplicating it. Supports an optional keyword filter (word-based match, not literal substring). 

This is the default variant - use it for any generic 'what training needs exist/are available' question. 
Do not ask the user whether they are a Supervisor or Admin; only switch to getSupervisorTrainingNeeds or getAdminTrainingNeeds when the request itself explicitly names a broader scope (their team, or company-wide).


## Signature

```
getSelfTrainingNeeds
```

## Arguments

- `keyword` (string, required) — Optional. A word or phrase to narrow the results by (e.g. 'MS Excel', 'DevOps') - matched word-by-word (every word here must appear somewhere in the target text, in any order) against both the existing need category names and the individual needs


## Advanced arguments

_None._


## Assigned agents

- Training and Development (`6955261cad06de92910e10aa`)
