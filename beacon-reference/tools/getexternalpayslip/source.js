(function(data) {
  return data.map(item => ({
    url: "",
    title: item.Item,
    subTitle: `Amount: ${item.Amount.toFixed(2)}`,
    icon: ""
  }));
})