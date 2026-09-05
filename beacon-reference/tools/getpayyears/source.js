(function(data, args, reqOptions) {
  return data.map(item => ({
    url: "",
    title: `Year: ${item.PayYear}`,
    subTitle: `Pay Type: ${item.PayType}`,
    icon: ""
  }));
})