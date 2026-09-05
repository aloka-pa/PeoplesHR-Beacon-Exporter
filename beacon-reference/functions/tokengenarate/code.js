(async function(tokenName){
          const reqOptions = await BeaconBar.executeFunction('reqOptions')();

    const myHeaders = new Headers();
myHeaders.append("accept", "*/*");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow"
};


const response = await fetch(`${reqOptions}recruitmentv9/Common/GetToken?tokenName=RctAppViewTokenName&_=${Date.now()}`, requestOptions)
const data = await response.text();
 return data; 
})