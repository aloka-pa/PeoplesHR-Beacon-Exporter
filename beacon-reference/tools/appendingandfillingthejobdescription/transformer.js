(function (_data, args, reqOptions) {
  const iframe = document.getElementById("ifrmPage");

  if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
    alert("Iframe not accessible or not loaded.");
    return { success: false };
  }

  const iframeWin = iframe.contentWindow;
  const iframeDoc = iframe.contentDocument || iframeWin.document;

  const rawHtml = args.description.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
  const rawText = rawHtml?.substring(0, 500) || "";

  const $textarea = iframeWin.$('#rct-requisitions-partial-requisition-137 textarea');
  let i = 0;
  $textarea.val("");

  const typeInterval = setInterval(() => {
    if (i < rawText.length) {
      const currentText = rawText.slice(0, i + 1);
      $textarea.val(currentText);
      i++;
    } else {
      clearInterval(typeInterval);
    }
  }, 10);

  return {
    success: true,
    description: rawText,
    Important: "if you need to format this, need the feedback to fill again this."
  };
})
