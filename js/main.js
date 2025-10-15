/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/
main();

function main() {
 'use strict';

 const csInterface = new CSInterface();

 init();

 function init() {

  themeManager.init();
  loadJSX('json2.js');

  $('#btnReset').click(reloadPanel);

  addLayout();

  checkInput();

  /**
   * Handling the incorrect input
   * but if user enters a point as the final character then value is incorrect
   * */
  function checkInput() {
   var inputElems = document.getElementsByTagName('input');
   for (var i = 0; i < inputElems.length; i++) {
    var obj = inputElems[i];

    if (obj.getAttribute('id') == 'pantSearch') continue;

    obj.onkeypress = function (e) {
     // keypress keyCode=44 which=44 charCode=44 char=,
     // keypress keyCode=46 which=46 charCode=46 char=.
     // keypress keyCode=46-57 which=46-57 charCode=46-57 char=0-9
     if (e.keyCode > 57 || e.keyCode < 48 && (e.keyCode != 44 && e.keyCode != 46)) {
      return false;
     }
     if (e.keyCode == 44 || e.keyCode == 46) {
      if (this.value.match(/[.,]/)) return false;
      this.value += '.';
      return false;
     }
    };
   }
  }

  function addLayout() {
   var sorryMessage = 'In development..';
   var pantBook = makePantoneBook();
   addPantList(pantBook);
   searchPantByName();
   makeEngines();
   addOutColors();

   var storeOpts = JSON.parse(localStorage.getItem('opts'));

   if (storeOpts) {
    setNmb(storeOpts.nmb);
   } else {
    setNmb(defNmb());
   }
   setTxt(defTxt());
   setSel(defSel());
   setCol(defCol());
   setColorsFromXml();

   $('#btnOk').click(function () {
    var opts = {};
    opts.txt = getTxt();
    opts.sel = getSel();
    opts.nmb = getNmb();
    opts.col = getCol();
    opts.chk = getChk();

    csInterface.evalScript(makeLayout.toString() + ';makeLayout(' + JSON.stringify(opts) + ')', function (result) {
     // alert (result);
    });
   });
   $('#btn_github').click(function () {
    try {
     window.cep.util.openURLInDefaultBrowser('https://github.com/dumbm1/ai_layout');
    } catch (e) {
     alert('See more on "https://github.com/dumbm1/ai_layout"');
    }
   });
   $('.col-btn').click(function (e) {
    var targ = e.target;
    if (targ.className != 'hostButton col-btn-close-btn') {
     prompt('shift', '5');
    }
   });
   $('input').change(function (e) {
    if ($(this).attr('id') == 'indentIn' ||
     $(this).attr('id') == 'margLeft' ||
     $(this).attr('id') == 'margRight' ||
     $(this).attr('id') == 'streams' ||
     $(this).attr('id') == 'layoutWidth' ||
     $(this).attr('id') == 'railWidth'
    ) {
     ($('#filmWidth').val(function () {
      var indentIn_val = $('#indentIn').val(),
       margLeft_val = $('#margLeft').val(),
       margRight_val = $('#margRight').val(),
       streams_val = $('#streams').val(),
       railWidth_val = $('#railWidth').val(),
       layoutWidth_val = $('#layoutWidth').val();
      return +indentIn_val * 2 + +margLeft_val + +margRight_val + +streams_val * +layoutWidth_val + +railWidth_val * 2;
     }));
    }
   });
   $('#white_layer').click(function (e) {
    // alert($('#white_layer').prop('checked'));
   });
   $('#dots').click(function (e) {
    // alert($('#dots').prop('checked'));
   });
   $('#active_doc').click(function (e) {
    // alert($('#active_doc').prop('checked'));
   });

   /* $("#layoutName").onkeypress(function() {
    $("#fileName").val($(this).val());
    });*/
   var layoutName = document.getElementById('layoutName');
   var fileName = document.getElementById('fileName');
   layoutName.onkeyup = function () {
    fileName.value = 'out_' + trnsRuToEn(document.getElementById('layoutName').value);
   };

   function trnsRuToEn(text) {
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

   /**
    * THE LIBRARY
    * */

   /*
      function setChkHandler() {

       $('input[type=checkbox].btn-link-chk').each(function () {

        if (this.checked == true) {
         $(this).parent().addClass('btn-link-checked');
         $(this).parent().parent().addClass('btn-link-div-checked');
         $(this).attr('checked', 'checked');
        } else {
         $(this).parent().removeClass('btn-link-checked');
         $(this).parent().parent().removeClass('btn-link-div-checked');
         $(this).removeAttr('checked');
        }
       });

       $('.btn-link-div').click(function () {
        var childDiv = $(this).find('.btn-link');
        var chkbx = childDiv.find('input');

        $(this).toggleClass('btn-link-div-checked', '');
        childDiv.toggleClass('btn-link-checked', '');

        if (chkbx.attr('checked') == 'checked') {
         chkbx.removeAttr('checked');
        } else {
         chkbx.attr('checked', 'checked');
        }
       });

      }
   */

   /**
    * GETTERS
    * */
   function getTxt() {
    var txt = {};
    $('textarea').each(function () {
     var key = $(this).attr('id');
     txt[key] = $(this).val();
    });
    return txt;
   }

   function getSel() {
    var sel = {};
    $('option:selected').each(function () {
     var key = $(this).parent().attr('id');
     sel[key] = $(this).val();
    });
    return sel;
   }

   function getNmb() {
    var nmb = {};
    $('input[type=number]').each(function () {
     var key = $(this).attr('id');
     nmb[key] = $(this).val();
    });
    return nmb;
   }

   function getCol() {
    var colOut = [];
    var j = 0;

    $('.col-btn').each(function () {
     var colName = $(this).find('.col-btn-title:first').text();
     var cmykComponents = '';
     for (var key in pantBook) {
      if (' ' + colName == key) {
       cmykComponents = pantBook[key];
       break;
      }
     }
     colOut[j] = {
      name: colName,
      color: $(this).css('color'),
      bg: $(this).css('background-color'),
      cmyk: cmykComponents
     };
     j++;
    });

    /**
     * raname the duplicated colors
     * */
    function _renameDuplicatesInArr(colOut) {
     var str = '';
     for (var i = 0; i < colOut.length; i++) {
      var obj = colOut[i];
      str += obj.name + '; ';
     }
     // alert(str);
     for (var i = 0; i < colOut.length; i++) {
      var current = colOut[i].name;
      var duplIndex = 2;
      for (var k = i + 1; k < colOut.length; k++) {
       var remains = colOut[k].name;
       if (current == remains) {
        colOut[k].name += '-' + duplIndex;
        duplIndex++;
       }
      }
      duplIndex = 2;
     }
     return colOut;
    }

    return _renameDuplicatesInArr(colOut);
   }

   function getChk() {
    var chk = {};
    $('input[type=checkbox]').each(function () {
     var key = $(this).attr('id');
     chk[key] = $(this).prop('checked');
    });
    return chk;
   }

   /**
    * DEFAULTS
    * */

   function defTxt() {
    return {
     fileName: 'out_000000_client_maket',
     layoutName: '000000 КЛИЕНТ МАКЕТ'
    };
   }

   function defCol() {
    return [
     {name: 'C', color: 'black', bg: 'cyan', cmyk: '100,0,0,0'},
     {name: 'M', color: 'white', bg: 'magenta', cmyk: '0,100,0,0'},
     {name: 'Y', color: 'black', bg: 'yellow', cmyk: '0,0,100,0'},
     {name: 'K', color: 'white', bg: 'black', cmyk: '0,0,0,100'},
     {name: 'W', color: 'black', bg: 'rgb(243, 236, 239)', cmyk: '3,6,2,0'}
     // {name: "L", color: "black", bg: "rgb(255, 128, 128)", cmyk: "0,50,50,0"},
     // {name: "Pr", color: "black", bg: "rgb(128, 255, 128)", cmyk: "50,0,50,0"},
    ];
   }

   function defNmb() {
    return {
     filmWidth: 314,
     streams: 1,
     layoutWidth: 300,

     margTop: 0,
     margBott: 0,
     margRight: 0,
     margLeft: 0,

     crossWidth: 5,
     crossStroke: 0.15,
     railWidth: 5,

     indentIn: 2,

     shift_1: 5,
     shift_2: 5,
     shift_3: 5,
     shift_4: 5,
     shift_5: 1,
     shift_6: 1,
     shift_7: 1,
     shift_8: 1
    };
   }

   function defSel() {
    return {
     engineList: 'soloflex',
     z: 320
    };
   }

   /**
    * SETTERS
    * */
   function setTxt(obj) {
    $('textarea').each(function () {
     for (var key in obj) {
      if (key == $(this).attr('id')) {
       $(this).val(obj[key]);
      }
     }

    });
   }

   function setSel(obj) {
    $('select').each(function () {
     for (var key in obj) {
      if (key == $(this).attr('id')) {
       $(this).find('option').each(function () {
        if ($(this).html() == obj[key]) {
         $(this).attr('selected', 'selected');
        } else {
         $(this).removeAttr('selected');
        }
       });
      }
     }
    });
   }

   // the shift paremeter is ignored
   function setNmb(obj) {

    $('input[type=number]').each(function () {
     /*          for (var key in obj) {
                var re = /shift_\d/;
                if (key == $(this).attr('id') && !($(this).attr('id').match(re))) {
                 $(this).val(obj[key]);
                } else if ($(this).attr('id').match(re)) {
                 $(this).val(+obj[key]);
                }
               }*/
     for (var key in obj) {
      if (key == $(this).attr('id')) {
       $(this).val(obj[key]);
      }
     }

    });
   }

   function setCol(arr) {
    /**
     * COLOR BUTTON TMPLATE
     * <div id="colBtns">
     ** <div class="col-btn" style="background-color: rgb(0, 255, 255); color: rgb(0, 0, 0);">
     *** <span class="col-btn-title">C</span>
     *** <span class="hostButton col-btn-close-btn">×</span>
     ** </div>
     * </div>
     * */

     // clear previous buttons
    var containter = document.getElementById('colBtns');
    containter.innerHTML = '';
    for (var i = 0; i < arr.length; i++) {
     var obj = arr[i];
     makeColBtn(obj.name, obj.color, obj.bg);
    }
   }

   function setColorsFromXml() {
    const TOTAL_INKS = 8;
    const setColorsFromXmlBtn = document.querySelector('#setColorsFromXmlBtn');
    const output = document.querySelector("#pantSearch");

    setColorsFromXmlBtn.addEventListener('click', (e) => {
     let colors = [];
     let colorsOutputString = '';

     try {
      csInterface.evalScript('getXmlStr();', function (result) {
       let xmlString = result;

       if (xmlString.match('Не найден xml-файл')) return;

       let xmlParser = new DOMParser();
       let xmlDoc = xmlParser.parseFromString(xmlString, 'text/xml');

       let inks = xmlDoc.getElementsByTagName("Ink");

       // alert(inks.length);

       try {
        Object.values(inks).forEach(function (ink, k, inks) {
         let currColor = ink.getAttribute('Name');
         if (!currColor.match(/^Process/) && currColor != 'W') {
          colors.push(currColor.slice(8, -2));
         }

        })
       } catch (e) {
        alert(e);
       }
       colorsOutputString = colors.join('|');
       output.value = colorsOutputString;
       __showP(colorsOutputString);

       function __showP(elemVal) {
        var searchFld = document.getElementById('pantSearch');
        var pantListDiv = document.getElementById('pantList');
        var pantUl = pantListDiv.getElementsByTagName('ul')[0];
        var pantLiElems = pantUl.getElementsByTagName('li');

        for (var i = 0; i < pantLiElems.length; i++) {
         var elem = pantLiElems[i];
         var liElemText = ((elem.getElementsByTagName('span')[0].textContent).slice(0)).toLowerCase();
         var re = elemVal.toLowerCase();
         if (!~liElemText.search(re)) {
          elem.className = 'hidden';
          // elem.style.display = 'none'; // cose the css-li style has a hight preority
         } else {
          elem.className = '';
          // elem.style.display = 'inline-block';
         }
        }
       }

      });
     } catch (e) {
      return ('Error in setColorsFromXml(). ' + e);
     }
    });
   }

   /**
    * @param {String} engineName - 'mira' or 'solo'
    * @return {Array} miraflex or soloflex cylinder diameter values
    * */
   function makeEngines() {
    var soloflex = [ // формный цилиндр Soloflex
     270, 280, 285, 290,
     300, 305, 310, 315, 320, 325, 330, 335, 340, 345, 350, 360, 370, 380, 390,
     400, 410, 420, 430, 440, 450, 460, 480, 495,
     500, 520, 530, 540, 560,
     600
    ];
    var miraflex = [ // формный цилиндр Miraflex
     300, 320, 330, 340, 345, 350, 360, 370, 380, 390,
     400, 410, 420, 430, 440, 450, 460, 470, 480,
     500, 520, 530, 540, 550, 560, 580,
     600, 640, 700
    ];
    var z = document.getElementById('z');
    var engineList = document.getElementById('engineList');
    _loadCylinders();
    engineList.addEventListener('change', _loadCylinders);

    function _loadCylinders() {
     if (engineList.value == 'miraflex') {
      z.innerHTML = '';

      for (var i = 0; i < miraflex.length; i++) {
       var optElem = document.createElement('option');
       optElem.innerHTML = miraflex[i];
       z.appendChild(optElem);
      }
     } else  /*if (engineList.value == 'soloflex')*/ {
      z.innerHTML = '';
      for (var i = 0; i < soloflex.length; i++) {
       var optElem = document.createElement('option');
       optElem.innerHTML = soloflex[i];
       z.appendChild(optElem);

      }
     }
    }

   }

   function searchPantByName() {
    var searchFld = document.getElementById('pantSearch');
    var pantListDiv = document.getElementById('pantList');
    var pantUl = pantListDiv.getElementsByTagName('ul')[0];
    var pantLiElems = pantUl.getElementsByTagName('li');

    searchFld.addEventListener('input', __filterNames);

    function __filterNames() {
     var elemVal = this.value;

     for (var i = 0; i < pantLiElems.length; i++) {
      var elem = pantLiElems[i];
      var liElemText = ((elem.getElementsByTagName('span')[0].textContent).slice(0)).toLowerCase();
      var re = elemVal.toLowerCase();
      if (!~liElemText.search(re)) {
       elem.className = 'hidden';
       // elem.style.display = 'none'; // cose the css-li style has a hight preority
      } else {
       elem.className = '';
       // elem.style.display = 'inline-block';
      }
     }
    }
   }

   function addPantList(pantBook) {
    var pntDiv = document.getElementById('pantList').getElementsByTagName('div')[0],
     ul = document.createElement('ul');

    for (var key in pantBook) {
     var li = document.createElement('li'),
      spn = document.createElement('span'),
      bgCol = convertCmykToRgb(pantBook[key]),
      fgCol = getContrastYIQ(bgCol);

     spn.innerHTML = key.slice(1);
     li.appendChild(spn);
     ul.appendChild(li);
     li.style.backgroundColor = 'rgb(' + bgCol.join(',') + ')';
     spn.style.color = fgCol;
     // li.setAttribute ('title', key);
    }
    pntDiv.appendChild(ul); // затем в документ
    ul.setAttribute('id', 'pantListUl');

    /**
     * @param {String} cmykValue - 4 naumbers with comma-ceparator
     * @return {Array} _rgb the array of RGB chennels values
     * */
    function convertCmykToRgb(cmykValue) {
     var _cmyk = cmykValue.split(','),
      _rgb = [];
     _rgb.push(Math.ceil(255 * (1 - _cmyk[0] / 100) * (1 - _cmyk[3] / 100)));
     _rgb.push(Math.ceil(255 * (1 - _cmyk[1] / 100) * (1 - _cmyk[3] / 100)));
     _rgb.push(Math.ceil(255 * (1 - _cmyk[2] / 100) * (1 - _cmyk[3] / 100)));

     return _rgb;
    }

    /**
     * by Brian Suda http://suda.co.uk
     * @param {Array} col - array contains three RGB number values
     * */
    function getContrastYIQ(rgbColor) {
     var r, g, b, yiq;

     r = parseInt(rgbColor[0]);
     g = parseInt(rgbColor[1]);
     b = parseInt(rgbColor[2]);

     yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
     return (yiq >= 128) ? 'black' : 'white'; // original
     // return (yiq >= 92) ? 'black' : 'white'; // my test (it's no bad too
    }
   }

   function addOutColors() {

    var pantList = document.getElementById('pantList')/*,
     mainCols = document.getElementById ('mainCols')*/;

    // mainCols.addEventListener ('mousedown', function (e) {
    //   _addColBtn (e);
    // });

    pantList.addEventListener('mousedown', function (e) {
     _addColBtn(e);
    });

    function _addColBtn(e) {
     var targ = e.target,
      col, bgCol, txt;

     if (targ.nodeName == 'UL') return;

     if (targ.nodeName == 'SPAN') {
      txt = targ.textContent;
      col = targ.style.color || window.getComputedStyle(targ).color;
      targ = targ.parentNode;
      bgCol = targ.style.backgroundColor || window.getComputedStyle(targ).backgroundColor;
      makeColBtn(txt, col, bgCol);
      return;
     }

     if (targ.nodeName == 'LI') {
      bgCol = targ.style.backgroundColor || window.getComputedStyle(targ).backgroundColor;
      targ = targ.getElementsByTagName('span')[0];
      col = targ.style.color || window.getComputedStyle(targ).color;
      txt = targ.textContent;
      makeColBtn(txt, col, bgCol);
      return;
     }

    }

   }

   function makeColBtn(/*txt, col, bgCol*/) {
    var txt = arguments[0],
     col = arguments[1],
     bgCol = arguments[2],
     container = document.getElementById('colBtns'),
     colLen = 8,
     btnsLen = container.getElementsByClassName('col-btn').length;

    if (btnsLen == colLen) return;

    var btn = document.createElement('div'),
     btnTitle = document.createElement('span'),
     btnClose = document.createElement('span');

    btn.className = 'col-btn';
    btnTitle.className = 'col-btn-title';
    btnClose.className = 'hostButton col-btn-close-btn';

    btn.style.backgroundColor = bgCol;
    btn.style.color = col;
    btnTitle.innerHTML = txt;
    btnClose.innerHTML = '&#xd7';

    btnClose.addEventListener('click', function (e) {
     ((this.parentNode).parentNode).removeChild(this.parentNode);
    });

    btn.appendChild(btnTitle);
    btn.appendChild(btnClose);
    container.appendChild(btn);
   }

   function showObjDeep(obj) {
    var str = '{\n';
    var indent = 1;

    showObj(obj);

    function showObj(obj) {

     for (var key in obj) {
      if (typeof obj[key] == 'object' /*&& !obj[key].splice*/) {
       str += addIndent(indent) + key + ':\n';
       ++indent;
       showObj(obj[key]);
      } else {
       str += addIndent(indent) + key + ': ' + obj[key] + ' [' + typeof obj[key] + '],\n';
      }
     }
     indent--;
    }

    return str + '}';

    function addIndent(i) {
     return new Array(i).join('_');
    }
   }

   /**
    * @return {Object}  { "pantone_name": "c,m,y,k"}
    */
   function makePantoneBook() {
    return {
     ' Pr': '50,0,50,0',
     ' W': '3,6,2,0',
     ' C': '100,0,0,0',
     ' M': '0,100,0,0',
     ' Y': '0,0,100,0',
     ' K': '0,0,0,100',
     ' L': '0,50,50,0',
     ' Process Black': '0,0,0, 100',
     ' Process Cyan': '100, 0, 0, 0',
     ' Process Magenta': '0, 100, 0, 0',
     ' Process Yellow': '0, 0, 100, 0',
     ' Black': '0,7,12,83',
     ' Blue 072': '100,87,0,38',
     ' Blue 0821': '40,0,6,0',
     ' Bright Red': '0,76,86,1',
     ' Dark Blue': '100,73,0,39',
     ' Green': '100,0,22,33',
     ' Medium Purple': '56,90,0,45',
     ' Orange 021': '0,67,99,0',
     ' Pink': '0,78,29,16',
     ' Process Blue': '100,33,0,21',
     ' Purple': '3,73,0,28',
     ' Red 032': '0,78,73,5',
     ' Reflex Blue': '100,79,0,46',
     ' Rhodamine Red': '0,91,32,13',
     ' Rubine Red': '0,92,58,18',
     ' Violet': '74,87,0,40',
     ' Warm Red': '0,73,77,2',
     ' Yellow 012': '0,17,94,0',
     ' Yellow': '0,14,92,0',
     ' Black 2': '0,8,37,80',
     ' Black 3': '19,0,16,84',
     ' Black 4': '0,20,39,80',
     ' Black 5': '0,30,27,76',
     ' Black 6': '58,20,0,88',
     ' Black 7': '0,5,14,76',
     ' Cool Gray 1': '1,0,0,14',
     ' Cool Gray 2': '1,0,1,18',
     ' Cool Gray 3': '1,0,1,21',
     ' Cool Gray 4': '0,0,0,27',
     ' Cool Gray 5': '1,0,0,30',
     ' Cool Gray 6': '4,2,0,33',
     ' Cool Gray 7': '5,2,0,39',
     ' Cool Gray 8': '5,2,0,44',
     ' Cool Gray 9': '8,3,0,51',
     ' Cool Gray 10': '10,3,0,58',
     ' Cool Gray 11': '12,4,0,64',
     ' Warm Gray 1': '0,3,6,15',
     ' Warm Gray 2': '0,3,8,21',
     ' Warm Gray 3': '0,4,8,25',
     ' Warm Gray 4': '0,4,8,30',
     ' Warm Gray 5': '0,4,9,33',
     ' Warm Gray 6': '0,5,10,35',
     ' Warm Gray 7': '0,6,12,41',
     ' Warm Gray 8': '0,8,14,45',
     ' Warm Gray 9': '0,8,16,49',
     ' Warm Gray 10': '0,8,17,53',
     ' Warm Gray 11': '0,11,19,57',
     ' 871': '0,13,41,47',
     ' 872': '0,16,42,47',
     ' 873': '0,20,45,46',
     ' 874': '0,21,45,45',
     ' 875': '0,26,42,46',
     ' 876': '0,29,45,45',
     ' 877': '5,2,0,43',
     ' 801': '100,24,0,20',
     ' 802': '59,0,75,17',
     ' 803': '0,9,91,0',
     ' 804': '0,34,68,0',
     ' 805': '0,55,53,0',
     ' 806': '0,73,28,1',
     ' 807': '0,79,17,10',
     ' 808': '100,0,16,29',
     ' 809': '0,3,79,7',
     ' 810': '0,17,77,0',
     ' 811': '0,44,57,0',
     ' 812': '0,61,36,0',
     ' 813': '0,69,21,3',
     ' 814': '42,49,0,16',
     ' 901': '100,21,0,15',
     ' 902': '35,0,50,9',
     ' 903': '0,5,56,0',
     ' 904': '0,20,45,0',
     ' 905': '0,38,34,0',
     ' 906': '0,50,15,1',
     ' 907': '0,54,8,7',
     ' 908': '100,20,0,14',
     ' 909': '26,0,40,7',
     ' 910': '0,5,44,0',
     ' 911': '0,15,35,0',
     ' 912': '0,32,28,0',
     ' 913': '0,41,12,2',
     ' 914': '0,45,7,5',
     ' 915': '100,17,0,11',
     ' 916': '20,0,30,7',
     ' 917': '0,4,35,1',
     ' 918': '0,12,29,0',
     ' 919': '0,24,21,0',
     ' 920': '0,31,10,1',
     ' 921': '0,32,6,5',
     ' 922': '100,0,14,24',
     ' 923': '0,2,56,4',
     ' 924': '0,10,54,0',
     ' 925': '0,32,42,0',
     ' 926': '0,47,26,0',
     ' 927': '0,51,12,2',
     ' 928': '37,44,0,14',
     ' 929': '85,0,12,21',
     ' 930': '0,2,44,3',
     ' 931': '0,9,47,0',
     ' 932': '0,27,35,0',
     ' 933': '0,38,20,0',
     ' 934': '0,42,10,3',
     ' 935': '29,34,0,12',
     ' 936': '51,0,7,16',
     ' 937': '0,0,31,4',
     ' 938': '0,7,34,0',
     ' 939': '0,19,25,0',
     ' 940': '0,28,13,1',
     ' 941': '0,31,6,3',
     ' 942': '20,24,0,9',
     ' 100': '0,8,60,0',
     ' 101': '0,8,69,0',
     ' 102': '0,12,90,0',
     ' 103': '0,17,93,20',
     ' 104': '0,17,93,29',
     ' 105': '0,15,70,44',
     ' 106': '0,10,70,0',
     ' 107': '0,12,82,0',
     ' 108': '0,14,89,0',
     ' 109': '0,18,93,0',
     ' 110': '0,24,93,12',
     ' 111': '0,22,93,31',
     ' 112': '0,19,85,36',
     ' 113': '0,13,67,0',
     ' 114': '0,13,73,0',
     ' 115': '0,15,83,0',
     ' 116': '0,20,92,0',
     ' 117': '0,28,95,18',
     ' 118': '0,26,95,30',
     ' 119': '0,18,73,45',
     ' 120': '0,14,59,0',
     ' 1205': '0,12,43,0',
     ' 121': '0,15,64,0',
     ' 1215': '0,16,54,0',
     ' 122': '0,19,73,0',
     ' 1225': '0,22,72,0',
     ' 123': '0,23,81,0',
     ' 1235': '0,28,86,0',
     ' 124': '0,30,95,6',
     ' 1245': '0,29,87,20',
     ' 125': '0,29,95,27',
     ' 1255': '0,26,80,30',
     ' 126': '0,26,85,38',
     ' 1265': '0,24,72,45',
     ' 127': '0,12,56,1',
     ' 128': '0,16,68,2',
     ' 129': '0,18,74,2',
     ' 130': '0,32,94,3',
     ' 131': '0,34,95,18',
     ' 132': '0,31,95,35',
     ' 133': '0,21,74,57',
     ' 134': '0,17,55,0',
     ' 1345': '0,19,47,0',
     ' 135': '0,22,64,0',
     ' 1355': '0,22,56,0',
     ' 136': '0,25,74,0',
     ' 1365': '0,30,70,0',
     ' 137': '0,36,96,0',
     ' 1375': '0,38,87,0',
     ' 138': '0,46,97,11',
     ' 1385': '0,45,97,15',
     ' 139': '0,40,96,30',
     ' 1395': '0,39,84,39',
     ' 140': '0,30,74,54',
     ' 1405': '0,31,71,56',
     ' 141': '0,19,61,3',
     ' 142': '0,24,69,3',
     ' 143': '0,27,77,3',
     ' 144': '0,42,95,5',
     ' 145': '0,40,96,17',
     ' 146': '0,36,87,32',
     ' 147': '0,21,62,54',
     ' 148': '0,21,45,0',
     ' 1485': '0,32,61,0',
     ' 149': '0,24,50,0',
     ' 1495': '0,44,87,0',
     ' 150': '0,30,64,0',
     ' 1505': '0,59,100,0',
     ' 151': '0,49,97,0',
     ' 152': '0,52,98,8',
     ' 1525': '0,62,99,27',
     ' 153': '0,45,87,24',
     ' 1535': '0,54,91,41',
     ' 154': '0,43,82,38',
     ' 1545': '0,44,76,60',
     ' 155': '0,15,34,5',
     ' 1555': '0,28,43,0',
     ' 156': '0,22,48,5',
     ' 1565': '0,37,58,0',
     ' 157': '0,33,64,6',
     ' 1575': '0,50,80,0',
     ' 158': '0,50,85,7',
     ' 1585': '0,58,92,0',
     ' 159': '0,53,88,19',
     ' 1595': '0,56,88,14',
     ' 160': '0,48,82,36',
     ' 1605': '0,50,79,33',
     ' 161': '0,37,66,61',
     ' 1615': '0,49,76,44',
     ' 162': '0,25,36,0',
     ' 1625': '0,36,45,0',
     ' 163': '0,39,57,0',
     ' 1635': '0,44,57,0',
     ' 164': '0,50,74,0',
     ' 1645': '0,58,76,0',
     ' 165': '0,59,87,0',
     ' 1655': '0,69,100,0',
     ' 166': '0,64,97,10',
     ' 1665': '0,69,98,12',
     ' 167': '0,57,85,24',
     ' 1675': '0,61,82,32',
     ' 168': '0,51,75,53',
     ' 1685': '0,56,77,48',
     ' 169': '0,30,33,0',
     ' 170': '0,47,54,0',
     ' 171': '0,63,77,0',
     ' 172': '0,72,91,0',
     ' 173': '0,66,85,17',
     ' 174': '0,63,78,41',
     ' 175': '0,52,61,58',
     ' 176': '0,30,26,0',
     ' 1765': '0,35,29,0',
     ' 1767': '0,30,24,2',
     ' 177': '0,49,45,0',
     ' 1775': '0,44,36,0',
     ' 1777': '0,60,50,1',
     ' 178': '0,64,63,0',
     ' 1785': '0,71,62,2',
     ' 1787': '0,77,69,3',
     ' 1788': '0,83,77,6',
     ' 179': '0,73,78,11',
     ' 1795': '0,81,77,16',
     ' 1797': '0,74,71,19',
     ' 180': '0,69,72,25',
     ' 1805': '0,77,74,30',
     ' 1807': '0,67,64,35',
     ' 181': '0,62,64,49',
     ' 1815': '0,70,67,51',
     ' 1817': '0,50,46,60',
     ' 182': '0,25,18,2',
     ' 183': '0,38,30,0',
     ' 184': '0,66,53,4',
     ' 185': '0,94,81,9',
     ' 186': '0,88,77,20',
     ' 187': '0,83,72,34',
     ' 188': '0,70,60,53',
     ' 189': '0,34,25,3',
     ' 1895': '0,25,16,3',
     ' 190': '0,52,38,3',
     ' 1905': '0,36,24,4',
     ' 191': '0,72,54,5',
     ' 1915': '0,67,47,5',
     ' 192': '0,92,69,10',
     ' 1925': '0,96,66,12',
     ' 193': '0,88,68,24',
     ' 1935': '0,97,69,22',
     ' 194': '0,74,58,39',
     ' 1945': '0,90,64,34',
     ' 195': '0,61,47,52',
     ' 1955': '0,83,59,45',
     ' 196': '0,16,13,7',
     ' 197': '0,32,24,10',
     ' 198': '0,67,57,11',
     ' 199': '0,95,77,15',
     ' 200': '0,92,75,26',
     ' 2001': '0,9,39,1',
     ' 2002': '0,12,51,0',
     ' 2003': '0,12,58,0',
     ' 2004': '0,14,51,0',
     ' 2005': '0,16,49,0',
     ' 2006': '0,22,66,6',
     ' 2007': '0,28,81,10',
     ' 2008': '0,21,54,4',
     ' 2009': '0,26,59,4',
     ' 201': '0,76,66,38',
     ' 2010': '0,31,92,0',
     ' 2011': '0,36,78,5',
     ' 2012': '0,39,96,4',
     ' 2013': '0,40,96,0',
     ' 2014': '0,41,99,27',
     ' 2015': '0,18,32,1',
     ' 2016': '0,29,54,0',
     ' 2017': '0,32,56,1',
     ' 2018': '0,53,98,0',
     ' 2019': '0,51,97,14',
     ' 202': '0,70,61,47',
     ' 2020': '0,56,99,25',
     ' 2021': '0,54,85,37',
     ' 2022': '0,33,44,1',
     ' 2023': '0,42,56,0',
     ' 2024': '0,50,65,1',
     ' 2025': '0,46,76,0',
     ' 2026': '0,60,75,3',
     ' 2027': '0,65,74,6',
     ' 2028': '0,77,100,7',
     ' 2029': '0,47,48,5',
     ' 203': '0,23,13,8',
     ' 2030': '0,45,47,13',
     ' 2031': '0,51,53,15',
     ' 2032': '0,57,59,17',
     ' 2033': '0,64,66,21',
     ' 2034': '0,73,74,9',
     ' 2035': '0,93,88,15',
     ' 2036': '0,23,13,3',
     ' 2037': '0,37,17,6',
     ' 2038': '0,59,32,7',
     ' 2039': '0,73,41,10',
     ' 204': '0,44,27,10',
     ' 2040': '0,89,59,13',
     ' 2041': '0,77,51,37',
     ' 2042': '0,62,44,56',
     ' 2043': '0,16,10,8',
     ' 2044': '0,35,20,11',
     ' 2045': '0,47,27,14',
     ' 2046': '0,57,33,20',
     ' 2047': '0,58,33,35',
     ' 2048': '0,60,34,41',
     ' 2049': '0,65,42,48',
     ' 205': '0,67,45,12',
     ' 2050': '0,9,2,7',
     ' 2051': '0,11,5,14',
     ' 2052': '0,18,8,23',
     ' 2053': '0,27,11,31',
     ' 2054': '0,27,11,39',
     ' 2055': '0,34,15,44',
     ' 2056': '0,41,19,51',
     ' 2057': '0,28,10,19',
     ' 2058': '0,27,6,28',
     ' 2059': '0,31,11,29',
     ' 206': '0,96,73,19',
     ' 2060': '0,45,15,22',
     ' 2061': '0,51,20,33',
     ' 2062': '0,60,21,30',
     ' 2063': '0,68,25,36',
     ' 2064': '0,26,3,13',
     ' 2065': '2,23,0,14',
     ' 2066': '3,31,0,17',
     ' 2067': '4,44,0,24',
     ' 2068': '6,54,0,28',
     ' 2069': '7,62,0,33',
     ' 207': '0,97,69,35',
     ' 2070': '9,78,0,42',
     ' 2071': '12,19,0,13',
     ' 2072': '16,28,0,17',
     ' 2073': '21,29,0,17',
     ' 2074': '27,43,0,25',
     ' 2075': '32,44,0,26',
     ' 2076': '32,49,0,29',
     ' 2077': '42,59,0,36',
     ' 2078': '5,15,0,26',
     ' 2079': '8,24,0,36',
     ' 208': '0,75,52,47',
     ' 2080': '14,31,0,33',
     ' 2081': '17,38,0,39',
     ' 2082': '22,45,0,43',
     ' 2083': '31,50,0,22',
     ' 2084': '35,67,0,30',
     ' 2085': '6,11,0,10',
     ' 2086': '25,31,0,20',
     ' 2087': '32,40,0,16',
     ' 2088': '42,52,0,22',
     ' 2089': '49,59,0,27',
     ' 209': '0,64,45,56',
     ' 2090': '54,66,0,29',
     ' 2091': '68,82,0,37',
     ' 2092': '18,20,0,16',
     ' 2093': '17,21,0,23',
     ' 2094': '23,26,0,32',
     ' 2095': '39,42,0,31',
     ' 2096': '46,51,0,36',
     ' 2097': '58,61,0,26',
     ' 2098': '75,75,0,34',
     ' 2099': '14,19,0,21',
     ' 210': '0,35,19,3',
     ' 2100': '24,28,0,21',
     ' 2101': '40,43,0,19',
     ' 2102': '51,48,0,31',
     ' 2103': '58,54,0,34',
     ' 2104': '65,62,0,39',
     ' 2105': '69,71,0,51',
     ' 2106': '17,11,0,19',
     ' 2107': '26,18,0,27',
     ' 2108': '33,24,0,34',
     ' 2109': '38,28,0,40',
     ' 211': '0,47,25,5',
     ' 2110': '42,31,0,44',
     ' 2111': '55,37,0,51',
     ' 2112': '62,68,0,60',
     ' 2113': '31,23,0,11',
     ' 2114': '41,29,0,22',
     ' 2115': '48,35,0,27',
     ' 2116': '56,40,0,30',
     ' 2117': '71,51,0,39',
     ' 2118': '71,55,0,53',
     ' 2119': '70,52,0,61',
     ' 212': '0,66,36,6',
     ' 2120': '21,13,0,9',
     ' 2121': '40,21,0,15',
     ' 2122': '36,23,0,11',
     ' 2123': '53,32,0,14',
     ' 2124': '57,40,0,17',
     ' 2125': '76,50,0,22',
     ' 2126': '100,65,0,30',
     ' 2127': '20,10,0,12',
     ' 2128': '38,21,0,10',
     ' 2129': '70,35,0,14',
     ' 213': '0,84,47,10',
     ' 2130': '75,42,0,17',
     ' 2131': '100,51,0,25',
     ' 2132': '100,53,0,24',
     ' 2133': '100,46,0,35',
     ' 2134': '34,20,0,19',
     ' 2135': '45,26,0,25',
     ' 2136': '33,19,0,28',
     ' 2137': '42,24,0,34',
     ' 2138': '36,19,0,43',
     ' 2139': '59,30,0,41',
     ' 214': '0,86,49,19',
     ' 2140': '70,35,0,49',
     ' 2141': '45,18,0,9',
     ' 2142': '50,24,0,11',
     ' 2143': '97,33,0,20',
     ' 2144': '100,43,0,28',
     ' 2145': '100,51,0,34',
     ' 2146': '100,60,0,43',
     ' 2147': '100,65,0,53',
     ' 2148': '53,18,0,30',
     ' 2149': '64,23,0,33',
     ' 215': '0,85,48,33',
     ' 2150': '84,26,0,38',
     ' 2151': '100,33,0,36',
     ' 2152': '100,29,0,43',
     ' 2153': '100,30,0,51',
     ' 2154': '100,44,0,49',
     ' 2155': '26,10,0,20',
     ' 2156': '33,14,0,24',
     ' 2157': '39,17,0,30',
     ' 2158': '51,22,0,35',
     ' 2159': '58,23,0,39',
     ' 216': '0,72,43,52',
     ' 2160': '67,27,0,43',
     ' 2161': '92,30,0,49',
     ' 2162': '13,7,0,29',
     ' 2163': '26,11,0,31',
     ' 2164': '29,12,0,34',
     ' 2165': '35,14,0,40',
     ' 2166': '44,18,0,45',
     ' 2167': '46,19,0,47',
     ' 2168': '76,20,0,64',
     ' 2169': '44,16,0,18',
     ' 217': '0,18,6,10',
     ' 2170': '60,21,0,22',
     ' 2171': '88,28,0,12',
     ' 2172': '100,40,0,18',
     ' 2173': '100,37,0,17',
     ' 2174': '100,41,0,19',
     ' 2175': '100,45,0,22',
     ' 2176': '17,6,0,24',
     ' 2177': '30,7,0,32',
     ' 2178': '36,9,0,38',
     ' 2179': '47,12,0,45',
     ' 218': '0,50,22,11',
     ' 2180': '58,14,0,51',
     ' 2181': '70,14,0,58',
     ' 2182': '98,19,0,64',
     ' 2183': '100,22,0,26',
     ' 2184': '100,37,0,17',
     ' 2185': '100,28,0,35',
     ' 2186': '100,45,0,47',
     ' 2187': '100,40,0,54',
     ' 2188': '100,36,0,59',
     ' 2189': '100,30,0,71',
     ' 219': '0,83,40,15',
     ' 2190': '75,20,0,10',
     ' 2191': '100,27,0,12',
     ' 2192': '100,33,0,15',
     ' 2193': '100,33,0,15',
     ' 2194': '100,37,0,16',
     ' 2195': '100,41,0,19',
     ' 2196': '100,39,0,31',
     ' 2197': '57,9,0,9',
     ' 2198': '84,11,0,11',
     ' 2199': '100,15,0,14',
     ' 220': '0,93,52,35',
     ' 2200': '100,15,0,23',
     ' 2201': '100,19,0,16',
     ' 2202': '100,25,0,13',
     ' 2203': '100,22,0,32',
     ' 2204': '22,5,0,16',
     ' 2205': '34,9,0,23',
     ' 2206': '37,11,0,30',
     ' 2207': '48,13,0,30',
     ' 2208': '55,16,0,36',
     ' 2209': '61,15,0,37',
     ' 221': '0,93,51,43',
     ' 2210': '100,30,0,55',
     ' 2211': '37,7,0,35',
     ' 2212': '51,9,0,43',
     ' 2213': '67,8,0,52',
     ' 2214': '72,9,0,52',
     ' 2215': '63,14,0,61',
     ' 2216': '56,13,0,65',
     ' 2217': '100,9,0,74',
     ' 2218': '44,7,0,25',
     ' 2219': '56,9,0,29',
     ' 222': '0,71,36,59',
     ' 2220': '66,10,0,34',
     ' 2221': '96,12,0,38',
     ' 2222': '100,14,0,40',
     ' 2223': '100,16,0,45',
     ' 2224': '100,18,0,49',
     ' 2225': '53,6,0,11',
     ' 2226': '87,7,0,14',
     ' 2227': '63,6,0,21',
     ' 2228': '100,13,0,25',
     ' 2229': '100,14,0,28',
     ' 223': '0,35,12,7',
     ' 2230': '100,13,0,37',
     ' 2231': '100,15,0,43',
     ' 2232': '41,2,0,29',
     ' 2233': '54,4,0,31',
     ' 2234': '60,4,0,34',
     ' 2235': '95,6,0,38',
     ' 2236': '94,8,0,38',
     ' 2237': '100,6,0,44',
     ' 2238': '100,11,0,54',
     ' 2239': '100,0,12,18',
     ' 224': '0,51,19,9',
     ' 2240': '100,0,16,24',
     ' 2241': '46,0,9,36',
     ' 2242': '99,0,27,35',
     ' 2243': '100,0,17,41',
     ' 2244': '86,0,13,50',
     ' 2245': '90,0,35,48',
     ' 2246': '22,0,11,16',
     ' 2247': '38,0,20,25',
     ' 2248': '37,0,21,28',
     ' 2249': '45,0,23,33',
     ' 225': '0,83,33,12',
     ' 2250': '94,0,34,31',
     ' 2251': '91,0,35,33',
     ' 2252': '81,0,53,35',
     ' 2253': '18,0,14,8',
     ' 2254': '22,0,19,13',
     ' 2255': '34,0,28,18',
     ' 2256': '53,0,41,24',
     ' 2257': '80,0,52,33',
     ' 2258': '80,0,72,48',
     ' 2259': '82,0,66,56',
     ' 226': '0,92,47,19',
     ' 2260': '12,0,15,19',
     ' 2261': '16,0,20,28',
     ' 2262': '18,0,20,33',
     ' 2263': '21,0,26,41',
     ' 2264': '27,0,35,41',
     ' 2265': '25,0,35,51',
     ' 2266': '36,0,54,66',
     ' 2267': '29,0,31,13',
     ' 2268': '42,0,42,15',
     ' 2269': '34,0,46,21',
     ' 227': '0,94,44,34',
     ' 2270': '68,0,60,22',
     ' 2271': '75,0,70,28',
     ' 2272': '77,0,81,40',
     ' 2273': '64,0,64,56',
     ' 2274': '5,0,19,14',
     ' 2275': '9,0,32,14',
     ' 2276': '14,0,52,35',
     ' 2277': '36,0,77,42',
     ' 2278': '31,0,71,50',
     ' 2279': '22,0,65,51',
     ' 228': '0,85,36,46',
     ' 2280': '23,0,68,59',
     ' 2281': '4,0,32,9',
     ' 2282': '12,0,35,9',
     ' 2283': '22,0,55,12',
     ' 2284': '13,0,40,16',
     ' 2285': '27,0,64,15',
     ' 2286': '34,0,89,21',
     ' 2287': '46,0,89,23',
     ' 2288': '8,0,45,11',
     ' 2289': '6,0,43,15',
     ' 229': '0,66,32,60',
     ' 2290': '17,0,82,14',
     ' 2291': '17,0,87,17',
     ' 2292': '21,0,86,22',
     ' 2293': '23,0,90,24',
     ' 2294': '24,0,92,34',
     ' 2295': '2,0,41,8',
     ' 2296': '4,0,55,9',
     ' 2297': '9,0,85,13',
     ' 2298': '13,0,59,14',
     ' 2299': '17,0,73,18',
     ' 230': '0,31,11,5',
     ' 2300': '9,0,65,24',
     ' 2301': '11,0,81,32',
     ' 2302': '2,0,44,28',
     ' 2303': '7,0,50,30',
     ' 2304': '3,0,54,33',
     ' 2305': '1,0,89,35',
     ' 2306': '4,0,72,45',
     ' 2307': '0,0,79,57',
     ' 2308': '0,13,68,62',
     ' 2309': '0,12,23,9',
     ' 231': '0,49,16,6',
     ' 2310': '0,12,23,15',
     ' 2311': '0,19,35,19',
     ' 2312': '0,16,29,28',
     ' 2313': '0,26,47,22',
     ' 2314': '0,32,60,32',
     ' 2315': '0,50,88,42',
     ' 2316': '0,19,35,26',
     ' 2317': '0,27,49,28',
     ' 2318': '0,30,56,35',
     ' 2319': '0,35,66,44',
     ' 232': '0,71,26,10',
     ' 2320': '0,38,67,55',
     ' 2321': '0,28,49,56',
     ' 2322': '0,32,53,69',
     ' 2323': '0,3,16,28',
     ' 2324': '0,10,27,29',
     ' 2325': '0,11,28,36',
     ' 2326': '0,12,32,45',
     ' 2327': '0,8,32,48',
     ' 2328': '0,15,39,52',
     ' 2329': '0,17,44,59',
     ' 233': '0,90,36,23',
     ' 2330': '0,1,3,19',
     ' 2331': '0,3,4,32',
     ' 2332': '0,1,4,46',
     ' 2333': '0,3,6,55',
     ' 2334': '0,6,8,58',
     ' 2335': '0,16,25,63',
     ' 2336': '0,5,8,69',
     ' 2337': '0,23,26,2',
     ' 2338': '0,26,29,12',
     ' 2339': '0,38,39,6',
     ' 234': '0,92,36,36',
     ' 2340': '0,46,43,19',
     ' 2341': '0,40,39,29',
     ' 2342': '0,49,45,29',
     ' 2343': '0,48,39,34',
     ' 2344': '0,48,54,5',
     ' 2345': '0,56,59,0',
     ' 2346': '0,64,58,0',
     ' 2347': '0,96,100,10',
     ' 2348': '0,63,67,10',
     ' 2349': '0,73,98,19',
     ' 235': '0,88,35,49',
     ' 2350': '0,80,86,31',
     ' 2351': '0,33,3,28',
     ' 2352': '0,42,7,30',
     ' 2353': '0,57,12,27',
     ' 2354': '0,43,2,44',
     ' 2355': '0,88,7,48',
     ' 2356': '0,91,11,57',
     ' 2357': '0,78,30,62',
     ' 2358': '3,6,0,31',
     ' 2359': '8,14,0,47',
     ' 236': '0,30,8,6',
     ' 2360': '18,15,0,43',
     ' 2361': '24,20,0,45',
     ' 2362': '22,18,0,48',
     ' 2363': '20,19,0,54',
     ' 2364': '9,16,0,57',
     ' 2365': '0,20,3,8',
     ' 2366': '59,46,0,20',
     ' 2367': '69,55,0,31',
     ' 2368': '77,60,0,25',
     ' 2369': '100,63,0,28',
     ' 237': '0,41,10,9',
     ' 2370': '100,69,0,42',
     ' 2371': '92,86,0,44',
     ' 2372': '98,71,0,53',
     ' 2373': '34,18,0,37',
     ' 2374': '46,25,0,50',
     ' 2375': '0,45,8,13',
     ' 2376': '36,20,0,56',
     ' 2377': '70,23,0,56',
     ' 2378': '54,28,0,59',
     ' 2379': '39,21,0,65',
     ' 238': '0,56,14,12',
     ' 2380': '55,30,0,71',
     ' 2381': '70,33,0,13',
     ' 2382': '100,36,0,16',
     ' 2383': '100,32,0,31',
     ' 2384': '100,38,0,37',
     ' 2385': '0,70,14,19',
     ' 2386': '100,45,0,23',
     ' 2387': '100,49,0,21',
     ' 2388': '100,54,0,30',
     ' 2389': '73,20,0,21',
     ' 239': '0,68,18,15',
     ' 2390': '100,27,0,33',
     ' 2391': '100,23,0,35',
     ' 2392': '100,22,0,48',
     ' 2393': '100,28,0,20',
     ' 2394': '100,32,0,20',
     ' 2395': '0,89,18,24',
     ' 2396': '100,14,0,29',
     ' 2397': '100,4,0,25',
     ' 2398': '100,0,2,27',
     ' 2399': '100,0,7,33',
     ' 240': '0,75,20,24',
     ' 2400': '100,0,14,31',
     ' 2401': '75,0,8,35',
     ' 2402': '100,0,15,38',
     ' 2403': '100,0,10,46',
     ' 2404': '11,0,15,27',
     ' 2405': '0,90,18,32',
     ' 2406': '18,0,14,39',
     ' 2407': '24,0,17,44',
     ' 2408': '40,0,30,52',
     ' 2409': '22,0,26,61',
     ' 241': '0,83,23,33',
     ' 2410': '24,0,30,65',
     ' 2411': '54,0,47,74',
     ' 2412': '65,0,28,16',
     ' 2413': '72,0,20,28',
     ' 2414': '88,0,31,26',
     ' 2415': '0,90,20,38',
     ' 2416': '89,0,32,31',
     ' 2417': '74,0,31,39',
     ' 2418': '85,0,52,47',
     ' 2419': '99,0,27,51',
     ' 242': '0,70,24,51',
     ' 2420': '79,0,50,23',
     ' 2421': '64,0,90,29',
     ' 2422': '78,0,71,35',
     ' 2423': '77,0,82,33',
     ' 2424': '63,0,92,39',
     ' 2425': '0,90,21,50',
     ' 2426': '77,0,81,45',
     ' 2427': '81,0,66,63',
     ' 2428': '0,40,79,11',
     ' 2429': '0,53,85,22',
     ' 243': '0,19,1,10',
     ' 2430': '0,26,44,14',
     ' 2431': '0,36,62,11',
     ' 2432': '0,38,60,12',
     ' 2433': '0,45,64,13',
     ' 2434': '0,47,58,9',
     ' 2435': '0,43,54,23',
     ' 2436': '0,55,66,28',
     ' 2437': '0,23,35,3',
     ' 2438': '0,30,42,10',
     ' 2439': '0,32,42,22',
     ' 244': '0,31,3,11',
     ' 2440': '0,19,23,28',
     ' 2441': '0,34,44,34',
     ' 2442': '0,40,46,37',
     ' 2443': '0,60,77,44',
     ' 2444': '0,26,30,13',
     ' 2445': '0,38,36,13',
     ' 2446': '0,35,32,18',
     ' 2447': '0,37,32,31',
     ' 2448': '0,55,62,13',
     ' 2449': '0,49,44,72',
     ' 245': '0,40,2,15',
     ' 2450': '0,66,37,15',
     ' 2451': '0,62,38,29',
     ' 2452': '0,70,43,23',
     ' 2453': '8,23,0,23',
     ' 2454': '100,22,0,36',
     ' 2455': '24,0,5,25',
     ' 2456': '76,0,11,39',
     ' 2457': '18,0,10,33',
     ' 2458': '32,0,14,40',
     ' 2459': '51,0,15,32',
     ' 246': '0,76,9,24',
     ' 2460': '42,0,2,31',
     ' 2461': '86,0,2,41',
     ' 2462': '38,0,6,45',
     ' 2463': '24,0,4,54',
     ' 2464': '33,0,40,26',
     ' 2465': '65,0,55,57',
     ' 2466': '55,0,4,69',
     ' 2467': '0,21,41,28',
     ' 2468': '0,32,50,40',
     ' 2469': '0,40,59,43',
     ' 247': '0,80,10,29',
     ' 2470': '0,19,37,39',
     ' 2471': '0,18,28,35',
     ' 2472': '0,33,55,62',
     ' 2473': '0,5,3,24',
     ' 2474': '0,8,13,31',
     ' 2475': '0,16,20,36',
     ' 2476': '0,16,17,49',
     ' 2477': '0,22,24,56',
     ' 2478': '0,27,20,71',
     ' 2479': '0,17,25,75',
     ' 248': '0,78,9,37',
     ' 249': '0,66,14,50',
     ' 250': '0,18,0,10',
     ' 251': '3,30,0,13',
     ' 252': '5,50,0,19',
     ' 253': '3,77,0,33',
     ' 254': '3,76,0,41',
     ' 255': '0,65,2,57',
     ' 256': '6,14,0,13',
     ' 2562': '9,25,0,10',
     ' 2563': '8,23,0,16',
     ' 2567': '14,26,0,14',
     ' 257': '7,22,0,18',
     ' 2572': '12,35,0,14',
     ' 2573': '13,34,0,19',
     ' 2577': '21,38,0,20',
     ' 258': '12,51,0,40',
     ' 2582': '19,57,0,22',
     ' 2583': '14,46,0,30',
     ' 2587': '32,58,0,32',
     ' 259': '13,70,0,53',
     ' 2592': '20,74,0,29',
     ' 2593': '19,65,0,39',
     ' 2597': '42,85,0,46',
     ' 260': '6,60,0,60',
     ' 2602': '20,78,0,38',
     ' 2603': '19,69,0,49',
     ' 2607': '43,86,0,53',
     ' 261': '6,55,0,63',
     ' 2612': '14,69,0,49',
     ' 2613': '18,70,0,54',
     ' 2617': '41,84,0,60',
     ' 262': '2,47,0,69',
     ' 2622': '5,49,0,60',
     ' 2623': '13,65,0,59',
     ' 2627': '36,76,0,67',
     ' 263': '10,14,0,9',
     ' 2635': '16,20,0,11',
     ' 264': '18,26,0,11',
     ' 2645': '26,31,0,14',
     ' 265': '36,49,0,19',
     ' 2655': '34,42,0,17',
     ' 266': '48,65,0,26',
     ' 2665': '45,55,0,23',
     ' 267': '49,73,0,38',
     ' 268': '42,63,0,48',
     ' 2685': '74,90,0,55',
     ' 269': '33,56,0,57',
     ' 2695': '46,61,0,72',
     ' 270': '23,19,0,13',
     ' 2705': '30,26,0,11',
     ' 2706': '15,9,0,8',
     ' 2707': '21,9,0,7',
     ' 2708': '25,13,0,8',
     ' 271': '34,28,0,17',
     ' 2715': '43,38,0,16',
     ' 2716': '34,23,0,11',
     ' 2717': '33,17,0,6',
     ' 2718': '73,37,0,15',
     ' 272': '48,40,0,24',
     ' 2725': '60,52,0,22',
     ' 2726': '93,52,0,22',
     ' 2727': '100,42,0,11',
     ' 2728': '100,59,0,27',
     ' 273': '81,76,0,63',
     ' 2735': '100,90,0,46',
     ' 2736': '100,75,0,32',
     ' 2738': '100,88,0,45',
     ' 274': '77,71,0,68',
     ' 2745': '95,92,0,56',
     ' 2746': '100,76,0,44',
     ' 2747': '100,74,0,55',
     ' 2748': '100,74,0,55',
     ' 275': '68,65,0,71',
     ' 2755': '87,82,0,61',
     ' 2756': '100,68,0,57',
     ' 2757': '100,66,0,61',
     ' 2758': '100,66,0,61',
     ' 276': '44,46,0,79',
     ' 2765': '71,66,0,72',
     ' 2766': '100,62,0,70',
     ' 2767': '100,45,0,70',
     ' 2768': '100,58,0,71',
     ' 277': '31,13,0,9',
     ' 278': '47,21,0,8',
     ' 279': '100,34,0,13',
     ' 280': '100,66,0,59',
     ' 281': '100,63,0,64',
     ' 282': '100,54,0,74',
     ' 283': '43,17,0,8',
     ' 284': '62,24,0,10',
     ' 285': '100,43,0,19',
     ' 286': '100,66,0,37',
     ' 287': '100,62,0,47',
     ' 288': '100,58,0,55',
     ' 289': '100,45,0,75',
     ' 290': '25,8,0,7',
     ' 2905': '45,14,0,9',
     ' 291': '38,13,0,8',
     ' 2915': '68,21,0,10',
     ' 292': '65,23,0,8',
     ' 2925': '100,29,0,13',
     ' 293': '100,61,0,35',
     ' 2935': '100,51,0,29',
     ' 294': '100,55,0,57',
     ' 2945': '100,48,0,41',
     ' 295': '100,51,0,66',
     ' 2955': '100,44,0,61',
     ' 296': '100,38,0,82',
     ' 2965': '100,39,0,76',
     ' 297': '59,15,0,9',
     ' 2975': '39,9,0,8',
     ' 298': '100,21,0,9',
     ' 2985': '72,15,0,9',
     ' 299': '100,27,0,12',
     ' 2995': '100,24,0,12',
     ' 300': '100,48,0,29',
     ' 3005': '100,39,0,22',
     ' 301': '100,43,0,47',
     ' 3015': '100,36,0,39',
     ' 302': '100,35,0,64',
     ' 3025': '100,30,0,55',
     ' 303': '100,26,0,78',
     ' 3035': '100,24,0,67',
     ' 304': '37,6,0,9',
     ' 305': '73,13,0,8',
     ' 306': '100,19,0,11',
     ' 307': '100,35,0,34',
     ' 308': '100,29,0,51',
     ' 309': '100,19,0,71',
     ' 310': '63,8,0,11',
     ' 3105': '61,6,0,12',
     ' 311': '100,12,0,13',
     ' 3115': '100,9,0,17',
     ' 312': '100,18,0,20',
     ' 3125': '100,13,0,22',
     ' 313': '100,22,0,26',
     ' 3135': '100,16,0,33',
     ' 314': '100,22,0,35',
     ' 3145': '100,13,0,45',
     ' 315': '100,18,0,50',
     ' 3155': '100,13,0,55',
     ' 316': '100,12,0,68',
     ' 3165': '100,10,0,65',
     ' 317': '24,0,0,10',
     ' 318': '43,2,0,12',
     ' 319': '100,4,0,17',
     ' 320': '100,7,0,34',
     ' 321': '100,6,0,41',
     ' 322': '100,4,0,52',
     ' 323': '100,3,0,61',
     ' 324': '31,0,2,14',
     ' 3242': '54,0,2,14',
     ' 3245': '47,0,6,12',
     ' 3248': '49,0,10,20',
     ' 325': '55,0,1,20',
     ' 3252': '100,0,3,18',
     ' 3255': '97,0,7,17',
     ' 3258': '67,0,9,23',
     ' 326': '100,0,4,30',
     ' 3262': '100,0,6,25',
     ' 3265': '100,0,10,22',
     ' 3268': '100,0,16,34',
     ' 327': '100,0,11,47',
     ' 3272': '100,0,5,36',
     ' 3275': '100,0,13,30',
     ' 3278': '100,0,23,39',
     ' 328': '100,0,9,55',
     ' 3282': '100,0,10,47',
     ' 3285': '100,0,13,42',
     ' 3288': '100,0,22,49',
     ' 329': '100,0,8,59',
     ' 3292': '100,0,9,64',
     ' 3295': '100,0,16,54',
     ' 3298': '100,0,22,58',
     ' 330': '100,0,9,67',
     ' 3302': '100,0,7,70',
     ' 3305': '100,0,15,69',
     ' 3308': '100,0,18,72',
     ' 331': '30,0,5,9',
     ' 332': '40,0,8,11',
     ' 333': '77,0,11,14',
     ' 334': '100,0,22,40',
     ' 335': '100,0,21,52',
     ' 336': '100,0,21,60',
     ' 337': '34,0,12,17',
     ' 3375': '46,0,15,11',
     ' 338': '48,0,13,20',
     ' 3385': '67,0,19,16',
     ' 339': '100,0,23,30',
     ' 3395': '91,0,30,24',
     ' 340': '89,0,35,41',
     ' 3405': '86,0,40,32',
     ' 341': '100,0,30,52',
     ' 3415': '88,0,38,53',
     ' 342': '100,0,30,60',
     ' 3425': '98,0,32,62',
     ' 343': '78,0,25,65',
     ' 3435': '74,0,26,73',
     ' 344': '26,0,17,14',
     ' 345': '31,0,19,17',
     ' 346': '43,0,24,21',
     ' 347': '81,0,54,40',
     ' 348': '83,0,53,49',
     ' 349': '85,0,45,59',
     ' 350': '45,0,37,67',
     ' 3500': '83,0,53,57',
     ' 3501': '49,0,88,33',
     ' 3506': '100,43,0,32',
     ' 3507': '10,0,89,19',
     ' 3508': '19,0,58,53',
     ' 351': '28,0,18,10',
     ' 3514': '0,28,94,1',
     ' 3515': '29,90,0,52',
     ' 3516': '0,76,93,12',
     ' 3517': '0,96,89,23',
     ' 3519': '0,26,23,11',
     ' 352': '36,0,21,11',
     ' 3520': '12,36,0,24',
     ' 3522': '80,0,61,46',
     ' 3523': '0,60,55,55',
     ' 3524': '51,49,0,68',
     ' 3526': '24,6,0,38',
     ' 3527': '0,67,25,18',
     ' 3529': '69,0,75,35',
     ' 353': '42,0,25,13',
     ' 3533': '55,0,9,15',
     ' 3534': '100,0,9,30',
     ' 3535': '68,89,0,48',
     ' 3536': '84,0,55,54',
     ' 3537': '93,0,57,72',
     ' 3538': '100,29,0,16',
     ' 3539': '53,0,68,39',
     ' 354': '78,0,60,30',
     ' 3541': '100,7,0,38',
     ' 3542': '81,80,0,52',
     ' 3543': '26,31,0,18',
     ' 3544': '0,19,25,11',
     ' 3545': '100,17,0,11',
     ' 3546': '0,94,87,18',
     ' 3547': '0,29,87,20',
     ' 355': '78,0,60,41',
     ' 3551': '100,16,0,22',
     ' 3553': '100,38,0,29',
     ' 3555': '41,70,0,52',
     ' 3556': '0,75,79,6',
     ' 3557': '100,3,0,49',
     ' 3558': '36,25,0,17',
     ' 3559': '19,50,0,34',
     ' 356': '81,0,55,52',
     ' 3560': '100,0,7,36',
     ' 3561': '33,0,88,24',
     ' 3564': '0,57,99,5',
     ' 3566': '47,61,0,55',
     ' 3568': '0,16,8,6',
     ' 357': '58,0,39,66',
     ' 3570': '12,0,90,16',
     ' 3572': '0,38,36,0',
     ' 3574': '34,44,0,50',
     ' 3575': '29,40,0,24',
     ' 3577': '42,16,0,13',
     ' 358': '19,0,33,14',
     ' 3581': '100,53,0,57',
     ' 3582': '0,44,20,18',
     ' 3583': '48,73,0,49',
     ' 3584': '85,49,0,50',
     ' 3588': '0,42,84,0',
     ' 359': '22,0,38,16',
     ' 3590': '81,44,0,37',
     ' 3591': '100,68,0,51',
     ' 3593': '19,39,0,29',
     ' 3595': '0,20,11,6',
     ' 3596': '0,17,37,12',
     ' 3597': '100,52,0,54',
     ' 3599': '0,13,39,13',
     ' 360': '38,0,60,25',
     ' 361': '54,0,73,31',
     ' 362': '42,0,67,38',
     ' 363': '41,0,67,45',
     ' 364': '33,0,64,54',
     ' 365': '11,0,38,12',
     ' 366': '15,0,44,13',
     ' 367': '19,0,54,17',
     ' 368': '31,0,79,26',
     ' 369': '33,0,86,35',
     ' 370': '25,0,77,45',
     ' 371': '11,0,64,62',
     ' 372': '8,0,39,8',
     ' 373': '9,0,44,9',
     ' 374': '11,0,51,10',
     ' 375': '25,0,91,17',
     ' 376': '24,0,90,26',
     ' 377': '16,0,91,40',
     ' 378': '6,0,68,61',
     ' 379': '0,2,54,9',
     ' 380': '0,1,69,10',
     ' 381': '2,0,87,14',
     ' 382': '4,0,89,17',
     ' 383': '0,1,90,32',
     ' 384': '0,6,92,40',
     ' 385': '0,9,71,52',
     ' 386': '0,3,54,5',
     ' 387': '0,2,75,7',
     ' 388': '0,1,80,9',
     ' 389': '2,0,88,12',
     ' 390': '0,1,90,26',
     ' 391': '0,8,89,36',
     ' 392': '0,10,91,47',
     ' 393': '0,5,52,3',
     ' 3935': '0,7,61,1',
     ' 394': '0,6,74,3',
     ' 3945': '0,9,91,1',
     ' 395': '0,5,84,4',
     ' 3955': '0,11,90,3',
     ' 396': '0,4,90,9',
     ' 3965': '0,11,89,3',
     ' 397': '0,8,90,22',
     ' 3975': '0,14,92,25',
     ' 398': '0,10,92,30',
     ' 3985': '0,15,93,37',
     ' 399': '0,13,92,35',
     ' 3995': '0,15,68,58',
     ' 400': '0,2,7,23',
     ' 4001': '0,8,33,6',
     ' 4002': '0,12,42,11',
     ' 4003': '0,7,28,16',
     ' 4004': '0,11,41,19',
     ' 4005': '0,11,36,23',
     ' 4006': '0,14,40,26',
     ' 4007': '0,16,46,31',
     ' 4008': '0,30,84,2',
     ' 4009': '0,36,70,4',
     ' 401': '0,2,7,31',
     ' 4010': '0,55,92,8',
     ' 4011': '0,48,65,10',
     ' 4012': '0,52,74,7',
     ' 4013': '0,48,80,19',
     ' 4014': '0,44,61,27',
     ' 4015': '0,8,53,15',
     ' 4016': '0,13,71,13',
     ' 4017': '0,20,71,10',
     ' 4018': '0,17,65,16',
     ' 4019': '0,16,60,22',
     ' 402': '0,4,9,38',
     ' 4020': '0,19,91,23',
     ' 4021': '0,19,69,30',
     ' 4022': '0,15,40,17',
     ' 4023': '0,17,51,15',
     ' 4024': '0,20,52,16',
     ' 4025': '0,27,66,14',
     ' 4026': '0,28,68,24',
     ' 4027': '0,32,77,43',
     ' 4028': '0,28,68,49',
     ' 4029': '0,13,30,8',
     ' 403': '0,5,12,45',
     ' 4030': '0,17,28,5',
     ' 4031': '0,14,20,8',
     ' 4032': '0,18,22,3',
     ' 4033': '0,25,31,3',
     ' 4034': '0,27,43,20',
     ' 4035': '0,26,42,21',
     ' 4036': '0,20,22,24',
     ' 4037': '0,31,34,29',
     ' 4038': '0,36,41,30',
     ' 4039': '0,40,45,31',
     ' 404': '0,8,17,53',
     ' 4040': '0,29,33,40',
     ' 4041': '0,27,32,50',
     ' 4042': '0,23,31,53',
     ' 4043': '0,13,23,12',
     ' 4044': '0,18,30,23',
     ' 4045': '0,20,30,27',
     ' 4046': '0,16,27,30',
     ' 4047': '0,19,32,32',
     ' 4048': '0,21,36,35',
     ' 4049': '0,14,26,41',
     ' 405': '0,6,15,59',
     ' 4050': '0,21,32,14',
     ' 4051': '0,39,46,12',
     ' 4052': '0,38,45,14',
     ' 4053': '0,40,49,18',
     ' 4054': '0,51,64,33',
     ' 4055': '0,50,58,34',
     ' 4056': '0,41,47,47',
     ' 4057': '0,55,60,10',
     ' 4058': '0,67,63,9',
     ' 4059': '0,75,67,23',
     ' 406': '0,4,6,23',
     ' 4060': '0,70,65,25',
     ' 4061': '0,48,50,25',
     ' 4062': '0,59,59,34',
     ' 4063': '0,58,67,39',
     ' 4064': '0,23,20,8',
     ' 4065': '0,24,22,11',
     ' 4066': '0,32,34,8',
     ' 4067': '0,31,32,8',
     ' 4068': '0,37,36,9',
     ' 4069': '0,60,52,21',
     ' 407': '0,6,9,31',
     ' 4070': '0,66,56,29',
     ' 4071': '0,33,23,19',
     ' 4072': '0,44,31,12',
     ' 4073': '0,63,43,21',
     ' 4074': '0,76,41,51',
     ' 4075': '0,58,37,49',
     ' 4076': '0,47,31,49',
     ' 4077': '0,45,35,49',
     ' 4078': '0,15,6,10',
     ' 4079': '0,17,4,20',
     ' 408': '0,7,10,41',
     ' 4080': '0,14,1,20',
     ' 4081': '0,16,2,32',
     ' 4082': '0,38,13,36',
     ' 4083': '11,37,0,42',
     ' 4084': '0,43,11,57',
     ' 4085': '0,8,13,21',
     ' 4086': '0,11,11,27',
     ' 4087': '0,14,17,28',
     ' 4088': '0,18,23,34',
     ' 4089': '0,14,16,36',
     ' 409': '0,9,12,47',
     ' 4090': '0,20,27,43',
     ' 4091': '0,23,24,52',
     ' 4092': '0,16,10,21',
     ' 4093': '0,17,15,31',
     ' 4094': '0,27,18,43',
     ' 4095': '0,33,22,46',
     ' 4096': '0,38,35,53',
     ' 4097': '0,33,30,55',
     ' 4098': '0,32,39,60',
     ' 4099': '0,23,23,33',
     ' 410': '0,12,15,54',
     ' 4100': '0,37,37,50',
     ' 4101': '0,64,59,61',
     ' 4102': '0,66,58,66',
     ' 4103': '0,55,42,68',
     ' 4104': '0,29,26,67',
     ' 4105': '0,39,49,60',
     ' 4106': '0,13,9,23',
     ' 4107': '0,14,4,34',
     ' 4108': '0,18,7,36',
     ' 4109': '0,23,12,38',
     ' 411': '0,13,19,63',
     ' 4110': '0,20,6,46',
     ' 4111': '0,29,14,51',
     ' 4112': '0,22,17,46',
     ' 4113': '0,12,10,36',
     ' 4114': '0,9,5,39',
     ' 4115': '0,13,11,43',
     ' 4116': '0,14,14,40',
     ' 4117': '5,15,0,54',
     ' 4118': '16,26,0,69',
     ' 4119': '10,16,0,73',
     ' 412': '0,13,15,78',
     ' 4120': '14,18,0,18',
     ' 4121': '18,22,0,28',
     ' 4122': '38,38,0,30',
     ' 4123': '14,11,0,26',
     ' 4124': '22,17,0,31',
     ' 4125': '24,22,0,53',
     ' 4126': '24,35,0,61',
     ' 4127': '19,14,0,41',
     ' 4128': '20,14,0,48',
     ' 4129': '22,12,0,50',
     ' 413': '2,0,5,26',
     ' 4130': '28,17,0,57',
     ' 4131': '27,18,0,64',
     ' 4132': '25,21,0,71',
     ' 4133': '21,17,0,72',
     ' 4134': '10,7,0,31',
     ' 4135': '25,14,0,39',
     ' 4136': '27,14,0,50',
     ' 4137': '45,20,0,53',
     ' 4138': '38,15,0,55',
     ' 4139': '32,16,0,57',
     ' 414': '2,0,6,33',
     ' 4140': '26,16,0,72',
     ' 4141': '68,38,0,37',
     ' 4142': '64,38,0,49',
     ' 4143': '47,24,0,57',
     ' 4144': '43,35,0,64',
     ' 4145': '47,34,0,69',
     ' 4146': '62,44,0,79',
     ' 4147': '50,47,0,74',
     ' 4148': '51,15,0,31',
     ' 4149': '34,14,0,22',
     ' 415': '1,0,8,42',
     ' 4150': '68,32,0,28',
     ' 4151': '100,39,0,31',
     ' 4152': '100,43,0,42',
     ' 4153': '100,42,0,46',
     ' 4154': '100,43,0,54',
     ' 4155': '10,2,0,19',
     ' 4156': '28,6,0,20',
     ' 4157': '54,10,0,24',
     ' 4158': '76,15,0,41',
     ' 4159': '100,33,0,49',
     ' 416': '2,0,9,50',
     ' 4160': '100,24,0,62',
     ' 4161': '54,16,0,65',
     ' 4162': '21,0,6,18',
     ' 4163': '30,0,8,21',
     ' 4164': '92,0,9,50',
     ' 4165': '79,0,8,59',
     ' 4166': '49,0,3,54',
     ' 4167': '55,0,6,60',
     ' 4168': '57,0,1,73',
     ' 4169': '10,0,3,22',
     ' 417': '3,0,9,60',
     ' 4170': '15,0,1,25',
     ' 4171': '17,0,1,27',
     ' 4172': '28,0,4,30',
     ' 4173': '36,0,2,23',
     ' 4174': '35,0,0,24',
     ' 4175': '27,4,0,24',
     ' 4176': '4,0,6,19',
     ' 4177': '2,0,8,26',
     ' 4178': '4,0,12,32',
     ' 4179': '8,0,22,35',
     ' 418': '1,0,10,67',
     ' 4180': '6,0,16,40',
     ' 4181': '14,0,16,47',
     ' 4182': '12,0,15,53',
     ' 4183': '5,0,5,24',
     ' 4184': '10,0,7,33',
     ' 4185': '18,0,5,36',
     ' 4186': '29,0,3,44',
     ' 4187': '19,0,1,52',
     ' 4188': '32,0,1,64',
     ' 4189': '79,10,0,67',
     ' 419': '11,0,3,87',
     ' 4190': '7,0,8,29',
     ' 4191': '11,0,5,35',
     ' 4192': '12,0,9,42',
     ' 4193': '6,0,12,59',
     ' 4194': '15,0,2,61',
     ' 4195': '4,1,0,60',
     ' 4196': '26,5,0,65',
     ' 4197': '12,0,8,38',
     ' 4198': '16,0,9,50',
     ' 4199': '17,0,10,59',
     ' 420': '2,0,2,21',
     ' 4200': '17,0,9,58',
     ' 4201': '25,0,10,59',
     ' 4202': '28,0,8,70',
     ' 4203': '41,0,10,72',
     ' 4204': '7,0,19,18',
     ' 4205': '11,0,29,25',
     ' 4206': '16,0,25,32',
     ' 4207': '22,0,25,37',
     ' 4208': '46,0,25,56',
     ' 4209': '37,0,13,65',
     ' 421': '2,0,2,29',
     ' 4210': '41,0,14,69',
     ' 4211': '2,0,30,15',
     ' 4212': '17,0,61,33',
     ' 4213': '22,0,62,44',
     ' 4214': '22,0,29,52',
     ' 4215': '24,0,42,56',
     ' 4216': '26,0,58,66',
     ' 4217': '17,0,61,64',
     ' 4218': '3,0,13,29',
     ' 4219': '3,0,11,33',
     ' 422': '6,1,0,36',
     ' 4220': '2,0,13,46',
     ' 4221': '0,0,22,51',
     ' 4222': '1,0,16,54',
     ' 4223': '5,0,20,59',
     ' 4224': '14,0,24,71',
     ' 4225': '0,8,20,45',
     ' 4226': '0,3,23,47',
     ' 4227': '0,3,23,58',
     ' 4228': '0,6,31,65',
     ' 4229': '0,1,19,63',
     ' 423': '6,2,0,44',
     ' 4230': '0,7,14,65',
     ' 4231': '0,6,21,61',
     ' 4232': '0,6,90,14',
     ' 4233': '0,6,90,22',
     ' 4234': '0,1,51,24',
     ' 4235': '0,2,29,30',
     ' 4236': '0,4,44,22',
     ' 4237': '0,7,43,31',
     ' 4238': '0,4,42,43',
     ' 4239': '0,3,11,21',
     ' 424': '2,0,1,55',
     ' 4240': '0,7,19,21',
     ' 4241': '0,9,27,26',
     ' 4242': '0,14,42,46',
     ' 4243': '0,20,40,48',
     ' 4244': '0,17,36,50',
     ' 4245': '0,12,30,64',
     ' 4246': '0,5,17,20',
     ' 4247': '0,9,20,17',
     ' 4248': '0,9,22,15',
     ' 4249': '0,12,29,23',
     ' 425': '9,0,0,65',
     ' 4250': '0,11,28,26',
     ' 4251': '0,13,34,27',
     ' 4252': '0,12,28,27',
     ' 4253': '0,13,25,26',
     ' 4254': '0,21,41,24',
     ' 4255': '0,14,32,31',
     ' 4256': '0,16,34,32',
     ' 4257': '0,16,26,42',
     ' 4258': '0,15,19,57',
     ' 4259': '0,14,27,81',
     ' 426': '14,5,0,83',
     ' 4260': '0,19,30,19',
     ' 4261': '0,32,56,37',
     ' 4262': '0,34,54,33',
     ' 4263': '0,37,57,31',
     ' 4264': '0,35,51,31',
     ' 4265': '0,36,53,39',
     ' 4266': '0,40,62,38',
     ' 4267': '0,9,16,24',
     ' 4268': '0,12,22,29',
     ' 4269': '0,15,30,33',
     ' 427': '4,1,0,16',
     ' 4270': '0,11,26,41',
     ' 4271': '0,15,25,43',
     ' 4272': '0,17,25,49',
     ' 4273': '0,10,12,69',
     ' 4274': '6,2,0,27',
     ' 4275': '2,0,2,31',
     ' 4276': '3,2,0,37',
     ' 4277': '3,4,0,43',
     ' 4278': '4,4,0,48',
     ' 4279': '0,8,2,65',
     ' 428': '6,2,0,20',
     ' 4280': '37,22,0,79',
     ' 4281': '0,0,0,31',
     ' 4282': '0,1,1,32',
     ' 4283': '0,3,2,35',
     ' 4284': '5,9,0,54',
     ' 4285': '3,8,0,59',
     ' 4286': '1,9,0,63',
     ' 4287': '0,6,5,73',
     ' 4288': '4,0,4,26',
     ' 4289': '0,0,0,40',
     ' 429': '8,2,0,32',
     ' 4290': '0,3,3,44',
     ' 4291': '0,5,5,55',
     ' 4292': '0,3,1,55',
     ' 4293': '3,8,0,60',
     ' 4294': '2,5,0,66',
     ' 430': '15,6,0,43',
     ' 431': '22,8,0,56',
     ' 432': '36,13,0,71',
     ' 433': '46,21,0,82',
     ' 434': '0,5,4,19',
     ' 435': '0,7,5,25',
     ' 436': '0,10,7,33',
     ' 437': '0,18,13,52',
     ' 438': '0,23,20,65',
     ' 439': '0,22,21,73',
     ' 440': '0,19,20,78',
     ' 441': '5,0,1,22',
     ' 442': '6,0,0,32',
     ' 443': '8,1,0,38',
     ' 444': '13,2,0,50',
     ' 445': '14,3,0,65',
     ' 446': '10,0,2,74',
     ' 447': '6,0,4,77',
     ' 448': '0,14,43,70',
     ' 4485': '0,22,61,61',
     ' 449': '0,18,51,67',
     ' 4495': '0,17,64,44',
     ' 450': '0,19,59,64',
     ' 4505': '0,15,56,39',
     ' 451': '0,8,39,37',
     ' 4515': '0,11,41,28',
     ' 452': '0,6,29,30',
     ' 4525': '0,10,35,20',
     ' 453': '0,2,20,25',
     ' 4535': '0,7,29,18',
     ' 454': '0,3,17,20',
     ' 4545': '0,6,26,15',
     ' 455': '0,16,64,58',
     ' 456': '0,15,73,35',
     ' 457': '0,18,82,25',
     ' 458': '0,12,60,12',
     ' 459': '0,11,55,11',
     ' 460': '0,8,45,8',
     ' 461': '0,6,36,7',
     ' 462': '0,27,53,62',
     ' 4625': '0,47,65,68',
     ' 463': '0,33,66,54',
     ' 4635': '0,37,63,40',
     ' 464': '0,37,70,44',
     ' 4645': '0,29,47,32',
     ' 465': '0,20,51,26',
     ' 4655': '0,23,38,24',
     ' 466': '0,16,41,21',
     ' 4665': '0,20,34,19',
     ' 467': '0,13,34,16',
     ' 4675': '0,14,24,13',
     ' 468': '0,9,27,13',
     ' 4685': '0,12,23,11',
     ' 469': '0,41,68,59',
     ' 4695': '0,44,55,64',
     ' 470': '0,46,74,34',
     ' 4705': '0,39,53,50',
     ' 471': '0,47,79,27',
     ' 4715': '0,30,43,40',
     ' 472': '0,32,53,9',
     ' 4725': '0,22,32,30',
     ' 473': '0,21,36,5',
     ' 4735': '0,16,24,24',
     ' 474': '0,19,31,5',
     ' 4745': '0,11,18,20',
     ' 475': '0,15,27,4',
     ' 4755': '0,9,15,16',
     ' 476': '0,33,47,69',
     ' 477': '0,39,56,62',
     ' 478': '0,43,63,55',
     ' 479': '0,26,41,32',
     ' 480': '0,14,25,23',
     ' 481': '0,12,20,16',
     ' 482': '0,10,17,13',
     ' 483': '0,53,63,60',
     ' 484': '0,68,77,39',
     ' 485': '0,82,89,14',
     ' 486': '0,38,47,8',
     ' 487': '0,30,37,7',
     ' 488': '0,21,28,7',
     ' 489': '0,17,25,7',
     ' 490': '0,54,53,64',
     ' 491': '0,61,58,50',
     ' 492': '0,65,62,43',
     ' 493': '0,39,31,13',
     ' 494': '0,30,24,9',
     ' 495': '0,21,16,5',
     ' 496': '0,17,14,5',
     ' 497': '0,41,44,68',
     ' 4975': '0,48,45,75',
     ' 498': '0,46,50,59',
     ' 4985': '0,44,40,46',
     ' 499': '0,50,53,52',
     ' 4995': '0,36,31,39',
     ' 500': '0,32,26,22',
     ' 5005': '0,28,25,31',
     ' 501': '0,24,20,14',
     ' 5015': '0,20,18,20',
     ' 502': '0,19,16,9',
     ' 5025': '0,17,15,13',
     ' 503': '0,15,15,8',
     ' 5035': '0,12,12,13',
     ' 504': '0,51,42,65',
     ' 505': '0,58,42,56',
     ' 506': '0,59,39,49',
     ' 507': '0,31,19,17',
     ' 508': '0,26,17,11',
     ' 509': '0,22,15,10',
     ' 510': '0,19,13,8',
     ' 511': '0,52,16,62',
     ' 5115': '0,44,12,70',
     ' 512': '0,59,5,50',
     ' 5125': '0,39,7,60',
     ' 513': '0,61,1,44',
     ' 5135': '0,31,6,52',
     ' 514': '0,33,4,18',
     ' 5145': '0,22,4,40',
     ' 515': '0,22,4,12',
     ' 5155': '0,13,3,26',
     ' 516': '0,17,3,11',
     ' 5165': '0,8,1,18',
     ' 517': '0,14,4,8',
     ' 5175': '0,7,2,16',
     ' 518': '1,34,0,71',
     ' 5185': '0,30,8,72',
     ' 519': '10,46,0,63',
     ' 5195': '0,32,9,61',
     ' 520': '12,54,0,57',
     ' 5205': '0,24,7,48',
     ' 521': '10,28,0,30',
     ' 5215': '0,13,3,33',
     ' 522': '8,21,0,22',
     ' 5225': '0,10,3,23',
     ' 523': '6,15,0,18',
     ' 5235': '0,8,4,19',
     ' 524': '2,10,0,14',
     ' 5245': '0,6,3,15',
     ' 525': '14,51,0,62',
     ' 5255': '53,48,0,79',
     ' 526': '24,63,0,46',
     ' 5265': '39,39,0,63',
     ' 527': '29,67,0,34',
     ' 5275': '31,29,0,53',
     ' 528': '17,38,0,18',
     ' 5285': '17,17,0,35',
     ' 529': '12,26,0,13',
     ' 5295': '11,10,0,23',
     ' 530': '8,18,0,10',
     ' 5305': '7,6,0,17',
     ' 531': '3,13,0,10',
     ' 5315': '4,4,0,13',
     ' 532': '41,24,0,83',
     ' 533': '62,37,0,74',
     ' 534': '98,41,0,64',
     ' 535': '28,15,0,26',
     ' 536': '21,11,0,21',
     ' 537': '15,7,0,16',
     ' 538': '12,5,0,14',
     ' 539': '100,35,0,76',
     ' 5395': '96,31,0,83',
     ' 540': '100,43,0,66',
     ' 5405': '48,16,0,45',
     ' 541': '100,45,0,56',
     ' 5415': '45,15,0,41',
     ' 542': '48,17,0,16',
     ' 5425': '33,11,0,33',
     ' 543': '32,12,0,10',
     ' 5435': '19,7,0,21',
     ' 544': '20,8,0,9',
     ' 5445': '16,5,0,17',
     ' 545': '17,5,0,9',
     ' 5455': '13,5,0,15',
     ' 546': '100,15,0,80',
     ' 5463': '97,11,0,82',
     ' 5467': '57,0,7,80',
     ' 547': '100,18,0,76',
     ' 5473': '100,7,0,60',
     ' 5477': '35,0,5,63',
     ' 548': '100,21,0,69',
     ' 5483': '51,6,0,44',
     ' 5487': '24,0,2,52',
     ' 549': '47,11,0,28',
     ' 5493': '28,2,0,32',
     ' 5497': '16,0,1,40',
     ' 550': '33,9,0,21',
     ' 5503': '23,3,0,26',
     ' 5507': '12,0,2,31',
     ' 551': '25,5,0,17',
     ' 5513': '17,1,0,21',
     ' 5517': '8,0,2,24',
     ' 552': '18,4,0,13',
     ' 5523': '13,0,0,18',
     ' 5527': '8,0,2,21',
     ' 553': '42,0,27,73',
     ' 5535': '51,0,16,81',
     ' 554': '68,0,28,64',
     ' 5545': '38,0,11,59',
     ' 555': '65,0,28,55',
     ' 5555': '27,0,10,51',
     ' 556': '32,0,16,37',
     ' 5565': '21,0,7,38',
     ' 557': '24,0,11,31',
     ' 5575': '15,0,6,33',
     ' 558': '19,0,9,25',
     ' 5585': '12,0,6,26',
     ' 559': '15,0,8,22',
     ' 5595': '7,0,6,20',
     ' 560': '53,0,12,76',
     ' 5605': '37,0,19,79',
     ' 561': '100,0,11,65',
     ' 5615': '19,0,15,54',
     ' 562': '100,0,11,56',
     ' 5625': '15,0,13,48',
     ' 563': '44,0,6,26',
     ' 5635': '11,0,8,35',
     ' 564': '35,0,6,21',
     ' 5645': '9,0,8,30',
     ' 565': '25,0,4,17',
     ' 5655': '7,0,7,25',
     ' 566': '17,0,4,14',
     ' 5665': '5,0,6,23',
     ' 567': '68,0,16,75',
     ' 568': '100,0,13,58',
     ' 569': '100,0,14,49',
     ' 570': '49,0,8,21',
     ' 571': '31,0,5,14',
     ' 572': '28,0,5,12',
     ' 573': '22,0,5,11',
     ' 574': '12,0,46,64',
     ' 5743': '10,0,44,72',
     ' 5747': '5,0,55,73',
     ' 575': '17,0,54,49',
     ' 5753': '8,0,43,60',
     ' 5757': '0,1,58,55',
     ' 576': '19,0,51,38',
     ' 5763': '3,0,37,52',
     ' 5767': '0,0,46,44',
     ' 577': '12,0,33,23',
     ' 5773': '4,0,28,44',
     ' 5777': '0,0,35,36',
     ' 578': '9,0,25,20',
     ' 5783': '3,0,21,34',
     ' 5787': '0,0,25,26',
     ' 579': '8,0,24,19',
     ' 5793': '2,0,18,28',
     ' 5797': '0,0,21,21',
     ' 5803': '1,0,15,22',
     ' 5807': '0,0,17,18',
     ' 581': '0,9,67,60',
     ' 5815': '0,8,59,66',
     ' 582': '0,6,82,42',
     ' 5825': '0,8,56,46',
     ' 583': '0,1,85,25',
     ' 5835': '0,8,46,35',
     ' 584': '0,2,58,14',
     ' 5845': '0,6,38,30',
     ' 585': '0,3,49,11',
     ' 5855': '0,4,31,24',
     ' 586': '0,2,46,10',
     ' 5865': '0,4,27,19',
     ' 587': '0,3,39,9',
     ' 5875': '0,3,25,17',
     ' 600': '0,5,35,4',
     ' 6001': '0,11,42,7',
     ' 6002': '0,16,50,6',
     ' 6003': '0,20,65,10',
     ' 6004': '0,25,75,10',
     ' 6005': '0,27,84,11',
     ' 6006': '0,28,84,17',
     ' 6007': '0,36,77,26',
     ' 6008': '0,18,35,25',
     ' 6009': '0,21,43,30',
     ' 601': '0,5,40,5',
     ' 6010': '0,24,48,35',
     ' 6011': '0,26,54,37',
     ' 6012': '0,30,63,46',
     ' 6013': '0,35,67,52',
     ' 6014': '0,24,56,59',
     ' 6015': '0,26,43,5',
     ' 6016': '0,38,60,2',
     ' 6017': '0,43,71,0',
     ' 6018': '0,48,79,2',
     ' 6019': '0,56,94,5',
     ' 602': '0,6,49,4',
     ' 6020': '0,61,98,10',
     ' 6021': '0,59,88,13',
     ' 6022': '0,21,25,4',
     ' 6023': '0,25,32,7',
     ' 6024': '0,35,43,9',
     ' 6025': '0,41,51,13',
     ' 6026': '0,46,57,15',
     ' 6027': '0,50,68,23',
     ' 6028': '0,51,66,27',
     ' 6029': '0,16,15,18',
     ' 603': '0,9,67,4',
     ' 6030': '0,20,22,22',
     ' 6031': '0,23,27,27',
     ' 6032': '0,27,32,30',
     ' 6033': '0,30,37,33',
     ' 6034': '0,34,44,36',
     ' 6035': '0,37,48,41',
     ' 6036': '0,24,19,26',
     ' 6037': '0,31,26,32',
     ' 6038': '0,37,31,37',
     ' 6039': '0,42,37,42',
     ' 604': '0,11,81,5',
     ' 6040': '0,48,46,47',
     ' 6041': '0,51,50,51',
     ' 6042': '0,54,52,61',
     ' 6043': '0,40,34,4',
     ' 6044': '0,44,40,5',
     ' 6045': '0,48,43,7',
     ' 6046': '0,53,51,9',
     ' 6047': '0,63,66,17',
     ' 6048': '0,62,63,17',
     ' 6049': '0,64,74,24',
     ' 605': '0,14,92,8',
     ' 6050': '0,32,16,2',
     ' 6051': '0,47,31,1',
     ' 6052': '0,51,35,8',
     ' 6053': '0,61,44,3',
     ' 6054': '0,61,42,13',
     ' 6055': '0,67,51,17',
     ' 6056': '0,70,56,20',
     ' 6057': '0,54,22,18',
     ' 6058': '0,60,26,21',
     ' 6059': '0,64,30,24',
     ' 606': '0,15,92,17',
     ' 6060': '0,66,32,26',
     ' 6061': '0,70,34,29',
     ' 6062': '0,71,38,30',
     ' 6063': '0,71,42,36',
     ' 6064': '0,14,2,20',
     ' 6065': '0,22,10,22',
     ' 6066': '0,25,12,25',
     ' 6067': '0,27,12,30',
     ' 6068': '0,30,15,33',
     ' 6069': '0,34,18,40',
     ' 607': '0,5,35,6',
     ' 6070': '0,34,18,40',
     ' 6071': '7,22,0,39',
     ' 6072': '4,29,0,53',
     ' 6073': '5,33,0,59',
     ' 6074': '0,32,0,62',
     ' 6075': '0,33,0,67',
     ' 6076': '0,38,4,72',
     ' 6077': '0,28,7,78',
     ' 6078': '11,28,0,18',
     ' 6079': '11,34,0,24',
     ' 608': '0,7,43,7',
     ' 6080': '13,39,0,30',
     ' 6081': '13,43,0,32',
     ' 6082': '12,47,0,39',
     ' 6083': '13,54,0,44',
     ' 6084': '12,55,0,50',
     ' 6085': '18,13,0,7',
     ' 6086': '24,16,0,14',
     ' 6087': '27,19,0,18',
     ' 6088': '33,23,0,22',
     ' 6089': '42,29,0,24',
     ' 609': '0,7,48,6',
     ' 6090': '45,32,0,32',
     ' 6091': '56,37,0,39',
     ' 6092': '35,27,0,22',
     ' 6093': '39,30,0,23',
     ' 6094': '42,33,0,28',
     ' 6095': '47,36,0,29',
     ' 6096': '52,41,0,35',
     ' 6097': '62,46,0,39',
     ' 6098': '67,50,0,44',
     ' 6099': '42,25,0,13',
     ' 610': '0,10,62,7',
     ' 6100': '47,28,0,21',
     ' 6101': '57,34,0,23',
     ' 6102': '59,34,0,28',
     ' 6103': '76,44,0,41',
     ' 6104': '100,55,0,46',
     ' 6105': '100,55,0,49',
     ' 6106': '18,10,0,16',
     ' 6107': '23,13,0,18',
     ' 6108': '30,15,0,25',
     ' 6109': '37,19,0,31',
     ' 611': '0,10,80,13',
     ' 6110': '39,19,0,33',
     ' 6111': '44,22,0,39',
     ' 6112': '64,27,0,50',
     ' 6113': '34,11,0,40',
     ' 6114': '34,12,0,43',
     ' 6115': '37,11,0,49',
     ' 6116': '43,13,0,53',
     ' 6117': '43,13,0,56',
     ' 6118': '39,9,0,70',
     ' 6119': '37,8,0,73',
     ' 612': '0,13,91,20',
     ' 6120': '100,23,0,16',
     ' 6121': '100,24,0,18',
     ' 6122': '100,29,0,23',
     ' 6123': '100,30,0,24',
     ' 6124': '100,32,0,27',
     ' 6125': '100,31,0,32',
     ' 6126': '100,39,0,38',
     ' 6127': '61,13,0,20',
     ' 6128': '95,13,0,26',
     ' 6129': '100,16,0,31',
     ' 613': '0,16,90,27',
     ' 6130': '100,16,0,37',
     ' 6131': '100,18,0,45',
     ' 6132': '100,20,0,39',
     ' 6133': '100,22,0,49',
     ' 6134': '44,5,0,16',
     ' 6135': '45,4,0,24',
     ' 6136': '65,3,0,32',
     ' 6137': '77,2,0,37',
     ' 6138': '100,3,0,42',
     ' 6139': '100,2,0,46',
     ' 614': '0,5,31,12',
     ' 6140': '100,2,0,50',
     ' 6141': '38,0,4,19',
     ' 6142': '51,0,9,24',
     ' 6143': '89,0,15,32',
     ' 6144': '100,0,20,36',
     ' 6145': '100,0,25,41',
     ' 6146': '97,0,29,46',
     ' 6147': '90,0,33,50',
     ' 6148': '13,5,0,6',
     ' 6149': '16,3,0,13',
     ' 615': '0,6,34,14',
     ' 6150': '22,0,0,21',
     ' 6151': '34,0,0,28',
     ' 6152': '42,0,8,36',
     ' 6153': '51,0,13,46',
     ' 6154': '70,0,23,53',
     ' 6155': '34,0,9,35',
     ' 6156': '41,0,14,41',
     ' 6157': '49,0,18,45',
     ' 6158': '60,0,23,50',
     ' 6159': '86,0,23,56',
     ' 616': '0,6,36,17',
     ' 6160': '81,0,30,63',
     ' 6161': '73,0,25,71',
     ' 6162': '63,0,27,33',
     ' 6163': '90,0,33,36',
     ' 6164': '91,0,34,38',
     ' 6165': '88,0,41,42',
     ' 6166': '85,0,46,45',
     ' 6167': '87,0,49,54',
     ' 6168': '84,0,44,53',
     ' 6169': '37,0,31,27',
     ' 617': '0,8,50,22',
     ' 6170': '39,0,33,31',
     ' 6171': '42,0,39,35',
     ' 6172': '43,0,39,42',
     ' 6173': '61,0,50,47',
     ' 6174': '61,0,49,50',
     ' 6175': '52,0,44,55',
     ' 6176': '20,0,14,24',
     ' 6177': '23,0,17,31',
     ' 6178': '31,0,24,36',
     ' 6179': '38,0,29,42',
     ' 618': '0,11,64,31',
     ' 6180': '44,0,33,46',
     ' 6181': '47,0,37,49',
     ' 6182': '52,0,42,54',
     ' 6183': '10,0,15,47',
     ' 6184': '14,0,17,49',
     ' 6185': '14,0,22,54',
     ' 6186': '15,0,24,60',
     ' 6187': '14,0,25,63',
     ' 6188': '16,0,28,68',
     ' 6189': '25,0,19,76',
     ' 619': '0,13,72,35',
     ' 6190': '2,0,20,7',
     ' 6191': '0,0,27,9',
     ' 6192': '3,0,45,12',
     ' 6193': '3,0,67,16',
     ' 6194': '6,0,87,21',
     ' 6195': '10,0,89,30',
     ' 6196': '11,0,89,31',
     ' 6197': '2,0,2,14',
     ' 6198': '2,0,4,21',
     ' 6199': '2,0,9,26',
     ' 620': '0,14,79,44',
     ' 6200': '1,0,11,28',
     ' 6201': '1,0,16,36',
     ' 6202': '2,0,19,40',
     ' 6203': '0,1,23,43',
     ' 6204': '0,3,13,34',
     ' 6205': '0,5,20,40',
     ' 6206': '0,6,22,43',
     ' 6207': '0,6,23,46',
     ' 6208': '0,9,30,52',
     ' 6209': '0,8,32,58',
     ' 621': '9,0,4,12',
     ' 6210': '0,7,36,62',
     ' 6211': '12,4,0,39',
     ' 6212': '13,5,0,45',
     ' 6213': '11,4,0,51',
     ' 6214': '10,3,0,54',
     ' 6215': '12,3,0,58',
     ' 6216': '5,1,0,67',
     ' 6217': '5,0,3,71',
     ' 6218': '16,8,0,32',
     ' 6219': '20,8,0,38',
     ' 622': '11,0,4,20',
     ' 6220': '19,8,0,44',
     ' 6221': '21,8,0,48',
     ' 6222': '23,9,0,52',
     ' 6223': '28,11,0,58',
     ' 6224': '31,10,0,63',
     ' 623': '17,0,6,27',
     ' 624': '26,0,9,38',
     ' 625': '39,0,10,50',
     ' 626': '59,0,16,64',
     ' 627': '65,0,8,81',
     ' 628': '21,3,0,10',
     ' 629': '33,5,0,13',
     ' 630': '48,7,0,16',
     ' 631': '84,11,0,21',
     ' 632': '100,17,0,30',
     ' 633': '100,22,0,41',
     ' 634': '100,27,0,48',
     ' 635': '32,6,0,9',
     ' 636': '44,8,0,9',
     ' 637': '79,13,0,12',
     ' 638': '100,18,0,15',
     ' 639': '100,25,0,22',
     ' 640': '100,30,0,26',
     ' 641': '100,35,0,37',
     ' 642': '11,5,0,9',
     ' 643': '15,6,0,10',
     ' 644': '28,13,0,18',
     ' 645': '42,18,0,22',
     ' 646': '57,23,0,30',
     ' 647': '100,33,0,42',
     ' 648': '100,50,0,62',
     ' 649': '8,3,0,9',
     ' 650': '13,5,0,10',
     ' 651': '24,12,0,16',
     ' 652': '39,18,0,25',
     ' 653': '89,34,0,41',
     ' 654': '100,46,0,56',
     ' 655': '100,53,0,67',
     ' 656': '6,3,0,7',
     ' 657': '17,8,0,8',
     ' 658': '26,13,0,9',
     ' 659': '51,25,0,14',
     ' 660': '100,36,0,21',
     ' 661': '100,62,0,42',
     ' 662': '100,73,0,56',
     ' 663': '2,3,0,9',
     ' 664': '2,4,0,10',
     ' 665': '6,9,0,18',
     ' 666': '12,18,0,30',
     ' 667': '19,27,0,43',
     ' 668': '25,36,0,52',
     ' 669': '35,50,0,66',
     ' 670': '0,8,3,9',
     ' 671': '0,18,6,10',
     ' 672': '0,28,9,13',
     ' 673': '0,37,14,16',
     ' 674': '0,54,21,23',
     ' 675': '0,76,33,32',
     ' 676': '0,94,46,42',
     ' 677': '0,9,4,11',
     ' 678': '0,12,4,12',
     ' 679': '0,14,5,14',
     ' 680': '0,24,9,22',
     ' 681': '0,37,14,32',
     ' 682': '0,51,21,41',
     ' 683': '0,66,30,51',
     ' 684': '0,12,6,11',
     ' 685': '0,17,8,14',
     ' 686': '0,21,10,19',
     ' 687': '0,28,12,27',
     ' 688': '0,39,16,35',
     ' 689': '0,55,23,47',
     ' 690': '0,64,31,62',
     ' 691': '0,11,10,9',
     ' 692': '0,16,14,11',
     ' 693': '0,24,20,16',
     ' 694': '0,32,27,23',
     ' 695': '0,40,32,29',
     ' 696': '0,52,42,40',
     ' 697': '0,56,49,46',
     ' 698': '0,12,11,4',
     ' 699': '0,20,15,5',
     ' 700': '0,29,24,6',
     ' 701': '0,42,33,9',
     ' 702': '0,55,45,18',
     ' 703': '0,68,59,28',
     ' 704': '0,72,70,37',
     ' 705': '0,10,8,4',
     ' 706': '0,16,13,4',
     ' 707': '0,26,20,3',
     ' 708': '0,41,33,2',
     ' 709': '0,59,49,5',
     ' 710': '0,71,63,11',
     ' 711': '0,78,77,19',
     ' 712': '0,21,38,0',
     ' 713': '0,26,46,0',
     ' 714': '0,33,61,0',
     ' 715': '0,44,80,2',
     ' 716': '0,50,96,6',
     ' 717': '0,57,97,15',
     ' 718': '0,59,100,24',
     ' 719': '0,17,32,6',
     ' 720': '0,22,40,8',
     ' 721': '0,27,51,12',
     ' 722': '0,36,67,20',
     ' 723': '0,43,79,29',
     ' 724': '0,49,88,41',
     ' 725': '0,50,80,49',
     ' 726': '0,15,29,11',
     ' 727': '0,18,35,14',
     ' 728': '0,22,42,18',
     ' 729': '0,30,56,28',
     ' 730': '0,37,72,37',
     ' 731': '0,46,85,52',
     ' 732': '0,47,83,61',
     ' 7401': '0,9,33,2',
     ' 7402': '0,10,35,6',
     ' 7403': '0,13,45,5',
     ' 7404': '0,14,73,1',
     ' 7405': '0,19,90,2',
     ' 7406': '0,22,93,3',
     ' 7407': '0,22,59,19',
     ' 7408': '0,26,95,1',
     ' 7409': '0,28,84,4',
     ' 7410': '0,32,53,0',
     ' 7411': '0,29,60,7',
     ' 7412': '0,40,75,16',
     ' 7413': '0,41,77,12',
     ' 7414': '0,45,86,22',
     ' 7415': '0,20,26,9',
     ' 7416': '0,54,64,9',
     ' 7417': '0,65,75,11',
     ' 7418': '0,59,56,20',
     ' 7419': '0,58,49,30',
     ' 7420': '0,77,58,38',
     ' 7421': '0,70,51,60',
     ' 7422': '0,16,14,4',
     ' 7423': '0,55,40,12',
     ' 7424': '0,68,41,11',
     ' 7425': '0,78,53,29',
     ' 7426': '0,85,62,35',
     ' 7427': '0,80,70,40',
     ' 7428': '0,58,41,58',
     ' 7429': '0,17,10,11',
     ' 7430': '0,23,13,14',
     ' 7431': '0,36,20,22',
     ' 7432': '0,48,30,29',
     ' 7433': '0,63,40,35',
     ' 7434': '0,65,43,40',
     ' 7435': '0,70,39,46',
     ' 7436': '0,7,1,8',
     ' 7437': '3,16,0,18',
     ' 7438': '3,25,0,16',
     ' 7439': '6,25,0,28',
     ' 7440': '5,28,0,34',
     ' 7441': '22,50,0,25',
     ' 7442': '26,65,0,26',
     ' 7443': '7,6,0,8',
     ' 7444': '20,16,0,13',
     ' 7445': '17,17,0,23',
     ' 7446': '37,33,0,21',
     ' 7447': '28,40,0,53',
     ' 7448': '4,25,0,70',
     ' 7449': '0,37,7,75',
     ' 7450': '15,10,0,15',
     ' 7451': '46,24,0,11',
     ' 7452': '50,32,0,14',
     ' 7453': '52,25,0,12',
     ' 7454': '55,20,0,30',
     ' 7455': '100,46,0,31',
     ' 7456': '56,37,0,30',
     ' 7457': '21,4,0,9',
     ' 7458': '49,11,0,21',
     ' 7459': '78,15,0,30',
     ' 7460': '100,29,0,25',
     ' 7461': '100,32,0,27',
     ' 7462': '100,39,0,45',
     ' 7463': '100,41,0,71',
     ' 7464': '25,0,3,18',
     ' 7465': '69,0,10,24',
     ' 7466': '100,5,0,27',
     ' 7467': '100,6,0,32',
     ' 7468': '100,24,0,40',
     ' 7469': '100,29,0,48',
     ' 7470': '100,19,0,55',
     ' 7471': '46,0,4,13',
     ' 7472': '53,0,3,28',
     ' 7473': '85,0,9,40',
     ' 7474': '100,8,0,49',
     ' 7475': '47,2,0,51',
     ' 7476': '100,7,0,65',
     ' 7477': '72,15,0,65',
     ' 7478': '31,0,15,11',
     ' 7479': '76,0,39,19',
     ' 7480': '83,0,40,26',
     ' 7481': '82,0,54,29',
     ' 7482': '83,0,49,38',
     ' 7483': '55,0,38,64',
     ' 7484': '100,0,29,66',
     ' 7485': '6,0,15,13',
     ' 7486': '15,0,33,11',
     ' 7487': '31,0,52,14',
     ' 7488': '38,0,62,16',
     ' 7489': '28,0,52,34',
     ' 7490': '24,0,50,40',
     ' 7491': '5,0,52,47',
     ' 7492': '4,0,36,20',
     ' 7493': '4,0,25,23',
     ' 7494': '9,0,21,32',
     ' 7495': '3,0,58,40',
     ' 7496': '7,0,75,47',
     ' 7497': '0,7,27,52',
     ' 7498': '5,0,43,62',
     ' 7499': '0,6,27,5',
     ' 7500': '0,8,25,12',
     ' 7501': '0,9,28,14',
     ' 7502': '0,13,34,18',
     ' 7503': '0,10,39,33',
     ' 7504': '0,19,37,41',
     ' 7505': '0,28,50,48',
     ' 7506': '0,9,26,6',
     ' 7507': '0,18,39,0',
     ' 7508': '0,19,43,10',
     ' 7509': '0,25,55,14',
     ' 7510': '0,32,69,21',
     ' 7511': '0,36,78,27',
     ' 7512': '0,41,83,34',
     ' 7513': '0,20,26,11',
     ' 7514': '0,25,37,16',
     ' 7515': '0,30,47,22',
     ' 7516': '0,45,72,39',
     ' 7517': '0,51,76,46',
     ' 7518': '0,28,36,56',
     ' 7519': '0,20,34,63',
     ' 7520': '0,19,25,7',
     ' 7521': '0,20,32,24',
     ' 7522': '0,42,53,29',
     ' 7523': '0,46,49,32',
     ' 7524': '0,49,56,34',
     ' 7525': '0,32,49,39',
     ' 7526': '0,60,81,45',
     ' 7527': '0,2,8,16',
     ' 7528': '0,6,11,23',
     ' 7529': '0,6,13,29',
     ' 7530': '0,10,20,36',
     ' 7531': '0,15,30,52',
     ' 7532': '0,19,36,61',
     ' 7533': '0,23,43,71',
     ' 7534': '0,2,8,19',
     ' 7535': '0,4,15,28',
     ' 7536': '0,4,17,34',
     ' 7537': '2,0,5,32',
     ' 7538': '5,0,7,39',
     ' 7539': '2,0,4,43',
     ' 7540': '13,7,0,67',
     ' 7541': '5,1,0,11',
     ' 7542': '17,3,0,23',
     ' 7543': '14,6,0,31',
     ' 7544': '23,10,0,42',
     ' 7545': '40,15,0,60',
     ' 7546': '57,21,0,72',
     ' 7547': '68,27,0,83',
     ' 7548': '0,23,93,0',
     ' 7549': '0,30,96,0',
     ' 7550': '0,33,97,16',
     ' 7551': '0,32,97,28',
     ' 7552': '0,30,74,54',
     ' 7553': '0,24,62,64',
     ' 7554': '0,21,45,70',
     ' 7555': '0,27,87,15',
     ' 7556': '0,27,81,26',
     ' 7557': '0,24,77,36',
     ' 7558': '0,27,75,40',
     ' 7559': '0,28,70,42',
     ' 7560': '0,22,62,50',
     ' 7561': '0,15,50,56',
     ' 7562': '0,20,49,25',
     ' 7563': '0,30,78,14',
     ' 7564': '0,39,95,12',
     ' 7565': '0,43,81,18',
     ' 7566': '0,44,70,31',
     ' 7567': '0,39,65,46',
     ' 7568': '0,34,56,52',
     ' 7569': '0,39,81,13',
     ' 7570': '0,39,79,15',
     ' 7571': '0,38,74,20',
     ' 7572': '0,39,72,27',
     ' 7573': '0,40,74,33',
     ' 7574': '0,35,65,37',
     ' 7575': '0,31,63,47',
     ' 7576': '0,39,64,12',
     ' 7577': '0,45,73,11',
     ' 7578': '0,52,78,12',
     ' 7579': '0,60,81,13',
     ' 7580': '0,58,75,24',
     ' 7581': '0,45,62,46',
     ' 7582': '0,30,46,59',
     ' 7583': '0,51,77,22',
     ' 7584': '0,53,79,26',
     ' 7585': '0,47,69,30',
     ' 7586': '0,48,70,37',
     ' 7587': '0,49,69,41',
     ' 7588': '0,38,58,51',
     ' 7589': '0,23,39,64',
     ' 7590': '0,15,26,16',
     ' 7591': '0,36,54,24',
     ' 7592': '0,52,72,29',
     ' 7593': '0,58,72,38',
     ' 7594': '0,53,64,50',
     ' 7595': '0,44,56,58',
     ' 7596': '0,35,48,63',
     ' 7597': '0,69,83,16',
     ' 7598': '0,63,78,25',
     ' 7599': '0,66,79,29',
     ' 7600': '0,57,70,44',
     ' 7601': '0,51,67,48',
     ' 7602': '0,41,59,51',
     ' 7603': '0,37,53,59',
     ' 7604': '0,6,7,10',
     ' 7605': '0,17,21,11',
     ' 7606': '0,31,35,15',
     ' 7607': '0,44,50,23',
     ' 7608': '0,56,63,35',
     ' 7609': '0,54,61,48',
     ' 7610': '0,50,52,59',
     ' 7611': '0,16,21,12',
     ' 7612': '0,24,30,20',
     ' 7613': '0,27,33,26',
     ' 7614': '0,24,29,34',
     ' 7615': '0,23,26,47',
     ' 7616': '0,27,27,58',
     ' 7617': '0,30,29,65',
     ' 7618': '0,45,61,22',
     ' 7619': '0,60,72,25',
     ' 7620': '0,72,76,27',
     ' 7621': '0,78,76,31',
     ' 7622': '0,73,70,42',
     ' 7623': '0,69,69,45',
     ' 7624': '0,63,65,49',
     ' 7625': '0,64,73,11',
     ' 7626': '0,73,81,21',
     ' 7627': '0,73,75,33',
     ' 7628': '0,72,73,37',
     ' 7629': '0,53,52,56',
     ' 7630': '0,50,51,61',
     ' 7631': '0,49,48,66',
     ' 7632': '0,6,4,16',
     ' 7633': '0,16,14,24',
     ' 7634': '0,46,32,25',
     ' 7635': '0,71,50,22',
     ' 7636': '0,82,61,26',
     ' 7637': '0,66,51,42',
     ' 7638': '0,63,49,51',
     ' 7639': '0,26,21,42',
     ' 7640': '0,56,42,42',
     ' 7641': '0,68,49,45',
     ' 7642': '0,59,35,55',
     ' 7643': '0,53,32,60',
     ' 7644': '0,48,25,66',
     ' 7645': '0,45,27,69',
     ' 7646': '0,31,17,36',
     ' 7647': '0,62,33,34',
     ' 7648': '0,76,33,40',
     ' 7649': '0,78,29,46',
     ' 7650': '0,69,22,56',
     ' 7651': '0,57,11,60',
     ' 7652': '0,55,11,64',
     ' 7653': '2,9,0,41',
     ' 7654': '0,24,1,38',
     ' 7655': '0,42,6,39',
     ' 7656': '0,56,9,46',
     ' 7657': '0,58,10,58',
     ' 7658': '0,47,4,59',
     ' 7659': '0,39,10,64',
     ' 7660': '9,11,0,35',
     ' 7661': '8,26,0,41',
     ' 7662': '9,47,0,49',
     ' 7663': '16,58,0,52',
     ' 7664': '21,54,0,52',
     ' 7665': '18,50,0,56',
     ' 7666': '9,20,0,61',
     ' 7667': '38,22,0,37',
     ' 7668': '43,30,0,36',
     ' 7669': '44,37,0,39',
     ' 7670': '50,43,0,42',
     ' 7671': '50,47,0,46',
     ' 7672': '50,50,0,49',
     ' 7673': '46,37,0,48',
     ' 7674': '29,22,0,29',
     ' 7675': '31,25,0,32',
     ' 7676': '32,36,0,38',
     ' 7677': '29,43,0,42',
     ' 7678': '34,49,0,45',
     ' 7679': '42,52,0,49',
     ' 7680': '39,58,0,53',
     ' 7681': '33,17,0,20',
     ' 7682': '51,26,0,28',
     ' 7683': '77,35,0,33',
     ' 7684': '89,39,0,39',
     ' 7685': '100,43,0,40',
     ' 7686': '100,44,0,43',
     ' 7687': '100,52,0,44',
     ' 7688': '87,24,0,21',
     ' 7689': '100,25,0,24',
     ' 7690': '100,30,0,34',
     ' 7691': '100,35,0,40',
     ' 7692': '100,36,0,47',
     ' 7693': '100,38,0,53',
     ' 7694': '100,37,0,59',
     ' 7695': '39,11,0,26',
     ' 7696': '47,12,0,32',
     ' 7697': '59,16,0,37',
     ' 7698': '62,18,0,44',
     ' 7699': '73,20,0,49',
     ' 7700': '100,26,0,51',
     ' 7701': '100,26,0,53',
     ' 7702': '76,14,0,23',
     ' 7703': '100,17,0,26',
     ' 7704': '100,22,0,33',
     ' 7705': '100,25,0,42',
     ' 7706': '100,26,0,44',
     ' 7707': '100,22,0,51',
     ' 7708': '100,22,0,57',
     ' 7709': '52,5,0,26',
     ' 7710': '100,8,0,28',
     ' 7711': '100,10,0,34',
     ' 7712': '100,15,0,39',
     ' 7713': '100,9,0,45',
     ' 7714': '100,8,0,49',
     ' 7715': '100,7,0,58',
     ' 7716': '100,0,5,41',
     ' 7717': '100,0,6,47',
     ' 7718': '100,0,2,53',
     ' 7719': '100,0,3,57',
     ' 7720': '100,0,8,61',
     ' 7721': '100,2,0,63',
     ' 7722': '100,0,1,68',
     ' 7723': '51,0,18,35',
     ' 7724': '100,0,27,41',
     ' 7725': '96,0,37,48',
     ' 7726': '92,0,37,52',
     ' 7727': '93,0,36,56',
     ' 7728': '100,0,33,60',
     ' 7729': '100,0,22,65',
     ' 7730': '48,0,34,42',
     ' 7731': '68,0,45,47',
     ' 7732': '88,0,46,52',
     ' 7733': '90,0,41,56',
     ' 7734': '59,0,32,62',
     ' 7735': '36,0,31,66',
     ' 7736': '34,0,21,67',
     ' 7737': '31,0,63,36',
     ' 7738': '49,0,58,36',
     ' 7739': '61,0,55,39',
     ' 7740': '53,0,55,44',
     ' 7741': '47,0,51,47',
     ' 7742': '35,0,47,53',
     ' 7743': '32,0,40,59',
     ' 7744': '0,3,85,25',
     ' 7745': '0,4,77,30',
     ' 7746': '0,3,68,38',
     ' 7747': '0,0,63,45',
     ' 7748': '0,1,58,50',
     ' 7749': '0,3,52,54',
     ' 7750': '0,1,46,60',
     ' 7751': '0,13,63,18',
     ' 7752': '0,18,81,16',
     ' 7753': '0,20,83,23',
     ' 7754': '0,19,73,36',
     ' 7755': '0,16,65,46',
     ' 7756': '0,13,54,55',
     ' 7757': '0,12,50,58',
     ' 7758': '0,12,91,14',
     ' 7759': '0,14,94,20',
     ' 7760': '0,12,70,41',
     ' 7761': '0,6,52,53',
     ' 7762': '5,0,42,61',
     ' 7763': '1,0,34,64',
     ' 7764': '0,1,37,67',
     ' 7765': '0,9,78,23',
     ' 7766': '0,10,81,26',
     ' 7767': '0,12,73,31',
     ' 7768': '0,15,64,42',
     ' 7769': '0,15,53,55',
     ' 7770': '0,12,43,61',
     ' 7771': '0,8,33,69',
     ' 8001': '0,0,0,45',
     ' 8002': '0,6,11,46',
     ' 8003': '0,9,16,45',
     ' 8004': '0,11,24,46',
     ' 8005': '0,16,31,46',
     ' 8006': '0,18,37,46',
     ' 8020': '0,12,21,39',
     ' 8021': '0,20,29,36',
     ' 8022': '0,32,48,33',
     ' 8023': '0,42,61,32',
     ' 8024': '0,48,73,31',
     ' 8025': '0,52,79,34',
     ' 8040': '0,3,5,42',
     ' 8041': '0,15,20,39',
     ' 8042': '0,22,29,38',
     ' 8043': '0,33,41,35',
     ' 8044': '0,43,56,35',
     ' 8045': '0,45,61,36',
     ' 8060': '0,11,4,41',
     ' 8061': '0,21,15,39',
     ' 8062': '0,30,23,38',
     ' 8063': '0,41,34,35',
     ' 8064': '0,43,38,37',
     ' 8065': '0,46,45,38',
     ' 8080': '2,9,0,41',
     ' 8081': '0,25,6,40',
     ' 8082': '0,35,11,40',
     ' 8083': '0,49,16,38',
     ' 8084': '0,63,29,36',
     ' 8085': '0,70,38,37',
     ' 8100': '4,17,0,41',
     ' 8101': '2,25,0,42',
     ' 8102': '1,33,0,43',
     ' 8103': '1,44,0,44',
     ' 8104': '0,60,16,43',
     ' 8105': '0,66,25,44',
     ' 8120': '8,11,0,40',
     ' 8121': '8,17,0,40',
     ' 8122': '9,26,0,42',
     ' 8123': '10,38,0,42',
     ' 8124': '0,43,3,46',
     ' 8125': '0,46,10,48',
     ' 8140': '13,17,0,41',
     ' 8141': '18,24,0,41',
     ' 8142': '24,37,0,40',
     ' 8143': '29,46,0,41',
     ' 8144': '14,38,0,49',
     ' 8145': '10,40,0,54',
     ' 8160': '11,9,0,40',
     ' 8161': '20,16,0,40',
     ' 8162': '38,35,0,40',
     ' 8163': '47,44,0,39',
     ' 8164': '46,47,0,43',
     ' 8165': '45,50,0,47',
     ' 8180': '16,6,0,40',
     ' 8181': '39,18,0,38',
     ' 8182': '57,27,0,38',
     ' 8183': '82,38,0,37',
     ' 8184': '100,38,0,42',
     ' 8185': '100,40,0,49',
     ' 8200': '26,8,0,39',
     ' 8201': '37,12,0,39',
     ' 8202': '55,18,0,38',
     ' 8203': '99,24,0,36',
     ' 8204': '68,16,0,45',
     ' 8205': '68,15,0,49',
     ' 8220': '28,8,0,40',
     ' 8221': '42,12,0,38',
     ' 8222': '63,15,0,37',
     ' 8223': '100,19,0,37',
     ' 8224': '100,17,0,44',
     ' 8225': '100,14,0,51',
     ' 8240': '13,3,0,41',
     ' 8241': '37,6,0,41',
     ' 8242': '54,9,0,39',
     ' 8243': '91,13,0,39',
     ' 8244': '63,4,0,48',
     ' 8245': '63,0,0,52',
     ' 8260': '20,3,0,42',
     ' 8261': '32,3,0,43',
     ' 8262': '47,2,0,45',
     ' 8263': '74,1,0,48',
     ' 8264': '75,0,2,53',
     ' 8265': '90,0,9,57',
     ' 8280': '17,0,0,41',
     ' 8281': '26,0,2,41',
     ' 8282': '41,0,3,41',
     ' 8283': '63,0,7,41',
     ' 8284': '43,0,12,44',
     ' 8285': '47,0,18,46',
     ' 8300': '14,0,7,40',
     ' 8301': '22,0,11,41',
     ' 8302': '31,0,16,41',
     ' 8303': '42,0,24,41',
     ' 8304': '31,0,26,44',
     ' 8305': '31,0,32,48',
     ' 8320': '7,0,4,41',
     ' 8321': '13,0,21,41',
     ' 8322': '18,0,29,40',
     ' 8323': '26,0,39,40',
     ' 8324': '18,0,41,42',
     ' 8325': '16,0,47,45',
     ' 8340': '3,0,16,41',
     ' 8341': '6,0,25,41',
     ' 8342': '6,0,37,39',
     ' 8343': '9,0,48,40',
     ' 8344': '6,0,62,42',
     ' 8345': '2,0,72,44',
     ' 8360': '2,0,19,40',
     ' 8361': '0,1,32,40',
     ' 8362': '0,4,45,37',
     ' 8363': '0,8,60,33',
     ' 8364': '0,11,60,35',
     ' 8365': '0,15,67,36',
     ' 8380': '0,1,9,42',
     ' 8381': '0,4,21,41',
     ' 8382': '0,10,33,38',
     ' 8383': '0,15,44,35',
     ' 8384': '0,24,62,33',
     ' 8385': '0,26,68,34',
     ' 8400': '0,0,0,47',
     ' 8401': '1,0,2,50',
     ' 8402': '0,0,0,56',
     ' 8403': '0,1,2,63',
     ' 8404': '0,5,10,67',
     ' 8405': '0,9,16,70',
     ' 8420': '1,2,0,44',
     ' 8421': '1,2,0,49',
     ' 8422': '0,3,4,54',
     ' 8423': '0,5,6,60',
     ' 8424': '0,16,19,61',
     ' 8425': '0,18,24,63',
     ' 8440': '0,13,12,40',
     ' 8441': '0,23,24,38',
     ' 8442': '0,33,32,36',
     ' 8443': '0,42,44,33',
     ' 8444': '0,52,57,31',
     ' 8445': '0,56,62,32',
     ' 8460': '3,4,0,43',
     ' 8461': '1,7,0,48',
     ' 8462': '0,10,2,50',
     ' 8463': '0,15,4,53',
     ' 8464': '0,32,18,56',
     ' 8465': '0,34,24,56',
     ' 8480': '50,14,0,53',
     ' 8481': '38,18,0,54',
     ' 8482': '70,23,0,56',
     ' 8483': '100,35,0,59',
     ' 8484': '100,34,0,51',
     ' 8485': '100,33,0,45',
     ' 8500': '12,0,1,49',
     ' 8501': '27,0,12,53',
     ' 8502': '39,7,0,59',
     ' 8503': '41,11,0,74',
     ' 8504': '58,16,0,64',
     ' 8505': '53,13,0,60',
     ' 8520': '0,3,25,52',
     ' 8521': '5,0,19,67',
     ' 8522': '16,0,13,71',
     ' 8523': '26,0,11,76',
     ' 8524': '36,0,0,71',
     ' 8525': '35,4,0,68',
     ' 8540': '0,43,39,48',
     ' 8541': '0,41,36,57',
     ' 8542': '0,52,44,61',
     ' 8543': '0,47,27,64',
     ' 8544': '0,39,14,62',
     ' 8545': '0,35,9,62',
     ' 8560': '0,38,52,52',
     ' 8561': '0,43,44,53',
     ' 8562': '0,48,41,55',
     ' 8563': '0,42,46,55',
     ' 8564': '0,36,38,53',
     ' 8565': '0,33,31,54',
     ' 8580': '0,30,59,40',
     ' 8581': '0,33,63,47',
     ' 8582': '0,35,66,51',
     ' 8583': '0,39,73,57',
     ' 8584': '0,35,63,57',
     ' 8585': '0,32,56,56',
     ' 8600': '0,4,7,65',
     ' 8601': '0,8,13,70',
     ' 8602': '5,5,0,76',
     ' 8603': '28,19,0,77',
     ' 8604': '36,21,0,71',
     ' 8605': '40,20,0,67',
     ' 8620': '0,23,46,54',
     ' 8621': '0,24,43,61',
     ' 8622': '0,19,38,68',
     ' 8623': '0,12,24,74',
     ' 8624': '0,8,18,74',
     ' 8625': '0,7,15,72',
     ' 8640': '0,24,70,37',
     ' 8641': '0,23,78,32',
     ' 8642': '0,22,90,31',
     ' 8643': '0,24,96,30',
     ' 8644': '0,18,84,31',
     ' 8645': '0,14,74,33',
     ' 8660': '0,18,65,42',
     ' 8661': '0,12,77,45',
     ' 8662': '0,8,79,45',
     ' 8663': '0,0,84,48',
     ' 8664': '2,0,72,44',
     ' 8665': '5,0,60,43',
     ' 8680': '0,8,51,51',
     ' 8681': '0,2,58,51',
     ' 8682': '12,0,63,50',
     ' 8683': '24,0,70,47',
     ' 8684': '26,0,60,47',
     ' 8685': '28,0,53,45',
     ' 8700': '1,0,33,54',
     ' 8701': '12,0,45,53',
     ' 8702': '26,0,48,51',
     ' 8703': '44,0,50,50',
     ' 8704': '45,0,41,47',
     ' 8705': '44,0,35,45',
     ' 8720': '28,0,21,57',
     ' 8721': '27,0,26,54',
     ' 8722': '49,0,26,55',
     ' 8723': '76,0,26,49',
     ' 8724': '70,0,19,47',
     ' 8725': '68,0,15,45',
     ' 8740': '37,0,9,59',
     ' 8741': '59,0,19,59',
     ' 8742': '59,0,10,58',
     ' 8743': '100,0,2,58',
     ' 8744': '100,4,0,53',
     ' 8745': '100,8,0,49',
     ' 8760': '75,0,1,61',
     ' 8761': '100,9,0,59',
     ' 8762': '72,10,0,59',
     ' 8763': '100,22,0,58',
     ' 8764': '100,23,0,51',
     ' 8765': '100,23,0,47',
     ' 8780': '44,38,0,63',
     ' 8781': '48,28,0,63',
     ' 8782': '71,51,0,55',
     ' 8783': '100,49,0,57',
     ' 8784': '95,44,0,51',
     ' 8785': '89,42,0,47',
     ' 8800': '4,38,0,65',
     ' 8801': '19,41,0,62',
     ' 8802': '38,55,0,61',
     ' 8803': '26,55,0,62',
     ' 8804': '30,51,0,56',
     ' 8805': '35,48,0,52',
     ' 8820': '0,53,31,47',
     ' 8821': '0,63,28,49',
     ' 8822': '0,48,4,59',
     ' 8823': '7,60,0,61',
     ' 8824': '18,54,0,53',
     ' 8825': '25,54,0,50',
     ' 8840': '0,57,40,44',
     ' 8841': '0,66,40,44',
     ' 8842': '0,76,36,45',
     ' 8843': '0,76,25,50',
     ' 8844': '0,66,14,50',
     ' 8845': '0,53,4,52',
     ' 8860': '0,54,57,41',
     ' 8861': '0,58,51,42',
     ' 8862': '0,69,52,41',
     ' 8863': '0,79,58,41',
     ' 8864': '0,70,45,43',
     ' 8865': '0,61,34,44',
     ' 8880': '0,47,48,42',
     ' 8881': '0,56,46,39',
     ' 8882': '0,67,44,34',
     ' 8883': '0,68,62,33',
     ' 8884': '0,62,54,36',
     ' 8885': '0,57,47,37',
     ' 8900': '0,50,65,35',
     ' 8901': '0,56,67,27',
     ' 8902': '0,55,57,28',
     ' 8903': '0,63,61,25',
     ' 8904': '0,58,53,26',
     ' 8905': '0,54,49,29',
     ' 8920': '0,43,60,36',
     ' 8921': '0,54,77,29',
     ' 8922': '0,57,92,27',
     ' 8923': '0,60,82,26',
     ' 8924': '0,57,75,28',
     ' 8925': '0,53,69,30',
     ' 8940': '0,41,73,34',
     ' 8941': '0,45,83,33',
     ' 8942': '0,50,93,30',
     ' 8943': '0,53,97,25',
     ' 8944': '0,50,88,27',
     ' 8945': '0,46,75,30',
     ' 8960': '0,30,70,37',
     ' 8961': '0,39,82,33',
     ' 8962': '0,39,96,31',
     ' 8963': '0,46,97,28',
     ' 8964': '0,42,82,30',
     ' 8965': '0,37,72,32',
     ' 9020': '0,1,16,6',
     ' 9021': '0,3,4,6',
     ' 9022': '0,3,1,7',
     ' 9023': '1,3,0,8',
     ' 9040': '9,2,0,6',
     ' 9041': '5,0,2,8',
     ' 9042': '3,0,2,8',
     ' 9043': '0,0,3,10',
     ' 9044': '13,0,0,11',
     ' 9045': '11,0,1,13',
     ' 9060': '0,1,10,6',
     ' 9061': '0,3,2,6',
     ' 9062': '5,0,1,7',
     ' 9063': '4,0,3,6',
     ' 9064': '0,0,7,5',
     ' 9080': '0,0,3,11',
     ' 9081': '0,2,5,12',
     ' 9082': '0,2,6,18',
     ' 9083': '0,1,6,20',
     ' 9084': '0,3,8,32',
     ' 9100': '1,0,3,9',
     ' 9101': '1,0,3,11',
     ' 9102': '2,0,2,14',
     ' 9103': '2,0,2,15',
     ' 9120': '0,3,25,3',
     ' 9121': '0,3,28,3',
     ' 9122': '0,2,20,9',
     ' 9123': '0,3,17,13',
     ' 9140': '0,3,16,4',
     ' 9141': '0,3,20,3',
     ' 9142': '0,2,15,9',
     ' 9143': '0,3,15,9',
     ' 9160': '0,7,22,4',
     ' 9161': '0,6,20,8',
     ' 9162': '0,5,14,11',
     ' 9163': '0,5,15,15',
     ' 9180': '0,7,16,3',
     ' 9181': '0,7,18,4',
     ' 9182': '0,6,14,7',
     ' 9183': '0,6,13,10',
     ' 9184': '0,4,13,7',
     ' 9185': '0,5,12,7',
     ' 9186': '0,6,13,12',
     ' 9200': '0,8,16,3',
     ' 9201': '0,8,17,4',
     ' 9202': '0,7,14,7',
     ' 9203': '0,7,14,10',
     ' 9220': '0,8,15,5',
     ' 9221': '0,9,16,7',
     ' 9222': '0,9,13,9',
     ' 9223': '0,6,11,12',
     ' 9224': '0,4,9,5',
     ' 9225': '0,4,10,6',
     ' 9226': '0,3,8,7',
     ' 9240': '0,6,8,5',
     ' 9241': '0,7,9,7',
     ' 9242': '0,8,11,9',
     ' 9243': '0,8,10,12',
     ' 9244': '0,4,6,5',
     ' 9260': '0,9,10,5',
     ' 9261': '0,10,11,6',
     ' 9262': '0,8,8,9',
     ' 9263': '0,9,11,11',
     ' 9280': '0,7,7,5',
     ' 9281': '0,8,8,5',
     ' 9282': '0,8,8,6',
     ' 9283': '0,6,7,9',
     ' 9284': '0,19,17,3',
     ' 9285': '0,2,4,6',
     ' 9286': '0,9,10,3',
     ' 9300': '0,10,7,4',
     ' 9301': '0,7,5,7',
     ' 9302': '0,11,8,9',
     ' 9303': '0,9,7,10',
     ' 9320': '0,8,3,6',
     ' 9321': '0,9,4,9',
     ' 9322': '0,10,4,9',
     ' 9323': '0,9,4,12',
     ' 9324': '0,16,4,6',
     ' 9340': '2,5,0,9',
     ' 9341': '3,6,0,10',
     ' 9342': '3,6,0,11',
     ' 9343': '3,8,0,12',
     ' 9344': '11,20,0,10',
     ' 9345': '0,1,1,7',
     ' 9360': '7,8,0,8',
     ' 9361': '6,9,0,9',
     ' 9362': '5,7,0,10',
     ' 9363': '6,9,0,13',
     ' 9380': '7,5,0,7',
     ' 9381': '12,7,0,8',
     ' 9382': '15,9,0,9',
     ' 9383': '10,6,0,11',
     ' 9384': '9,5,0,7',
     ' 9385': '10,5,0,12',
     ' 9400': '11,5,0,7',
     ' 9401': '12,5,0,6',
     ' 9402': '10,3,0,9',
     ' 9403': '13,5,0,10',
     ' 9420': '13,5,0,6',
     ' 9421': '13,4,0,8',
     ' 9422': '13,5,0,10',
     ' 9423': '15,5,0,13',
     ' 9424': '18,2,0,9',
     ' 9440': '20,4,0,8',
     ' 9441': '21,5,0,7',
     ' 9442': '20,4,0,9',
     ' 9443': '19,4,0,12',
     ' 9460': '13,2,0,5',
     ' 9461': '20,2,0,10',
     ' 9462': '20,2,0,12',
     ' 9463': '17,2,0,12',
     ' 9464': '37,7,0,7',
     ' 9480': '16,0,0,8',
     ' 9481': '17,1,0,8',
     ' 9482': '18,2,0,9',
     ' 9483': '12,0,1,14',
     ' 9500': '20,0,0,9',
     ' 9501': '19,0,1,12',
     ' 9502': '12,0,1,11',
     ' 9503': '10,0,1,13',
     ' 9504': '11,0,1,15',
     ' 9520': '11,0,3,6',
     ' 9521': '9,0,2,9',
     ' 9522': '8,0,3,10',
     ' 9523': '7,0,2,11',
     ' 9524': '26,0,6,8',
     ' 9525': '4,0,4,6',
     ' 9540': '8,0,4,6',
     ' 9541': '6,0,3,8',
     ' 9542': '6,0,6,14',
     ' 9543': '8,0,7,16',
     ' 9544': '4,0,9,5',
     ' 9560': '6,0,7,6',
     ' 9561': '7,0,9,9',
     ' 9562': '5,0,8,11',
     ' 9563': '4,0,7,13',
     ' 9580': '4,0,14,6',
     ' 9581': '2,0,10,9',
     ' 9582': '1,0,9,14',
     ' 9583': '3,0,11,17',
     ' 9584': '3,0,10,11',
     ' 9585': '2,0,10,14',
     ' 9600': '2,0,14,8',
     ' 9601': '1,0,12,9',
     ' 9602': '0,0,13,14',
     ' 9603': '0,1,11,14'
    }
   }

  }
 }

 function reloadPanel() {
  location.reload();
 }

 function loadJSX(fileName) {
  var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + '/jsx/';
  csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
 }
}

/**
 * Extend Script host function
 * */
function makeLayout(str) {
 var PT_TO_MM = 2.834645668;
 var MM_TO_PT = 0.352777778;
 var DISTORS = 0;

 var margTop = +str.nmb.margTop,
  margBott = +str.nmb.margBott,
  margLeft = +str.nmb.margLeft,
  margRight = +str.nmb.margRight;

 var testLayName = '__test-lay__',
  primerLayName = '__primer-lay__',
  lakLayName = '__lak-lay__',
  whiteLayName = '__white-lay__',
  lakPrimerLayName = '__lak-primer-lay__';

 var outLay = false,
  outLayName = 'out';

 // scrollWin (showObjDeep (str));

 _addDoc(str);
 _addLakAndPrimer(str);
 // _showRulers(str);
 _addGuides(str);
 _addTestElems(str);

 // _delAllUnused();

 (function setZeroPoint() {
  var d = activeDocument;
  d.rulerOrigin = [
   d.rulerOrigin[0],
   d.height - +str.nmb.margTop * PT_TO_MM
  ];
  d.artboards[d.artboards.getActiveArtboardIndex()].rulerOrigin = [
   d.artboards[d.artboards.getActiveArtboardIndex()].rulerOrigin[0],
   str.nmb.margTop * PT_TO_MM
  ];
 }());

 function _addDoc(opts) {
  var docName, doc;

  var railW = +opts.nmb.railWidth;
  var margVert = +opts.nmb.margTop + +(opts.nmb.margBott);
  var margHor = +opts.nmb.margLeft + +(opts.nmb.margRight);
  var docW = (+opts.nmb.layoutWidth * +opts.nmb.streams + margHor + +opts.nmb.indentIn * 2 + railW * 2) * PT_TO_MM;
  var docH = (+opts.sel.z + margVert - DISTORS) * PT_TO_MM;

  if (opts.chk['active_doc']) {
   docName = activeDocument.name;
   doc = activeDocument;
   ___setArtb2HW(0, docW, docH);
   // alert('hi!');
   rmWhitePrLakLays([testLayName, primerLayName, lakLayName, whiteLayName, lakPrimerLayName], outLayName);
  } else {
   docName = opts.txt.fileName;
   var pres = new DocumentPreset();

   pres.title = docName;
   pres.colorMode = DocumentColorSpace.CMYK;
   pres.height = docH;
   pres.width = docW;
   pres.units = RulerUnits.Millimeters;
   pres.previewMode = DocumentPreviewMode.OverprintPreview;
   pres.rasterResolution = DocumentRasterResolution.HighResolution;
   // pres.numArtboards       = 10;
   // pres.artboardLayout     = DocumentArtboardLayout.Row;
   // pres.artboardRowsOrCols = 5;
   // pres.transparencyGrid   = DocumentTransparencyGrid.TransparencyGridOrange;

   doc = documents.addDocument('', pres, false);
   // doc.saveAs (new File (Folder.desktop + '/ze_test.ai'), new IllustratorSaveOptions ());
  }

  doc.artboards[0].rulerOrigin = doc.rulerOrigin = [
   (+opts.nmb.margLeft + +opts.nmb.railWidth + +opts.nmb.indentIn) * PT_TO_MM, docH - opts.nmb.margTop * PT_TO_MM
  ];

  try {
   outLay = doc.layers.getByName(outLayName);
  } catch (e) {
  }

  // addLayer({rgb: [0, 128, 128], doc: doc, title: 'color'});
  addLayer({rgb: [128, 128, 0], doc: doc, title: testLayName, parentLayName: outLayName});

  // doc.layers[doc.layers.length - 1].remove();

  /** !!! WARN !!! This function working correctrly.
   * But other code worked non-correct - needs to refactoring
   * */

  // __setZero();
  /**
   * Set artboard to target height and weight
   *
   * взять ортборд
   * добавить прямоугольник по ортборду, без заливки и обводки
   * привести прямоугольник к переданным параметрам высоты и ширины, относительно нижней точки
   * привести артборд к прямоугольнику
   * удалить прямоугольник
   *
   * @param {number} n номер артборда
   * @param {number} h высота
   * @param {number} w ширина
   * */
  function ___setArtb2HW(n, h, w) {
   executeMenuCommand('deselectall');

   var doc = activeDocument;
   doc.artboards.setActiveArtboardIndex(0);
   doc.rulerOrigin = [0, doc.height]; // Set Zero point ruler on Document

   var lay = doc.activeLayer;
   var artbRect = doc.artboards[n].artboardRect;
   var rectParams = [artbRect[1], artbRect[0], artbRect[2], -artbRect[3]]; //[top, left, width, height]
   var rect = lay.pathItems.rectangle(w - rectParams[3], (rectParams[2] - h) / 2, h, w);

   rect.stroked = false;
   rect.filled = false;
   rect.selected = true;
   doc.fitArtboardToSelectedArt(n);
   rect.remove();
  }

  /** !!! WARN !!! This function working correctrly.
   * But other code worked non-correct - needs to refactoring
   * */
  function __setZero() {
   if (documents.length == 0) return;

   activeDocument.rulerOrigin = [0, activeDocument.height]; // Set Zero point ruler on Document

   if (selection.length != 0) {
    var left = selection[0].left,
     top = -selection[0].top;

    activeDocument.artboards[activeDocument.artboards.getActiveArtboardIndex()].rulerOrigin = [left, top];
    return;
   }
   activeDocument.artboards[activeDocument.artboards.getActiveArtboardIndex()].rulerOrigin = [0, 0];
  }
 }

 function _showRulers() {
  var actStr = '/version 3' +
   '/name [ 11' +
   '	53686f772052756c657273' +
   ']' +
   '/isOpen 1' +
   '/actionCount 1' +
   '/action-1 {' +
   '	/name [ 11' +
   '		53686f772052756c657273' +
   '	]' +
   '	/keyIndex 0' +
   '	/colorIndex 0' +
   '	/isOpen 1' +
   '	/eventCount 1' +
   '	/event-1 {' +
   '		/useRulersIn1stQuadrant 0' +
   '		/internalName (adobe_commandManager)' +
   '		/localizedName [ 16' +
   '			416363657373204d656e75204974656d' +
   '		]' +
   '		/isOpen 0' +
   '		/isOn 1' +
   '		/hasDialog 0' +
   '		/parameterCount 3' +
   '		/parameter-1 {' +
   '			/key 1769238125' +
   '			/showInPalette -1' +
   '			/type (ustring)' +
   '			/value [ 5' +
   '				72756c6572' +
   '			]' +
   '		}' +
   '		/parameter-2 {' +
   '			/key 1818455661' +
   '			/showInPalette -1' +
   '			/type (ustring)' +
   '			/value [ 11' +
   '				53686f772052756c657273' +
   '			]' +
   '		}' +
   '		/parameter-3 {' +
   '			/key 1668114788' +
   '			/showInPalette -1' +
   '			/type (integer)' +
   '			/value 37' +
   '		}' +
   '	}' +
   '}';

  runAction('Show Rulers', 'Show Rulers', actStr);
 }

 function _addGuides(opts) {
  var doc = activeDocument,
   lay, outLay = false,
   docW = doc.width,
   docH = doc.height;

  try {
   outLay = doc.layers.getByName(outLayName);
   lay = outLay.layers.getByName(testLayName);
   // alert(testLayName);
  } catch (e) {
  }

  if (!outLay) lay = doc.layers.getByName(testLayName);

  var topGuide, bottGuide, centerGuide, leftGuide, rightGuide;

  var topX, topY, topLen,
   leftX, leftY, leftLen;

  var guideBleeds = 1000;

  topX = -guideBleeds * PT_TO_MM;
  topY = 0;
  topLen = docH + guideBleeds * 2 * PT_TO_MM;
  topGuide = lay.pathItems.add();
  topGuide.setEntirePath([
   [topX, topY],
   [topX + topLen, topY]
  ]);
  topGuide.guides = true;

  bottGuide = topGuide.duplicate();
  bottGuide.position = [topGuide.position[0], topGuide.position[1] - docH + (margTop + margBott) * PT_TO_MM];

  centerGuide = topGuide.duplicate();
  centerGuide.position = [topGuide.position[0], -(+opts.sel.z - DISTORS) / 2 * PT_TO_MM];

  leftX = 0;
  leftY = -guideBleeds * PT_TO_MM;
  leftLen = docH + guideBleeds * 2 * PT_TO_MM;
  leftGuide = lay.pathItems.add();
  leftGuide.setEntirePath([
   [leftX, leftY],
   [leftX, leftY + leftLen]
  ]);
  leftGuide.guides = true;

  rightGuide = leftGuide.duplicate();
  rightGuide.position = [leftGuide.position[0] + +opts.nmb.layoutWidth * +opts.nmb.streams * PT_TO_MM, leftGuide.position[1]];

  for (var i = 1; i < opts.nmb.streams; i++) {
   var duplGuide = leftGuide.duplicate();
   duplGuide.position = [
    (leftGuide.position[0] + +opts.nmb.layoutWidth * i) * PT_TO_MM,
    leftGuide.position[1]
   ];
  }

 }

 function _addTestElems(opts) {
  var fontName = __getFonts()[0];
  var lay,
   outLay = false;
  var doc = activeDocument;

  try {
   outLay = doc.layers.getByName(outLayName);
   lay = outLay.layers.getByName(testLayName);
   // alert(testLayName);
  } catch (e) {
  }

  if (!outLay) lay = doc.layers.getByName(testLayName);

  var mainGr = lay.groupItems.add(),
   railGr = mainGr.groupItems.add(),
   crossGr = mainGr.groupItems.add(),
   dotsGr = lay.groupItems.add(),
   titleGr = lay.groupItems.add(),
   colorGr = lay.groupItems.add(),
   trafficLightGr = lay.groupItems.add(),
   squardsGr = lay.groupItems.add(),
   miraGr = lay.groupItems.add();

  __addRails(opts, railGr);
  __addCrossGr(opts, crossGr);
  __addTitle(opts, titleGr);
  __addColors(opts, colorGr);

  /**
   * !!! WARN !!! Patch
   * */
  (function setZero() {
   if (documents.length == 0) return;

   activeDocument.rulerOrigin = [0, activeDocument.height]; // Set Zero point ruler on Document

   if (selection.length != 0) {
    var left = selection[0].left,
     top = -selection[0].top;

    activeDocument.artboards[activeDocument.artboards.getActiveArtboardIndex()].rulerOrigin = [left, top];
    return;
   }
   activeDocument.artboards[activeDocument.artboards.getActiveArtboardIndex()].rulerOrigin = [0, 0];
  }());

  __addDotsGr(opts, dotsGr);

  __addTrafficLightsGr(opts, trafficLightGr);
  try {
   __addSquardsGr(opts, squardsGr);
  } catch (e) {
   alert(e.line + '. ' + e.message);
  }
  try {
   __addMiraGr(opts, miraGr);
  } catch (e) {
   alert(e.line + '. ' + e.message);
  }

  // duplicate the rails to right
  var mainGrCopy = mainGr.duplicate();
  mainGrCopy.position = [
   railGr.position[0] + (+opts.nmb.layoutWidth * +opts.nmb.streams + +opts.nmb.indentIn * 2 + +opts.nmb.railWidth) * PT_TO_MM,
   railGr.position[1]
  ];

  colorGr.translate((+opts.nmb.layoutWidth * +opts.nmb.streams + +opts.nmb.indentIn * 2 + +opts.nmb.railWidth) * PT_TO_MM,
   0);

  try {
   __moveLakPrimerElements();
  } catch (e) {
   alert('__moveLakPrimerElements error\n' + e);
  }

  /**
   * LIB TO ADD TEST ELEMENTS
   * */

  function __moveLakPrimerElements() {

   var layPrimerLakNames = [primerLayName, lakLayName, lakPrimerLayName],
    outLay = false,
    layPrLak = false,
    crossLakGroups = false,
    crossPrGroups = false,
    lakLabel = false,
    primerLabel = false;

   try {
    outLay = activeDocument.layers.getByName(outLayName);
   } catch (e) {
   }

   if (outLay) {
    layPrLak = __getLakPrimerLay(layPrimerLakNames, outLay);
   } else {
    layPrLak = __getLakPrimerLay(layPrimerLakNames, activeDocument);
   }

   if (!layPrLak) return;

   try {
    crossLakGroups = getAllGroupsByName('cross_L', 6);
    for (var i = 0; i < crossLakGroups.length; i++) {
     var crossLakGr = crossLakGroups[i];
     crossLakGr.move(layPrLak, ElementPlacement.INSIDE);
    }
   } catch (e) {
   }

   try {
    crossPrGroups = getAllGroupsByName('cross_Pr', 6);
    for (var j = 0; j < crossPrGroups.length; j++) {
     var crossPrGr = crossPrGroups[j];
     crossPrGr.move(layPrLak, ElementPlacement.INSIDE);
    }
   } catch (e) {
   }

   try {
    lakLabel = activeDocument.pageItems.getByName('__lak-label__');
    lakLabel.move(layPrLak, ElementPlacement.INSIDE);
   } catch (e) {
   }

   try {
    primerLabel = activeDocument.pageItems.getByName('__primer-label__');
    primerLabel.move(layPrLak, ElementPlacement.INSIDE);
   } catch (e) {
   }

  }

  function __addColors(opts, colorGr) {
   var colorGr = colorGr.groupItems.add();
   var labelGr = colorGr.groupItems.add();
   var fontSize = 20;
   var bgH = (+opts.nmb.railWidth - +opts.nmb.railWidth / 3) * PT_TO_MM,
    bgW;
   var colArr = opts.col;

   var labelX = 0,
    labelY = 0;

   for (var i = 0; i < colArr.length; i++) {
    var obj = colArr[i];
    var colorLabel = labelGr.textFrames.add();

    colorLabel.contents = setPantAlias(obj.name);
    // alert (obj.name.length);
    // colorLabel.paragraphs[0].paragraphAttributes.justification = Justification.RIGHT;
    colorLabel.textRange.characterAttributes.textFont = textFonts.getByName(fontName);
    colorLabel.textRange.characterAttributes.capitalization = FontCapsOption.SMALLCAPS;
    colorLabel.textRange.characterAttributes.size = fontSize;

    if (i == 0) {
     ___tuneCharSize();
    }

    if (obj.name.match(/^W(#\d)?$/)) {
     colorLabel.textRange.characterAttributes.fillColor = getColor('white');
     colorLabel.textRange.characterAttributes.overprintFill = false;
    } else if (obj.name == 'L') {
     colorLabel.textRange.characterAttributes.fillColor = getColor(obj.name, obj.cmyk.split(','), 0);
     colorLabel.textRange.characterAttributes.overprintFill = true;
     colorLabel.name = '__lak-label__';
    } else if (obj.name == 'Pr') {
     colorLabel.textRange.characterAttributes.fillColor = getColor(obj.name, obj.cmyk.split(','), 0);
     colorLabel.textRange.characterAttributes.overprintFill = true;
     colorLabel.name = '__primer-label__';
    } else {
     colorLabel.textRange.characterAttributes.fillColor = getColor(obj.name, obj.cmyk.split(','), 100);
     colorLabel.textRange.characterAttributes.overprintFill = true;
    }

    colorLabel.position = [labelX, labelY];
    labelX += colorLabel.width;
   }

   function ___tuneCharSize() {
    // tune the label to bg
    var lblHeight = calcCharSize(colorLabel).h;
    while (lblHeight > bgH) {
     fontSize -= 0.1;
     colorLabel.textRange.characterAttributes.size = fontSize;
     lblHeight = calcCharSize(colorLabel).h;
    }
   }

   labelGr.position = [0, calcCharSize(labelGr.pageItems[0]).top];

   var colBg = (function addColorBg() {
    bgW = labelGr.width;
    var colBg = labelGr.pathItems.rectangle(0, 0, bgW, bgH);
    colBg.stroked = false;
    colBg.fillColor = getColor('white');

    for (var j = 0; j < colArr.length; j++) {
     var col = colArr[j];
     if (col.name == 'W') {
      colBg.fillColor = getColor('W', col.cmyk.split(','), 100);
     }
    }

    colBg.move(labelGr, ElementPlacement.PLACEATEND);
    return colBg;

   }());

   labelGr.rotate(90, true);
   labelGr.position = [
    (-opts.nmb.indentIn - opts.nmb.railWidth + 0.5 * +opts.nmb.railWidth / 3) * PT_TO_MM - calcCharSize(labelGr.pageItems[0]).top,
    (-(opts.sel.z - 6 - +opts.nmb.crossWidth) / 2 + 2.5) * PT_TO_MM + colorGr.height
   ];

   /* for (var l = 0; l < colArr.length; l++) {
    var col2 = colArr[l];
    if (col2.name == 'Pr') {
    var primer       = colBg.duplicate ();
    primer.fillColor = getColor ('Pr', col2.cmyk.split (','), 100);
    }
    }*/
  }

  /*function __addTitle(opts, titleGr) {
   var fontSize = 16;
   var str = (opts.txt.layoutName + ' ' + formatDate2(new Date())).replace(/_/gmi, '  ');
   var title = titleGr.textFrames.add();
   var titleTmplRect = [ // top, left, width, height
    (-(+opts.sel.z - DISTORS) / 2 - opts.nmb.crossWidth / 2 - 3) * PT_TO_MM,
    (-opts.nmb.railWidth - opts.nmb.indentIn) * PT_TO_MM,
    opts.nmb.railWidth * PT_TO_MM,
    ((opts.sel.z - DISTORS) / 2 - opts.nmb.crossWidth - 15) * PT_TO_MM
   ];
   var titleCharSize;
   var titleFrameSize;
   var col = opts.col;

   // add test title template rectangle:
   // activeDocument.pathItems.rectangle (titleTmplRect[0], titleTmplRect[1], titleTmplRect[2], titleTmplRect[3]);

   title.contents = str;
   // title.paragraphs[0].paragraphAttributes.justification = Justification.RIGHT;
   title.paragraphs[0].paragraphAttributes.justification = Justification.LEFT;
   title.textRange.characterAttributes.textFont = textFonts.getByName(fontName);
   title.textRange.characterAttributes.size = fontSize;
   title.textRange.characterAttributes.capitalization = FontCapsOption.ALLCAPS;

   title.textRange.characterAttributes.fillColor = getRegistration();
   title.textRange.characterAttributes.overprintFill = true;

   title.rotate(90, true);

   // tune text frame width
   while (calcCharSize(title).h * MM_TO_PT > opts.nmb.railWidth - 1.5) {
    fontSize -= 0.1;
    title.textRange.characterAttributes.size = fontSize;
   }
   // tune text frame height
   while (__getFrameSize(title)[3] > titleTmplRect[3]) {
    fontSize -= 0.1;
    title.textRange.characterAttributes.size = fontSize;
   }

   titleCharSize = calcCharSize(title);
   titleFrameSize = __getFrameSize(title);

   title.position = [
    titleTmplRect[1] - calcCharSize(title).top + (+opts.nmb.railWidth * PT_TO_MM - calcCharSize(title).h) / 2,
    titleTmplRect[0] - opts.sel.z * PT_TO_MM / 2 + Math.abs(title.geometricBounds[1] - title.geometricBounds[3]) + +opts.nmb.crossWidth * 4 * PT_TO_MM
   ];

   for (i = 0; i < opts.col.length; i++) {
    var obj = opts.col[i];
    if (obj.name != 'Pr' && obj.name != 'L') continue;

    for (var i = 0, titleWhiteCount = 0; i < col.length; i++) {
     var obj = col[i];
     if (obj.name.match(/^Pr(#\d)?$/) || obj.name.match(/^L(#\d)?/)) { // !!! Pr - primer but no Process colors
      if (titleWhiteCount == 0) {
       var tmpTitleDupl = title.duplicate();

       tmpTitleDupl.textRange.characterAttributes.fillColor = getColor('white');
       tmpTitleDupl.textRange.characterAttributes.overprintFill = false;
       tmpTitleDupl.move(titleGr, ElementPlacement.PLACEATEND);
       titleWhiteCount++;
      }
     } else {
      var tmpTitleDupl = title.duplicate();

      tmpTitleDupl.textRange.characterAttributes.fillColor = getColor(obj.name, obj.cmyk.split(','), 100);
      tmpTitleDupl.textRange.characterAttributes.overprintFill = true;
     }
    }
    title.remove();
    break;
   }

  }*/

  function __addTitle(opts, titleGr) {
   var fontSize = 16;
   var str = (opts.txt.layoutName + ' ' + formatDate2(new Date())).replace(/_/gmi, '  ');
   var title = titleGr.textFrames.add();
   var titleTmplRect = [ // top, left, width, height
    (-(+opts.sel.z - DISTORS) / 2 - opts.nmb.crossWidth / 2 - 3) * PT_TO_MM,
    (-opts.nmb.railWidth - opts.nmb.indentIn) * PT_TO_MM,
    opts.nmb.railWidth * PT_TO_MM,
    ((opts.sel.z - DISTORS) / 2 - opts.nmb.crossWidth - 15) * PT_TO_MM
   ];
   var titleCharSize;
   var titleFrameSize;
   var col = opts.col;

   var layPrimerLak = false, outLay = false, layPrimerLakNames = [primerLayName, lakLayName, lakPrimerLayName];

   try {
    outLay = doc.layers.getByName(outLayName);
   } catch (e) {
   }

   if (outLay) {
    layPrimerLak = __getLakPrimerLay(layPrimerLakNames, outLay);
   } else {
    layPrimerLak = __getLakPrimerLay(layPrimerLakNames, activeDocument);
   }

   // add test title template rectangle:
   // activeDocument.pathItems.rectangle (titleTmplRect[0], titleTmplRect[1], titleTmplRect[2], titleTmplRect[3]);

   title.contents = str;
   // title.paragraphs[0].paragraphAttributes.justification = Justification.RIGHT;
   title.paragraphs[0].paragraphAttributes.justification = Justification.LEFT;
   title.textRange.characterAttributes.textFont = textFonts.getByName(fontName);
   title.textRange.characterAttributes.size = fontSize;
   title.textRange.characterAttributes.capitalization = FontCapsOption.ALLCAPS;

   title.textRange.characterAttributes.fillColor = getRegistration();
   title.textRange.characterAttributes.overprintFill = true;

   title.rotate(90, true);

   // tune text frame width
   while (calcCharSize(title).h * MM_TO_PT > opts.nmb.railWidth - 1.5) {
    fontSize -= 0.1;
    title.textRange.characterAttributes.size = fontSize;
   }
   // tune text frame height
   while (__getFrameSize(title)[3] > titleTmplRect[3]) {
    fontSize -= 0.1;
    title.textRange.characterAttributes.size = fontSize;
   }

   titleCharSize = calcCharSize(title);
   titleFrameSize = __getFrameSize(title);

   title.position = [
    titleTmplRect[1] - calcCharSize(title).top + (+opts.nmb.railWidth * PT_TO_MM - calcCharSize(title).h) / 2,
    titleTmplRect[0] - opts.sel.z * PT_TO_MM / 2 + Math.abs(title.geometricBounds[1] - title.geometricBounds[3]) + +opts.nmb.crossWidth * 4 * PT_TO_MM
   ];

   for (i = 0; i < opts.col.length; i++) {
    var currCol = opts.col[i];
    if (currCol.name == "Pr") {
     var primerColor = title.duplicate();
     primerColor.textRange.characterAttributes.strokeWeight = 0;
     primerColor.textRange.characterAttributes.fillColor = getColor('Pr', getCMYK(opts, 'Pr'), 0);
     primerColor.textRange.characterAttributes.overprintFill = true;
     primerColor.move(layPrimerLak, ElementPlacement.INSIDE);
    }
    if (currCol.name == "L") {
     var lakColor = title.duplicate();
     lakColor.textRange.characterAttributes.strokeWeight = 0;
     lakColor.textRange.characterAttributes.fillColor = getColor('L', getCMYK(opts, 'L'), 0);
     lakColor.textRange.characterAttributes.overprintFill = true;
     lakColor.move(layPrimerLak, ElementPlacement.INSIDE);
    }
   }

  }

  /*function __addRails(opts, railGr) {
   var arr = opts.col;
   var shift_count = 1;

   for (var i = 0; i < arr.length; i++) {
    var obj = arr[i];

    if (obj.name == 'Pr') continue;

    var rail = railGr.pathItems.rectangle(
     opts.nmb['shift_' + shift_count] * PT_TO_MM,
     (-opts.nmb.railWidth - opts.nmb.indentIn) * PT_TO_MM,
     opts.nmb.railWidth * PT_TO_MM,
     (opts.sel.z - DISTORS) * PT_TO_MM
    );
    rail.name = 'rail_' + obj.name;
    var cmykArr = obj.cmyk.split(',');
    if (obj.name.match(/^L(#\d)?$/)) {
     rail.fillColor = getColor(obj.name, cmykArr, 100);
    } else {
     rail.fillColor = getColor(obj.name, cmykArr, 20);
    }

    rail.stroked = false;
    rail.fillOverprint = true;

    shift_count++;
   }
   var railTopLine = railGr.pathItems.rectangle(
    0,
    (-opts.nmb.railWidth / 2 - opts.nmb.indentIn - 0.1) * PT_TO_MM,
    0.2 * PT_TO_MM,
    (opts.sel.z - DISTORS) * PT_TO_MM);
   railTopLine.name = 'rail_topLine';
   railTopLine.fillColor = makeSpot('film', [0, 0, 0, 30], 100);
   railTopLine.fillOverprint = false;
   railTopLine.stroked = false;
  }*/

  function __getLakPrimerLay(layNames, parentObject) {
   var lay = false;
   for (var i = 0; i < layNames.length; i++) {
    var layName = layNames[i];
    try {
     lay = parentObject.layers.getByName(layName);
    } catch (e) {
     // continue;
    }

   }
   return lay;

  }

  function __addRails(opts, railGr) {
   var arr = opts.col;

   for (var i = 0; i < arr.length; i++) {
    var obj = arr[i];

    if (obj.name == 'Pr') continue;

    var rail = railGr.pathItems.rectangle(
     0,
     (-opts.nmb.railWidth - opts.nmb.indentIn) * PT_TO_MM,
     opts.nmb.railWidth * PT_TO_MM,
     (opts.sel.z - DISTORS) * PT_TO_MM
    );
    rail.name = 'rail_' + obj.name;
    var cmykArr = obj.cmyk.split(',');
    if (obj.name.match(/^L(#\d)?$/)) {
     rail.fillColor = getColor(obj.name, cmykArr, 100);
    } else {
     rail.fillColor = getColor(obj.name, cmykArr, 20);
    }

    rail.stroked = false;
    rail.fillOverprint = true;

   }
   var railTopLine = railGr.pathItems.rectangle(
    0,
    (-opts.nmb.railWidth / 2 - opts.nmb.indentIn - 0.1) * PT_TO_MM,
    0.2 * PT_TO_MM,
    (opts.sel.z - DISTORS) * PT_TO_MM);
   railTopLine.name = 'rail_topLine';
   railTopLine.fillColor = makeSpot('film', [0, 0, 0, 30], 100);
   railTopLine.fillOverprint = false;
   railTopLine.stroked = false;
  }

  function __addCrossGr(opts, crossGr) {
   var arr = opts.col;
   var DBL_STROKE = 2;
   var scale_count_main = 2;
   var scale_count_ground = 0;
   var scale_fact_main = 90;
   var scale_fact_ground = 85;

   var crossBg = crossGr.pathItems.rectangle(
    +opts.nmb.crossWidth * PT_TO_MM,
    -opts.nmb.crossWidth * PT_TO_MM / 2,
    +opts.nmb.crossWidth * PT_TO_MM,
    +opts.nmb.crossWidth * PT_TO_MM
   );
   crossBg.stroked = false;
   crossBg.name = '__cross-bg__';
   crossBg.fillColor = getColor('white');
   crossBg.overprintFill = false;

   try {
    var crossCircle = crossGr.pathItems.ellipse(
     +opts.nmb.crossWidth * PT_TO_MM,
     -opts.nmb.crossWidth * PT_TO_MM / 2,
     +opts.nmb.crossWidth * PT_TO_MM,
     +opts.nmb.crossWidth * PT_TO_MM
    );

    crossCircle.name = '__cross-circle__';

    crossCircle.filled = false;
    crossCircle.stroked = true;
    crossCircle.strokeWidth = +opts.nmb.crossStroke * PT_TO_MM;
    crossCircle.strokeColor = getRegistration();
    crossCircle.resize(50, 50);
    crossCircle.strokeOverprint = true;
   } catch (e) {
   }

   for (var m = 0; m < arr.length; m++) {
    var obj1 = arr[m];
    if (obj1.name == 'C' || obj1.name == 'M' || obj1.name == 'Y' || obj1.name == 'K') {
     scale_count_main = 3;
     break;
    }
   }

   for (var k = 0; k < arr.length; k++) {
    var obj = arr[k];

    var lineGr = crossGr.groupItems.add();
    var line = lineGr.pathItems.add();

    line.filled = false;
    line.stroked = true;
    line.strokeOverprint = true;

    if (
     obj.name.match(/^L(#\d)?$/) ||
     obj.name.match(/^W(#\d)?$/) ||
     obj.name.match(/^Pr(#\d)?$/)
    ) {
     line.strokeWidth = +opts.nmb.crossStroke * PT_TO_MM * 2.5;
    } else {
     line.strokeWidth = +opts.nmb.crossStroke * PT_TO_MM;
    }

    var cmykArr = obj.cmyk.split(',');

    if (obj.name.match(/^L(#\d)?$/) || obj.name.match(/^Pr(#\d)?$/)) {
     line.strokeColor = getColor(obj.name, cmykArr, 0);
    } else {
     line.strokeColor = getColor(obj.name, cmykArr, 100);
    }

    line.setEntirePath([
     [0, 0],
     [0, +opts.nmb.crossWidth * PT_TO_MM]
    ]);

    var lineClon = line.duplicate();
    lineClon.rotate(90, true, undefined, undefined, undefined, Transformation.CENTER);
    lineGr.name = 'cross_' + obj.name;

    if (obj.name.match(/^W$/)) {
     lineGr.move(crossBg, ElementPlacement.PLACEBEFORE);
     continue;
    } else if (obj.name.match(/^W(#\d)$/) || obj.name.match(/^L(#\d)?$/) || obj.name.match(/^Pr(#\d)?$/)) {
     lineGr.move(crossBg, ElementPlacement.PLACEBEFORE);
     if (scale_fact_ground > 0) {
      lineGr.resize(scale_fact_ground, scale_fact_ground, true, false, false, false, undefined, Transformation.CENTER);
     }
     scale_count_ground++;
     scale_fact_ground -= 15;
     continue;
    } else if (obj.name == 'C' || obj.name == 'M' || obj.name == 'Y' || obj.name == 'K') {
     // scale_count_main = 3;
     continue;
    } else {
     if (scale_count_main > 2) {
      lineGr.resize(scale_fact_main, scale_fact_main, true, false, false, false, undefined, Transformation.CENTER);
      scale_fact_main -= 10;
     }
     scale_count_main++;
    }

   }

   crossGr.position = [
    (-opts.nmb.railWidth - opts.nmb.indentIn + (+opts.nmb.railWidth - opts.nmb.crossWidth) / 2) * PT_TO_MM,
    -(+opts.sel.z - DISTORS - opts.nmb.crossWidth) / 2 * PT_TO_MM
   ];

   var crossGrTop = crossGr.duplicate(),
    crossGrBottom = crossGr.duplicate();
   crossGrTop.translate(0, (-opts.nmb.crossWidth * 1.5 + +opts.sel.z / 2) * PT_TO_MM);
   crossGrBottom.translate(0, (opts.nmb.crossWidth * 1.5 - +opts.sel.z / 2) * PT_TO_MM);

  }

  function __addDotsGr(opts, dotsGr) {
   // alert(typeof opts.chk['dots']);
   if (!opts.chk['dots']) return;
   var DOT_DIAMETER = .3;

   try {
    var streamsNumb = +opts.nmb.streams;
    var layoutWidth = +opts.nmb.layoutWidth;
    var indentIn = +opts.nmb.indentIn;
    var railWidth = +opts.nmb.railWidth;
    var z = +opts.sel.z;

    var dotNextPositionX = 0;

    var dot = dotsGr.pathItems.ellipse(0, 0, DOT_DIAMETER * PT_TO_MM, DOT_DIAMETER * PT_TO_MM);
    dot.fillColor = getRegistration();
    dot.stroked = false;
    dot.overprintFill = true;

    dot.position = [
     (railWidth + indentIn / 2 - DOT_DIAMETER / 2) * PT_TO_MM,
     -(z - DISTORS - DOT_DIAMETER) / 2 * PT_TO_MM
    ]

    for (var i = 0; i < streamsNumb; i++) {
     var dotNext = dot.duplicate();
     if (streamsNumb == 1) {
      dotNext.translate((layoutWidth + indentIn) * PT_TO_MM, 0);
      break;
     }
     if (i == 0) {
      dotNext.translate((layoutWidth + indentIn / 2) * PT_TO_MM, 0);
      dotNextPositionX += layoutWidth + indentIn / 2;
      continue;
     }
     if (i == streamsNumb - 1) {
      dotNext.translate((layoutWidth + dotNextPositionX + indentIn / 2) * PT_TO_MM, 0);
      continue;
     }
     dotNext.translate((layoutWidth + dotNextPositionX) * PT_TO_MM, 0);
     dotNextPositionX += layoutWidth;
    }

   } catch (e) {
    alert('__addDotsGr\n' + e.line + ' ' + e.message);
   }
  }

  /**
   * Светофоры
   * */

  function __addTrafficLightsGr(opts, trafficLightsGr) {
   if (opts.nmb.railWidth < 3.5) return;

   var arr = opts.col;
   var BASE_W = +opts.nmb.railWidth * PT_TO_MM;
   var lightShift = BASE_W * 3;

   var LIGHT_BG_D = 3.5 * PT_TO_MM,
    LIGHT_STROKE_D = 2.5 * PT_TO_MM,
    LIGHT_D = 1.5 * PT_TO_MM;

   var wPlate = false;

   try {
    for (var i = 0; i < arr.length; i++) {
     if (arr[i].name.match(/^W(#\d)?$/)) wPlate = true;
    }
   } catch (e) {
    alert('Error in first circle\nline ' + e.line + '. ' + e.message);
   }

   try {
    for (var i = 0; i < arr.length; i++) {
     var obj = arr[i];

     if (obj.name.match(/^L(#\d)?$/) || obj.name.match(/^Pr(#\d)?$/)) continue;

     var cmykArr = obj.cmyk.split(',');

     var lightGr = trafficLightsGr.groupItems.add();

     var lightBg = lightGr.pathItems.ellipse(
      -lightShift, (BASE_W - LIGHT_BG_D) / 2, LIGHT_BG_D, LIGHT_BG_D
     );
     var lightStroke = lightGr.pathItems.ellipse(
      -lightShift - (LIGHT_BG_D - LIGHT_STROKE_D) / 2, (BASE_W - LIGHT_STROKE_D) / 2, LIGHT_STROKE_D, LIGHT_STROKE_D
     );
     var light = lightGr.pathItems.ellipse(
      -lightShift - (LIGHT_BG_D - LIGHT_D) / 2, (BASE_W - LIGHT_D) / 2, LIGHT_D, LIGHT_D
     );

     lightShift += LIGHT_BG_D;

     lightStroke.filled = false;
     light.stroked = false;
     lightBg.stroked = false;
     light.filled = true;

     light.fillOverprint = true;
     lightStroke.strokeOverprint = true;

     light.fillColor = getColor(obj.name, cmykArr, 100);
     lightStroke.strokeColor = getRegistration();
     // lightBg.fillColor = getColor(obj.name, cmykArr, 100);
     lightBg.fillColor = getColor('white');

     lightStroke.strokeWidth = opts.nmb.crossStroke * PT_TO_MM;

     if (wPlate) lightBg.fillColor = makeSpot('W');

     // пост обработка - убираем заливку подложки с элемента 'W'
     if (obj.name.match(/^W(#\d)?$/)) lightBg.fillColor = getColor('white');

    }
   } catch (e) {
    alert('Error in second circle\n' + e.line + '. ' + e.message);
   }

   trafficLightsGr.translate(
    activeDocument.width - opts.nmb.railWidth * PT_TO_MM, 0
   );
   var trafficLightsGrBottom = trafficLightsGr.duplicate();
   trafficLightsGrBottom.translate(
    0, -opts.sel.z * PT_TO_MM + trafficLightsGrBottom.height + BASE_W * 6);

  }

  /**
   * Квадратики
   * */
  function __addSquardsGr(opts, squardsGr) {

   if (opts.nmb.railWidth < 5) return;

   var colors = opts.col;
   var SQRD_W = 5 * PT_TO_MM;
   var SAMPLE_SQRDS = opts.chk.one_color_squards;
   var shift = 0;
   var squardsBg;
   var colStepsArr;

   for (var i = 0; i < colors.length; i++) {
    if (colors[i].name.match(/^L(#\d)?$/) || colors[i].name.match(/^Pr(#\d)?$/) || colors[i].name.match(/^W(#\d)?$/)) continue;

    var sqrdSteps = +opts.nmb['shift_' + (i + 1)];
    if (sqrdSteps == 5) {
     colStepsArr = [100, 75, 50, 25, 2];
    } else if (sqrdSteps == 4) {
     colStepsArr = [100, 70, 35, 2];
    } else if (sqrdSteps == 3) {
     colStepsArr = [100, 50, 2];
    } else if (sqrdSteps == 2) {
     colStepsArr = [100, 2];
    } else if (sqrdSteps == 1) {
     colStepsArr = [100];
    } else throw new Error('Неверное количество патчей.');

    for (var j = 0; j < sqrdSteps; j++) {

     var sqrd = squardsGr.pathItems.rectangle(shift, 0, SQRD_W, SQRD_W);
     sqrd.fillColor = getColor(colors[i].name, colors[i].cmyk.split(','), colStepsArr[j]);
     sqrd.stroked = false;
     sqrd.fillOverprint = true;
     shift -= SQRD_W;
    }
   }

   for (var i = 0; i < colors.length; i++) {

    if (colors[i].name.match(/^W(#\d)?$/)) {
     shift -= SQRD_W;
     squardsBg = squardsGr.pathItems.rectangle(0, 0, SQRD_W, -shift);
     squardsBg.stroked = false;
     squardsBg.fillColor = getColor("W");
     break;
    } else if (i >= colors.length - 1) {
     squardsBg = squardsGr.pathItems.rectangle(0, 0, SQRD_W, -shift);
     squardsBg.stroked = false;
     squardsBg.fillColor = getColor("white");
    }

   }
   squardsBg.move(squardsGr, ElementPlacement.PLACEATEND);

   squardsGr.translate(
    activeDocument.width - opts.nmb.railWidth * PT_TO_MM,
    -opts.sel.z * PT_TO_MM / 2 - opts.nmb.crossWidth * 1.5 * PT_TO_MM
   )

  }

  /**
   * Мира
   * */
  function __addMiraGr(opts, miraGr) {

   if (opts.nmb.railWidth < 5) return;

   var colors = opts.col;
   var MIRA_D = 5 * PT_TO_MM;
   var shift = 0;
   var elBg = getColor("white");

   for (var i = 0; i < colors.length; i++) {
    if (colors[i].name.match(/^W(#\d)?$/)) {
     elBg = getColor("W");
     break;
    }
   }

   for (var i = 0; i < colors.length; i++) {

    if (colors[i].name.match(/^L(#\d)?$/) || colors[i].name.match(/^Pr(#\d)?$/)) continue;

    var elGr;

    if (colors[i].name.match(/^W(#\d)?$/)) {
     elGr = __makeMira(miraGr, getColor(colors[i].name, colors[i].cmyk.split(','), 100), getColor('white'), shift);
    } else {
     elGr = __makeMira(miraGr, getColor(colors[i].name, colors[i].cmyk.split(','), 100), elBg, shift);
    }

    shift -= MIRA_D;
   }

   miraGr.translate(
    activeDocument.width - opts.nmb.railWidth * PT_TO_MM,
    -opts.nmb.crossWidth * 4 * PT_TO_MM + shift / 5 * 3.5
   );

   function __makeMira(miraGr, color, bgColor, shift) {

    if (!color) {
     var color = new CMYKColor();
     color.cyan = 100;
    } else {
     var color = color;
    }

    if (!bgColor) {
     var bgColor = new CMYKColor();
     bgColor.magenta = 10;
    } else {
     var bgColor = bgColor;
    }

    var miraEl = miraGr.groupItems.add();
    miraEl.name = '__mira_element__';

    var elBg = miraEl.pathItems.ellipse(shift, 0, 7.0866 * 2, 7.0866 * 2);
    elBg.stroked = false;
    elBg.fillColor = bgColor;

    var el = miraEl.pathItems.add();

    el.setEntirePath([
     [6.8882, shift - 0],
     [7.285, shift - 0],
     [7.0866, shift - 7.0866]
    ]);

    el.closed = true;
    el.fillColor = color;
    el.stroked = false;
    el.fillOverprint = true;

    var el_1 = el.duplicate();
    el_1.rotate(-10, true, true, true, true, Transformation.BOTTOM);

    for (var i = 0; i < 8; i++) {
     el_1 = el_1.duplicate();
     el_1.rotate(-10, true, true, true, true, Transformation.BOTTOMLEFT);
    }

    var el_2 = el_1.duplicate();
    el_2.rotate(-10, true, true, true, true, Transformation.LEFT);

    for (var i = 0; i < 8; i++) {
     el_2 = el_2.duplicate();
     el_2.rotate(-10, true, true, true, true, Transformation.TOPLEFT);
    }

    var el_3 = el_2.duplicate();
    el_3.rotate(-10, true, true, true, true, Transformation.TOP);

    for (var i = 0; i < 8; i++) {
     el_3 = el_3.duplicate();
     el_3.rotate(-10, true, true, true, true, Transformation.TOPRIGHT);
    }

    var el_4 = el_3.duplicate();
    el_4.rotate(-10, true, true, true, true, Transformation.RIGHT);

    for (var i = 0; i < 7; i++) {
     el_4 = el_4.duplicate();
     el_4.rotate(-10, true, true, true, true, Transformation.BOTTOMRIGHT);
    }

    return miraEl;
   }

  }

  /**
   * get available bold-fonts from base bold-fonts array
   *
   * @return {Array} fonts - available bold fonts
   */
  function __getFonts() {
   var fonts = [],
    fontsCommon = [
     'MyriadPro-BoldCond', 'MyriadPro-Black', 'MyriadPro-Bold', 'Monaco-Bold',
     'Arial-Bold', 'Arial-BoldMT', 'Arial-Black',
     'ComicSansMS-Bold', 'Calibri-Bold', 'CourierNewPS-BoldMT', 'Courier-Bold',
     'Charcoal',
     'DejaVuSans-Bold',
     'Geneva-Bold', 'Impact',
     'Nimbus-Sans-Bold', 'NimbusMonoL-Bold',
     'TrebuchetMS-Bold', 'Tahoma-Bold',
     'Verdana-Bold'
    ];

   // записать шрифты с поддержкой всех символов логических операций в массив
   for (var i = 0; i < fontsCommon.length; i++) {
    try {
     fonts.push((textFonts.getByName(fontsCommon[i]).name));
    } catch (e) {
    }
   }
   return fonts;
  }

  function __getFrameSize(frame) { // top, left, width, height
   return [frame.position[1], frame.position[0], frame.width, frame.height];
  }
 }

 function _addLakAndPrimer(opts) {
  var doc = activeDocument;
  var colArr = opts.col;
  var sw = 0;
  var lay, wLay, vr, pr;
  var plateX = 0, plateY = 0;

  /*  try {
     outLay = doc.layers.getByName(outLayName);
     lay = outLay.layers.getByName(testLayName);
     // alert(testLayName);
    } catch (e) {
    }

    if (!outLay) lay = doc.layers.getByName(testLayName);*/

  // alert(opts.chk.white_layer);

  for (var i = 0; i < colArr.length; i++) {
   var obj = colArr[i];
   // if (obj.name != 'L' && obj.name != 'Pr') continue;
   if (obj.name == 'L') sw += 1;
   if (obj.name == 'Pr') sw += 2;
   if (obj.name == 'W' && opts.chk.white_layer) sw += 4;
  }

  switch (sw) {
   case 1:
    lay = addLayer({rgb: [128, 0, 128], doc: doc, title: lakLayName, parentLayName: outLayName});
    ___addVr();
    break;
   case 2:
    lay = addLayer({rgb: [128, 0, 128], doc: doc, title: primerLayName, parentLayName: outLayName});
    ___addPr();
    break;
   case 3:
    lay = addLayer({rgb: [128, 0, 128], doc: doc, title: lakPrimerLayName, parentLayName: outLayName});
    ___addVr();
    ___addPr();
    break;
   case 4:
    wLay = addLayer({rgb: [128, 0, 128], doc: doc, title: whiteLayName, parentLayName: outLayName});
    ___moveWhiteLay();
    break;
   case 5:
    wLay = addLayer({rgb: [128, 0, 128], doc: doc, title: whiteLayName, parentLayName: outLayName});
    lay = addLayer({rgb: [128, 0, 128], doc: doc, title: lakLayName, parentLayName: outLayName});
    ___addVr();
    ___moveWhiteLay();
    break;
   case 6:
    wLay = addLayer({rgb: [128, 0, 128], doc: doc, title: whiteLayName, parentLayName: outLayName});
    lay = addLayer({rgb: [128, 0, 128], doc: doc, title: primerLayName, parentLayName: outLayName});
    ___addPr();
    ___moveWhiteLay();
    break;
   case 7:
    wLay = addLayer({rgb: [128, 0, 128], doc: doc, title: whiteLayName, parentLayName: outLayName});
    lay = addLayer({rgb: [128, 0, 128], doc: doc, title: lakPrimerLayName, parentLayName: outLayName});
    ___addVr();
    ___addPr();
    ___moveWhiteLay();
    break;
   default:
    break;
  }

  /*   function ___addVr() {
      vr = lay.pathItems.rectangle(
       plateY,
       (plateX - opts.nmb.indentIn) * PT_TO_MM,
       (+opts.nmb.layoutWidth * +opts.nmb.streams + +opts.nmb.indentIn * 2) * PT_TO_MM,
       (+opts.sel.z - DISTORS) * PT_TO_MM
      );
      vr.stroked = false;
      vr.fillColor = getColor('L', getCMYK(opts, 'L'), 100);
      vr.fillOverprint = true;
     }*/

  function ___addVr() {
   vr = lay.pathItems.rectangle(
    plateY,
    (plateX - opts.nmb.railWidth - opts.nmb.indentIn) * PT_TO_MM,
    (+opts.nmb.layoutWidth * +opts.nmb.streams + +opts.nmb.railWidth * 2 + +opts.nmb.indentIn * 2) * PT_TO_MM,
    (+opts.sel.z - DISTORS) * PT_TO_MM
   );
   vr.stroked = false;
   vr.fillColor = getColor('L', getCMYK(opts, 'L'), 100);
   vr.fillOverprint = true;
  }

  function ___addPr() {
   pr = lay.pathItems.rectangle(
    plateY,
    (plateX - opts.nmb.railWidth - opts.nmb.indentIn) * PT_TO_MM,
    (+opts.nmb.layoutWidth * +opts.nmb.streams + +opts.nmb.railWidth * 2 + +opts.nmb.indentIn * 2) * PT_TO_MM,
    (+opts.sel.z - DISTORS) * PT_TO_MM
   );
   pr.stroked = false;
   pr.fillColor = getColor('Pr', getCMYK(opts, 'Pr'), 100);
   pr.fillOverprint = true;
  }

  function ___moveWhiteLay() {
   var outLay = false;
   var testLay;
   try {
    outLay = activeDocument.layers.getByName(outLayName);
    testLay = outLay.layers.getByName(testLayName);
   } catch (e) {
    testLay = activeDocument.layers.getByName(testLayName);
   }
   wLay.move(testLay, ElementPlacement.PLACEAFTER);
  }

 }

 function _delAllUnused() {
  activeDocument.swatchGroups[1].remove();

  var str = '/version 3' +
   '/name [ 12' +
   '	64656c416c6c556e75736564' +
   ']' +
   '/isOpen 0' +
   '/actionCount 1' +
   '/action-1 {' +
   '	/name [ 12' +
   '		64656c416c6c556e75736564' +
   '	]' +
   '	/keyIndex 0' +
   '	/colorIndex 2' +
   '	/isOpen 0' +
   '	/eventCount 8' +
   '	/event-1 {' +
   '		/useRulersIn1stQuadrant 0' +
   '		/internalName (ai_plugin_swatches)' +
   '		/localizedName [ 8' +
   '			5377617463686573' +
   '		]' +
   '		/isOpen 0' +
   '		/isOn 1' +
   '		/hasDialog 0' +
   '		/parameterCount 1' +
   '		/parameter-1 {' +
   '			/key 1835363957' +
   '			/showInPalette -1' +
   '			/type (enumerated)' +
   '			/name [ 17' +
   '				53656c65637420416c6c20556e75736564' +
   '			]' +
   '			/value 11' +
   '		}' +
   '	}' +
   '	/event-2 {' +
   '		/useRulersIn1stQuadrant 0' +
   '		/internalName (ai_plugin_swatches)' +
   '		/localizedName [ 8' +
   '			5377617463686573' +
   '		]' +
   '		/isOpen 0' +
   '		/isOn 1' +
   '		/hasDialog 1' +
   '		/showDialog 0' +
   '		/parameterCount 1' +
   '		/parameter-1 {' +
   '			/key 1835363957' +
   '			/showInPalette -1' +
   '			/type (enumerated)' +
   '			/name [ 13' +
   '				44656c65746520537761746368' +
   '			]' +
   '			/value 3' +
   '		}' +
   '	}' +
   '	/event-3 {' +
   '		/useRulersIn1stQuadrant 0' +
   '		/internalName (ai_plugin_brush)' +
   '		/localizedName [ 5' +
   '			4272757368' +
   '		]' +
   '		/isOpen 0' +
   '		/isOn 1' +
   '		/hasDialog 0' +
   '		/parameterCount 1' +
   '		/parameter-1 {' +
   '			/key 1835363957' +
   '			/showInPalette -1' +
   '			/type (enumerated)' +
   '			/name [ 17' +
   '				53656c65637420416c6c20556e75736564' +
   '			]' +
   '			/value 8' +
   '		}' +
   '	}' +
   '	/event-4 {' +
   '		/useRulersIn1stQuadrant 0' +
   '		/internalName (ai_plugin_brush)' +
   '		/localizedName [ 5' +
   '			4272757368' +
   '		]' +
   '		/isOpen 0' +
   '		/isOn 1' +
   '		/hasDialog 1' +
   '		/showDialog 0' +
   '		/parameterCount 1' +
   '		/parameter-1 {' +
   '			/key 1835363957' +
   '			/showInPalette -1' +
   '			/type (enumerated)' +
   '			/name [ 12' +
   '				44656c657465204272757368' +
   '			]' +
   '			/value 3' +
   '		}' +
   '	}' +
   '	/event-5 {' +
   '		/useRulersIn1stQuadrant 0' +
   '		/internalName (ai_plugin_styles)' +
   '		/localizedName [ 14' +
   '			47726170686963205374796c6573' +
   '		]' +
   '		/isOpen 0' +
   '		/isOn 1' +
   '		/hasDialog 0' +
   '		/parameterCount 1' +
   '		/parameter-1 {' +
   '			/key 1835363957' +
   '			/showInPalette -1' +
   '			/type (enumerated)' +
   '			/name [ 17' +
   '				53656c65637420416c6c20556e75736564' +
   '			]' +
   '			/value 14' +
   '		}' +
   '	}' +
   '	/event-6 {' +
   '		/useRulersIn1stQuadrant 0' +
   '		/internalName (ai_plugin_styles)' +
   '		/localizedName [ 14' +
   '			47726170686963205374796c6573' +
   '		]' +
   '		/isOpen 0' +
   '		/isOn 1' +
   '		/hasDialog 1' +
   '		/showDialog 0' +
   '		/parameterCount 1' +
   '		/parameter-1 {' +
   '			/key 1835363957' +
   '			/showInPalette -1' +
   '			/type (enumerated)' +
   '			/name [ 20' +
   '				44656c6574652047726170686963205374796c65' +
   '			]' +
   '			/value 3' +
   '		}' +
   '	}' +
   '	/event-7 {' +
   '		/useRulersIn1stQuadrant 0' +
   '		/internalName (ai_plugin_symbol_palette)' +
   '		/localizedName [ 7' +
   '			53796d626f6c73' +
   '		]' +
   '		/isOpen 0' +
   '		/isOn 1' +
   '		/hasDialog 0' +
   '		/parameterCount 1' +
   '		/parameter-1 {' +
   '			/key 1835363957' +
   '			/showInPalette -1' +
   '			/type (enumerated)' +
   '			/name [ 17' +
   '				53656c65637420416c6c20556e75736564' +
   '			]' +
   '			/value 12' +
   '		}' +
   '	}' +
   '	/event-8 {' +
   '		/useRulersIn1stQuadrant 0' +
   '		/internalName (ai_plugin_symbol_palette)' +
   '		/localizedName [ 7' +
   '			53796d626f6c73' +
   '		]' +
   '		/isOpen 0' +
   '		/isOn 1' +
   '		/hasDialog 1' +
   '		/showDialog 0' +
   '		/parameterCount 1' +
   '		/parameter-1 {' +
   '			/key 1835363957' +
   '			/showInPalette -1' +
   '			/type (enumerated)' +
   '			/name [ 13' +
   '				44656c6574652053796d626f6c' +
   '			]' +
   '			/value 5' +
   '		}' +
   '	}' +
   '}';
  runAction('delAllUnused', 'delAllUnused', str);
 }

 /**
  * COMMON LIB
  * */
 /**
  * Возвращает массив групп активного документа
  * @param {String} name имя группы
  * @param {Number} max длинна массива
  * @return {Array} массив всех найденных групп активного документа с именем name
  * */
 function getAllGroupsByName(name, max) {
  var d = activeDocument;
  var groups = d.groupItems;
  var arr = [];
  for (var i = 0, j = 0; i < groups.length, j < max; i++) {
   var gr = groups[i];
   if (gr.name != name) continue;
   arr.push(gr);
   j++;
  }
  return arr;
 }

 function setPantAlias(pantName) {

  var aliases = {
   'Process Yellow': 'PrY',
   'Process Magenta': 'PrM',
   'Process Cyan': 'PrC',
   'Process Black': 'K2',
   'Yellow 012': '012',
   'Orange 021': '021',
   'Warm Red': 'WR',
   'Red 032': '032',
   'Rubine Red': 'Rub',
   'Rhodamine Red': 'Rh',
   'Purple': 'Pu',
   'Violet': 'V',
   'Blue 072': '072',
   'Reflex Blue': 'Ref',
   'Process Blue': 'PrBlu',
   'Green': 'Gr',
   'Black': 'K2',
   'Black 2': 'B2',
   'Black 3': 'B3',
   'Black 4': 'B4',
   'Black 5': 'B5',
   'Black 6': 'B6',
   'Black 7': 'B7',
   'Warm Gray 1': 'WG1',
   'Warm Gray 2': 'WG2',
   'Warm Gray 3': 'WG3',
   'Warm Gray 4': 'WG4',
   'Warm Gray 5': 'WG5',
   'Warm Gray 6': 'WG6',
   'Warm Gray 7': 'WG7',
   'Warm Gray 8': 'WG8',
   'Warm Gray 9': 'WG9',
   'Warm Gray 10': 'WG10',
   'Warm Gray 11': 'WG11',
   'Cool Gray 1': 'CG1',
   'Cool Gray 2': 'CG2',
   'Cool Gray 3': 'CG3',
   'Cool Gray 4': 'CG4',
   'Cool Gray 5': 'CG5',
   'Cool Gray 6': 'CG6',
   'Cool Gray 7': 'CG7',
   'Cool Gray 8': 'CG8',
   'Cool Gray 9': 'CG9',
   'Cool Gray 10': 'CG10',
   'Cool Gray 11': 'CG11'
  };

  for (var key in aliases) {
   if (pantName == key) return aliases[key];

   /* if (pantName.match(key)) {
     return aliases[key] + pantName.slice(-2);
    }*/
  }
  return pantName;
 }

 /*
  function setPantAlias (pantName) {
  var aliases = {
  "Process Yellow":  "PrY",
  "Process Magenta": "PrM",
  "Process Cyan":    "PrC",
  "Process Black":   "PrK",
  "Yellow 012":      "012",
  "Orange 021":      "021",
  "Warm Red":        "WR",
  "Red 032":         "032",
  "Rubine Red":      "Rub",
  "Rhodamine Red":   "Rhod",
  "Purple":          "Purp",
  "Violet":          "Viol",
  "Blue 072":        "072",
  "Reflex Blue":     "Refl",
  "Process Blue":    "PrBlue",
  "Green":           "Gr",
  "Black":           "Black",
  "Black 2":         "Black2",
  "Black 3":         "Black3",
  "Black 4":         "Black4",
  "Black 5":         "Black5",
  "Black 6":         "Black6",
  "Black 7":         "Black7",
  "Warm Gray 1":     "WG1",
  "Warm Gray 2":     "WG2",
  "Warm Gray 3":     "WG3",
  "Warm Gray 4":     "WG4",
  "Warm Gray 5":     "WG5",
  "Warm Gray 6":     "WG6",
  "Warm Gray 7":     "WG7",
  "Warm Gray 8":     "WG8",
  "Warm Gray 9":     "WG9",
  "Warm Gray 10":    "WG10",
  "Warm Gray 11":    "WG11",
  "Cool Gray 1":     "CG1",
  "Cool Gray 2":     "CG2",
  "Cool Gray 3":     "CG3",
  "Cool Gray 4":     "CG4",
  "Cool Gray 5":     "CG5",
  "Cool Gray 6":     "CG6",
  "Cool Gray 7":     "CG7",
  "Cool Gray 8":     "CG8",
  "Cool Gray 9":     "CG9",
  "Cool Gray 10":    "CG10",
  "Cool Gray 11":    "CG11"
  }

  for (var key in aliases) {
  if (pantName == key) {
  return aliases[key];
  }
  }
  return pantName;
  }
  */

 function getColor(colorName, cmyk, tint) {
  colorName = colorName || 'Ze_Test';
  cmyk = cmyk || [11, 11, 11, 11];
  // if (tint !== 0) tint = tint || 100;

  var col;

  switch (colorName) {
   case 'C':
    col = makeCMYK(cmyk);
    if (tint) col.cyan = tint;
    break;
   case 'M':
    col = makeCMYK(cmyk);
    if (tint) col.magenta = tint;
    break;
   case 'Y':
    col = makeCMYK(cmyk);
    if (tint) col.yellow = tint;
    break;
   case 'K':
    col = makeCMYK(cmyk);
    if (tint) col.black = tint;
    break;
   case 'white':
    col = makeCMYK([0, 0, 0, 0]);
    break;
   default:
    col = makeSpot(colorName, cmyk, tint);
    break;
  }
  return col;
 }

 function makeSpot(name, cmyk, tint) {
  if (+tint === 0) {
   tint = 0;
  } else {
   tint = +tint || 100;
  }

  name = name || 'Ze_Test';
  cmyk = cmyk || [11, 11, 11, 11];

  var newSpot, newColor, newSpotColor;

  if (name != 'L' && name != 'W' && name != 'Pr' && name != 'film' && name != 'W 2' && name != 'MatLak') {
   name = 'PANTONE ' + name + ' C';
  }

  try {
   newSpotColor = activeDocument.swatches.getByName(name);
   newSpotColor.color.tint = tint;
   return newSpotColor.color;
  } catch (e) {
   newSpot = activeDocument.spots.add();
   newColor = new CMYKColor();
   newSpotColor = new SpotColor();

   newColor.cyan = cmyk[0];
   newColor.magenta = cmyk[1];
   newColor.yellow = cmyk[2];
   newColor.black = cmyk[3];

   newSpot.name = name;
   newSpot.colorType = ColorModel.SPOT;
   newSpot.color = newColor;

   newSpotColor.spot = newSpot;
   newSpotColor.tint = tint;

   return newSpotColor;
  }
 }

 function makeCMYK(cmyk) {
  var col = new CMYKColor();
  col.cyan = cmyk[0];
  col.magenta = cmyk[1];
  col.yellow = cmyk[2];
  col.black = cmyk[3];
  return col;
 }

 function getRegistration() {
  var tint = 100,
   name = '[Registration]';

  var newSpot, newColor, newSpotColor;

  try {
   newSpotColor = activeDocument.swatches.getByName('[Registration]');
   return newSpotColor.color;
  } catch (e) {
   newSpot = activeDocument.spots.add();
   newColor = new CMYKColor();
   newSpotColor = new SpotColor();

   newSpot.name = name;
   newSpot.colorType = ColorModel.REGISTRATION;
   newSpot.color = newColor;

   newSpotColor.spot = newSpot;

   return newSpotColor;
  }
 }

 function getLayByName(name) {
  if (!documents.length) return;
  var lay;
  try {
   lay = activeDocument.layers.getByName(name);
  } catch (e) {
   lay = activeDocument.activeLayer;
  }
  return lay;
 }

 function addLayer(o/*{o.rgb, o.doc, o.title, o.parentLayName}*/) {
  var rgb = o.rgb || [128, 255, 128];
  var doc = o.doc || activeDocument;
  var title = o.title || '__test-lay__';
  var lay, parentLay = false;
  var parentLayName = o.parentLayName;
  /* try {
    lay = doc.layers.getByName(title);
    if (doc.layers.length > 1) lay.remove();
   } catch (e) {
   }*/

  var col = new RGBColor();

  try {
   parentLay = doc.layers.getByName(parentLayName);
   lay = parentLay.layers.add();
  } catch (e) {
   lay = doc.layers.add();
  }

  col.red = rgb[0];
  col.green = rgb[1];
  col.blue = rgb[2];

  lay.name = title;
  lay.color = col;

  return lay;
 }

 function rmWhitePrLakLays(layNamesArr, parentLayName) {
  var lay, layName, parentLay = false;
  var doc = activeDocument;

  try {
   parentLay = doc.layers.getByName(parentLayName);
  } catch (e) {
  }

  for (var i = 0; i < layNamesArr.length; i++) {
   layName = layNamesArr[i];
   try {
    if (parentLay) {
     lay = parentLay.layers.getByName(layName);
    } else {
     lay = doc.layers.getByName(layName);
    }
    if (parentLay) {
     lay.remove();
     continue;
    }
    if (doc.layers.length > 1) lay.remove();
   } catch (e) {
   }
  }
 }

 function getXmlStr() {

  if (!documents.length) {
   var errNoDocs = new Error('Нет активных документов!');
   alert(errNoDocs);
   return errNoDocs;
  }

  var a = ('' + activeDocument.fullName).slice(0, -3);
  var x = new File(a + '.xml');

  if (!x.exists) {
   var errNoXml = new Error('Не найден xml-файл!');
   alert(errNoXml);
   return errNoXml;
  }

  var s = '';
  x.open('r');
  s = x.read();
  x.close();

  return s;
 }

 function runAction(actName, setName, actStr) {
  var f = new File('~/ScriptAction.aia');
  f.open('w');
  f.write(actStr);
  f.close();
  app.loadAction(f);
  f.remove();
  app.doScript(actName, setName, false); // action name, set name
  app.unloadAction(setName, ''); // set name
 }

 /**
  * calculate top, bottom spasing and the real height of the capital character F
  *
  * @param {TextFrameItem} frame - object of the TextFrameItem class
  * @return {Object} fontMeasures - result object {chr, top, bot, toString()}
  */
 function calcCharSize(frame) {
  var txt2meas = activeDocument.activeLayer.textFrames.add(),
   fullH,
   fontMeasures = {};

  txt2meas.contents = 'C';

  txt2meas.textRange.characterAttributes.textFont = frame.textRange.characterAttributes.textFont;
  txt2meas.textRange.characterAttributes.size = frame.textRange.characterAttributes.size;

  var txt2meas_curv = (txt2meas.duplicate()).createOutline();

  fullH = txt2meas.height;
  fontMeasures.h = txt2meas_curv.height;
  fontMeasures.top = Math.abs(txt2meas.position[1] - txt2meas_curv.position[1]);
  fontMeasures.bot = (fullH - fontMeasures.h - fontMeasures.top);

  txt2meas.remove();
  txt2meas_curv.remove();

  return fontMeasures;
 }

 function formatDate2(date) {
  var d = date;
  // форматировать дату, с учетом того, что месяцы начинаются с 0
  d = [
   '0' + d.getDate(),
   '0' + (d.getMonth() + 1),
   '' + d.getFullYear(),
   '0' + d.getHours(),
   '0' + d.getMinutes()
  ];
  for (var i = 0; i < d.length; i++) {
   d[i] = d[i].slice(-2);
  }
  return d.slice(0, 3).join('.') /*+ ' ' + d.slice(3).join(':')*/;
 }

 function getCMYK(opts, name) {
  var arr = opts.col;
  for (var i = 0; i < arr.length; i++) {
   var obj = arr[i];
   if (obj.name == name) {
    return obj.cmyk.split(',');
   }
  }
 }
}
