(function (data, args, reqOptions) {
  return data.map(item => ({
    PayType: item.PayType,
    PayYear: item.PayYear,
    PaySchId: item.PaySchId,
    EmpNumber: item.EmpNumber
  }));
})