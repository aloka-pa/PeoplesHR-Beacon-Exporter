(function(data, args, reqOptions) {
  return data.map(item => ({
    url: "",
    title: item.PayTypeName,
    subTitle: `Pay Type: ${item.PayType}`,
    icon: ""
  }));
})