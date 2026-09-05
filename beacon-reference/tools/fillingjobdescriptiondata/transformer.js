(function (_data, args, reqOptions) {
  const descriptionFinaced = args.descriptionFinaced.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
  const otherDescription = args.OtherDescription.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
  const iframeDoc = document.querySelector('#ifrmPage')?.contentDocument;
  if (!iframeDoc) {
    return {
      success: false,
      message: "iframe not found"
    };
  }

  const finaceField = iframeDoc.querySelector('#ctl00_body_txtFinace');
  const otherField = iframeDoc.querySelector('#ctl00_body_txtOther');

  if (finaceField) finaceField.value = "";
  if (otherField) otherField.value = "";

  
  let i = 0, j = 0;

  const typeInterval1 = setInterval(() => {
    if (i < descriptionFinaced.length) {
      finaceField.value = descriptionFinaced.slice(0, i + 1);
      i++;
    } else {
      clearInterval(typeInterval1);
    }
  }, 20); 

  const typeInterval2 = setInterval(() => {
    if (j < otherDescription.length) {
      otherField.value = otherDescription.slice(0, j + 1);
      j++;
    } else {
      clearInterval(typeInterval2);
    }
  }, 20); 

  return {
    success: true,
    Importantmessage: "Typing simulated character-by-character. Let me know if formatting is needed."
  };
}) 