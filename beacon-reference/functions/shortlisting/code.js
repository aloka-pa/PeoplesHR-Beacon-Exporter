(function (candidate) {
    // BeaconBar.executeCommand("6808bef7dc16a0e2ff3ce0d8");
    function RctShowCandidateComparision(html, divId) {
    $(divId).empty();
    $(divId).append(html);
    $(divId).show();
}
function RctGetCandidateComparision(reqappId, appId, reqId, processId, appIntProfId, impersonated) {
    appIntProfId = appIntProfId || -1;
    impersonated = impersonated || 0;

    //Enable Interview Candidate Comparison if Process Id = Reference Check
    var isReferenceCheck = processId == 7 ? true : false;
    processId = processId == 7 ? 4 : processId;

    var param = "?reqappId=" + reqappId + "&" + "appId=" + appId + "&" + "reqId=" + reqId + "&" + "processId=" + processId + "&" + "appIntProfId=" + appIntProfId + "&" + "impersonated=" + impersonated + "&" + "isReferenceCheck=" + isReferenceCheck;

    $.ajax({
        type: "GET",
        async: false,
        url: window.$RCT_ROOT + 'Common/GetCandidateComparision' + param
    }).done(function(data) {
        text = data;
    }).fail(function(xhr) {
        var status = xhr.status;
        var responseText = xhr.responseText;
        bootbox.alert(responseText);
    });

    return text;
}
    function showCandidateComparison(candidate) {
        var html = RctGetCandidateComparision(
            candidate.ReqAppId,
            candidate.AppId,
            candidate.ReqId,
            // ShrtLstngComparision.ProcessId,
            0
        );

        RctShowCandidateComparision(html, "#SLCandidateComparision");
        // ShrtLstngComparision.ShowHideComparision(true);
    }

    showCandidateComparison(candidate);
})