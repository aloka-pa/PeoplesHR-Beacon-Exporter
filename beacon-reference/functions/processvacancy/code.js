async function loadRequisitionDetails(vac, e) {
    try {
        const unmapped = ko.mapping.toJS(vac);
        $('#hdnRequistionDet').val(JSON.stringify(unmapped));

        vac.IsLoadingDetailedView(true);

        const reqId = vac.Id;
        const url = RctUrl("HiringManagerProcess/ProcessView") + `?reqId=${encodeURIComponent(reqId)}`;

        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.text(); 

        RctHiringMngrSum.ProFormData = data;
        $('#rct-sumPage').hide();
        $('#rct-mainPage').html(data).show();

    } catch (error) {
        RctShowError(null, "Request Failed", error.message);
    } finally {
        vac.IsLoadingDetailedView(false);
    }
}
