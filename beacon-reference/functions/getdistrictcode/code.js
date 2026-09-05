(async function(countryCode,provinceCode) {
    const sl = await BeaconBar.getSharedData("sl");
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");

    const formdata = new FormData();
    formdata.append("scrollLeft", "0");
    formdata.append("scrollTop", "0");
    formdata.append("__EVENTTARGET", "ctl00$body$ddlProvince");
    formdata.append("__EVENTARGUMENT", "");
    formdata.append("__LASTFOCUS", "");
    formdata.append("__VIEWSTATE", window.provinceCode.viewState);
    formdata.append("__VIEWSTATEGENERATOR", window.provinceCode.viewStateGen);
    formdata.append("__VIEWSTATEENCRYPTED", "");
    formdata.append("__EVENTVALIDATION", window.provinceCode.eventValidation);
    formdata.append("ctl00$hdnDateFormat", "dd/mm/yy");
    formdata.append("ctl00$body$hdnIsHead", "");
    formdata.append("ctl00$body$hdnEditItemIndex", "");
    formdata.append("ctl00_body_RadWindowManager1_ClientState", "");
    formdata.append("ctl00$body$txtName", "");
    formdata.append("ctl00$body$txtAbbreviation", "");
    formdata.append("ctl00$body$txttp", "");
    formdata.append("ctl00$body$txtFax", "");
    formdata.append("ctl00$body$txtemail", "");
    formdata.append("ctl00$body$txturl", "");
    formdata.append("ctl00$body$txtaddress", "");
    formdata.append("ctl00$body$ddlCountry", countryCode);
    formdata.append("ctl00$body$ddlProvince", provinceCode);
    formdata.append("ctl00$body$cboTimeZone", "");
    formdata.append("ctl00$body$txtHeadName", "");
    formdata.append("ctl00$body$txtHTitle", "");
    formdata.append("ctl00$body$txtAdminName", "");
    formdata.append("ctl00$body$filMyFile","file");
    formdata.append("ctl00$body$hdnDefCountry", "-1");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow"
    };

    const response = await fetch(`${location.origin}/${sl}/EIM/Location.aspx`, requestOptions)
    const html = await response.text();

    const districtDetails = await BeaconBar.executeFunction("getDomExtract")(html);
    window.districtCode = districtDetails;

    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');

    function extractOptions(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return [];
        return Array.from(select.options).map(option => ({
            value: option.value,
            label: option.text.trim()
        }));
    }

    const district = extractOptions("ctl00_body_ddlDistrict");


    return district;
});