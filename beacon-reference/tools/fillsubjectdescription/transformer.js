(function (_data, args, reqOptions) {
  const description = args.description.replace(/<\/?[^>]+(>|$)/g, ""); 

  const iframeDoc = document.querySelector("#ifrmPage")?.contentDocument;
  if (!iframeDoc) {
    return {
      success: false,
      message: "iframe not found"
    };
  }

  const textarea = iframeDoc.querySelector("#descid");
  if (!textarea) {
    return {
      success: false,
      message: "#descid not found inside iframe"
    };
  }

  textarea.value = ""; 
  let i = 0;

  const interval = setInterval(() => {
    if (i < description.length) {
      textarea.value = description.slice(0, i + 1);
      i++;
    } else {
      clearInterval(interval);
    }
  }, 10); 

  return {
    success: true,
    message: " do you need any formatting to this tell me i do it for you "
  };
})
