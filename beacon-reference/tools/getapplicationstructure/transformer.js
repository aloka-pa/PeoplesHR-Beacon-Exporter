(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getBenefitApplicationStructure")(args.benCode);
  window.benCode ={
    benCode:args.benCode,
    benName : args.benefitName
  } 
  return details;
})
