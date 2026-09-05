(async function (url, empNumber) {
    //done
    const sl = await BeaconBar.getSharedData("sl");
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    const response = await fetch(`${location.origin}/${sl}/${url}`, requestOptions);
    const data = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');

    const viewState = doc.querySelector('#__VIEWSTATE')?.value || '';
    const eventValidation = doc.querySelector('#__EVENTVALIDATION')?.value || '';
    const viewStateGen = doc.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

    const urlencoded1 = new URLSearchParams();
    urlencoded1.append("scrollLeft", "0");
    urlencoded1.append("scrollTop", "0");
    urlencoded1.append("__EVENTTARGET", "");
    urlencoded1.append("__EVENTARGUMENT", "");
    urlencoded1.append("__VIEWSTATE", viewState);
    urlencoded1.append("__VIEWSTATEGENERATOR", viewStateGen);
    urlencoded1.append("__VIEWSTATEENCRYPTED", "");
    urlencoded1.append("__EVENTVALIDATION", eventValidation);
    urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded1.append("ctl00$body$hdnIsHead", "");
    urlencoded1.append("ctl00$body$hdnEditItemIndex", "");
    urlencoded1.append("ctl00_body_RadWindowManager1_ClientState", "");
    urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "LOC_CODE");
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", empNumber);
    urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
    urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
    urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdSummary_ClientState", "");
    urlencoded1.append("ctl00$body$hdnDefCountry", "-1");

    const requestOptions1 = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded1,
        redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${sl}/${url}`, requestOptions1);
    const data1 = await response1.text();

    const dom = parser.parseFromString(data1, 'text/html');

    const row = dom.querySelector('tr[id^="ctl00_body_grdSummary"]');
    if (!row) return null;

    const anchor = row.querySelector('a[href^="javascript:__doPostBack"]');
    if (!anchor) return null;

    const match = anchor.getAttribute('href').match(/__doPostBack\('([^']+)'/);
    const postBackKey = match ? match[1] : null;

    const details = {
        viewState: dom.querySelector('#__VIEWSTATE')?.value || '',
        eventValidation: dom.querySelector('#__EVENTVALIDATION')?.value || '',
        viewStateGen: dom.querySelector('#__VIEWSTATEGENERATOR')?.value || '',
        target: postBackKey
    };

    return details;
})
