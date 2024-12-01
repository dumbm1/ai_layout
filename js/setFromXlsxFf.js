getXlsx();

function getXlsx() {
 const chooseFileBtn = document.querySelector('#chooseFileBtn');

 chooseFileBtn.addEventListener("change", async e => {

  try {
   return getFf(e);
  } catch (e) {
   return new Error('Error in getXlsx' + e.message);
  }

 });
}

async function getFf(e) {
 const testOutputTextarea = document.querySelector("#testOutputTextarea");
 let outStr = '';

 const file = e.target.files[0];
 const data = await file.arrayBuffer();

 const workBook = XLSX.read(data);
 const workSheet = workBook.Sheets[workBook.SheetNames[0]];

 const xlsxData = {
  customerCompanyName: workSheet.C4?.v,
  orderNumber: workSheet.C5?.v,
  // orderName: workSheet.E6?.v,
  orderName: [
   workSheet.E6?.v, workSheet.E7?.v, workSheet.E8?.v, workSheet.E9?.v, workSheet.E10?.v,
   workSheet.E11?.v, workSheet.E12?.v, workSheet.E13?.v, workSheet.E14?.v
  ],

  printSideUp: workSheet.F23?.v,
  printSideDn: workSheet.F24?.v,

  formCylinder: workSheet.E40?.v,
  rapport: workSheet.L42?.v,
  streamWidth: workSheet.L40?.v,
  // streamsNumber: workSheet.D6?.v,
  streamsNumber: [
   workSheet.D6?.v, workSheet.D7?.v, workSheet.D8?.v, workSheet.D9?.v, workSheet.D10?.v,
   workSheet.D11?.v, workSheet.D12?.v, workSheet.D13?.v, workSheet.D14?.v,
  ],
  supports: workSheet.E22?.v,
  filmWidth: workSheet.E42?.v,

  inkNumber: workSheet.E43?.v,
  inkChange: workSheet.L37?.v,

  sensorLabelSize: workSheet.J49?.v,
  sensorLabelColor: workSheet.J51?.v,
  sensorLabelFieldColor: workSheet.J50?.v,

  filmPrint: workSheet.F53?.v,
  filmCover: workSheet.F54?.v,

  windingSchema: workSheet.L46?.v,
 };

/* for (let key in xlsxData) {
  let val = xlsxData[key];
  outStr += key + ': ' + val + ' (' + typeof val + ')\n\n';
 }*/

 // testOutputTextarea.value = outStr ;

 _setFromXlsxFf(xlsxData);

 function _setFromXlsxFf(xlsxData) {
  const streamWidthField = document.querySelector('#layoutWidth');
  const streamsNumberField = document.querySelector('#streams');
  const layoutNameField = document.querySelector('#layoutName');
  const zList = document.querySelector('#z');

  streamWidthField.value = +xlsxData.streamWidth;
  streamsNumberField.value = +__getStreamNumb(xlsxData.streamsNumber);
  zList.value = +xlsxData.formCylinder;
  layoutNameField.value = xlsxData.orderNumber + ' ' + xlsxData.customerCompanyName + ' ' + __getStreamNames(xlsxData.orderName);


  function __getStreamNumb(arr) {
   let streamNumb = 0;
   for (let i = 0; i < arr.length; i++) {
    if (!arr[i]) continue;
    streamNumb += +arr[i];
   }
   return streamNumb;
  }

  function __getStreamNames(arr) {
   var arr2 = [];
   for (var i = 0; i < arr.length; i++) {
    if (!arr[i]) continue;
    arr2.push(arr[i]);
   }
   return arr2.join(' + ');
  }
 }

 // return xlsxData;
}

