# getExtraCurricularActivityCategory

**Task:** Fetching Extra Curricular Activity Categories

**Tags:** EIMAdmin, ExtraCurricularActivities

**Status:** live

## Description

This transformer works on the Extra Curricular Activity Category master screen (EIM/ExtraCulActivityCatgory.aspx) to retrieve category records. It can search by category code or category name (supports partial matching), and it can also return all available categories when the user asks to “show all / list all / return all”. When returning all (or when many results exist), it reads the UI page size and automatically navigates through all grid pages to collect records across every page, so results are not limited to page 1.

## Signature

```
getExtraCurricularActivityCategory
```

## Arguments

- `categoryCode` (string, optional) — The unique code identifier category code to search (partial supported, but usually exact code works best). Example: "000001"
- `categoryName` (string, optional) — Category name / partial name to search (partial match). Example: "academic"
- `returnAll` (string, optional) — Set to "show all" / "all" / "yes" (or any phrase like "get all", "list", "existing", "available") to return all categories across all pages.
(Also triggers automatically if the user types those keywords inside categoryCode or categoryName.)
- `pageSize` (string, optional) — Initial page size to request on the first grid load (default "10"). After the first response, the transformer adopts the UI page size automatically.
- `maxPages` (string, optional) — Safety limit for how many pages the transformer will scan when collecting records (default is high). Useful to prevent very large pulls.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
