# getSupervisorTrainingNeeds

**Task:** Displaying Existing Training Needs (Supervisor)

**Tags:** T&D, Aloka, phase3

**Status:** live

## Description

Lists the training needs on file within a Supervisor's scope: the master list of company-wide existing need categories (e.g. 'DevOps & Development Practices') plus every individual need record visible to the Supervisor (own team), each with status/objective/relevance/benefit fields. Displaying Existing Training Needs) for the Supervisor persona - broader than getSelfTrainingNeeds, scoped to the team rather than just the requester. Supports an optional keyword filter (word-based match). 
Only use this when the request explicitly signals team/subordinate scope, e.g. 'what training needs does my team have'. 
A generic 'what training needs are available' should use getSelfTrainingNeeds instead - never ask the user to confirm they're a Supervisor to decide which tool to call.

## Signature

```
getSupervisorTrainingNeeds
```

## Arguments

- `keyword` (string, optional) — Optional. A word or phrase to narrow the results by (e.g. 'MS Excel', 'DevOps') - matched word-by-word (every word here must appear somewhere in the target text, in any order) against the existing need category names and individual need records.


## Advanced arguments

_None._


## Assigned agents

- Training and Development (`6955261cad06de92910e10aa`)
