(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("TNA/RoundingInformation.aspx")) {
    return {
      status: "NO_ACCESS",
      message: "You do not have access to Rounding Information screen. Please contact HR Admin."
    };
  }

  // Get all rounding patterns
  const allPatterns = await BeaconBar.executeFunction("getRoundingInformation")();

  if (!allPatterns || allPatterns.length === 0) {
    return {
      status: "NOT_FOUND",
      message: "No rounding patterns found in the system"
    };
  }

  // Helper function to extract rounding info from HTML
  function extractRoundingInfoFromHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const result = {};

    // Pattern Name
    const patternInput = doc.querySelector('#ctl00_body_txtRoundingPatternName');
    result.patternName = patternInput?.value || '';

    // Pattern Type (General or Range)
    const radioGeneral = doc.querySelector('#ctl00_body_rbtnGeneral');
    const radioRange = doc.querySelector('#ctl00_body_rbtnRange');
    if (radioGeneral?.checked) {
      result.patternType = 'General';
    } else if (radioRange?.checked) {
      result.patternType = 'Range';
    } else {
      result.patternType = 'Unknown';
    }

    // Rounding Method
    const methodSelect = doc.querySelector('#ctl00_body_cboMethod');
    if (methodSelect) {
      const selectedOption = methodSelect.options[methodSelect.selectedIndex];
      result.roundingMethod = selectedOption?.textContent.trim() || methodSelect.value;
    }

    // Rounding Value
    const numValInput = doc.querySelector('#ctl00_body_txtNumVal');
    result.roundingValue = numValInput?.value || '';

    return result;
  }

  // If user provides specific pattern code OR name, return only that pattern
  if (args.patternCode || args.patternName) {
    let matchedPattern = null;

    // Search by code if provided
    if (args.patternCode) {
      matchedPattern = allPatterns.find(x => x.code === args.patternCode);
    }
    
    // Search by name if code not found or not provided
    if (!matchedPattern && args.patternName) {
      matchedPattern = allPatterns.find(x => 
        x.name && x.name.toLowerCase().includes(args.patternName.toLowerCase())
      );
    }
    
    if (!matchedPattern) {
      const searchedBy = args.patternCode ? `code "${args.patternCode}"` : `name "${args.patternName}"`;
      return {
        status: "NOT_FOUND",
        message: `Rounding pattern with ${searchedBy} not found`
      };
    }

    const htmlResult = await BeaconBar.executeFunction("openRoundingInformation")(matchedPattern);
    const details = extractRoundingInfoFromHTML(htmlResult);

    return {
      status: "SUCCESS",
      message: `Rounding information retrieved successfully`,
      pattern: {
        code: matchedPattern.code,
        name: matchedPattern.name || details.patternName,
        patternName: details.patternName,
        patternType: details.patternType,
        roundingMethod: details.roundingMethod,
        roundingValue: details.roundingValue
      }
    };
  }

  // If no specific code or name provided, return ALL patterns with their details
  const allPatternDetails = [];
  
  for (const pattern of allPatterns) {
    try {
      const htmlResult = await BeaconBar.executeFunction("openRoundingInformation")(pattern);
      const details = extractRoundingInfoFromHTML(htmlResult);
      
      allPatternDetails.push({
        code: pattern.code,
        name: pattern.name || details.patternName,
        patternName: details.patternName,
        patternType: details.patternType,
        roundingMethod: details.roundingMethod,
        roundingValue: details.roundingValue
      });
    } catch (error) {
      // If one pattern fails, still continue with others
      allPatternDetails.push({
        code: pattern.code,
        name: pattern.name,
        error: "Failed to load details"
      });
    }
  }

  return {
    status: "SUCCESS",
    message: `Found ${allPatternDetails.length} rounding pattern(s)`,
    count: allPatternDetails.length,
    patterns: allPatternDetails
  };
})