/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function main() {
 'use strict';

 const csInterface = new CSInterface();

 init();

 function init() {

  themeManager.init();
  loadJSX('json2.js');

  $('#btnReset').click(reloadPanel);

  document.getElementById('btnKillCEP').addEventListener('click', () => {
   let apiVersion = csInterface.getCurrentApiVersion();
   if (apiVersion.major > 6) {
    csInterface.requestOpenExtension('ai_layout_dialog');
    csInterface.closeExtension();
   } else {
    csInterface.closeExtension();
   }
  });

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
   setChkHandler();
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
   setChk(defChk());
   setColorsFromXml();

   $('#btnFactoryDefaults').click(function () {
    var conf = confirm('Are you sure that want to return to the factory defaults?');
    if (conf) {
     localStorage.clear();
     setTxt(defTxt());
     setSel(defSel());
     setNmb(defNmb());
     setCol(defCol());
     setChk(defChk());
    }
   });
   $('#btnSaveToProfile').click(function () {
    // alert(showObjDeep(getCol()));
    alert(sorryMessage);
   });
   $('#btnOk').click(function () {
    var opts = {};
    opts.txt = getTxt();
    opts.sel = getSel();
    opts.nmb = getNmb();
    opts.col = getCol();
    opts.chk = getChk();

    csInterface.evalScript('makeLayout(' + JSON.stringify(opts) + ')', function (result) {
     // alert (result);
    });
   });
   $('#btnSave').click(function () {
    var opts = {};
    opts.txt = getTxt();
    opts.sel = getSel();
    opts.nmb = getNmb();
    opts.col = getCol();
    opts.chk = getChk();
    // show all
    localStorage.setItem('opts', JSON.stringify(opts));
    // var storeOpts = JSON.parse (localStorage.getItem ('opts'));
    // csInterface.evalScript ('scrollWin(' + JSON.stringify (showObjDeep (storeOpts)) + ')');
   });
   $('#btnLoadFromProfile').click(function () {
    alert(sorryMessage);
   });
   $('#btn_github').click(function () {
    try {
     window.cep.util.openURLInDefaultBrowser('https://github.com/dumbm1/ai_layout');
    } catch (e) {
     alert('See more on "https://github.com/dumbm1/ai_layout"');
    }
   });
   $('#btnSettings').click(function () {
    alert(sorryMessage);
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

   function defChk() {
    return {
     margChkHorLink: false,
     margChkVertLink: false,
     crossChkLink: false,
     indentChkLink: false
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

   function setChk(obj) {
    $(':checkbox').each(function () {
     for (var key in obj) {
      if (key == $(this).attr('id')) {
       if (!obj[key]) {
        $(this).removeAttr('checked');
        $(this).parent().removeClass('btn-link-checked');
        $(this).parent().parent().removeClass('btn-link-div-checked');
       } else {
        $(this).attr('checked', 'checked');
        $(this).parent().addClass('btn-link-checked');
        $(this).parent().parent().addClass('btn-link-div-checked');
       }
      }
     }
    });
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
     260, 265, 270, 275, 280, 285, 290,
     300, 305, 310, 315, 320, 330, 335, 340, 350, 355, 360, 365, 370, 380, 390,
     400, 410, 420, 430, 440, 450, 460, 480, 495,
     500, 510, 520, 540, 560, 580,
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

    searchFld.addEventListener('input', function () {
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
    });
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
     ' Warm Red': '0,83,80,0',
     ' Yellow': '0,1,100,0',
     ' Yellow 012': '0,13,100,0',
     ' Black': '63,62,59,94',
     ' Blue 072': '100,95,0,3',
     ' Green': '93,0,63,0',
     ' Orange 021': '0,65,100,0',
     ' Process Blue': '100,13,1,2',
     ' Purple': '40,90,0,0',
     ' Red 032': '0,86,63,0',
     ' Reflex Blue': '100,89,0,0',
     ' Rhodamine Red': '9,87,0,0',
     ' Rubine Red': '0,100,22,3',
     ' Violet': '90,99,0,0',

     ' 100': '0,0,56,0',
     ' 101': '0,0,68,0',
     ' 102': '0,0,95,0',
     ' 103': '5,5,100,16',
     ' 104': '7,13,100,28',
     ' 105': '13,18,88,45',
     ' 106': '0,0,75,0',
     ' 107': '0,0,92,0',
     ' 108': '0,5,98,0',
     ' 109': '0,9,100,0',
     ' 110': '2,22,100,8',
     ' 111': '8,21,100,28',
     ' 112': '10,20,100,40',
     ' 113': '0,2,83,0',
     ' 114': '0,4,87,0',
     ' 115': '0,6,87,0',
     ' 116': '0,14,100,0',
     ' 117': '6,27,100,12',
     ' 118': '7,28,100,30',
     ' 119': '17,22,100,47',
     ' 120': '0,5,64,0',
     ' 121': '0,8,70,0',
     ' 122': '0,11,80,0',
     ' 123': '0,19,89,0',
     ' 124': '0,30,100,0',
     ' 125': '6,32,100,24',
     ' 126': '11,31,100,36',
     ' 127': '0,4,62,0',
     ' 128': '0,7,75,0',
     ' 129': '0,11,78,0',
     ' 130': '0,32,100,0',
     ' 131': '2,39,100,10',
     ' 132': '9,38,100,32',
     ' 133': '19,37,100,59',
     ' 134': '0,12,60,0',
     ' 135': '0,21,76,0',
     ' 136': '0,28,87,0',
     ' 137': '0,41,100,0',
     ' 138': '0,52,100,0',
     ' 139': '7,49,100,25',
     ' 140': '19,49,100,54',
     ' 141': '0,16,65,0',
     ' 142': '0,24,78,0',
     ' 143': '0,32,87,0',
     ' 144': '0,51,100,0',
     ' 145': '4,53,100,8',
     ' 146': '7,50,100,34',
     ' 147': '19,38,90,58',
     ' 148': '0,17,43,0',
     ' 149': '0,24,51,0',
     ' 150': '0,41,78,0',
     ' 151': '0,60,100,0',
     ' 152': '0,66,100,0',
     ' 153': '5,64,100,17',
     ' 154': '8,66,100,41',
     ' 155': '0,12,34,0',
     ' 156': '0,23,49,0',
     ' 157': '0,42,74,0',
     ' 158': '0,62,95,0',
     ' 159': '1,72,100,7',
     ' 160': '6,71,100,31',
     ' 161': '16,67,100,71',
     ' 162': '0,25,35,0',
     ' 163': '0,44,52,0',
     ' 164': '0,59,80,0',
     ' 165': '0,70,100,0',
     ' 166': '0,76,100,0',
     ' 167': '5,77,100,15',
     ' 168': '12,80,100,60',
     ' 169': '0,30,26,0',
     ' 170': '0,48,50,0',
     ' 171': '0,61,72,0',
     ' 172': '0,73,87,0',
     ' 173': '0,82,94,2',
     ' 174': '8,86,100,36',
     ' 175': '18,79,78,56',
     ' 176': '0,35,18,0',
     ' 177': '0,54,38,0',
     ' 178': '0,70,58,0',
     ' 179': '0,87,85,0',
     ' 180': '3,91,86,12',
     ' 181': '21,93,88,50',
     ' 182': '0,31,8,0',
     ' 183': '0,49,17,0',
     ' 184': '0,73,32,0',
     ' 185': '0,93,79,0',
     ' 186': '2,100,85,6',
     ' 187': '7,100,82,26',
     ' 188': '16,100,65,58',
     ' 189': '0,39,10,0',
     ' 190': '0,56,18,0',
     ' 191': '0,79,36,0',
     ' 192': '0,94,64,0',
     ' 193': '2,99,62,11',
     ' 194': '8,100,55,37',
     ' 195': '19,90,50,55',
     ' 196': '0,23,6,0',
     ' 197': '0,46,12,0',
     ' 198': '0,82,37,0',
     ' 199': '0,100,72,0',
     ' 200': '3,100,70,12',
     ' 201': '7,100,68,32',
     ' 202': '9,100,64,48',
     ' 203': '0,37,2,0',
     ' 204': '0,59,5,0',
     ' 205': '0,83,16,0',
     ' 206': '0,100,50,0',
     ' 207': '5,100,48,22',
     ' 208': '15,100,37,45',
     ' 209': '20,97,40,58',
     ' 210': '0,45,4,0',
     ' 211': '0,61,6,0',
     ' 212': '0,78,8,0',
     ' 213': '0,92,18,0',
     ' 214': '0,100,24,4',
     ' 215': '6,100,26,24',
     ' 216': '13,96,26,52',
     ' 217': '1,32,0,0',
     ' 218': '2,63,0,0',
     ' 219': '1,92,4,0',
     ' 220': '5,100,25,24',
     ' 221': '9,100,26,38',
     ' 222': '20,100,22,61',
     ' 223': '1,50,0,0',
     ' 224': '3,70,0,0',
     ' 225': '4,88,0,0',
     ' 226': '0,100,2,0',
     ' 227': '7,100,10,21',
     ' 228': '16,100,14,42',
     ' 229': '26,100,19,61',
     ' 230': '1,41,0,0',
     ' 231': '3,60,0,0',
     ' 232': '6,70,0,0',
     ' 233': '12,100,0,0',
     ' 234': '18,100,6,18',
     ' 235': '20,100,11,41',
     ' 236': '3,37,0,0',
     ' 237': '6,53,0,0',
     ' 238': '12,74,0,0',
     ' 239': '16,82,0,0',
     ' 240': '20,89,0,0',
     ' 241': '30,100,2,2',
     ' 242': '32,100,11,41',
     ' 243': '4,32,0,0',
     ' 244': '9,45,0,0',
     ' 245': '16,56,0,0',
     ' 246': '31,88,0,0',
     ' 247': '35,95,0,0',
     ' 248': '42,100,0,0',
     ' 249': '42,95,10,31',
     ' 250': '7,28,0,0',
     ' 251': '17,43,0,0',
     ' 252': '27,67,0,0',
     ' 253': '42,91,0,0',
     ' 254': '48,96,0,0',
     ' 255': '53,96,10,24',
     ' 256': '9,22,0,0',
     ' 257': '18,36,0,0',
     ' 258': '51,79,0,0',
     ' 259': '67,100,4,5',
     ' 260': '66,100,8,27',
     ' 261': '62,100,9,44',
     ' 262': '58,92,12,54',
     ' 263': '10,17,0,0',
     ' 264': '26,37,0,0',
     ' 265': '52,66,0,0',
     ' 266': '76,90,0,0',
     ' 267': '82,97,0,0',
     ' 268': '82,98,0,12',
     ' 269': '80,98,5,27',
     ' 270': '29,25,0,0',
     ' 271': '49,44,0,0',
     ' 272': '61,56,0,0',
     ' 273': '100,100,0,22',
     ' 274': '100,100,7,38',
     ' 275': '100,100,7,56',
     ' 276': '100,100,10,79',
     ' 277': '35,9,0,0',
     ' 278': '45,14,0,0',
     ' 279': '68,34,0,0',
     ' 280': '100,85,5,22',
     ' 281': '100,85,5,36',
     ' 282': '100,90,13,68',
     ' 283': '42,9,0,0',
     ' 284': '59,17,0,0',
     ' 285': '90,48,0,0',
     ' 286': '100,75,0,0',
     ' 287': '100,75,2,18',
     ' 288': '100,80,6,32',
     ' 289': '100,76,12,70',
     ' 290': '23,0,1,0',
     ' 291': '38,4,0,0',
     ' 292': '59,11,0,0',
     ' 293': '100,69,0,4',
     ' 294': '100,69,7,30',
     ' 295': '100,69,8,54',
     ' 296': '100,73,28,86',
     ' 297': '52,0,1,0',
     ' 298': '67,2,0,0',
     ' 299': '86,8,0,0',
     ' 300': '99,50,0,0',
     ' 301': '100,53,4,19',
     ' 302': '100,48,12,58',
     ' 303': '100,47,22,82',
     ' 304': '34,0,6,0',
     ' 305': '54,0,6,0',
     ' 306': '75,0,5,0',
     ' 307': '100,22,2,18',
     ' 308': '100,18,8,50',
     ' 309': '99,27,22,80',
     ' 310': '48,0,9,0',
     ' 311': '68,0,13,0',
     ' 312': '88,0,11,0',
     ' 313': '100,0,11,2',
     ' 314': '100,5,14,17',
     ' 315': '100,12,21,44',
     ' 316': '97,21,33,73',
     ' 317': '23,0,10,0',
     ' 318': '40,0,14,0',
     ' 319': '59,0,22,0',
     ' 320': '96,0,31,2',
     ' 321': '96,3,35,12',
     ' 322': '97,9,39,34',
     ' 323': '96,16,42,57',
     ' 324': '35,0,14,0',
     ' 325': '53,0,23,0',
     ' 326': '81,0,39,0',
     ' 327': '100,2,60,14',
     ' 328': '100,10,61,38',
     ' 329': '100,14,60,49',
     ' 330': '90,21,60,65',
     ' 331': '27,0,15,0',
     ' 332': '33,0,18,0',
     ' 333': '49,0,28,0',
     ' 334': '99,0,70,0',
     ' 335': '97,6,69,19',
     ' 336': '95,11,70,44',
     ' 337': '39,0,22,0',
     ' 338': '50,0,31,0',
     ' 339': '84,0,59,0',
     ' 340': '99,0,84,0',
     ' 341': '95,5,82,24',
     ' 342': '93,10,75,43',
     ' 343': '89,19,72,60',
     ' 344': '32,0,30,0',
     ' 345': '43,0,41,0',
     ' 346': '53,0,51,0',
     ' 347': '93,0,100,0',
     ' 348': '96,2,100,12',
     ' 349': '90,12,95,40',
     ' 350': '80,21,79,64',
     ' 351': '27,0,23,0',
     ' 3514': '0,20,100,0',
     ' 352': '37,0,31,0',
     ' 353': '41,0,36,0',
     ' 354': '81,0,92,0',
     ' 355': '91,0,100,0',
     ' 356': '91,4,100,25',
     ' 357': '92,18,94,61',
     ' 358': '34,0,42,0',
     ' 359': '40,0,50,0',
     ' 360': '63,0,84,0',
     ' 361': '77,0,100,0',
     ' 362': '78,0,100,2',
     ' 363': '76,3,100,18',
     ' 364': '71,4,100,45',
     ' 365': '24,0,44,0',
     ' 366': '31,0,51,0',
     ' 367': '41,0,68,0',
     ' 368': '65,0,100,0',
     ' 369': '68,0,100,0',
     ' 370': '62,1,100,25',
     ' 371': '50,9,98,61',
     ' 372': '16,0,41,0',
     ' 373': '21,0,48,0',
     ' 374': '30,0,64,0',
     ' 375': '46,0,90,0',
     ' 376': '54,0,100,0',
     ' 377': '50,1,100,20',
     ' 378': '47,11,99,64',
     ' 379': '13,0,61,0',
     ' 380': '18,0,82,0',
     ' 381': '25,0,98,0',
     ' 382': '28,0,100,0',
     ' 383': '29,1,100,18',
     ' 384': '26,4,99,35',
     ' 385': '24,14,94,55',
     ' 386': '9,0,66,0',
     ' 387': '12,0,80,0',
     ' 388': '15,0,80,0',
     ' 389': '21,0,85,0',
     ' 390': '27,0,100,3',
     ' 391': '23,5,100,33',
     ' 392': '24,11,100,48',
     ' 393': '6,0,55,0',
     ' 394': '6,0,72,0',
     ' 395': '9,0,90,0',
     ' 396': '10,0,95,0',
     ' 397': '14,2,100,15',
     ' 398': '14,6,100,24',
     ' 399': '16,9,100,36',
     ' 400': '6,7,13,16',
     ' 401': '10,11,17,27',
     ' 402': '13,16,21,36',
     ' 403': '18,21,27,47',
     ' 404': '20,25,30,59',
     ' 405': '26,31,35,72',
     ' 406': '5,8,10,16',
     ' 407': '9,14,13,28',
     ' 408': '12,19,19,40',
     ' 409': '17,25,22,51',
     ' 410': '22,33,28,60',
     ' 411': '30,42,34,75',
     ' 412': '52,59,45,90',
     ' 413': '9,5,12,14',
     ' 414': '13,8,17,26',
     ' 415': '22,14,23,38',
     ' 416': '28,18,29,51',
     ' 417': '33,23,35,63',
     ' 418': '38,26,40,72',
     ' 419': '86,70,69,95',
     ' 420': '6,4,7,13',
     ' 421': '13,8,11,26',
     ' 422': '19,12,13,34',
     ' 423': '22,14,18,45',
     ' 424': '30,20,19,58',
     ' 425': '48,29,26,76',
     ' 426': '94,77,53,94',
     ' 427': '7,3,5,8',
     ' 428': '10,4,4,14',
     ' 429': '21,11,9,23',
     ' 430': '33,18,13,40',
     ' 431': '45,25,16,59',
     ' 432': '65,43,26,78',
     ' 433': '90,68,41,90',
     ' 434': '5,11,8,12',
     ' 435': '9,16,8,19',
     ' 436': '12,24,9,28',
     ' 437': '21,40,18,56',
     ' 438': '42,56,47,77',
     ' 439': '53,61,47,83',
     ' 440': '63,62,59,88',
     ' 441': '22,4,15,8',
     ' 442': '25,7,19,20',
     ' 443': '33,12,18,30',
     ' 444': '45,16,25,50',
     ' 445': '52,23,30,74',
     ' 446': '54,27,36,82',
     ' 447': '50,30,40,90',
     ' 448': '33,43,80,82',
     ' 449': '31,38,75,76',
     ' 450': '32,39,87,74',
     ' 451': '21,15,54,31',
     ' 452': '16,11,45,25',
     ' 453': '11,7,35,15',
     ' 454': '11,5,29,8',
     ' 455': '23,38,89,70',
     ' 456': '10,23,100,43',
     ' 457': '9,24,100,32',
     ' 458': '5,4,73,7',
     ' 459': '5,3,64,4',
     ' 460': '2,2,55,3',
     ' 461': '2,1,45,2',
     ' 462': '28,48,71,73',
     ' 463': '14,54,95,62',
     ' 464': '11,53,94,53',
     ' 465': '9,29,66,24',
     ' 466': '8,23,52,15',
     ' 467': '6,15,41,10',
     ' 468': '6,13,41,4',
     ' 469': '24,79,100,73',
     ' 470': '7,70,99,38',
     ' 471': '5,71,100,23',
     ' 472': '1,46,63,1',
     ' 473': '0,32,42,0',
     ' 474': '0,25,36,0',
     ' 475': '0,21,30,0',
     ' 476': '30,71,75,81',
     ' 477': '23,75,78,69',
     ' 478': '19,79,84,61',
     ' 479': '14,48,53,26',
     ' 480': '8,29,32,13',
     ' 481': '5,23,27,10',
     ' 482': '4,17,21,7',
     ' 483': '21,80,81,69',
     ' 484': '8,92,100,33',
     ' 485': '0,95,100,0',
     ' 486': '0,55,50,0',
     ' 487': '0,43,40,0',
     ' 488': '0,31,26,0',
     ' 489': '0,20,21,0',
     ' 490': '26,85,85,72',
     ' 491': '18,85,65,55',
     ' 492': '11,85,60,48',
     ' 493': '2,57,17,3',
     ' 494': '0,47,10,0',
     ' 495': '0,32,6,0',
     ' 496': '0,27,5,0',
     ' 497': '30,73,74,78',
     ' 498': '23,78,77,65',
     ' 499': '21,73,58,56',
     ' 500': '6,50,21,14',
     ' 501': '1,39,11,5',
     ' 502': '0,26,9,1',
     ' 503': '0,20,6,1',
     ' 504': '29,82,44,73',
     ' 505': '19,82,44,65',
     ' 506': '19,86,38,57',
     ' 507': '4,51,7,6',
     ' 508': '1,41,4,2',
     ' 509': '1,36,3,0',
     ' 510': '0,30,3,0',
     ' 511': '50,99,9,59',
     ' 512': '53,99,3,18',
     ' 513': '53,99,0,0',
     ' 514': '16,55,0,0',
     ' 515': '8,42,0,0',
     ' 516': '4,31,0,0',
     ' 517': '2,25,0,0',
     ' 518': '55,86,20,63',
     ' 519': '65,95,9,40',
     ' 520': '67,95,4,16',
     ' 521': '34,56,0,0',
     ' 522': '24,44,0,0',
     ' 523': '16,33,0,0',
     ' 524': '10,23,0,0',
     ' 525': '69,100,4,45',
     ' 526': '73,100,0,0',
     ' 527': '69,99,0,0',
     ' 528': '35,58,0,0',
     ' 529': '23,45,0,0',
     ' 530': '15,33,0,0',
     ' 531': '9,24,0,0',
     ' 532': '88,76,30,82',
     ' 533': '95,72,15,67',
     ' 534': '95,74,7,44',
     ' 535': '43,25,3,8',
     ' 536': '34,17,2,7',
     ' 537': '21,7,2,3',
     ' 538': '14,4,1,3',
     ' 539': '100,65,22,80',
     ' 540': '100,57,12,66',
     ' 541': '100,58,9,46',
     ' 542': '60,19,1,4',
     ' 543': '37,9,0,1',
     ' 544': '27,4,1,1',
     ' 545': '21,2,0,1',
     ' 546': '100,41,35,87',
     ' 547': '100,35,32,82',
     ' 548': '100,21,28,76',
     ' 549': '56,8,9,21',
     ' 550': '42,7,8,8',
     ' 551': '35,3,8,7',
     ' 552': '24,3,7,2',
     ' 553': '82,30,65,76',
     ' 554': '84,22,77,60',
     ' 555': '80,17,76,51',
     ' 556': '54,8,47,14',
     ' 557': '44,4,37,10',
     ' 558': '36,3,28,4',
     ' 559': '29,2,24,3',
     ' 560': '79,30,63,80',
     ' 561': '84,20,58,54',
     ' 562': '85,12,53,36',
     ' 563': '54,0,29,2',
     ' 564': '43,0,23,0',
     ' 565': '30,0,18,0',
     ' 566': '17,0,12,0',
     ' 567': '88,33,69,72',
     ' 568': '90,14,62,43',
     ' 569': '90,9,60,15',
     ' 570': '57,0,36,0',
     ' 571': '40,0,25,0',
     ' 572': '27,0,18,0',
     ' 573': '20,0,14,0',
     ' 574': '56,22,98,72',
     ' 575': '55,9,95,45',
     ' 576': '54,5,94,24',
     ' 577': '35,2,58,0',
     ' 578': '27,0,48,0',
     ' 579': '24,0,43,0',
     ' 580': '20,0,36,0',
     ' 581': '25,19,100,70',
     ' 582': '25,9,100,39',
     ' 583': '26,1,100,10',
     ' 584': '21,0,89,0',
     ' 585': '14,0,68,0',
     ' 586': '10,0,59,0',
     ' 587': '9,0,50,0',
     ' 600': '2,0,39,0',
     ' 601': '4,0,47,0',
     ' 602': '5,0,55,0',
     ' 603': '6,0,82,0',
     ' 604': '5,0,94,0',
     ' 605': '0,2,100,9',
     ' 606': '0,6,100,16',
     ' 607': '3,0,34,0',
     ' 608': '5,0,45,0',
     ' 609': '6,0,55,1',
     ' 610': '8,1,74,2',
     ' 611': '7,1,89,10',
     ' 612': '7,5,100,20',
     ' 613': '8,11,100,28',
     ' 614': '6,2,32,1',
     ' 615': '8,3,41,3',
     ' 616': '10,5,49,6',
     ' 617': '11,6,64,13',
     ' 618': '14,10,85,27',
     ' 619': '17,14,93,38',
     ' 620': '17,17,97,48',
     ' 621': '12,1,12,2',
     ' 622': '25,2,19,5',
     ' 623': '37,4,26,10',
     ' 624': '48,8,34,20',
     ' 625': '64,16,45,30',
     ' 626': '80,18,56,54',
     ' 627': '93,33,68,85',
     ' 628': '20,0,7,0',
     ' 629': '36,0,9,0',
     ' 630': '48,0,10,0',
     ' 631': '74,0,13,0',
     ' 632': '93,2,15,7',
     ' 633': '98,6,10,29',
     ' 634': '100,13,10,41',
     ' 635': '30,0,7,0',
     ' 636': '39,0,7,0',
     ' 637': '62,0,8,0',
     ' 638': '86,0,9,0',
     ' 639': '99,1,5,5',
     ' 640': '100,10,3,16',
     ' 641': '100,23,0,19',
     ' 642': '13,2,1,1',
     ' 643': '20,3,1,2',
     ' 644': '42,10,2,6',
     ' 645': '56,21,2,8',
     ' 646': '72,31,3,12',
     ' 647': '96,54,5,27',
     ' 648': '100,71,9,56',
     ' 649': '10,3,1,0',
     ' 650': '18,6,1,2',
     ' 651': '38,14,1,2',
     ' 652': '58,26,2,5',
     ' 653': '94,57,4,18',
     ' 654': '100,71,10,47',
     ' 655': '100,79,12,59',
     ' 656': '10,2,0,0',
     ' 657': '22,6,0,0',
     ' 658': '37,11,0,0',
     ' 659': '59,27,0,0',
     ' 660': '88,50,0,0',
     ' 661': '100,75,0,6',
     ' 662': '100,87,0,20',
     ' 663': '3,6,0,2',
     ' 664': '5,8,0,3',
     ' 665': '17,20,0,1',
     ' 666': '36,39,2,5',
     ' 667': '56,59,4,14',
     ' 668': '70,77,7,23',
     ' 669': '87,97,8,49',
     ' 670': '1,17,0,0',
     ' 671': '3,28,0,0',
     ' 672': '6,46,0,0',
     ' 673': '9,55,0,0',
     ' 674': '16,83,0,0',
     ' 675': '18,100,0,8',
     ' 676': '9,100,14,33',
     ' 677': '1,16,0,2',
     ' 678': '3,23,0,1',
     ' 679': '4,29,0,0',
     ' 680': '9,49,0,6',
     ' 681': '16,68,1,9',
     ' 682': '24,86,4,28',
     ' 683': '26,99,12,50',
     ' 684': '3,22,2,1',
     ' 685': '0,29,0,4',
     ' 686': '6,42,1,2',
     ' 687': '10,55,2,10',
     ' 688': '17,68,3,12',
     ' 689': '24,89,5,37',
     ' 690': '30,98,13,68',
     ' 691': '0,14,5,1',
     ' 692': '2,26,7,2',
     ' 693': '3,39,9,6',
     ' 694': '5,50,14,13',
     ' 695': '8,60,21,24',
     ' 696': '17,82,42,40',
     ' 697': '19,85,48,46',
     ' 698': '0,16,4,0',
     ' 699': '0,28,5,0',
     ' 700': '0,40,8,0',
     ' 701': '0,58,13,0',
     ' 702': '4,78,30,2',
     ' 703': '6,91,53,16',
     ' 704': '8,97,76,31',
     ' 705': '0,11,3,0',
     ' 706': '0,23,7,0',
     ' 707': '0,36,8,0',
     ' 708': '0,53,17,0',
     ' 709': '0,69,29,0',
     ' 710': '0,84,46,0',
     ' 711': '0,97,75,0',
     ' 712': '0,20,30,0',
     ' 713': '0,27,40,0',
     ' 714': '0,40,59,0',
     ' 715': '0,54,87,0',
     ' 716': '0,61,99,0',
     ' 717': '0,68,100,0',
     ' 718': '0,74,100,8',
     ' 719': '0,14,26,1',
     ' 720': '0,25,38,2',
     ' 721': '0,35,52,4',
     ' 722': '2,50,76,13',
     ' 723': '6,60,98,20',
     ' 724': '7,70,100,42',
     ' 725': '9,75,100,55',
     ' 726': '1,15,26,3',
     ' 727': '2,21,32,6',
     ' 728': '5,32,46,10',
     ' 729': '7,45,66,18',
     ' 730': '10,55,83,35',
     ' 731': '11,68,100,61',
     ' 732': '16,69,100,71',
     ' 1205': '0,3,43,0',
     ' 1215': '0,6,53,0',
     ' 1225': '0,19,79,0',
     ' 1235': '0,31,98,0',
     ' 1245': '6,35,99,18',
     ' 1255': '9,35,98,30',
     ' 1265': '14,36,95,46',
     ' 1345': '0,17,50,0',
     ' 1355': '0,22,60,0',
     ' 1365': '0,34,76,0',
     ' 1375': '0,45,94,0',
     ' 1385': '2,56,100,3',
     ' 1395': '9,55,100,39',
     ' 1405': '20,55,100,60',
     ' 1485': '0,34,58,0',
     ' 1495': '0,46,78,0',
     ' 1505': '0,56,90,0',
     ' 1525': '2,77,100,9',
     ' 1535': '10,75,100,42',
     ' 1545': '20,76,100,70',
     ' 1555': '0,26,36,0',
     ' 1565': '0,39,51,0',
     ' 1575': '0,51,77,0',
     ' 1585': '0,61,97,0',
     ' 1595': '0,71,100,3',
     ' 1605': '6,71,100,32',
     ' 1615': '10,72,100,46',
     ' 1625': '0,41,42,0',
     ' 1635': '0,51,55,0',
     ' 1645': '0,63,75,0',
     ' 1655': '0,73,98,0',
     ' 1665': '0,79,100,0',
     ' 1675': '5,83,100,27',
     ' 1685': '11,82,100,48',
     ' 1765': '0,42,18,0',
     ' 1767': '0,33,10,0',
     ' 1775': '0,49,23,0',
     ' 1777': '0,66,29,0',
     ' 1785': '0,76,54,0',
     ' 1787': '0,82,53,0',
     ' 1788': '0,88,82,0',
     ' 1795': '0,96,93,2',
     ' 1797': '2,97,85,7',
     ' 1805': '5,96,80,22',
     ' 1807': '10,93,71,33',
     ' 1815': '16,97,86,54',
     ' 1817': '30,85,59,70',
     ' 1895': '0,30,2,0',
     ' 1905': '0,47,9,0',
     ' 1915': '0,75,21,0',
     ' 1925': '0,97,50,0',
     ' 1935': '1,100,55,6',
     ' 1945': '5,100,55,28',
     ' 1955': '9,100,54,43',
     ' 2001': '0,3,48,0',
     ' 2002': '0,4,58,0',
     ' 2003': '0,1,70,0',
     ' 2004': '0,8,61,0',
     ' 2005': '0,13,60,0',
     ' 2006': '0,22,77,0',
     ' 2007': '0,33,92,2',
     ' 2008': '0,25,78,0',
     ' 2009': '0,35,87,0',
     ' 2010': '0,35,100,0',
     ' 2011': '0,48,99,0',
     ' 2012': '0,45,100,0',
     ' 2013': '0,46,100,0',
     ' 2014': '0,51,100,26',
     ' 2015': '0,16,32,0',
     ' 2016': '0,33,57,0',
     ' 2017': '0,34,57,0',
     ' 2018': '0,58,95,0',
     ' 2019': '0,69,100,2',
     ' 2020': '0,68,100,22',
     ' 2021': '0,80,100,35',
     ' 2022': '0,38,44,0',
     ' 2023': '0,48,54,0',
     ' 2024': '0,58,65,0',
     ' 2025': '0,50,71,0',
     ' 2026': '0,68,76,0',
     ' 2027': '0,76,75,0',
     ' 2028': '0,84,98,0',
     ' 2029': '0,63,49,0',
     ' 2030': '0,68,51,0',
     ' 2031': '4,71,54,0',
     ' 2032': '4,78,61,2',
     ' 2033': '4,83,68,9',
     ' 2034': '0,85,80,0',
     ' 2035': '0,97,100,3',
     ' 2036': '0,29,1,0',
     ' 2037': '2,51,0,0',
     ' 2038': '0,68,0,0',
     ' 2039': '0,83,3,0',
     ' 2040': '0,96,43,0',
     ' 2041': '0,98,39,40',
     ' 2042': '20,91,44,58',
     ' 2043': '2,23,4,0',
     ' 2044': '0,53,3,0',
     ' 2045': '0,67,5,0',
     ' 2046': '0,80,7,3',
     ' 2047': '18,85,17,21',
     ' 2048': '16,88,24,34',
     ' 2049': '19,90,36,47',
     ' 2050': '3,15,3,0',
     ' 2051': '8,23,5,0',
     ' 2052': '18,39,11,0',
     ' 2053': '28,55,16,2',
     ' 2054': '40,59,28,4',
     ' 2055': '44,68,32,14',
     ' 2056': '47,74,34,23',
     ' 2057': '9,49,0,0',
     ' 2058': '26,53,6,0',
     ' 2059': '26,58,10,0',
     ' 2060': '19,70,0,0',
     ' 2061': '25,80,5,3',
     ' 2062': '28,88,0,0',
     ' 2063': '35,94,0,0',
     ' 2064': '13,45,0,0',
     ' 2065': '15,38,0,0',
     ' 2066': '23,49,0,0',
     ' 2067': '34,63,0,0',
     ' 2068': '40,71,0,0',
     ' 2069': '47,81,0,0',
     ' 2070': '59,89,0,0',
     ' 2071': '23,29,0,0',
     ' 2072': '34,42,0,0',
     ' 2073': '39,44,0,0',
     ' 2074': '51,62,0,0',
     ' 2075': '56,60,0,0',
     ' 2076': '60,70,0,0',
     ' 2077': '76,85,0,0',
     ' 2078': '30,41,2,0',
     ' 2079': '45,53,10,0',
     ' 2080': '45,55,0,0',
     ' 2081': '60,72,0,0',
     ' 2082': '70,81,0,0',
     ' 2083': '46,58,0,0',
     ' 2084': '66,79,0,0',
     ' 2085': '9,16,0,0',
     ' 2086': '41,45,0,0',
     ' 2087': '45,49,0,0',
     ' 2088': '58,60,0,0',
     ' 2089': '72,74,0,0',
     ' 2090': '77,79,0,0',
     ' 2091': '86,88,0,0',
     ' 2092': '29,32,0,0',
     ' 2093': '38,38,1,0',
     ' 2094': '53,52,3,0',
     ' 2095': '66,63,0,0',
     ' 2096': '76,75,0,0',
     ' 2097': '77,74,0,0',
     ' 2098': '88,86,0,0',
     ' 2099': '36,38,1,0',
     ' 2100': '43,42,0,0',
     ' 2101': '54,52,0,0',
     ' 2102': '76,71,0,0',
     ' 2103': '84,82,0,0',
     ' 2104': '92,87,0,0',
     ' 2105': '100,100,0,3',
     ' 2106': '31,18,5,0',
     ' 2107': '44,28,12,2',
     ' 2108': '58,38,15,7',
     ' 2109': '74,51,22,8',
     ' 2110': '81,60,19,13',
     ' 2111': '86,65,21,26',
     ' 2112': '97,96,0,41',
     ' 2113': '39,23,0,0',
     ' 2114': '52,38,0,0',
     ' 2115': '64,46,0,0',
     ' 2116': '76,56,0,0',
     ' 2117': '92,79,0,0',
     ' 2118': '99,89,0,7',
     ' 2119': '97,85,0,37',
     ' 2120': '26,9,0,0',
     ' 2121': '51,21,0,0',
     ' 2122': '47,25,0,0',
     ' 2123': '63,39,0,0',
     ' 2124': '67,49,0,0',
     ' 2125': '74,55,0,0',
     ' 2126': '93,78,0,0',
     ' 2127': '30,8,0,0',
     ' 2128': '49,20,0,0',
     ' 2129': '69,35,0,0',
     ' 2130': '78,51,0,0',
     ' 2131': '87,64,0,0',
     ' 2132': '92,64,0,0',
     ' 2133': '96,64,0,0',
     ' 2134': '46,26,0,0',
     ' 2135': '62,39,0,0',
     ' 2136': '58,33,14,2',
     ' 2137': '69,41,15,8',
     ' 2138': '70,46,31,12',
     ' 2139': '79,49,17,15',
     ' 2140': '93,61,9,42',
     ' 2141': '49,9,0,0',
     ' 2142': '54,20,0,0',
     ' 2143': '77,34,0,0',
     ' 2144': '95,53,0,0',
     ' 2145': '98,62,0,14',
     ' 2146': '100,72,0,20',
     ' 2147': '99,86,0,7',
     ' 2148': '66,29,14,4',
     ' 2149': '79,37,17,2',
     ' 2150': '83,39,15,13',
     ' 2151': '93,51,6,4',
     ' 2152': '92,44,13,22',
     ' 2153': '97,49,11,38',
     ' 2154': '100,58,0,42',
     ' 2155': '38,15,8,0',
     ' 2156': '51,23,11,0',
     ' 2157': '63,31,14,0',
     ' 2158': '74,38,17,4',
     ' 2159': '79,43,18,8',
     ' 2160': '85,47,20,13',
     ' 2161': '93,55,16,25',
     ' 2162': '42,23,18,1',
     ' 2163': '52,29,26,3',
     ' 2164': '58,32,27,3',
     ' 2165': '68,39,30,9',
     ' 2166': '75,45,33,14',
     ' 2167': '79,46,34,16',
     ' 2168': '91,44,30,57',
     ' 2169': '52,13,5,0',
     ' 2170': '69,21,6,0',
     ' 2171': '72,17,0,0',
     ' 2172': '86,42,0,0',
     ' 2173': '88,31,0,0',
     ' 2174': '94,43,0,0',
     ' 2175': '99,47,0,0',
     ' 2176': '33,12,17,0',
     ' 2177': '54,20,24,3',
     ' 2178': '68,29,30,7',
     ' 2179': '76,35,34,18',
     ' 2180': '83,40,34,30',
     ' 2181': '89,42,29,50',
     ' 2182': '93,44,32,57',
     ' 2183': '88,21,13,2',
     ' 2184': '94,29,0,0',
     ' 2185': '100,38,17,2',
     ' 2186': '100,46,0,46',
     ' 2187': '100,47,0,48',
     ' 2188': '100,39,0,63',
     ' 2189': '94,24,0,85',
     ' 2190': '70,3,0,0',
     ' 2191': '82,11,0,0',
     ' 2192': '89,18,0,0',
     ' 2193': '92,24,0,0',
     ' 2194': '95,26,0,0',
     ' 2195': '98,40,0,0',
     ' 2196': '100,35,0,12',
     ' 2197': '50,0,12,0',
     ' 2198': '61,0,15,0',
     ' 2199': '77,0,16,0',
     ' 2200': '82,1,17,3',
     ' 2201': '84,0,16,0',
     ' 2202': '92,0,6,0',
     ' 2203': '94,1,14,15',
     ' 2204': '33,5,8,2',
     ' 2205': '55,11,18,3',
     ' 2206': '59,21,17,4',
     ' 2207': '73,18,22,8',
     ' 2208': '71,30,23,9',
     ' 2209': '79,23,23,19',
     ' 2210': '97,45,24,55',
     ' 2211': '62,22,35,2',
     ' 2212': '75,29,42,12',
     ' 2213': '82,34,49,24',
     ' 2214': '84,34,47,22',
     ' 2215': '89,46,44,40',
     ' 2216': '88,50,45,50',
     ' 2217': '88,0,28,88',
     ' 2218': '63,9,28,2',
     ' 2219': '68,10,30,3',
     ' 2220': '76,13,34,9',
     ' 2221': '80,16,34,19',
     ' 2222': '85,17,38,19',
     ' 2223': '91,11,38,40',
     ' 2224': '96,0,31,57',
     ' 2225': '45,0,18,0',
     ' 2226': '60,0,23,0',
     ' 2227': '60,0,25,0',
     ' 2228': '92,0,34,0',
     ' 2229': '96,0,36,0',
     ' 2230': '96,3,41,13',
     ' 2231': '100,5,40,21',
     ' 2232': '61,7,31,0',
     ' 2233': '71,8,35,4',
     ' 2234': '75,10,37,6',
     ' 2235': '81,9,41,15',
     ' 2236': '79,14,43,11',
     ' 2237': '86,16,44,21',
     ' 2238': '100,2,46,49',
     ' 2239': '59,0,39,0',
     ' 2240': '74,0,49,0',
     ' 2241': '73,7,51,6',
     ' 2242': '95,0,74,0',
     ' 2243': '90,5,63,6',
     ' 2244': '86,14,63,20',
     ' 2245': '100,0,81,18',
     ' 2246': '35,0,33,0',
     ' 2247': '54,0,48,0',
     ' 2248': '59,0,53,0',
     ' 2249': '73,0,62,0',
     ' 2250': '79,0,67,0',
     ' 2251': '87,0,74,0',
     ' 2252': '88,0,86,0',
     ' 2253': '21,0,22,0',
     ' 2254': '29,0,35,0',
     ' 2255': '43,0,49,0',
     ' 2256': '57,0,62,0',
     ' 2257': '87,0,91,0',
     ' 2258': '91,0,100,8',
     ' 2259': '87,0,99,32',
     ' 2260': '31,0,39,0',
     ' 2261': '46,4,52,0',
     ' 2262': '54,9,62,2',
     ' 2263': '65,12,75,14',
     ' 2264': '64,13,72,8',
     ' 2265': '73,12,89,34',
     ' 2266': '71,0,100,68',
     ' 2267': '32,0,42,0',
     ' 2268': '42,0,51,0',
     ' 2269': '51,0,71,0',
     ' 2270': '61,0,73,0',
     ' 2271': '74,0,85,0',
     ' 2272': '87,0,100,2',
     ' 2273': '84,0,100,39',
     ' 2274': '15,0,34,0',
     ' 2275': '24,0,48,0',
     ' 2276': '48,8,83,9',
     ' 2277': '63,0,97,20',
     ' 2278': '62,0,98,35',
     ' 2279': '54,0,96,51',
     ' 2280': '61,0,99,56',
     ' 2281': '15,0,46,0',
     ' 2282': '22,0,42,0',
     ' 2283': '35,0,61,0',
     ' 2284': '33,0,60,0',
     ' 2285': '43,0,70,0',
     ' 2286': '48,0,86,0',
     ' 2287': '61,0,93,0',
     ' 2288': '24,0,57,0',
     ' 2289': '24,0,60,0',
     ' 2290': '34,0,78,0',
     ' 2291': '38,0,82,0',
     ' 2292': '48,0,92,0',
     ' 2293': '49,0,90,0',
     ' 2294': '50,0,95,13',
     ' 2295': '12,0,49,0',
     ' 2296': '17,0,54,0',
     ' 2297': '29,0,72,0',
     ' 2298': '33,0,72,0',
     ' 2299': '41,0,84,0',
     ' 2300': '40,0,89,0',
     ' 2301': '46,0,100,14',
     ' 2302': '33,7,74,5',
     ' 2303': '43,11,76,0',
     ' 2304': '37,9,83,11',
     ' 2305': '25,0,100,32',
     ' 2306': '39,4,100,38',
     ' 2307': '34,0,100,60',
     ' 2308': '10,7,98,77',
     ' 2309': '3,15,29,0',
     ' 2310': '11,20,30,0',
     ' 2311': '15,31,45,2',
     ' 2312': '25,37,50,4',
     ' 2313': '18,41,62,6',
     ' 2314': '32,58,85,7',
     ' 2315': '0,71,100,49',
     ' 2316': '25,39,50,3',
     ' 2317': '26,45,62,6',
     ' 2318': '29,52,72,15',
     ' 2319': '21,63,98,46',
     ' 2320': '25,69,97,54',
     ' 2321': '0,44,75,74',
     ' 2322': '32,72,99,81',
     ' 2323': '26,20,40,0',
     ' 2324': '30,30,53,5',
     ' 2325': '36,36,56,6',
     ' 2326': '45,44,67,14',
     ' 2327': '50,42,67,16',
     ' 2328': '47,49,73,33',
     ' 2329': '46,50,78,46',
     ' 2330': '13,9,13,0',
     ' 2331': '32,26,29,3',
     ' 2332': '50,42,44,6',
     ' 2333': '66,55,58,10',
     ' 2334': '62,56,56,16',
     ' 2335': '70,65,73,27',
     ' 2336': '76,69,68,33',
     ' 2337': '0,27,22,0',
     ' 2338': '4,39,29,0',
     ' 2339': '0,49,32,0',
     ' 2340': '9,66,40,0',
     ' 2341': '23,64,51,2',
     ' 2342': '16,73,46,7',
     ' 2343': '24,75,44,10',
     ' 2344': '0,56,50,0',
     ' 2345': '0,59,50,0',
     ' 2346': '0,65,50,0',
     ' 2347': '0,88,100,0',
     ' 2348': '0,76,65,0',
     ' 2349': '0,82,100,10',
     ' 2350': '0,95,100,21',
     ' 2351': '24,59,0,0',
     ' 2352': '29,69,0,0',
     ' 2353': '24,77,0,0',
     ' 2354': '48,78,9,7',
     ' 2355': '55,100,0,0',
     ' 2356': '50,98,0,32',
     ' 2357': '23,100,0,58',
     ' 2358': '34,28,19,4',
     ' 2359': '52,48,31,15',
     ' 2360': '55,45,27,10',
     ' 2361': '62,50,23,9',
     ' 2362': '59,52,28,13',
     ' 2363': '63,58,30,19',
     ' 2364': '59,59,36,20',
     ' 2365': '2,30,0,0',
     ' 2366': '64,55,0,0',
     ' 2367': '80,72,0,0',
     ' 2368': '82,70,0,0',
     ' 2369': '87,77,0,0',
     ' 2370': '97,96,0,0',
     ' 2371': '94,100,0,0',
     ' 2372': '97,99,0,14',
     ' 2373': '58,42,18,5',
     ' 2374': '72,55,20,18',
     ' 2375': '16,60,0,0',
     ' 2376': '71,55,33,23',
     ' 2377': '84,54,29,28',
     ' 2378': '83,63,26,34',
     ' 2379': '81,64,41,38',
     ' 2380': '91,71,36,56',
     ' 2381': '61,29,0,0',
     ' 2382': '78,30,0,0',
     ' 2383': '83,40,3,6',
     ' 2384': '99,48,1,14',
     ' 2385': '23,83,0,0',
     ' 2386': '83,54,0,0',
     ' 2387': '88,56,0,0',
     ' 2388': '100,66,0,0',
     ' 2389': '68,17,8,0',
     ' 2390': '86,31,11,5',
     ' 2391': '86,23,16,9',
     ' 2392': '87,38,24,19',
     ' 2393': '94,11,5,0',
     ' 2394': '100,12,0,2',
     ' 2395': '26,90,0,0',
     ' 2396': '91,5,24,0',
     ' 2397': '74,0,29,0',
     ' 2398': '71,0,36,0',
     ' 2399': '90,0,43,0',
     ' 2400': '80,0,49,0',
     ' 2401': '73,4,45,0',
     ' 2402': '96,0,58,0',
     ' 2403': '100,0,56,11',
     ' 2404': '36,12,41,1',
     ' 2405': '36,100,0,0',
     ' 2406': '53,20,53,2',
     ' 2407': '61,29,60,3',
     ' 2408': '73,29,75,14',
     ' 2409': '72,42,81,22',
     ' 2410': '77,46,88,28',
     ' 2411': '72,2,100,76',
     ' 2412': '48,0,45,0',
     ' 2413': '67,0,53,0',
     ' 2414': '70,0,65,0',
     ' 2415': '38,100,0,6',
     ' 2416': '78,0,68,0',
     ' 2417': '79,7,71,2',
     ' 2418': '100,0,97,13',
     ' 2419': '97,13,78,16',
     ' 2420': '65,0,73,0',
     ' 2421': '65,0,96,0',
     ' 2422': '80,0,100,0',
     ' 2423': '78,0,99,0',
     ' 2424': '69,0,98,7',
     ' 2425': '40,100,10,26',
     ' 2426': '89,0,100,10',
     ' 2427': '87,0,100,50',
     ' 2430': '15,39,55,0',
     ' 2562': '19,35,0,0',
     ' 2563': '22,39,0,0',
     ' 2567': '29,45,0,0',
     ' 2572': '29,55,0,0',
     ' 2573': '35,52,0,0',
     ' 2577': '40,54,0,0',
     ' 2582': '48,80,0,0',
     ' 2583': '47,72,0,0',
     ' 2587': '58,76,0,0',
     ' 2592': '58,90,0,0',
     ' 2593': '66,92,0,0',
     ' 2597': '80,99,0,0',
     ' 2602': '65,100,0,0',
     ' 2603': '72,99,0,3',
     ' 2607': '83,99,0,2',
     ' 2612': '67,100,0,5',
     ' 2613': '74,99,5,11',
     ' 2617': '84,99,0,12',
     ' 2622': '65,100,5,40',
     ' 2623': '75,100,8,26',
     ' 2627': '85,100,6,38',
     ' 2635': '24,29,0,0',
     ' 2645': '40,44,0,0',
     ' 2655': '54,61,0,0',
     ' 2665': '70,76,0,0',
     ' 2685': '90,99,0,8',
     ' 2695': '91,100,8,59',
     ' 2705': '40,36,0,0',
     ' 2706': '19,10,0,0',
     ' 2707': '20,6,0,0',
     ' 2708': '30,13,0,0',
     ' 2715': '56,52,0,0',
     ' 2716': '40,29,0,0',
     ' 2717': '34,15,0,0',
     ' 2718': '65,45,0,0',
     ' 2725': '76,76,0,0',
     ' 2726': '81,70,0,0',
     ' 2727': '70,47,0,0',
     ' 2728': '90,68,0,0',
     ' 2735': '97,100,0,4',
     ' 2736': '97,95,0,0',
     ' 2738': '100,92,0,1',
     ' 2745': '97,100,0,18',
     ' 2746': '100,98,0,0',
     ' 2747': '100,95,0,16',
     ' 2748': '100,95,2,10',
     ' 2755': '97,100,0,30',
     ' 2756': '100,98,0,15',
     ' 2757': '100,95,4,42',
     ' 2758': '100,95,5,39',
     ' 2765': '100,100,9,57',
     ' 2766': '100,100,6,60',
     ' 2767': '100,90,10,77',
     ' 2768': '100,90,13,71',
     ' 2905': '45,1,0,1',
     ' 2915': '60,9,0,0',
     ' 2925': '85,21,0,0',
     ' 2935': '100,52,0,0',
     ' 2945': '100,53,2,16',
     ' 2955': '100,60,10,53',
     ' 2965': '100,63,16,78',
     ' 2975': '34,0,5,0',
     ' 2985': '60,0,3,0',
     ' 2995': '83,1,0,0',
     ' 3005': '100,31,0,0',
     ' 3015': '100,35,3,21',
     ' 3025': '100,27,10,56',
     ' 3035': '100,30,19,76',
     ' 3105': '44,0,11,0',
     ' 3115': '59,0,14,0',
     ' 3125': '84,0,18,0',
     ' 3135': '100,0,20,0',
     ' 3145': '100,10,29,20',
     ' 3155': '100,9,29,47',
     ' 3165': '100,16,33,66',
     ' 3242': '44,0,20,0',
     ' 3245': '42,0,24,0',
     ' 3248': '48,0,22,0',
     ' 3252': '49,0,23,0',
     ' 3255': '48,0,25,0',
     ' 3258': '59,0,30,0',
     ' 3262': '76,0,38,0',
     ' 3265': '66,0,39,0',
     ' 3268': '86,0,53,0',
     ' 3272': '94,0,48,0',
     ' 3275': '90,0,52,0',
     ' 3278': '99,0,69,0',
     ' 3282': '100,4,56,8',
     ' 3285': '98,0,59,0',
     ' 3288': '99,3,68,12',
     ' 3292': '98,14,65,51',
     ' 3295': '100,5,65,26',
     ' 3298': '99,11,72,35',
     ' 3302': '90,21,65,69',
     ' 3305': '92,25,70,68',
     ' 3308': '94,28,74,73',
     ' 3375': '36,0,24,0',
     ' 3385': '43,0,28,0',
     ' 3395': '66,0,48,0',
     ' 3405': '88,0,68,0',
     ' 3415': '97,10,86,18',
     ' 3425': '93,13,85,44',
     ' 3435': '93,24,85,68',
     ' 3515': '75,100,16,8',
     ' 3507': '38,1,100,0',
     ' 3520': '31,59,0,0',
     ' 3545': '75,1,7,0',
     ' 3533': '54,0,28,0',
     ' 3534': '99,0,47,0',
     ' 3588': '0,50,92,0',
     ' 3935': '2,0,60,0',
     ' 3945': '3,0,90,0',
     ' 3955': '4,0,100,0',
     ' 3965': '7,0,100,0',
     ' 3975': '8,7,100,25',
     ' 3985': '12,13,100,43',
     ' 3995': '23,25,100,67',
     ' 4485': '24,42,91,75',
     ' 4495': '19,35,90,55',
     ' 4505': '16,27,83,42',
     ' 4515': '13,19,62,28',
     ' 4525': '9,12,47,18',
     ' 4535': '6,8,35,12',
     ' 4545': '5,6,30,4',
     ' 4625': '30,72,74,80',
     ' 4635': '12,58,81,42',
     ' 4645': '11,46,64,30',
     ' 4655': '8,41,51,20',
     ' 4665': '5,30,38,12',
     ' 4675': '5,20,28,6',
     ' 4685': '2,15,23,5',
     ' 4695': '24,85,100,76',
     ' 4705': '24,70,71,58',
     ' 4715': '17,59,60,45',
     ' 4725': '13,42,43,31',
     ' 4735': '7,28,27,16',
     ' 4745': '5,22,23,14',
     ' 4755': '3,16,20,9',
     ' 4975': '36,84,59,85',
     ' 4985': '22,74,38,47',
     ' 4995': '15,62,30,38',
     ' 5005': '10,52,25,29',
     ' 5015': '5,35,14,10',
     ' 5025': '3,30,13,7',
     ' 5035': '1,18,8,3',
     ' 5115': '51,91,21,70',
     ' 5125': '42,81,11,49',
     ' 5135': '36,68,10,31',
     ' 5145': '25,51,5,20',
     ' 5155': '13,31,2,8',
     ' 5165': '7,19,2,3',
     ' 5175': '5,16,2,3',
     ' 5185': '53,81,26,75',
     ' 5195': '44,74,21,58',
     ' 5205': '30,59,13,41',
     ' 5215': '15,38,7,22',
     ' 5225': '8,25,4,14',
     ' 5235': '5,18,4,8',
     ' 5245': '3,10,3,5',
     ' 5255': '97,100,15,72',
     ' 5265': '86,83,9,45',
     ' 5275': '74,68,7,31',
     ' 5285': '44,40,5,15',
     ' 5295': '26,22,2,9',
     ' 5305': '18,15,2,6',
     ' 5315': '10,7,1,4',
     ' 5395': '100,71,39,90',
     ' 5405': '68,35,17,40',
     ' 5415': '56,24,11,34',
     ' 5425': '45,16,9,24',
     ' 5435': '31,8,6,11',
     ' 5445': '21,5,4,8',
     ' 5455': '17,4,6,4',
     ' 5463': '100,45,38,90',
     ' 5467': '86,33,57,92',
     ' 5473': '86,20,32,51',
     ' 5477': '66,24,43,66',
     ' 5483': '65,11,25,27',
     ' 5487': '51,16,35,50',
     ' 5493': '47,4,16,16',
     ' 5497': '38,9,23,32',
     ' 5503': '39,2,14,10',
     ' 5507': '27,5,17,18',
     ' 5513': '29,1,10,5',
     ' 5517': '20,4,13,10',
     ' 5523': '22,1,9,2',
     ' 5527': '12,2,9,8',
     ' 5535': '79,34,62,84',
     ' 5545': '62,19,45,50',
     ' 5555': '51,12,39,37',
     ' 5565': '44,12,34,24',
     ' 5575': '37,9,28,13',
     ' 5585': '23,3,19,8',
     ' 5595': '20,3,17,4',
     ' 5605': '82,36,83,90',
     ' 5615': '52,16,52,54',
     ' 5625': '46,18,44,37',
     ' 5635': '34,10,33,20',
     ' 5645': '26,6,24,12',
     ' 5655': '20,4,20,9',
     ' 5665': '14,2,15,7',
     ' 5743': '54,24,86,73',
     ' 5747': '50,27,98,76',
     ' 5753': '42,16,80,58',
     ' 5757': '34,12,91,54',
     ' 5763': '37,13,71,50',
     ' 5767': '31,11,76,35',
     ' 5773': '29,10,52,32',
     ' 5777': '26,9,56,20',
     ' 5783': '24,8,41,19',
     ' 5787': '18,4,41,10',
     ' 5793': '19,6,34,12',
     ' 5797': '15,4,37,9',
     ' 5803': '12,2,24,9',
     ' 5807': '11,3,25,3',
     ' 5815': '35,30,100,75',
     ' 5825': '22,15,86,47',
     ' 5835': '18,11,70,32',
     ' 5845': '18,10,60,23',
     ' 5855': '12,5,44,15',
     ' 5865': '9,3,37,10',
     ' 5875': '9,4,31,5',
     ' 7401': '0,4,27,0',
     ' 7402': '1,4,45,1',
     ' 7403': '1,11,58,2',
     ' 7404': '0,8,86,0',
     ' 7405': '0,11,97,2',
     ' 7406': '0,20,100,2',
     ' 7407': '6,36,79,12',
     ' 7408': '0,29,100,0',
     ' 7409': '0,31,100,0',
     ' 7410': '0,41,59,0',
     ' 7411': '0,42,75,2',
     ' 7412': '2,58,96,10',
     ' 7413': '1,60,98,4',
     ' 7414': '6,66,100,21',
     ' 7415': '0,28,26,1',
     ' 7416': '0,72,70,0',
     ' 7417': '1,83,85,0',
     ' 7418': '8,83,55,5',
     ' 7419': '9,76,40,26',
     ' 7420': '13,100,54,30',
     ' 7421': '18,100,45,67',
     ' 7422': '0,16,3,0',
     ' 7423': '0,73,15,0',
     ' 7424': '0,90,9,0',
     ' 7425': '6,96,32,13',
     ' 7426': '5,99,44,22',
     ' 7427': '8,100,70,33',
     ' 7428': '20,96,36,62',
     ' 7429': '1,26,1,1',
     ' 7430': '2,38,1,2',
     ' 7431': '4,54,4,7',
     ' 7432': '8,73,9,15',
     ' 7433': '8,90,16,24',
     ' 7434': '11,94,25,34',
     ' 7435': '15,100,21,48',
     ' 7436': '2,14,0,0',
     ' 7437': '14,35,0,0',
     ' 7438': '18,47,0,0',
     ' 7439': '27,52,0,0',
     ' 7440': '36,60,0,0',
     ' 7441': '44,70,0,0',
     ' 7442': '58,87,0,0',
     ' 7443': '9,8,0,1',
     ' 7444': '27,21,0,0',
     ' 7445': '36,33,0,3',
     ' 7446': '50,46,0,0',
     ' 7447': '77,85,6,18',
     ' 7448': '67,79,24,59',
     ' 7449': '65,98,21,83',
     ' 7450': '25,13,0,0',
     ' 7451': '46,23,0,0',
     ' 7452': '55,37,0,0',
     ' 7453': '53,26,0,0',
     ' 7454': '62,23,4,12',
     ' 7455': '90,66,0,0',
     ' 7456': '72,55,0,0',
     ' 7457': '18,0,5,0',
     ' 7458': '53,3,8,9',
     ' 7459': '72,9,9,13',
     ' 7460': '100,6,2,10',
     ' 7461': '98,24,1,3',
     ' 7462': '100,48,6,30',
     ' 7463': '100,63,12,67',
     ' 7464': '35,0,18,0',
     ' 7465': '58,0,36,0',
     ' 7466': '86,0,32,0',
     ' 7467': '97,0,30,0',
     ' 7468': '90,18,7,29',
     ' 7469': '100,31,8,42',
     ' 7470': '96,20,25,53',
     ' 7471': '37,0,17,0',
     ' 7472': '54,0,27,0',
     ' 7473': '75,5,48,3',
     ' 7474': '96,9,32,29',
     ' 7475': '69,12,30,36',
     ' 7476': '89,22,34,65',
     ' 7477': '86,29,21,67',
     ' 7478': '28,0,25,0',
     ' 7479': '56,0,58,0',
     ' 7480': '75,0,71,0',
     ' 7481': '82,0,86,0',
     ' 7482': '90,0,93,0',
     ' 7483': '82,16,85,56',
     ' 7484': '91,14,78,60',
     ' 7485': '9,0,18,0',
     ' 7486': '28,0,45,0',
     ' 7487': '42,0,62,0',
     ' 7488': '52,0,82,0',
     ' 7489': '56,2,78,5',
     ' 7490': '57,6,92,19',
     ' 7491': '47,11,92,39',
     ' 7492': '17,1,47,3',
     ' 7493': '25,4,44,3',
     ' 7494': '35,5,42,14',
     ' 7495': '42,5,98,29',
     ' 7496': '46,6,100,42',
     ' 7497': '22,23,47,57',
     ' 7498': '46,23,84,68',
     ' 7499': '1,2,24,0',
     ' 7500': '3,5,26,2',
     ' 7501': '6,10,30,2',
     ' 7502': '6,14,39,8',
     ' 7503': '10,15,50,29',
     ' 7504': '17,36,52,38',
     ' 7505': '17,44,62,49',
     ' 7506': '0,7,25,1',
     ' 7507': '0,13,35,0',
     ' 7508': '2,19,46,4',
     ' 7509': '4,29,57,4',
     ' 7510': '5,41,77,10',
     ' 7511': '5,52,100,24',
     ' 7512': '7,58,100,30',
     ' 7513': '0,26,26,1',
     ' 7514': '3,35,36,5',
     ' 7515': '5,43,49,11',
     ' 7516': '11,72,92,36',
     ' 7517': '11,78,100,50',
     ' 7518': '21,56,49,60',
     ' 7519': '24,42,45,68',
     ' 7520': '1,26,21,0',
     ' 7521': '6,32,32,12',
     ' 7522': '8,62,54,16',
     ' 7523': '10,67,49,23',
     ' 7524': '12,78,62,25',
     ' 7525': '13,56,61,32',
     ' 7526': '9,83,100,46',
     ' 7527': '3,4,14,8',
     ' 7528': '5,10,17,16',
     ' 7529': '7,14,20,22',
     ' 7530': '10,18,25,32',
     ' 7531': '16,29,38,53',
     ' 7532': '23,37,45,65',
     ' 7533': '37,53,68,83',
     ' 7534': '5,5,15,8',
     ' 7535': '10,11,23,19',
     ' 7536': '11,13,30,32',
     ' 7537': '18,8,20,24',
     ' 7538': '24,11,24,33',
     ' 7539': '24,13,18,38',
     ' 7540': '41,28,22,70',
     ' 7541': '7,1,3,2',
     ' 7542': '24,4,8,13',
     ' 7543': '24,9,8,22',
     ' 7544': '35,14,11,34',
     ' 7545': '58,32,18,54',
     ' 7546': '73,45,24,66',
     ' 7547': '99,74,31,84',
     ' 7548': '0,12,98,0',
     ' 7549': '0,22,100,2',
     ' 7550': '0,34,98,12',
     ' 7551': '0,40,96,32',
     ' 7552': '19,42,100,59',
     ' 7553': '26,46,76,72',
     ' 7554': '37,53,68,81',
     ' 7555': '0,28,98,11',
     ' 7556': '7,35,99,19',
     ' 7557': '11,31,100,37',
     ' 7558': '13,36,95,41',
     ' 7559': '14,39,95,46',
     ' 7560': '19,37,95,55',
     ' 7561': '21,40,90,64',
     ' 7562': '8,29,66,19',
     ' 7563': '0,32,87,8',
     ' 7564': '0,45,100,4',
     ' 7565': '0,53,98,11',
     ' 7566': '7,67,98,23',
     ' 7567': '10,66,98,57',
     ' 7568': '15,67,100,65',
     ' 7569': '0,45,100,6',
     ' 7570': '0,48,98,10',
     ' 7571': '0,48,97,21',
     ' 7572': '0,50,93,32',
     ' 7573': '10,55,89,33',
     ' 7574': '12,55,92,36',
     ' 7575': '14,53,94,55',
     ' 7576': '6,50,76,0',
     ' 7577': '2,55,69,0',
     ' 7578': '0,67,100,0',
     ' 7579': '0,74,100,0',
     ' 7580': '0,77,97,15',
     ' 7581': '0,64,70,60',
     ' 7582': '0,49,66,75',
     ' 7583': '0,69,98,12',
     ' 7584': '0,70,100,17',
     ' 7585': '0,67,90,24',
     ' 7586': '0,69,89,41',
     ' 7587': '0,70,89,48',
     ' 7588': '0,55,69,65',
     ' 7589': '30,67,65,74',
     ' 7590': '11,27,33,0',
     ' 7591': '17,54,68,0',
     ' 7592': '0,69,85,24',
     ' 7593': '0,79,91,40',
     ' 7594': '0,67,70,60',
     ' 7595': '0,57,69,66',
     ' 7596': '28,79,90,76',
     ' 7597': '0,85,100,4',
     ' 7598': '0,85,100,10',
     ' 7599': '0,85,98,20',
     ' 7600': '0,78,83,55',
     ' 7601': '14,82,100,50',
     ' 7602': '11,68,95,62',
     ' 7603': '16,69,98,73',
     ' 7604': '0,8,5,4',
     ' 7605': '0,22,15,4',
     ' 7606': '0,41,29,6',
     ' 7607': '0,59,49,14',
     ' 7608': '0,76,72,31',
     ' 7609': '0,81,73,54',
     ' 7610': '0,77,60,72',
     ' 7611': '0,19,17,6',
     ' 7612': '14,39,37,0',
     ' 7613': '21,47,46,0',
     ' 7614': '35,50,49,0',
     ' 7615': '50,61,57,13',
     ' 7616': '50,65,57,28',
     ' 7617': '44,69,58,60',
     ' 7618': '12,63,72,0',
     ' 7619': '0,78,85,12',
     ' 7620': '0,95,94,28',
     ' 7621': '0,98,91,30',
     ' 7622': '0,97,89,45',
     ' 7623': '0,97,87,53',
     ' 7624': '0,97,87,60',
     ' 7625': '0,82,80,0',
     ' 7626': '0,93,95,2',
     ' 7627': '5,94,88,22',
     ' 7628': '8,93,78,33',
     ' 7629': '23,87,73,61',
     ' 7630': '26,86,80,69',
     ' 7631': '29,82,50,73',
     ' 7632': '0,9,4,8',
     ' 7633': '0,27,9,18',
     ' 7634': '15,68,23,0',
     ' 7635': '0,90,25,8',
     ' 7636': '0,100,45,12',
     ' 7637': '0,93,38,45',
     ' 7638': '0,91,33,52',
     ' 7639': '0,42,15,48',
     ' 7640': '0,79,24,41',
     ' 7641': '0,95,27,44',
     ' 7642': '0,86,5,64',
     ' 7643': '0,84,2,70',
     ' 7644': '5,81,0,79',
     ' 7645': '9,79,0,82',
     ' 7646': '33,61,26,0',
     ' 7647': '31,88,18,0',
     ' 7648': '22,100,0,16',
     ' 7649': '30,100,0,20',
     ' 7650': '34,98,0,41',
     ' 7651': '42,92,0,47',
     ' 7652': '42,92,0,50',
     ' 7653': '8,21,0,40',
     ' 7654': '34,55,10,0',
     ' 7655': '33,72,0,0',
     ' 7656': '45,90,0,4',
     ' 7657': '47,94,0,36',
     ' 7658': '40,86,0,50',
     ' 7659': '32,75,0,64',
     ' 7660': '37,37,17,0',
     ' 7661': '47,60,12,0',
     ' 7662': '60,87,5,0',
     ' 7663': '69,100,0,8',
     ' 7664': '74,100,0,10',
     ' 7665': '64,84,0,32',
     ' 7666': '75,80,50,0',
     ' 7667': '64,47,16,0',
     ' 7668': '67,56,8,0',
     ' 7669': '73,66,0,2',
     ' 7670': '80,74,0,0',
     ' 7671': '83,81,0,4',
     ' 7672': '85,84,0,6',
     ' 7673': '81,74,16,0',
     ' 7674': '50,41,4,0',
     ' 7675': '55,48,6,0',
     ' 7676': '61,64,3,0',
     ' 7677': '68,78,0,0',
     ' 7678': '74,85,0,0',
     ' 7679': '87,97,0,0',
     ' 7680': '87,99,0,8',
     ' 7681': '42,23,2,0',
     ' 7682': '63,37,2,0',
     ' 7683': '83,55,0,0',
     ' 7684': '90,64,0,0',
     ' 7685': '95,69,0,0',
     ' 7686': '100,73,0,10',
     ' 7687': '100,78,0,18',
     ' 7688': '69,19,4,0',
     ' 7689': '77,25,6,0',
     ' 7690': '95,41,10,0',
     ' 7691': '100,43,0,30',
     ' 7692': '100,45,0,45',
     ' 7693': '100,57,9,47',
     ' 7694': '100,57,9,52',
     ' 7695': '43,9,8,8',
     ' 7696': '56,9,9,21',
     ' 7697': '76,34,21,0',
     ' 7698': '65,9,0,53',
     ' 7699': '73,13,0,57',
     ' 7700': '84,17,0,57',
     ' 7701': '89,14,0,56',
     ' 7702': '68,1,8,8',
     ' 7703': '79,2,10,11',
     ' 7704': '93,4,8,24',
     ' 7705': '100,13,5,41',
     ' 7706': '100,16,10,44',
     ' 7707': '100,18,12,52',
     ' 7708': '100,18,12,59',
     ' 7709': '62,0,18,6',
     ' 7710': '81,0,23,0',
     ' 7711': '98,0,28,4',
     ' 7712': '100,0,28,20',
     ' 7713': '100,0,30,26',
     ' 7714': '96,0,30,45',
     ' 7715': '97,0,35,57',
     ' 7716': '83,0,40,11',
     ' 7717': '96,0,47,19',
     ' 7718': '98,0,48,40',
     ' 7719': '96,0,49,50',
     ' 7720': '89,0,45,60',
     ' 7721': '89,0,43,65',
     ' 7722': '89,0,45,72',
     ' 7723': '69,0,54,7',
     ' 7724': '82,0,67,11',
     ' 7725': '97,0,86,15',
     ' 7726': '100,0,93,29',
     ' 7727': '100,0,94,46',
     ' 7728': '93,0,75,55',
     ' 7729': '95,0,75,65',
     ' 7730': '68,0,71,18',
     ' 7731': '79,0,89,22',
     ' 7732': '89,0,96,30',
     ' 7733': '89,0,91,43',
     ' 7734': '77,0,82,65',
     ' 7735': '59,0,69,75',
     ' 7736': '56,0,58,78',
     ' 7737': '60,0,98,7',
     ' 7738': '74,0,98,2',
     ' 7739': '78,0,95,5',
     ' 7740': '75,0,95,15',
     ' 7741': '76,4,100,21',
     ' 7742': '71,5,100,45',
     ' 7743': '71,8,100,50',
     ' 7744': '18,0,98,10',
     ' 7745': '16,0,91,28',
     ' 7746': '17,0,88,39',
     ' 7747': '19,0,86,48',
     ' 7748': '20,2,86,50',
     ' 7749': '25,12,97,52',
     ' 7750': '25,15,94,58',
     ' 7751': '2,7,75,17',
     ' 7752': '2,13,88,14',
     ' 7753': '0,17,94,27',
     ' 7754': '0,16,85,50',
     ' 7755': '0,14,78,62',
     ' 7756': '0,14,75,70',
     ' 7757': '0,8,58,77',
     ' 7758': '1,0,97,14',
     ' 7759': '6,3,100,20',
     ' 7760': '16,17,97,48',
     ' 7761': '22,15,86,55',
     ' 7762': '40,20,80,60',
     ' 7763': '46,26,84,66',
     ' 7764': '46,29,84,68',
     ' 7765': '14,4,100,16',
     ' 7766': '14,5,100,24',
     ' 7767': '14,12,100,34',
     ' 7768': '15,19,82,45',
     ' 7769': '23,29,87,58',
     ' 7770': '32,37,75,68',
     ' 7771': '35,38,86,77',
     ' 9043': '8,6,10,0',

     ' 801': '90,5,5,0',
     ' 802': '35,0,60,0',
     ' 803': '0,0,70,0',
     ' 804': '0,20,35,0',
     ' 805': '0,40,25,0',
     ' 806': '0,50,0,0',
     ' 807': '15,75,0,0',
     ' 808': '80,0,40,0',
     ' 809': '10,0,100,0',
     ' 810': '0,10,35,0',
     ' 811': '0,25,25,0',
     ' 812': '0,50,15,0',
     ' 813': '0,70,0,0',
     ' 814': '55,60,0,0',
     ' 871': '20,25,60,25',
     ' 872': '20,30,70,15',
     ' 873': '30,30,60,10',
     ' 874': '0,20,50,30',
     ' 875': '30,40,70,0',
     ' 876': '30,50,85,0',
     ' 877': '0,0,0,40',

     // new metal
     ' 8960': '34,52,92,16',
     ' 8920': '30,62,70,13',

     ' Black 2': '39,43,80,91',
     ' Black 3': '67,44,67,95',
     ' Black 4': '41,57,72,90',
     ' Black 5': '42,69,37,85',
     ' Black 6': '100,79,44,93',
     ' Black 7': '38,35,33,92',
     ' Cool Gray 1': '4,2,4,8',
     ' Cool Gray 2': '5,3,5,11',
     ' Cool Gray 3': '8,5,7,16',
     ' Cool Gray 4': '12,8,9,23',
     ' Cool Gray 5': '13,9,10,27',
     ' Cool Gray 6': '16,11,11,27',
     ' Cool Gray 7': '20,14,12,40',
     ' Cool Gray 8': '23,16,13,46',
     ' Cool Gray 9': '30,22,17,57',
     ' Cool Gray 10': '40,30,20,66',
     ' Cool Gray 11': '44,34,22,77',
     ' Warm Gray 1': '3,3,6,7',
     ' Warm Gray 2': '6,7,10,11',
     ' Warm Gray 3': '9,11,13,20',
     ' Warm Gray 4': '11,13,15,27',
     ' Warm Gray 5': '11,13,16,32',
     ' Warm Gray 6': '14,19,21,39',
     ' Warm Gray 7': '16,23,23,44',
     ' Warm Gray 8': '17,24,25,49',
     ' Warm Gray 9': '23,32,34,51',
     ' Warm Gray 10': '24,34,35,60',
     ' Warm Gray 11': '26,36,38,68'

    };
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

}());

