(async function (data, args, reqOptions) {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept-Language", "en-US,en;q=0.9");
  // myHeaders.append("API-KEY", "abc123@@@");
  myHeaders.append("x-api-key", "your_secret_key");

  const raw = {
    query: args.query,
    is_custom: true
  };


    const response = await fetch(`${location.origin}/hr/chatbot/WebAPI/v3/Beacon/prompt_pdf_kb`, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(raw),
      redirect: "follow"
    });

    const result = await response.json();

    const output = result.articles?.map(x => ({
      fileName: x.filename,
      content: x.content
    })) || [];
    return output;

});
