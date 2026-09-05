(function (search = '') {
  if (search.length === 0) {
    BeaconBar.closeSidePane()
    return 'search';
  }
  if (search.startsWith('movementtype')) {
    return 'movementtype';
  }
  if (search.startsWith('training')) {
    return 'training';
  }
  if (search.startsWith('r/')) {
    return 'requisition';
  }
  return "search";
})