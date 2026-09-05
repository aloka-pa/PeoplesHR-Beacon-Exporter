(function (args, reqOptions) {
  return {
    url: `${location.origin}/${reqOptions.sl}/tnavue/service/api/Roster/GetRostersByGroupId`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-requested-with': 'XMLHttpRequest'
      // 'Cookie': 'ASP.NET_SessionId=cm101gkmudechmbl4hmoln3i; __RequestVerificationToken_L2hyYjU1=_Wlf80K884J1-06yE4Y0PmXCap6MRvvj4GnO15Q0MUwumyAt3GdRZqYSZNYv_g1z4f3BBZY5fpuvvCqTe69hW77VYqQ1; THEME_V8=default; .ASPXAUTH=241656AF614F5C57E7E671253351BAB2E5327E36273DFBB8653E95F93272BB9786E449B32DABBCCAACB72017EA6471D7AB327DD8F987997F4DC29BE96D1350263A3AEE5CFCF5EB81F54F2C1B485B6164C6AE6BE9EE265C3EA567E9940F69D5E8; ehrm85=...; my-application-browser-tab={"guid":"a72db831-856c-9064-de89-e5f54e53350f","timestamp":1749121553347}'
    },
    body: JSON.stringify({
      RosterGroup: args.rosetrId
    }),
    // credentials: 'include'
  };
})