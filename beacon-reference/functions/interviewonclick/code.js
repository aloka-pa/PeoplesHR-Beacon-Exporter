(function (candidate) {

    const iframe = document.querySelector("#ifrmPage");
    if (!iframe) {
        return;
    }

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) {
        return;
    }

    const { ReqAppId, appId, reqId, appIntProfId } = candidate;

    // Ensure functions exist before calling
    if (typeof iframeWindow.RctGetCandidateComparision !== "function") {
        return;
    }
    if (typeof iframeWindow.RctShowCandidateComparision !== "function") {
        return;
    }
    if (!iframeWindow.CndctngIntrvw || typeof iframeWindow.CndctngIntrvw.ProcessId === "undefined") {
        return;
    }

    try {
        const comparisonHtml = iframeWindow.RctGetCandidateComparision(
            ReqAppId,
            appId,
            reqId,
            iframeWindow.CndctngIntrvw.ProcessId,
            appIntProfId
        );

        iframeWindow.RctShowCandidateComparision(comparisonHtml, "#CICandidateComparision");

        if (typeof iframeWindow.CndctngIntrvw.ShowHideComparision === "function") {
            iframeWindow.CndctngIntrvw.ShowHideComparision(true);
        }
    } catch (err) {
    }
});
