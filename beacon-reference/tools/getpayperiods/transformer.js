(function (data) {
  return data.map(item => ({
    PayGrpCode: item.PayGrpCode,
    PayStartDate: item.PayStartDate,
    PayEndDate: item.PayEndDate,
    PayGrpNum: item.PayType,
    PayPeriod: item.PayPeriod
  }));
})