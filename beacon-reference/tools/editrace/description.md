# editRace

**Task:** Editing Race Information

**Tags:** EIMAdmin, Nationality&ReligionInformation

**Status:** live

## Description

Edit an existing race record. Only change the record that the user asked to edit. Do not change any other record.

If user provides new race name like ""/empty, tell user that race name should not be empty.

## Signature

```
editRace
```

## Arguments

- `raceCode` (string, optional) — race code to search for and then edit (required)
- `raceName` (string, optional) — A partial or full name used to search for races.
- `newRaceName` (string, optional) — The new name to update the race record, optional if no change is needed.
- `raceDescription` (string, optional) — The updated description for the race, optional if no change is needed.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
