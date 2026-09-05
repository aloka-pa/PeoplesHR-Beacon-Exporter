(function (_data, args, reqOptions) {
  const iframe = document.getElementById("ifrmPage");

  if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
    alert("Iframe not accessible or not loaded.");
    return { success: false };
  }

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  const richEditor = iframeDoc.querySelector('.note-editable');

  if (richEditor && args.description) {
    richEditor.innerHTML = "";

    const rawText = args.description;
    let i = 0;

    const typeInterval = setInterval(() => {
      if (i < rawText.length) {
        const currentText = rawText.slice(0, i + 1);
        const formattedText = currentText
          .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
          .replace(/\n/g, "<br>");

        richEditor.innerHTML = formattedText;
        i++;
      } else {
        clearInterval(typeInterval);

        const inputEvent = new iframe.contentWindow.Event('input', { bubbles: true });
        richEditor.dispatchEvent(inputEvent);
      }
    }, 10);
  }

  return {
    success: true
  };
});
