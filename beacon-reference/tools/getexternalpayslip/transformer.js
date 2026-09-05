(function (data) {
  return data.map(item => ({
    Item: item.Item,
    Amount: item.TrnAmount
  }));
})