(async function (data, args, reqOptions) {
  const url = await BeaconBar.executeFunction("updateUrlParams")("EIMV9/Bank/Bank?mvc=1&subordinate=0")
  const digest = await BeaconBar.executeFunction('getDigest')(url.updateParams);

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const response = await fetch(`${location.origin}/${reqOptions.sl}/${url.updateUrl}&digest=${digest.digest}&_=${Date.now()}`, {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  });
  const details = await response.text();
  const match = details.match(/var\s+modelBank\s*=\s*(\{[\s\S]*?\});/);
  const bank = JSON.parse(match[1]);
  window.bankData = bank.EmpBankList
  return {
    bankDetails: bank.EmpBankList,
    currecyList: bank.CurrencyList.map(x => ({
      CurrencyId: x.CurrencyId,
      CurrencyName: x.CurrencyName
    })),
    bankTypes: bank.BankAccTypList
  };
})