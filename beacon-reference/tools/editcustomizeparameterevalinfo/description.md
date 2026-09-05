# editCustomizeParameterEvalInfo

**Tags:** Perf, DummyL

**Status:** live

## Description

Before calling this please call 'getEvaluationInformationConfigurationDetails' to get the current list of parameters and values, and update only the changed parameter values from what the user has provided. Please remove anything the user has not changed from the parametersList

This tool will be used to toggle a given list of parameters for a given evaluation.

## Signature

```
editCustomizeParameterEvalInfo
```

## Arguments

_None._


## Advanced arguments

- `evaluationName` (string, required) — The name of the evaluation we want to update the parameters of
- `parameterList` (array, required) — List of parameters to update for the evaluation

