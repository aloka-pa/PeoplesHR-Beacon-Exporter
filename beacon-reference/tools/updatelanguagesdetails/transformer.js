(async function (data, args, reqOptions) {

    if (!BeaconBar.user.metaData.menus.includes("EIM/AssignLanguage.aspx")) {
        return "It seems you don't have access. Please check with the HR Admin";
    }

    const empEnc = await BeaconBar.executeFunction("employeeEncryptId")(window.language.publicKey, args.id);

    const editResponse = await BeaconBar.executeFunction('module')({
        scrollLeft: "0",
        scrollTop: "0",
        __EVENTTARGET: args.updateId,
        __EVENTARGUMENT: "",
        __LASTFOCUS: "",
        __VIEWSTATE: window.language.viewState,
        __VIEWSTATEGENERATOR: window.language.viewStateGen,
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: window.language.eventValidation,
        "ctl00$hdnDateFormat": "m/d/yy",
        "ctl00$hdnQuickmenu": "1",
        "ctl00_body_RadWindowManager1_ClientState": "",
        "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$cboLanuage": "-1",
        "ctl00$body$txtPublicKey": window.language.publicKey,
        "ctl00$body$txtEmpNumber": empEnc,
        "ctl00$body$grdLanuages$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdLanuages_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdLanuages$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
        "ctl00_body_grdLanuages_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdLanuages_ClientState": ""
    }, `${reqOptions.sl}/EIM/AssignLanguage.aspx`);

    const parser = new DOMParser();
    const document = parser.parseFromString(editResponse.rawData, "text/html");

    window.language = editResponse;

    const languageSelect = document.querySelector("#ctl00_body_cboLanuage");
    const readingSelect = document.querySelector("#ctl00_body_cboLanGradeReading");
    const writingSelect = document.querySelector("#ctl00_body_cboLanGradeWriting");
    const speakingSelect = document.querySelector("#ctl00_body_cboLanGradeSpeaking");

    const selectedLanguage = {
        label: languageSelect.options[languageSelect.selectedIndex].textContent.trim(),
        value: languageSelect.value
    };

    const reading = {
        label: readingSelect.options[readingSelect.selectedIndex].textContent.trim(),
        value: readingSelect.value
    };

    const writing = {
        label: writingSelect.options[writingSelect.selectedIndex].textContent.trim(),
        value: writingSelect.value
    };

    const speaking = {
        label: speakingSelect.options[speakingSelect.selectedIndex].textContent.trim(),
        value: speakingSelect.value
    };

    const ratingGrades = Array.from(readingSelect.options)
        .filter(option => option.value !== "-1")
        .map(option => ({
            gradeKey: option.value,
            gradeValue: option.textContent.trim()
        }));

    const selectedLanguageDetails = {
        language: selectedLanguage,
        READING: reading,
        WRITING: writing,
        SPEAKING: speaking
    };
    return { selectedLanguageDetails, ratingGrades };

});
