(async function (data, args, reqOptions) {
  try {
    // Defensive: guard every step so a missing/malformed BeaconBar context resolves to
    // a clean NO_ACCESS response instead of an opaque synchronous exception (same
    // pattern as every other drafts/* tool in this build).
    const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
    const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/NeedConverter/Index?mvc=1&bs=4"));
    if (!hasAccess) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin"
      };
    }

    const keyword = args.keyword ? String(args.keyword).trim().toLowerCase() : "";

    // Word-based matching, not literal substring matching. Confirmed live this matters:
    // a raw request titled "Git and Version Control Training" does NOT contain the literal
    // substring "git version control" (the word "and" breaks it), and a course titled
    // "Learn DevOps & Development Best Practices" does NOT contain the literal substring
    // "DevOps & Development Practices" (the word "Best" breaks it) - yet both are exactly
    // the right match for a user asking about "git version control". Tokenizing both sides
    // and requiring every keyword word to appear somewhere in the target text (in any
    // order, ignoring filler words like "and"/"the") handles both cases correctly.
    function tokenize(text) {
      return (text || "").toLowerCase().match(/[a-z0-9]+/g) || [];
    }
    function containsAllWords(haystackText, words) {
      if (words.length === 0) return false;
      const haystackWords = new Set(tokenize(haystackText));
      return words.every((w) => haystackWords.has(w));
    }
    const keywordWords = tokenize(keyword);

    const headers = new Headers();
    headers.append("Accept", "*/*");
    headers.append("Content-Type", "application/json");
    headers.append("x-requested-with", "XMLHttpRequest");

    async function postJson(path, body) {
      const url = `${window.origin}/${reqOptions.sl}/${path}`;
      let response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: headers,
          body: body !== undefined ? JSON.stringify(body) : undefined
        });
      } catch (networkError) {
        throw new Error(`Could not reach ${path}: ${networkError.message}`);
      }
      const rawText = await response.text();
      let parsed = null;
      try {
        parsed = rawText ? JSON.parse(rawText) : null;
      } catch (parseError) {
        throw new Error(`${path} returned a non-JSON response (HTTP ${response.status}).`);
      }
      if (!response.ok) {
        const detail = (parsed && (parsed.Message || (parsed.Status && parsed.Status.Message))) || rawText.slice(0, 200);
        throw new Error(`${path} failed with HTTP ${response.status}: ${detail}`);
      }
      return parsed;
    }

    // Step 1: fetch every training-need record, at every conversion stage.
    // Confirmed live shape: { Status, ConvertList: [...], NotConvertList: [...],
    // CompleteList: [...], MainNeed: [{needcode, needname}] }. ConvertList/NotConvertList/
    // CompleteList each hold raw, individual employee-submitted need requests
    // ({needcode, needname, requestneed, needdesc, objective, empno/displayempno/empname,
    // appdate, course, ...}) - NOT one-record-per-category. Multiple raw requests can (and
    // do, per a real live capture) share the same needcode/needname - e.g. needcode
    // "000006"/"DevOps & Development Practices" grouped a raw request literally titled
    // "Git and Version Control Training".
    const needData = await postJson("TNDV9/NeedConverter/GetNeedConverterDetails", undefined);
    if (!needData || !needData.Status || needData.Status.IsSuccessfull !== true) {
      return {
        status: "ERROR",
        message: (needData && needData.Status && needData.Status.Message) || "Failed to retrieve training needs"
      };
    }

    const convertList = Array.isArray(needData.ConvertList) ? needData.ConvertList : [];
    const notConvertList = Array.isArray(needData.NotConvertList) ? needData.NotConvertList : [];
    const completeList = Array.isArray(needData.CompleteList) ? needData.CompleteList : [];

    const allRequests = [
      ...convertList.map((r) => Object.assign({ _stage: "Convertible" }, r)),
      ...notConvertList.map((r) => Object.assign({ _stage: "NotConvertible" }, r)),
      ...completeList.map((r) => Object.assign({ _stage: "Completed" }, r))
    ];

    // Step 2: group raw requests by needcode. Confirmed live: an Admin converts several
    // narrow raw requests (e.g. "MS Word", "MS Excel", "MS PowerPoint") into one merged
    // need category (e.g. "MS Office") and creates ONE course from that merged category
    // (e.g. "MS Office Training Course for ABC Workers") - the resulting course is a
    // property of the needcode CATEGORY, not of any single raw request underneath it. A
    // real live capture showed this directly: needcode "000006" ("DevOps & Development
    // Practices") already has a real course created for it (confirmed separately via
    // TNDV9/Course/GetMasterData's R_Need field), but a newer raw request submitted under
    // that same needcode ("Git and Version Control Training") still showed its own
    // "course" field blank - it just hasn't been individually reviewed/merged in yet. So
    // the category-level course (if ANY request sharing this needcode has one) is the
    // right thing to surface, not any single record's own course field in isolation.
    const categoriesByCode = {};
    allRequests.forEach((r) => {
      const code = r.needcode || "";
      if (!categoriesByCode[code]) {
        categoriesByCode[code] = {
          needCode: code,
          needName: r.needname || "",
          assignedCourseName: "",
          requests: []
        };
      }
      const category = categoriesByCode[code];
      if (r.course && !category.assignedCourseName) {
        category.assignedCourseName = r.course;
      }
      category.requests.push({
        requestNeed: r.requestneed || "",
        needDescription: r.needdesc || "",
        objective: r.objective || "",
        requestedBy: r.empname || "",
        requestedByEmployeeNumber: r.displayempno || "",
        applicationDate: r.appdate || "",
        conversionStatus: r._stage
      });
    });

    let categories = Object.values(categoriesByCode).map((category) => ({
      needCode: category.needCode,
      needName: category.needName,
      // "Completed" once ANY request under this needcode carries a real course name -
      // this is the category-level status, distinct from any single request's own stage.
      conversionStatus: category.assignedCourseName ? "Completed" : (category.requests.some((r) => r.conversionStatus === "Convertible") ? "Convertible" : "NotConvertible"),
      assignedCourseName: category.assignedCourseName || null,
      requests: category.requests
    }));

    // Step 3: apply the keyword filter, if given - matches the merged category name
    // (e.g. "MS Office") as well as each raw request's own submitted text/description
    // (e.g. "MS Excel"), since a user describing their need will usually use the narrow
    // term, not the category name an Admin later chose.
    if (keywordWords.length > 0) {
      categories = categories.filter((category) =>
        containsAllWords(category.needName, keywordWords) ||
        category.requests.some((r) =>
          containsAllWords(`${r.requestNeed} ${r.needDescription}`, keywordWords)
        )
      );
    }

    // Step 4: for any matched category that still has no assignedCourseName (the common
    // case, per the live capture above - CompleteList was empty and no record had a
    // populated course), fall back to a direct name match against the course catalog
    // itself. Confirmed live: a need category and its resulting course are frequently
    // given the exact same name (e.g. "DevOps & Development Practices" is both the
    // needname AND the CosTitle of the course created from it) - TNDV9/Course/GetAllCourses
    // gives the full course catalog (CosCode/CosTitle/CosDesc) in one call. This is a
    // heuristic, name-based fallback, NOT an official conversion record - flagged as such
    // in the response (possibleCourseMatchIsInferred) so the agent doesn't overstate it.
    const categoriesNeedingCourseLookup = keywordWords.length > 0
      ? categories.filter((c) => !c.assignedCourseName)
      : [];
    if (categoriesNeedingCourseLookup.length > 0) {
      const coursesData = await postJson("TNDV9/Course/GetAllCourses", { WFMainID: "" });
      const courses = (coursesData && Array.isArray(coursesData.Courses)) ? coursesData.Courses : [];
      categoriesNeedingCourseLookup.forEach((category) => {
        // Match using the CATEGORY's own name (e.g. "DevOps & Development Practices"),
        // not the user's raw keyword - the category name is what the resulting course was
        // actually named after, whereas the user's keyword (e.g. "git version control")
        // describes the narrow raw request instead and won't reliably appear in the
        // course title/description at all.
        const categoryWords = tokenize(category.needName);
        const match = courses.find((c) =>
          containsAllWords(`${c.CosTitle || ""} ${c.CosDesc || ""}`, categoryWords)
        );
        if (match) {
          category.assignedCourseName = match.CosTitle || match.CosDesc || "";
          category.possibleCourseMatchIsInferred = true;
          // Bug fix (confirmed live): conversionStatus was computed in Step 3, before
          // this fallback runs - without this line a category could come back with
          // conversionStatus "Convertible" while assignedCourseName was already
          // populated by the name match, which is self-contradictory. Keep them in sync.
          category.conversionStatus = "Completed";
        }
      });
    }

    if (categories.length === 0) {
      return {
        status: "SUCCESS",
        message: keyword
          ? `No training need matching "${args.keyword}" was found.`
          : "No training needs are currently on file.",
        needCategories: []
      };
    }

    return {
      status: "SUCCESS",
      message: `Found ${categories.length} matching training need categor${categories.length === 1 ? "y" : "ies"}.`,
      needCategories: categories
    };

  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error);
    return {
      status: "ERROR",
      message: `Failed to retrieve training needs: ${errorMessage}`,
      error: errorMessage
    };
  }
})
