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

  // post process
  const fileNameField = document.querySelector('#fileName');
  fileNameField.value = 'out_' + _trnsRuToEn(layoutNameField.value);
  const mountWidthField = document.querySelector('#filmWidth');
  mountWidthField.value = _calcFilmWidth();

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

function _trnsRuToEn(text) {
 var txtArr = text.split('');
 var res = '';
 var trans = {
  А: 'A', а: 'a', Б: 'B', б: 'b', В: 'V', в: 'v', Г: 'G', г: 'g', Д: 'D', д: 'd',
  Е: 'E', е: 'e', Ё: 'YO', ё: 'yo', Ж: 'ZH', ж: 'zh', З: 'Z', з: 'z', И: 'I', и: 'i',
  Й: 'J', й: 'j', К: 'K', к: 'k', Л: 'L', л: 'l', М: 'M', м: 'm', Н: 'N', н: 'n',
  О: 'O', о: 'o', П: 'P', п: 'p', Р: 'R', р: 'r', С: 'S', с: 's', Т: 'T', т: 't', У: 'U',
  у: 'u', Ф: 'F', ф: 'f', Х: 'H', х: 'h', Ц: 'C', ц: 'c', Ч: 'CH', ч: 'ch', Ш: 'SH',
  ш: 'sh', Щ: 'SHH', щ: 'shh', Ъ: '', ъ: '', Ы: 'IY', ы: 'iy', Ь: '', ь: '',
  Э: 'E', э: 'e', Ю: 'YU', ю: 'yu', Я: 'YA', я: 'ya',
  ".": "", ",": "", ":": "", ";": "", "'": "", '"': '', "(": "", ")": ""
 };
 outer:  for (var i = 0; i < txtArr.length; i++) {
  var item = txtArr[i];
  for (var key in trans) {
   if (item !== key) continue;
   res += trans[key];
   continue outer;
  }
  res += item;
 }
 res = res.replace(/ /g, '_');
 return res;
}

function _calcFilmWidth() {
 const indentInField = document.querySelector('#indentIn');
 const margLeftField = document.querySelector('#margLeft');
 const margRightField = document.querySelector('#margRight');
 const streamsField = document.querySelector('#streams');
 const railWidthField = document.querySelector('#railWidth');
 const layoutWidthField = document.querySelector('#layoutWidth');

 return indentInField.value * 2 +
  +margLeftField.value +
  +margRightField.value +
  +streamsField.value * +layoutWidthField.value +
  +railWidthField.value * 2;
}
