# updateAttachmentTypeDetails

**Task:** Update Attachment Type Details

**Tags:** EIM, Headers

**Status:** live

## Description

In this tool, start by executing the "getEIMAttributeList" API to retrieve the existing data. If any required fields are missing from the user input, fetch the corresponding values using the getEIMAttributeList API to ensure completeness.

## Signature

```
updateAttachmentTypeDetails
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtDesc` (string, required) — Description or name of the attachment type (e.g., 'Attachment from Template Designer Module').
- `ctl00_body_ChkisExpire` (string, required) — Checkbox indicating if the attachment has an expiration (value is 'on' when checked).


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
