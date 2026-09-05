(function (data, args, reqOptions) {
  return data.map(item => ({
    PayType: item.PayType,
    PayTypeName: item.PayTypeName
  }));
})