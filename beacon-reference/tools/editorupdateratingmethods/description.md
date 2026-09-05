# editOrUpdateRatingMethods

**Task:** Updating Rating Methods

**Tags:** EIM, Headers

**Status:** live

## Description

editOrUpdateRatingMethods , before calling this api. must be first execute for "getEIMAttributeList" api. to get the corresponding values in the api. if the user update values give then take for update value. if the user not update to get previous data. marks values format using example format example "10.00" , 15.00"

## Signature

```
editOrUpdateRatingMethods
```

## Arguments

- `ratingMethod` (string, required) — ratingMethod , SkillRating
- `Grade` (string, required) — grade , Ex:- "1" or "A"
- `minimumMarks` (string, required) — minimumMarks , Ex:- "10.00" , 15.00". user give any format marks to take example format. must return example format values
- `maximumMarks` (string, required) — maximumMarks , "100.00" , "200.00". user give any format marks to take example format.must return example format values


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
