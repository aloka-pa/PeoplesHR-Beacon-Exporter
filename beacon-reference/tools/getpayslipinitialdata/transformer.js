(function (data, args, reqOptions) {
  return data.PayYears.flatMap(y =>
    y.PayPeriods.map(p => ({
      PFCode: data.PFCode,
      Year: y.Year,
      Schedule: p.Schedule,
      Period: p.Period
    }))
  );
})