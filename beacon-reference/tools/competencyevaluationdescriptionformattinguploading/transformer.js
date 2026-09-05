(function (_data, args, reqOptions) {
  const iframe = document.querySelector("#ifrmPage");
  if (!iframe || !iframe.contentDocument) {
    return { success: false, message: "Iframe not found." };
  }

  const iframeWindow = iframe.contentWindow;
  const CKEDITOR = iframeWindow.CKEDITOR;

  if (!CKEDITOR) {
    return { success: false, message: "CKEDITOR not found in iframe." };
  }

  const rawComments = args.approvalcomments || "no Appraiser comment found";

  const cleanedComments = rawComments
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\n/g, "<br>")
    .split(";")
    .map(c => c.trim())
    .filter(c => c.length > 0);

  const allSpans = iframe.contentDocument.querySelectorAll('span[data-bind]');
  const editableSpans = Array.from(allSpans).filter(span => {
    const bindVal = span.getAttribute("data-bind") || "";
    return (
      bindVal.includes("html: AppraiserComment") ||
      bindVal.includes("html: AppraiseeComment") ||
      bindVal.includes("html: ReviewerComment")
    );
  });

  let updatedCount = 0;

  function updateCKEditorContent(editorId, newContent) {
    if (CKEDITOR.instances[editorId]) {
      CKEDITOR.instances[editorId].setData(newContent);
      CKEDITOR.instances[editorId].updateElement();
    } else {
      CKEDITOR.on('instanceReady', function (event) {
        if (event.editor.name === editorId) {
          event.editor.setData(newContent);
          event.editor.updateElement();
        }
      });
    }
  }

  for (let i = 0; i < editableSpans.length && i < cleanedComments.length; i++) {
    const span = editableSpans[i];
    const comment = cleanedComments[i];
    
    span.innerHTML = comment;
    
    const parentDiv = span.closest('.longTextEditor');
    if (parentDiv) {
      const textarea = parentDiv.querySelector('textarea');
      if (textarea) {
        for (let editorName in CKEDITOR.instances) {
          const editor = CKEDITOR.instances[editorName];
          if (editor.element.$ === textarea) {
            updateCKEditorContent(editorName, comment);
            break;
          }
        }
      }
    }
    
    updatedCount++;
  }

  return {
    success: true,
    totalUpdated: updatedCount,
    message: `${updatedCount} comment(s) updated and synced with CKEditor + Knockout. Save will capture the new values.`
  };
});