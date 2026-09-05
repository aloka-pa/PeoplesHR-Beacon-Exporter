(function(data, args, reqOptions) {
  return data.map(item => ({
    url: "",
    title: item.PayPeriod,
    subTitle: `Year: ${item.PayYear}`,
    icon: ""
  }));
})