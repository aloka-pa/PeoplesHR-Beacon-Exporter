(async function (data, args, reqOptions) {
    if (args.entity === "location") {

        if (!BeaconBar.user.metaData.menus.includes("EIM/Location.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Location.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`
        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$hdnIsHead": "",
            "ctl00$body$hdnEditItemIndex": "",
            "ctl00_body_RadWindowManager1_ClientState": "",
            "ctl00$body$ContentSearch$cboCriteria": "LOC_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdSummary_ClientState": "",
            "ctl00$body$hdnDefCountry": "-1"
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll('tbody tr');
        const locationDataList = Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                code: cells[0]?.textContent.trim(),
                location: cells[1]?.textContent.trim()
            };
        });

        return locationDataList
    }
    if (args.entity === "companyHierarchy") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/CompanyHierarchy.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/CompanyHierarchy.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __SCROLLPOSITIONX: "0",
            __SCROLLPOSITIONY: "0",
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00_body_RadWindowManager1_ClientState": "",
            "ctl00$body$ContentSearchCompanyHie$cboCriteria": "T.HIE_CODE",
            "ctl00$body$ContentSearchCompanyHie$ddlHie": "-1",
            "ctl00$body$ContentSearchCompanyHie$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "64",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": "",
            // "ctl00$body$hdnOrgchartURL": "../OrgChartV9/companychart.aspx?popup=1&digest=PV50BXY2jf0BHCuP0L14jQ"
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tr.GroupHeader_Default, tr.GridRow_Default, tr.GridAltRow_Default");
        const companyHierarchyList = [];
        let currentDefinition = "";

        rows.forEach(row => {
            if (row.classList.contains("GroupHeader_Default")) {
                currentDefinition = row.textContent.trim();
            }

            if (row.classList.contains("GridRow_Default") || row.classList.contains("GridAltRow_Default")) {
                const cells = row.querySelectorAll("td");
                if (cells.length >= 4) {
                    const code = cells[1].innerText.trim();
                    const hierarchyName = cells[2].innerText.trim();
                    const topLevel = cells[3].innerText.trim();

                    if (code && hierarchyName) {
                        companyHierarchyList.push({
                            Code: code,
                            HierarchyName: hierarchyName,
                            TopLevel: topLevel,
                            Definition: currentDefinition
                        });
                    }
                }
            }
        });

        return companyHierarchyList
    }
    if (args.entity === "costCentre") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/Coscentre.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Coscentre.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "CENTRE_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "24",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tr.GridRow_Default, tr.GridAltRow_Default");
        const costCentreslist = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                const code = cells[0].innerText.trim();
                const name = cells[1].innerText.trim();

                if (code && name) {
                    costCentreslist.push({
                        Code: code,
                        CostCentreName: name
                    });
                }
            }
        });

        return costCentreslist
    }
    if (args.entity === "subLocation") {
        if (!BeaconBar.user.metaData.menus.includes("eim/SubLocation.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('eim/SubLocation.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/eim/SubLocation.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$hdnIsHead": "",
            "ctl00$body$hdnEditItemIndex": "",
            "ctl00$body$ContentSearch$cboCriteria": "SUB_LOC_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdSummary_ClientState": "",
            "ctl00$body$hdnDefCountry": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tr.GridRow_Default, tr.GridAltRow_Default");
        const sublocationList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                const code = cells[0].innerText.trim();
                const description = cells[1].innerText.trim();

                if (code && description) {
                    sublocationList.push({
                        code,
                        description
                    });
                }
            }
        });

        return sublocationList
    }
    if (args.entity === "salaryGrade") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/SalaryGradeInfo.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/SalaryGradeInfo.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/SalaryGradeInfo.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdsummary1$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "1",
            "ctl00$body$ContentSearch$cboCriteria": "SAGRD.SAL_GRD_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary1$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary1$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "100",
            "ctl00_body_grdsummary1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary1_ClientState": "",
            "ctl00$body$hdnDecimalFormat": "2"
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody > tr");
        const salaryGradeList = [];
        let currentGrade = "";
        let currentGradeCode = "";

        rows.forEach((row) => {
            if (row.classList.contains("GroupHeader_Default")) {
                const gradeText = row.querySelector("p")?.innerText.trim();
                if (gradeText && gradeText.startsWith("Salary Grade")) {
                    currentGrade = gradeText.replace("Salary Grade  :", "").trim();
                    currentGradeCode = currentGrade.split("_")[0].trim();
                    salaryGradeList.push({
                        codeId: currentGradeCode,
                        salaryGrade: currentGrade,
                        currencies: []
                    });
                }
            } else if (
                row.classList.contains("GridRow_Default") ||
                row.classList.contains("GridAltRow_Default")
            ) {
                const currencyCell = row.querySelectorAll("td")[1];
                if (currencyCell && currentGradeCode) {
                    const currency = currencyCell.innerText.trim();
                    if (currency) {
                        salaryGradeList[salaryGradeList.length - 1].currencies.push(currency);
                    }
                }
            }
        });

        return salaryGradeList
    }
    if (args.entity === "corporateTitle") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/CorporeteTitle.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/CorporeteTitle.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/CorporeteTitle.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "C.CT_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody > tr");
        const corporateTitleList = [];

        rows.forEach((row) => {
            if (
                row.classList.contains("GridRow_Default") ||
                row.classList.contains("GridAltRow_Default")
            ) {
                const cells = row.querySelectorAll("td");
                if (cells.length >= 3) {
                    corporateTitleList.push({
                        Code: cells[0].innerText.trim(),
                        CorporateTitle: cells[1].innerText.trim(),
                        SalaryGrade: cells[2].innerText.trim()
                    });
                }
            }
        });

        return corporateTitleList
    }
    if (args.entity === "designation") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/Designation.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Designation.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/Designation.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "D.DSG_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody > tr");
        const designationList = [];

        rows.forEach(row => {
            if (
                row.classList.contains("GridRow_Default") ||
                row.classList.contains("GridAltRow_Default")
            ) {
                const cells = row.querySelectorAll("td");
                if (cells.length >= 4) {
                    designationList.push({
                        Code: cells[0].innerText.trim(),
                        Designation: cells[1].innerText.trim(),
                        CorporateTitle: cells[2].innerText.trim(),
                        FunctionalRole: cells[3].innerText.trim()
                    });
                }
            }
        });

        return designationList
    }
    if (args.entity === "jobDescriptionCategory") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/JdCategory.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/JdCategory.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/JdCategory.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "JDCAT_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody > tr");
        const jobDescriptionCategoryList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                jobDescriptionCategoryList.push({
                    Code: cells[0].innerText.trim(),
                    JobDescriptionCategory: cells[1].innerText.trim()
                });
            }
        });

        return jobDescriptionCategoryList
    }
    if (args.entity === "jobDescriptionType") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/JdType.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/JdType.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/JdType.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "JDTYPE_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody > tr");
        const jobDescriptionTypeList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                jobDescriptionTypeList.push({
                    Code: cells[0].innerText.trim(),
                    JobDescriptionType: cells[1].innerText.trim()
                });
            }
        });

        return jobDescriptionTypeList
    }
    if (args.entity === "qualificationType") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/QualificationType.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/QualificationType.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/QualificationType.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "dd/mm/yy",
            "ctl00$hdnQuickmenu": "1",
            "ctl00$body$ContentSearch$cboCriteria": "QUALIFI_TYPE_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody > tr");
        const qualificationTypeList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                qualificationTypeList.push({
                    Code: cells[0].innerText.trim(),
                    QualificationType: cells[1].innerText.trim()
                });
            }
        });

        return qualificationTypeList
    }
    if (args.entity === "ratingMethod") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/RatingMethods.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/RatingMethods.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/RatingMethods.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "RATING_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody > tr");
        const ratingMethodList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                ratingMethodList.push({
                    Code: cells[0].innerText.trim(),
                    RatingMethod: cells[1].innerText.trim()
                });
            }
        });


        return ratingMethodList
    }
    if (args.entity === "membershipType") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/MemberShipType.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/MemberShipType.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/MemberShipType.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "MEMBTYPE_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody > tr");
        const membershipType = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                membershipType.push({
                    Code: cells[0].innerText.trim(),
                    MembershipType: cells[1].innerText.trim()
                });
            }
        });
        return membershipType
    }
    if (args.entity === "membershipDetails") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/Membership.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Membership.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/Membership.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "MEMBSHIP_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const membershipDetailsList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                membershipDetailsList.push({
                    Code: cells[0].innerText.trim(),
                    Membership: cells[1].innerText.trim()
                });
            }
        });
        return membershipDetailsList
    }
    if (args.entity === "membershipTitle") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/MemberShipTitles.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/MemberShipTitles.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/MemberShipTitles.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "MEMBTITLE_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const membershipTitlesList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                membershipTitlesList.push({
                    Code: cells[0].innerText.trim(),
                    "Membership Title": cells[1].innerText.trim()
                });
            }
        });

        return membershipTitlesList
    }
    if (args.entity === "bargainingUnit") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/BargainingUnit.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/BargainingUnit.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/BargainingUnit.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "BGN_UNIT_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": "",
            "ctl00$body$hdnEventType": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const bargainingunitsList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 3) {
                bargainingunitsList.push({
                    Code: cells[0].innerText.trim(),
                    Name: cells[1].innerText.trim(),
                    Abbreviation: cells[2].innerText.trim()
                });
            }
        });

        return bargainingunitsList
    }
    if (args.entity === "cashBenefit") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/CashBenifit.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/CashBenifit.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/CashBenifit.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "DATA.BEN_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const cashBenefitList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            const code = cells[0]?.textContent.trim();
            const description = cells[1]?.textContent.trim();
            const amount = cells[2]?.querySelector("span")?.textContent.trim();

            if (code && description && amount) {
                cashBenefitList.push({
                    Code: code,
                    Description: description,
                    Amount: amount
                });
            }
        });

        return cashBenefitList
    }
    if (args.entity === "nonCashBenefitCategory") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/NonCashBenifitCategory.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/NonCashBenifitCategory.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/NonCashBenifitCategory.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "NBENCAT_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const nonCashBenefitCategoryList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                const code = cells[0].textContent.trim();
                const description = cells[1].textContent.trim();
                nonCashBenefitCategoryList.push({ Code: code, Description: description });
            }
        });

        return nonCashBenefitCategoryList
    }
    if (args.entity === "nonCashBenefit") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/NonCashBenifit.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/NonCashBenifit.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/NonCashBenifit.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "B.NBEN_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const nonCashBenefitList = [];

        let currentCategory = "";

        rows.forEach(row => {
            if (row.classList.contains("GroupHeader_Default")) {
                const categoryText = row.querySelector("p")?.textContent.trim();
                if (categoryText.startsWith("Category :")) {
                    currentCategory = categoryText.replace("Category :", "").trim();
                }
            } else if (
                row.classList.contains("GridRow_Default") ||
                row.classList.contains("GridAltRow_Default")
            ) {
                const cells = row.querySelectorAll("td");
                if (cells.length >= 3) {
                    const code = cells[1].textContent.trim();
                    const description = cells[2].textContent.trim();
                    nonCashBenefitList.push({ Category: currentCategory, Code: code, Description: description });
                }
            }
        });

        return nonCashBenefitList
    }
    if (args.entity === "employeeCategory") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/StaffCatogary.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/StaffCatogary.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/StaffCatogary.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "CAT_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const employeeCategoryList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                const code = cells[0].textContent.trim();
                const category = cells[1].textContent.trim();
                if (code && category) {
                    employeeCategoryList.push({ Code: code, "Employee Category": category });
                }
            }
        });


        return employeeCategoryList
    }
    if (args.entity === "statutoryClassification") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/EmpCatgary.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/EmpCatgary.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/EmpCatgary.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "STAFFCAT_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const statutoryClassificationList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                const code = cells[0].textContent.trim();
                const classification = cells[1].textContent.trim();

                if (code && classification) {
                    statutoryClassificationList.push({
                        Code: code,
                        StatutoryClassification: classification
                    });
                }
            }
        });

        return statutoryClassificationList
    }
    if (args.entity === "function") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/Function.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Function.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/Function.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "FUNCTION_ID",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll('tbody tr');
        const functionList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
                const code = cells[0].textContent.trim();
                const func = cells[1].textContent.trim();
                if (code && func) {
                    functionList.push({ Code: code, Function: func });
                }
            }
        });

        return functionList
    }
    if (args.entity === "functionalRoles") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/FunctionalRole.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/FunctionalRole.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/FunctionalRole.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "F.FUNCTION_ROLE_ID",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const functionRole = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 3) {
                const code = cells[0].textContent.trim();
                const func = cells[1].textContent.trim();
                const role = cells[2].textContent.trim();

                functionRole.push({
                    Code: code,
                    Function: func,
                    FunctionalRole: role
                });
            }
        });

        return functionRole
    }
    if (args.entity === "classification") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/Classification.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Classification.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/Classification.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "CLASSIFICATION_ID",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const classificationsList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                const code = cells[0].textContent.trim();
                const classification = cells[1].textContent.trim();
                classificationsList.push({
                    Code: code,
                    Classification: classification
                });
            }
        });


        return classificationsList
    }
    if (args.entity === "bloodGroup") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/BloodGroup.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/BloodGroup.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/BloodGroup.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "BLGRP_ID",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdSummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const bloodgroupList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                const code = cells[0].innerText.trim();
                const bloodGroup = cells[1].innerText.trim();
                bloodgroupList.push({ Code: code, "Blood Group": bloodGroup });
            }
        });

        return bloodgroupList
    }
    if (args.entity === "employmentType") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/EmployeementType.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/EmployeementType.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/EmployeementType.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "EMPT_TYPE_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const employeementTypeList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            const obj = {
                Code: cells[0]?.innerText.trim(),
                "Employment Type": cells[1]?.innerText.trim(),
                "Date Limited": cells[2]?.innerText.trim(),
                Duration: cells[3]?.innerText.trim()
            };
            employeementTypeList.push(obj);
        });


        return employeementTypeList
    }
    if (args.entity === "employeeTitle") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/Salutation.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Salutation.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/Salutation.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "SALU_ID",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const employeeTitleList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            const code = cells[0]?.textContent.trim();
            const employeeTitle = cells[1]?.textContent.trim();

            if (code && employeeTitle) {
                employeeTitleList.push({ Code: code, EmployeeTitle: employeeTitle });
            }
        });



        return employeeTitleList
    }
    if (args.entity === "genderType") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/GenderType.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/GenderType.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/GenderType.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "GEN_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const genderTypeList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                const Code = cells[0].textContent.trim();
                const Gender = cells[1].textContent.trim();
                genderTypeList.push({ Code, Gender });
            }
        });
        return genderTypeList
    }
    if (args.entity === "maritalStatus") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/MaritalStatus.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/MaritalStatus.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/MaritalStatus.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "MARST_ID",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const maritalStatusList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                const code = cells[0].innerText.trim();
                const maritalStatus = cells[1].innerText.trim();
                maritalStatusList.push({ Code: code, MaritalStatus: maritalStatus });
            }
        });

        return maritalStatusList
    }
    if (args.entity === "attachmentType") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/AttachmentType.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/AttachmentType.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/AttachmentType.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "ATT_TYPE_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll('tbody tr');
        const attachmentTypeList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
                attachmentTypeList.push({
                    Code: cells[0].textContent.trim(),
                    AttachmentType: cells[1].textContent.trim(),
                    Expiration: cells[2].textContent.trim()
                });
            }
        });

        return attachmentTypeList;
    }
    if (args.entity === "employeeGroup") {
        if (!BeaconBar.user.metaData.menus.includes("EIM/StaffGroup.aspx")) {
            return "It seems you don't have access. Please check with the HR Admin";
        }
        const myHeaders = new Headers();
        myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        myHeaders.append("accept-language", "en-US,en;q=0.9");
        myHeaders.append("content-type", "application/x-www-form-urlencoded");
        myHeaders.append("x-requested-with", "XMLHttpRequest");


        const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/StaffGroup.aspx');

        const url = `${reqOptions.sl}/${updateurl.updateUrl}`

        // const url = `${reqOptions.sl}/EIM/StaffGroup.aspx`

        const listDetails = await BeaconBar.executeFunction("getEIMlist")(url);

        const paginationDetails = await BeaconBar.executeFunction("getEIMPaginationList")({
            scrollLeft: "0",
            scrollTop: "0",
            __EVENTTARGET: "ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeLinkButton",
            __EVENTARGUMENT: "",
            __VIEWSTATE: listDetails.viewState,
            __VIEWSTATEGENERATOR: listDetails.viewStateGen,
            __VIEWSTATEENCRYPTED: "",
            __EVENTVALIDATION: listDetails.eventValidation,
            "ctl00$hdnDateFormat": "m/d/yy",
            "ctl00$hdnQuickmenu": "",
            "ctl00$body$ContentSearch$cboCriteria": "GP_CODE",
            "ctl00$body$ContentSearch$txtContent": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
            "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
            "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
            "ctl00_body_grdsummary_ClientState": ""
        }, url)

        const parser = new DOMParser();
        const document = parser.parseFromString(paginationDetails, 'text/html');

        const rows = document.querySelectorAll("tbody tr");
        const employeegroupList = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                employeegroupList.push({
                    Code: cells[0].innerText.trim(),
                    "Employee Group": cells[1].innerText.trim()
                });
            }
        });
        return employeegroupList
    }
})