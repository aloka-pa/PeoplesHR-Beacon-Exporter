(async function(){
    const myHeaders = new Headers();
myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");


const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow"
};
const reqOptions = await BeaconBar.executeFunction("reqOptions")();
const response = await fetch(`${reqOptions}recruitmentv9/Common/GetAllHierarchyData?activeOnly=true&_=${Date.now()}`, requestOptions)
  const data = await response.text()
function buildHierarchyFlat(datas) {
  const data = JSON.parse(datas);
  if (!Array.isArray(data)) {
    throw new Error("Input must be an array.");
  }

  const flatList = [];

  function traverse(node, parentCode = null, level = 0) {
    const { Code, Name, Relation } = node;
    flatList.push({
      Code,
      Name,
      Parent: parentCode,
      Level: level
    });

    if (node.children && node.children.length) {
      node.children.forEach(child => traverse(child, Code, level + 1));
    }
  }

  // First build the tree
  const nodeMap = {};
  data.forEach(item => {
    nodeMap[item.Code] = { ...item, children: [] };
  });

  data.forEach(item => {
    if (item.Relation && nodeMap[item.Relation]) {
      nodeMap[item.Relation].children.push(nodeMap[item.Code]);
    }
  });

  // Traverse from roots (items without Relation)
  Object.values(nodeMap).forEach(item => {
    if (item.Relation === null) {
      traverse(item);
    }
  });

  return flatList;
}



const dropdownTree = buildHierarchyFlat(data);

  return dropdownTree ;
})