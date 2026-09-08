# getAdminTrainingNeeds

**Task:** Displaying Existing Training Needs (Admin)

**Tags:** T&D, Aloka, phase3

**Status:** live

## Description

Lists every training need on file company-wide: the master list of existing need categories (e.g. 'DevOps & Development Practices') plus every individual need record visible to an Admin across all employees, each with status/objective/relevance/benefit fields. Displaying Existing Training Needs for the Admin persona - the widest scope of the three variants, not limited to one person or team. Supports an optional keyword filter (word-based match). Only use this when the request explicitly signals company-wide/admin scope, e.g. 'show all logged training needs for review'. 
A generic 'what training needs are available' should use getSelfTrainingNeeds instead - never ask the user to confirm they're an Admin, and never default here since it is the broadest, most sensitive scope of the three.

## Signature

```
getAdminTrainingNeeds
```

## Arguments

- `keyword` (string, optional) — Optional. A word or phrase to narrow the results by (e.g. 'MS Excel', 'DevOps') - matched word-by-word (every word here must appear somewhere in the target text, in any order) against the existing need category names and individual need records.


## Advanced arguments

_None._


## Assigned agents

- Training and Development (`6955261cad06de92910e10aa`)
