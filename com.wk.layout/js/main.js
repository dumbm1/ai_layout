/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {
  'use strict';

  // Reloads extension panel
  function reloadPanel () {
    location.reload ();
  }

  var csInterface = new CSInterface ();

  function loadJSX (fileName) {
    var extensionRoot = csInterface.getSystemPath (SystemPath.EXTENSION) + "/jsx/";
    csInterface.evalScript ('$.evalFile("' + extensionRoot + fileName + '")');
  }

  function init () {

    themeManager.init ();
    loadJSX ("json2.js");

    $ ("#btnReset").click (reloadPanel);
    $ ("#btnKillCEP").click (function () {
      csInterface.evalScript ("killCEP()");
    });

    layout ();
    function layout () {
      var sorryMessage = 'Sorry. This element is in development..';
      var pantBook     = makePantoneBook ();
      addPantList (pantBook);
      searchPantByName ();
      makeEngines ();
      setChkHandler ();
      addOutColors ();

      var storeOpts = JSON.parse (localStorage.getItem ('opts'));

      if (storeOpts) {
        setNmb (storeOpts.nmb);
      } else {
        setNmb (defNmb ());
      }

      setTxt (defTxt ());
      setSel (defSel ());
      // setNmb (defNmb ());
      setCol (defCol ());
      setChk (defChk ());

      $ ("#btnFactoryDefaults").click (function () {
        var conf = confirm ('Are you sure that want to return to the factory defaults?');
        if (conf) {
          localStorage.clear ();
          setTxt (defTxt ());
          setSel (defSel ());
          setNmb (defNmb ());
          setCol (defCol ());
          setChk (defChk ());
        }
      });
      $ ('#btnSaveToProfile').click (function () {
        // alert(showObjDeep(getCol()));
        alert (sorryMessage);
      });
      $ ("#btnOk").click (function () {
        var opts = {}
        opts.txt = getTxt ();
        opts.sel = getSel ();
        opts.nmb = getNmb ();
        opts.col = getCol ();
        opts.chk = getChk ();

        csInterface.evalScript ('makeLayout(' + JSON.stringify (opts) + ')');
      });
      $ ('#btnSave').click (function () {
        var opts = {}
        opts.txt = getTxt ();
        opts.sel = getSel ();
        opts.nmb = getNmb ();
        opts.col = getCol ();
        opts.chk = getChk ();
        // show all
        localStorage.setItem ("opts", JSON.stringify (opts));
        // var storeOpts = JSON.parse (localStorage.getItem ('opts'));
        // csInterface.evalScript ('scrollWin(' + JSON.stringify (showObjDeep (storeOpts)) + ')');
      });
      $ ('#btnLoadFromProfile').click (function () {
        alert (sorryMessage);
      });
      $ ("#btnHelp").click (function () {
        alert ("mailto: m_js@bk.ru");
      });
      $ ('#btnSettings').click (function () {
       // alert (sorryMessage)
			 csInterface.requestOpenExtension('com.wk.ai_regexRepl', '');
      });
      $ ('.col-btn').click (function (e) {
        var targ = e.target;
        if (targ.className != 'hostButton col-btn-close-btn') {
          prompt ('shift', '5');
        }
      });

      /**
       * THE LIBRARY
       * */

      function setChkHandler () {

        $ ('input[type=checkbox].btn-link-chk').each (function () {

          if (this.checked == true) {
            $ (this).parent ().addClass ('btn-link-checked');
            $ (this).parent ().parent ().addClass ('btn-link-div-checked');
            $ (this).attr ('checked', 'checked');
          } else {
            $ (this).parent ().removeClass ('btn-link-checked');
            $ (this).parent ().parent ().removeClass ('btn-link-div-checked');
            $ (this).removeAttr ('checked');
          }
        });

        $ ('.btn-link-div').click (function () {
          var childDiv = $ (this).find ('.btn-link');
          var chkbx    = childDiv.find ('input');

          $ (this).toggleClass ('btn-link-div-checked', '');
          childDiv.toggleClass ('btn-link-checked', '');

          if (chkbx.attr ('checked') == 'checked') {
            chkbx.removeAttr ('checked');
          } else {
            chkbx.attr ('checked', 'checked');
          }
        });

      }

      /**
       * GETTERS
       * */
      function getTxt () {
        var txt = {};
        $ ("textarea").each (function () {
          var key  = $ (this).attr ("id");
          txt[key] = $ (this).val ();
        })
        return txt;
      }

      function getSel () {
        var sel = {};
        $ ("option:selected").each (function () {
          var key  = $ (this).parent ().attr ("id");
          sel[key] = $ (this).val ();
        })
        return sel;
      }

      function getNmb () {
        var nmb = {};
        $ ("input[type=number]").each (function () {
          var key  = $ (this).attr ("id");
          nmb[key] = $ (this).val ();
        })
        return nmb;
      }

      function getCol () {
        var colOut = [];
        var j      = 0;

        $ ('.col-btn').each (function () {
          var colName        = $ (this).find ('.col-btn-title:first').text ();
          var cmykComponents = '';
          for (var key in pantBook) {
            if (' ' + colName == key) {
              cmykComponents = pantBook[key];
              break;
            }
          }
          colOut[j] = {
            name:  colName,
            color: $ (this).css ('color'),
            bg:    $ (this).css ('background-color'),
            cmyk:  cmykComponents
          }
          j++;
        })

        /**
         * raname the duplicated colors
         * */
        function _renameDuplicatesInArr (colOut) {
          for (var i = 0; i < colOut.length; i++) {
            var current   = colOut[i].name;
            var duplIndex = 2;
            for (var k = i + 1; k < colOut.length; k++) {
              var remains = colOut[k].name;
              if (current == remains) {
                colOut[k].name += '#' + duplIndex;
                duplIndex++;
              }
            }
            duplIndex = 2;
          }
          return colOut;
        }

        return _renameDuplicatesInArr (colOut);
      }

      function getChk () {
        var chk = {};
        $ ("input[type=checkbox]").each (function () {
          var key  = $ (this).attr ("id");
          chk[key] = $ (this).attr ("checked") == "checked";
        })
        return chk;
      }

      /**
       * DEFAULTS
       * */

      function defTxt () {
        return {
          fileName: 'print-type_000000000_client-name_brand_product-title_poduct-weidth_additions',
        }
      }

      function defCol () {
        return [
          {name: "C", color: "black", bg: "cyan", cmyk: "100,0,0,0"},
          {name: "M", color: "white", bg: "magenta", cmyk: "0,100,0,0"},
          {name: "Y", color: "black", bg: "yellow", cmyk: "0,0,100,0"},
          {name: "K", color: "white", bg: "black", cmyk: "0,0,0,100"},
          {name: "W", color: "black", bg: "rgb(128, 128, 255)", cmyk: "50,50,0,0"},
          // {name: "Vr", color: "black", bg: "rgb(255, 128, 128)", cmyk: "0,50,50,0"},
          // {name: "Pr", color: "black", bg: "rgb(128, 255, 128)", cmyk: "50,0,50,0"},
        ];
      }

      function defNmb () {
        return {
          filmWidth:   320,
          layoutWidth: 300,

          margTop:   10,
          margBott:  10,
          margRight: 5,
          margLeft:  5,

          crossWidth:  4,
          crossHeight: 4,
          crossStroke: 0.15,
          railWidth:   4,

          indentOut: 1.5,
          indentIn:  1.5,

          shift_1: 0,
          shift_2: 0,
          shift_3: 0,
          shift_4: 0,
          shift_5: 0,
          shift_6: 0,
          shift_7: 0,
          shift_8: 0,
        }
      }

      function defChk () {
        return {
          margChkHorLink:  false,
          margChkVertLink: false,
          crossChkLink:    false,
          indentChkLink:   false,
        }
      }

      function defSel () {
        return {
          engineList: 'soloflex',
          z:          320,
        }
      }

      /**
       * SETTERS
       * */
      function setTxt (obj) {
        $ ("textarea").each (function () {
          for (var key in obj) {
            if (key == $ (this).attr ("id")) {
              $ (this).val (obj[key]);
            }
          }

        })
      }

      function setSel (obj) {
        $ ("select").each (function () {
          for (var key in obj) {
            if (key == $ (this).attr ('id')) {
              $ (this).find ('option').each (function () {
                if ($ (this).html () == obj[key]) {
                  $ (this).attr ('selected', 'selected');
                } else {
                  $ (this).removeAttr ('selected');
                }
              })
            }
          }
        })
      }

      // the shift paremeter is ignored
      function setNmb (obj) {

        $ ("input[type=number]").each (function () {
          for (var key in obj) {
            var re = /shift_\d/;
            if (key == $ (this).attr ("id") && !($ (this).attr ("id").match (re))) {
              $ (this).val (obj[key]);
            } else if ($ (this).attr ("id").match (re)) {
              $ (this).val (0);
            }
          }
        })
      }

      function setCol (arr) {
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
        var containter       = document.getElementById ('colBtns');
        containter.innerHTML = '';
        for (var i = 0; i < arr.length; i++) {
          var obj = arr[i];
          makeColBtn (obj.name, obj.color, obj.bg);
        }
      }

      function setChk (obj) {
        $ (':checkbox').each (function () {
          for (var key in obj) {
            if (key == $ (this).attr ("id")) {
              if (!obj[key]) {
                $ (this).removeAttr ("checked");
                $ (this).parent ().removeClass ('btn-link-checked');
                $ (this).parent ().parent ().removeClass ('btn-link-div-checked');
              } else {
                $ (this).attr ("checked", "checked");
                $ (this).parent ().addClass ('btn-link-checked');
                $ (this).parent ().parent ().addClass ('btn-link-div-checked');
              }
            }
          }
        })
      }

      /**
       * @param {String} engineName - 'mira' or 'solo'
       * @return {Array} miraflex or soloflex cylinder diameter values
       * */
      function makeEngines () {
        var soloflex   = [ // формный цилиндр Soloflex
          260, 265, 270, 275, 280, 285, 290,
          300, 305, 310, 315, 320, 330, 340, 350, 355, 360, 365, 370, 380, 390,
          400, 410, 420, 430, 440, 450, 460, 480, 495,
          500, 510, 520, 540, 560, 580,
          600
        ];
        var miraflex   = [ // формный цилиндр Miraflex
          300, 320, 330, 340, 350, 360, 370, 380, 390,
          400, 410, 420, 430, 440, 450, 460, 480,
          500, 520, 530, 540, 550, 560, 580,
          600, 640
        ];
        var z          = document.getElementById ('z');
        var engineList = document.getElementById ('engineList');
        _loadCylinders ();
        engineList.addEventListener ('change', _loadCylinders);

        function _loadCylinders () {
          if (engineList.value == 'miraflex') {
            z.innerHTML = '';

            for (var i = 0; i < miraflex.length; i++) {
              var optElem       = document.createElement ('option');
              optElem.innerHTML = miraflex[i];
              z.appendChild (optElem);
            }
          } else  /*if (engineList.value == 'soloflex')*/ {
            z.innerHTML = '';
            for (var i = 0; i < soloflex.length; i++) {
              var optElem       = document.createElement ('option');
              optElem.innerHTML = soloflex[i];
              z.appendChild (optElem);

            }
          }
        }

      }

      function searchPantByName () {
        var searchFld   = document.getElementById ('pantSearch');
        var pantListDiv = document.getElementById ('pantList');
        var pantUl      = pantListDiv.getElementsByTagName ('ul')[0];
        var pantLiElems = pantUl.getElementsByTagName ('li');

        searchFld.addEventListener ('input', function () {
          var elemVal = this.value;

          for (var i = 0; i < pantLiElems.length; i++) {
            var elem       = pantLiElems[i];
            var liElemText = ((elem.getElementsByTagName ('span')[0].textContent).slice (0)).toLowerCase ();
            var re         = elemVal.toLowerCase ();
            if (!~liElemText.search (re)) {
              elem.className = 'hidden';
              // elem.style.display = 'none'; // cose the css-li style has a hight preority
            } else {
              elem.className = '';
              // elem.style.display = 'inline-block';
            }
          }
        })
      }

      function addPantList (pantBook) {
        var pntDiv = document.getElementById ('pantList').getElementsByTagName ('div')[0],
            ul     = document.createElement ('ul');

        for (var key in pantBook) {
          var li    = document.createElement ('li'),
              spn   = document.createElement ('span'),
              bgCol = convertCmykToRgb (pantBook[key]),
              fgCol = getContrastYIQ (bgCol);

          spn.innerHTML = key.slice (1);
          li.appendChild (spn);
          ul.appendChild (li);
          li.style.backgroundColor = 'rgb(' + bgCol.join (',') + ')';
          spn.style.color          = fgCol;
          // li.setAttribute ('title', key);
        }
        pntDiv.appendChild (ul); // затем в документ
        ul.setAttribute ('id', 'pantListUl');

        /**
         * @param {String} cmykValue - 4 naumbers with comma-ceparator
         * @return {Array} _rgb the array of RGB chennels values
         * */
        function convertCmykToRgb (cmykValue) {
          var _cmyk = cmykValue.split (','),
              _rgb  = [];
          _rgb.push (Math.ceil (255 * (1 - _cmyk[0] / 100) * ( 1 - _cmyk[3] / 100)));
          _rgb.push (Math.ceil (255 * (1 - _cmyk[1] / 100) * ( 1 - _cmyk[3] / 100)));
          _rgb.push (Math.ceil (255 * (1 - _cmyk[2] / 100) * ( 1 - _cmyk[3] / 100)));

          return _rgb;
        }

        /**
         * by Brian Suda http://suda.co.uk
         * @param {Array} col - array contains three RGB number values
         * */
        function getContrastYIQ (rgbColor) {
          var r, g, b, yiq;

          r = parseInt (rgbColor[0]);
          g = parseInt (rgbColor[1]);
          b = parseInt (rgbColor[2]);

          yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
          return (yiq >= 128) ? 'black' : 'white'; // original
          // return (yiq >= 92) ? 'black' : 'white'; // my test (it's no bad too
        }
      }

      function addOutColors () {

        var pantList = document.getElementById ('pantList')/*,
         mainCols = document.getElementById ('mainCols')*/;

        // mainCols.addEventListener ('mousedown', function (e) {
        //   _addColBtn (e);
        // });

        pantList.addEventListener ('mousedown', function (e) {
          _addColBtn (e);
        });

        function _addColBtn (e) {
          var targ = e.target,
              col, bgCol, txt;

          if (targ.nodeName == 'UL') return;

          if (targ.nodeName == 'SPAN') {
            txt   = targ.textContent;
            col   = targ.style.color || window.getComputedStyle (targ).color;
            targ  = targ.parentNode;
            bgCol = targ.style.backgroundColor || window.getComputedStyle (targ).backgroundColor;
            makeColBtn (txt, col, bgCol);
            return;
          }

          if (targ.nodeName == 'LI') {
            bgCol = targ.style.backgroundColor || window.getComputedStyle (targ).backgroundColor;
            targ  = targ.getElementsByTagName ('span')[0];
            col   = targ.style.color || window.getComputedStyle (targ).color;
            txt   = targ.textContent;
            makeColBtn (txt, col, bgCol);
            return;
          }

        }

      }

      function makeColBtn (/*txt, col, bgCol*/) {
        var txt       = arguments[0],
            col       = arguments[1],
            bgCol     = arguments[2],
            container = document.getElementById ('colBtns'),
            colLen    = 8,
            btnsLen   = container.getElementsByClassName ('col-btn').length;

        if (btnsLen == colLen) return;

        var btn      = document.createElement ('div'),
            btnTitle = document.createElement ('span'),
            btnClose = document.createElement ('span');

        btn.className      = 'col-btn';
        btnTitle.className = 'col-btn-title';
        btnClose.className = 'hostButton col-btn-close-btn';

        btn.style.backgroundColor = bgCol;
        btn.style.color           = col;
        btnTitle.innerHTML        = txt;
        btnClose.innerHTML        = '&#xd7';

        btnClose.addEventListener ('click', function (e) {
          ((this.parentNode).parentNode).removeChild (this.parentNode);
        })

        btn.appendChild (btnTitle);
        btn.appendChild (btnClose);
        container.appendChild (btn);
      }

      function showObjDeep (obj) {
        var str    = '{\n';
        var indent = 1;

        showObj (obj);

        function showObj (obj) {

          for (var key in obj) {
            if (typeof obj[key] == 'object' /*&& !obj[key].splice*/) {
              str += addIndent (indent) + key + ':\n';
              ++indent;
              showObj (obj[key]);
            } else {
              str += addIndent (indent) + key + ': ' + obj[key] + ' [' + typeof obj[key] + '],\n';
            }
          }
          indent--;
        }

        return str + '}';
        function addIndent (i) {
          return new Array (i).join ('_');
        }
      }

      /**
       * @return {Object}  { "pantone_name": "c,m,y,k"}
       */
      function makePantoneBook () {
        return {
          " Pr":              "50,0,50,0",
          " W":               "50,50,0,0",
          " C":               "100,0,0,0",
          " M":               "0,100,0,0",
          " Y":               "0,0,100,0",
          " K":               "0,0,0,100",
          " Vr":              "0,50,50,0",
          " Process Yellow":  "0,0,100,0",
          " Process Magenta": "0,100,0,0",
          " Process Cyan":    "100,0,0,0",
          " Process Black":   "0,0,0,100",
          " Yellow 012":      "0,1,100,0",
          " Orange 021":      "0,53,100,0",
          " Warm Red":        "0,75,90,0",
          " Red 032":         "0,90,86,0",
          " Rubine Red":      "0,100,15,4",
          " Rhodamine Red":   "3,89,0,0",
          " Purple":          "38,88,0,0",
          " Violet":          "98,100,0,0",
          " Blue 072":        "100,88,0,5",
          " Reflex Blue":     "100,73,0,2",
          " Process Blue":    "100,10,0,10",
          " Green":           "100,0,59,0",
          " Black":           "0,13,49,98",
          " 100":             "0,0,51,0",
          " 101":             "0,0,79,0",
          " 102":             "0,0,95,0",
          " 103":             "0,3,100,18",
          " 104":             "0,3,100,30",
          " 105":             "0,3,100,50",
          " 106":             "0,2,69,0",
          " 107":             "0,4,79,0",
          " 108":             "0,6,95,0",
          " 109":             "0,10,100,0",
          " 110":             "0,12,100,7",
          " 111":             "0,11,100,27",
          " 112":             "0,10,100,38",
          " 113":             "0,7,66,0",
          " 114":             "0,8,73,0",
          " 115":             "0,9,80,0",
          " 116":             "0,16,100,0",
          " 117":             "0,18,100,15",
          " 118":             "0,18,100,27",
          " 119":             "0,12,100,49",
          " 120":             "0,9,58,0",
          " 121":             "0,11,69,0",
          " 122":             "0,17,80,0",
          " 123":             "0,24,94,0",
          " 124":             "0,28,100,6",
          " 125":             "0,26,100,26",
          " 126":             "0,25,100,37",
          " 1205":            "0,5,31,0",
          " 1215":            "0,9,45,0",
          " 1225":            "0,17,62,0",
          " 1235":            "0,29,91,0",
          " 1245":            "0,28,100,18",
          " 1255":            "0,27,100,34",
          " 1265":            "0,27,100,51",
          " 127":             "0,7,50,0",
          " 128":             "0,11,65,0",
          " 129":             "0,16,77,0",
          " 130":             "0,30,100,0",
          " 131":             "0,32,100,9",
          " 132":             "0,28,100,30",
          " 133":             "0,20,100,56",
          " 134":             "0,11,45,0",
          " 135":             "0,19,60,0",
          " 136":             "0,27,76,0",
          " 137":             "0,35,90,0",
          " 138":             "0,42,100,1",
          " 139":             "0,37,100,23",
          " 140":             "0,27,100,54",
          " 1345":            "0,14,47,0",
          " 1355":            "0,20,56,0",
          " 1365":            "0,29,72,0",
          " 1375":            "0,40,90,0",
          " 1385":            "0,44,100,7",
          " 1395":            "0,41,100,37",
          " 1405":            "0,36,100,63",
          " 141":             "0,19,51,0",
          " 142":             "0,28,76,0",
          " 143":             "0,35,85,0",
          " 144":             "0,48,100,0",
          " 145":             "0,47,100,8",
          " 146":             "0,43,100,33",
          " 147":             "0,28,100,56",
          " 148":             "0,16,37,0",
          " 149":             "0,23,47,0",
          " 150":             "0,35,70,0",
          " 151":             "0,48,95,0",
          " 152":             "0,51,100,1",
          " 153":             "0,46,100,18",
          " 154":             "0,46,100,34",
          " 1485":            "0,27,54,0",
          " 1495":            "0,33,67,0",
          " 1505":            "0,42,77,0",
          " 1525":            "0,58,100,10",
          " 1535":            "0,53,100,38",
          " 1545":            "0,53,100,72",
          " 155":             "0,12,28,0",
          " 156":             "0,22,42,0",
          " 157":             "0,43,70,0",
          " 158":             "0,61,97,0",
          " 159":             "0,66,100,7",
          " 160":             "0,62,100,32",
          " 161":             "0,52,100,64",
          " 1555":            "0,22,34,0",
          " 1565":            "0,34,49,0",
          " 1575":            "0,45,72,0",
          " 1585":            "0,56,90,0",
          " 1595":            "0,59,100,5",
          " 1605":            "0,56,100,30",
          " 1615":            "0,56,100,43",
          " 162":             "0,15,22,0",
          " 163":             "0,31,44,0",
          " 164":             "0,46,73,0",
          " 165":             "0,59,96,0",
          " 166":             "0,64,100,0",
          " 167":             "0,60,100,17",
          " 168":             "0,57,100,59",
          " 1625":            "0,31,37,0",
          " 1635":            "0,39,48,0",
          " 1645":            "0,49,66,0",
          " 1655":            "0,63,91,0",
          " 1665":            "0,68,100,0",
          " 1675":            "0,67,100,28",
          " 1685":            "0,68,100,44",
          " 169":             "0,20,20,0",
          " 170":             "0,40,44,0",
          " 171":             "0,53,68,0",
          " 172":             "0,66,88,0",
          " 173":             "0,69,100,4",
          " 174":             "0,70,100,36",
          " 175":             "0,65,100,60",
          " 176":             "0,25,18,0",
          " 177":             "0,45,40,0",
          " 178":             "0,59,56,0",
          " 179":             "0,79,100,0",
          " 180":             "0,79,100,11",
          " 181":             "0,74,100,47",
          " 1765":            "0,38,21,0",
          " 1775":            "0,47,29,0",
          " 1785":            "0,67,50,0",
          " 1788":            "0,84,88,0",
          " 1795":            "0,94,100,0",
          " 1805":            "0,91,100,23",
          " 1815":            "0,90,100,51",
          " 1767":            "0,27,12,0",
          " 1777":            "0,58,36,0",
          " 1787":            "0,76,60,0",
          " 1797":            "0,100,99,4",
          " 1807":            "0,100,96,28",
          " 1817":            "0,90,100,66",
          " 182":             "0,26,10,0",
          " 183":             "0,46,21,0",
          " 184":             "0,68,41,0",
          " 185":             "0,91,76,0",
          " 186":             "0,100,81,4",
          " 187":             "0,100,79,20",
          " 188":             "0,97,100,50",
          " 189":             "0,37,10,0",
          " 190":             "0,55,22,0",
          " 191":             "0,76,38,0",
          " 192":             "0,100,68,0",
          " 193":             "0,100,66,13",
          " 194":             "0,100,64,33",
          " 195":             "0,100,60,55",
          " 1895":            "0,28,7,0",
          " 1905":            "0,41,9,0",
          " 1915":            "0,71,20,0",
          " 1925":            "0,100,55,0",
          " 1935":            "0,100,57,5",
          " 1945":            "0,100,56,19",
          " 1955":            "0,100,60,37",
          " 196":             "0,25,4,0",
          " 197":             "0,45,10,0",
          " 198":             "0,78,33,0",
          " 199":             "0,100,62,0",
          " 200":             "0,100,63,12",
          " 201":             "0,100,63,29",
          " 202":             "0,100,61,43",
          " 203":             "0,34,3,0",
          " 204":             "0,58,3,0",
          " 205":             "0,84,9,0",
          " 206":             "0,100,38,3",
          " 207":             "0,100,43,19",
          " 208":             "0,100,36,37",
          " 209":             "0,100,34,53",
          " 210":             "0,39,6,0",
          " 211":             "0,55,8,0",
          " 212":             "0,72,11,0",
          " 213":             "0,95,27,0",
          " 214":             "0,100,34,8",
          " 215":             "0,100,35,27",
          " 216":             "0,95,40,49",
          " 217":             "0,28,0,0",
          " 218":             "2,61,0,0",
          " 219":             "1,88,0,0",
          " 220":             "0,100,13,17",
          " 221":             "0,100,15,30",
          " 222":             "0,100,10,59",
          " 223":             "0,46,0,0",
          " 224":             "1,63,0,0",
          " 225":             "1,83,0,0",
          " 226":             "0,99,0,0",
          " 227":             "0,100,7,19",
          " 228":             "0,100,4,41",
          " 229":             "0,100,15,60",
          " 230":             "0,34,0,0",
          " 231":             "1,52,0,0",
          " 232":             "3,67,0,0",
          " 233":             "11,100,0,0",
          " 234":             "6,100,0,26",
          " 235":             "5,100,0,40",
          " 236":             "1,30,0,0",
          " 237":             "3,49,0,0",
          " 238":             "6,63,0,0",
          " 239":             "11,79,0,0",
          " 240":             "18,94,0,0",
          " 241":             "27,100,0,2",
          " 242":             "10,100,0,49",
          " 2365":            "2,27,0,0",
          " 2375":            "10,57,0,0",
          " 2385":            "19,79,0,0",
          " 2395":            "27,95,0,0",
          " 2405":            "34,100,0,0",
          " 2415":            "33,100,0,8",
          " 2425":            "37,100,0,26",
          " 243":             "5,29,0,0",
          " 244":             "9,38,0,0",
          " 245":             "14,53,0,0",
          " 246":             "29,90,0,0",
          " 247":             "36,100,0,0",
          " 248":             "40,100,0,2",
          " 249":             "40,100,0,28",
          " 250":             "5,18,0,0",
          " 251":             "13,39,0,0",
          " 252":             "24,56,0,0",
          " 253":             "43,95,0,0",
          " 254":             "50,100,0,0",
          " 255":             "51,100,0,25",
          " 256":             "7,20,0,0",
          " 257":             "14,34,0,0",
          " 258":             "43,76,0,0",
          " 259":             "55,100,0,15",
          " 260":             "52,100,0,26",
          " 261":             "48,100,0,40",
          " 262":             "45,100,0,55",
          " 2562":            "19,35,0,0",
          " 2572":            "30,47,0,0",
          " 2582":            "46,72,0,0",
          " 2592":            "60,90,0,0",
          " 2602":            "63,100,0,3",
          " 2612":            "64,100,0,14",
          " 2622":            "57,98,0,46",
          " 2563":            "22,33,0,0",
          " 2573":            "30,43,0,0",
          " 2583":            "46,63,0,0",
          " 2593":            "61,89,0,0",
          " 2603":            "69,100,0,2",
          " 2613":            "63,100,0,15",
          " 2623":            "59,100,0,32",
          " 2567":            "29,36,0,0",
          " 2577":            "40,45,0,0",
          " 2587":            "59,66,0,0",
          " 2597":            "85,100,0,0",
          " 2607":            "81,100,0,7",
          " 2617":            "79,100,0,15",
          " 2627":            "77,100,0,31",
          " 263":             "10,14,0,0",
          " 264":             "26,28,0,0",
          " 265":             "54,56,0,0",
          " 266":             "79,90,0,0",
          " 267":             "89,100,0,0",
          " 268":             "82,100,0,12",
          " 269":             "78,100,0,33",
          " 2635":            "28,27,0,0",
          " 2645":            "40,36,0,0",
          " 2655":            "54,49,0,0",
          " 2665":            "62,60,0,0",
          " 2685":            "96,100,0,10",
          " 2695":            "91,100,0,49",
          " 270":             "31,27,0,0",
          " 271":             "43,37,0,0",
          " 272":             "58,48,0,0",
          " 273":             "100,96,0,8",
          " 274":             "100,100,0,28",
          " 275":             "98,100,0,43",
          " 276":             "100,100,0,58",
          " 2705":            "40,30,0,0",
          " 2715":            "57,45,0,0",
          " 2725":            "77,68,0,0",
          " 2735":            "100,95,0,3",
          " 2745":            "100,95,0,15",
          " 2755":            "100,97,0,30",
          " 2765":            "100,97,0,45",
          " 2706":            "19,9,0,0",
          " 2716":            "45,29,0,0",
          " 2726":            "79,66,0,0",
          " 2736":            "100,91,0,0",
          " 2746":            "100,92,0,10",
          " 2756":            "100,94,0,29",
          " 2766":            "100,94,0,47",
          " 2707":            "17,6,0,0",
          " 2717":            "29,12,0,0",
          " 2727":            "71,42,0,0",
          " 2747":            "100,85,0,13",
          " 2757":            "100,82,0,30",
          " 2767":            "100,78,0,54",
          " 2708":            "26,10,0,0",
          " 2718":            "67,41,0,0",
          " 2728":            "96,69,0,0",
          " 2738":            "100,87,0,2",
          " 2748":            "100,88,0,14",
          " 2758":            "100,80,0,26",
          " 2768":            "100,78,0,44",
          " 277":             "27,7,0,0",
          " 278":             "39,14,0,0",
          " 279":             "68,34,0,0",
          " 280":             "100,72,0,18",
          " 281":             "100,72,0,32",
          " 282":             "100,68,0,54",
          " 283":             "35,9,0,0",
          " 284":             "55,19,0,0",
          " 285":             "89,43,0,0",
          " 286":             "100,66,0,2",
          " 287":             "100,68,0,12",
          " 288":             "100,67,0,23",
          " 289":             "100,64,0,60",
          " 290":             "25,2,0,0",
          " 291":             "33,3,0,0",
          " 292":             "49,11,0,0",
          " 293":             "100,57,0,2",
          " 294":             "100,58,0,21",
          " 295":             "100,57,0,40",
          " 296":             "100,46,0,70",
          " 2905":            "41,2,0,0",
          " 2915":            "59,7,0,0",
          " 2925":            "85,24,0,0",
          " 2935":            "100,46,0,0",
          " 2945":            "100,45,0,14",
          " 2955":            "100,45,0,37",
          " 2965":            "100,38,0,64",
          " 297":             "49,1,0,0",
          " 298":             "69,7,0,0",
          " 299":             "85,19,0,0",
          " 300":             "100,44,0,0",
          " 301":             "100,45,0,18",
          " 302":             "100,25,0,50",
          " 303":             "100,11,0,74",
          " 2975":            "30,0,5,0",
          " 2985":            "59,0,6,0",
          " 2995":            "90,11,0,0",
          " 3005":            "100,34,0,2",
          " 3015":            "100,30,0,20",
          " 3025":            "100,17,0,51",
          " 3035":            "100,0,5,72",
          " 304":             "30,0,8,0",
          " 305":             "51,0,9,0",
          " 306":             "75,0,7,0",
          " 307":             "100,16,0,27",
          " 308":             "100,5,0,47",
          " 309":             "100,0,9,72",
          " 310":             "43,0,10,0",
          " 311":             "63,0,12,0",
          " 312":             "96,0,11,0",
          " 313":             "100,0,8,13",
          " 314":             "100,0,9,30",
          " 315":             "100,0,12,43",
          " 316":             "100,0,27,68",
          " 3105":            "43,0,12,0",
          " 3115":            "63,0,18,0",
          " 3125":            "83,0,21,0",
          " 3135":            "100,0,16,9",
          " 3145":            "100,0,19,23",
          " 3155":            "100,0,24,38",
          " 3165":            "100,0,28,65",
          " 317":             "18,0,8,0",
          " 318":             "38,0,15,0",
          " 319":             "52,0,19,0",
          " 320":             "100,0,31,7",
          " 321":             "100,0,31,23",
          " 322":             "100,0,33,35",
          " 323":             "100,0,38,47",
          " 324":             "28,0,12,0",
          " 325":             "56,0,26,0",
          " 326":             "87,0,38,0",
          " 327":             "100,0,44,17",
          " 328":             "100,0,45,32",
          " 329":             "100,0,46,46",
          " 330":             "100,0,48,60",
          " 3242":            "37,0,18,0",
          " 3252":            "47,0,24,0",
          " 3262":            "71,0,33,0",
          " 3272":            "100,0,44,0",
          " 3282":            "100,0,46,15",
          " 3292":            "100,0,49,46",
          " 3302":            "100,0,54,69",
          " 3245":            "34,0,19,0",
          " 3255":            "49,0,28,0",
          " 3265":            "69,0,37,0",
          " 3275":            "95,0,47,0",
          " 3285":            "100,0,50,7",
          " 3295":            "100,0,53,21",
          " 3305":            "100,0,61,61",
          " 3248":            "43,0,24,0",
          " 3258":            "59,0,33,0",
          " 3268":            "90,0,49,0",
          " 3278":            "100,0,55,5",
          " 3288":            "100,0,54,20",
          " 3298":            "100,0,57,42",
          " 3308":            "100,0,60,72",
          " 331":             "24,0,16,0",
          " 332":             "30,0,20,0",
          " 333":             "43,0,27,0",
          " 334":             "100,0,60,3",
          " 335":             "100,0,65,30",
          " 336":             "100,0,67,47",
          " 337":             "31,0,20,0",
          " 338":             "47,0,32,0",
          " 339":             "84,0,56,0",
          " 340":             "100,0,66,9",
          " 341":             "100,0,67,29",
          " 342":             "100,0,71,43",
          " 343":             "98,0,72,61",
          " 3375":            "35,0,25,0",
          " 3385":            "45,0,33,0",
          " 3395":            "61,0,45,0",
          " 3405":            "85,0,65,0",
          " 3415":            "100,0,77,22",
          " 3425":            "100,0,78,42",
          " 3435":            "100,0,81,66",
          " 344":             "27,0,23,0",
          " 345":             "38,0,32,0",
          " 346":             "55,0,47,0",
          " 347":             "100,0,86,3",
          " 348":             "100,0,85,24",
          " 349":             "100,0,91,42",
          " 350":             "79,0,100,75",
          " 351":             "17,0,16,0",
          " 352":             "27,0,25,0",
          " 353":             "38,0,36,0",
          " 354":             "80,0,90,0",
          " 355":             "94,0,100,0",
          " 356":             "95,0,100,27",
          " 357":             "80,0,100,56",
          " 358":             "27,0,38,0",
          " 359":             "36,0,49,0",
          " 360":             "58,0,80,0",
          " 361":             "69,0,100,0",
          " 362":             "70,0,100,9",
          " 363":             "68,0,100,24",
          " 364":             "65,0,100,42",
          " 365":             "12,0,29,0",
          " 366":             "20,0,44,0",
          " 367":             "32,0,59,0",
          " 368":             "57,0,100,0",
          " 369":             "59,0,100,7",
          " 370":             "56,0,100,27",
          " 371":             "43,0,100,56",
          " 372":             "10,0,33,0",
          " 373":             "16,0,46,0",
          " 374":             "24,0,57,0",
          " 375":             "41,0,78,0",
          " 376":             "50,0,100,0",
          " 377":             "45,0,100,24",
          " 378":             "34,0,100,60",
          " 379":             "9,0,58,0",
          " 380":             "13,0,72,0",
          " 381":             "20,0,91,0",
          " 382":             "29,0,100,0",
          " 383":             "20,0,100,19",
          " 384":             "18,0,100,31",
          " 385":             "3,0,100,58",
          " 386":             "6,0,56,0",
          " 387":             "10,0,74,0",
          " 388":             "14,0,79,0",
          " 389":             "20,0,85,0",
          " 390":             "22,0,100,8",
          " 391":             "13,0,100,33",
          " 392":             "7,0,100,49",
          " 393":             "3,0,55,0",
          " 394":             "6,0,76,0",
          " 395":             "8,0,85,0",
          " 396":             "11,0,94,0",
          " 397":             "10,0,100,11",
          " 398":             "7,0,100,28",
          " 399":             "0,0,100,43",
          " 3935":            "1,0,68,0",
          " 3945":            "3,0,85,0",
          " 3955":            "6,0,100,0",
          " 3965":            "8,0,100,0",
          " 3975":            "0,0,100,29",
          " 3985":            "0,3,100,41",
          " 3995":            "0,3,100,64",
          " 400":             "0,3,6,16",
          " 401":             "0,5,11,23",
          " 402":             "0,6,14,31",
          " 403":             "0,7,17,43",
          " 404":             "0,8,22,56",
          " 405":             "0,10,33,72",
          " 406":             "0,5,6,16",
          " 407":             "0,8,9,26",
          " 408":             "0,10,11,34",
          " 409":             "0,13,15,45",
          " 410":             "0,18,21,56",
          " 411":             "0,27,36,72",
          " 412":             "0,30,66,98",
          " 413":             "0,0,9,20",
          " 414":             "0,0,10,30",
          " 415":             "0,0,12,41",
          " 416":             "0,0,16,50",
          " 417":             "1,0,25,65",
          " 418":             "3,0,31,75",
          " 419":             "29,0,36,100",
          " 420":             "0,0,0,15",
          " 421":             "0,0,0,26",
          " 422":             "0,0,0,33",
          " 423":             "0,0,0,44",
          " 424":             "0,0,0,61",
          " 425":             "0,0,0,77",
          " 426":             "0,0,0,99",
          " 427":             "0,0,0,11",
          " 428":             "2,0,0,18",
          " 429":             "3,0,0,32",
          " 430":             "5,0,0,45",
          " 431":             "11,1,0,64",
          " 432":             "23,2,0,77",
          " 433":             "33,3,0,95",
          " 434":             "7,9,10,0",
          " 435":             "13,15,15,0",
          " 436":             "24,25,26,0",
          " 437":             "46,45,49,0",
          " 438":             "75,68,100,10",
          " 439":             "80,73,100,20",
          " 440":             "82,76,100,30",
          " 441":             "6,0,7,9",
          " 442":             "8,0,9,19",
          " 443":             "12,0,12,30",
          " 444":             "15,0,15,42",
          " 445":             "20,0,20,65",
          " 446":             "21,0,23,75",
          " 447":             "16,0,31,82",
          " 448":             "65,58,100,35",
          " 449":             "65,55,100,28",
          " 450":             "60,50,100,22",
          " 451":             "33,28,58,0",
          " 452":             "24,18,42,0",
          " 453":             "14,10,27,0",
          " 454":             "9,6,17,0",
          " 4485":            "0,26,100,69",
          " 4495":            "0,20,95,46",
          " 4505":            "0,15,78,36",
          " 4515":            "0,9,50,24",
          " 4525":            "0,7,39,17",
          " 4535":            "0,4,30,11",
          " 4545":            "0,3,19,6",
          " 455":             "0,17,100,65",
          " 456":             "0,15,100,43",
          " 457":             "0,15,100,28",
          " 458":             "10,10,73,0",
          " 459":             "6,7,55,0",
          " 460":             "4,5,44,0",
          " 461":             "3,3,35,0",
          " 462":             "50,58,100,45",
          " 463":             "30,56,100,37",
          " 464":             "10,49,100,35",
          " 465":             "20,32,58,0",
          " 466":             "12,22,43,0",
          " 467":             "9,15,34,0",
          " 468":             "6,9,23,0",
          " 4625":            "0,60,100,79",
          " 4635":            "0,48,96,44",
          " 4645":            "0,37,68,28",
          " 4655":            "0,26,45,18",
          " 4665":            "0,18,32,10",
          " 4675":            "0,11,21,6",
          " 4685":            "0,7,14,4",
          " 469":             "0,52,100,62",
          " 470":             "0,58,100,33",
          " 471":             "0,59,100,18",
          " 472":             "0,34,52,0",
          " 473":             "0,23,36,0",
          " 474":             "0,15,26,0",
          " 475":             "0,11,20,0",
          " 4695":            "0,81,100,77",
          " 4705":            "0,62,71,49",
          " 4715":            "0,42,45,34",
          " 4725":            "0,32,35,25",
          " 4735":            "0,22,23,15",
          " 4745":            "0,17,18,10",
          " 4755":            "0,10,12,6",
          " 476":             "57,80,100,45",
          " 477":             "50,85,100,35",
          " 478":             "40,86,100,30",
          " 479":             "30,48,57,0",
          " 480":             "15,29,33,0",
          " 481":             "9,19,23,0",
          " 482":             "5,11,15,0",
          " 483":             "0,91,100,60",
          " 484":             "0,95,100,29",
          " 485":             "0,95,100,0",
          " 486":             "0,47,41,0",
          " 487":             "0,35,28,0",
          " 488":             "0,26,19,0",
          " 489":             "0,15,11,0",
          " 490":             "0,74,100,72",
          " 491":             "0,79,100,52",
          " 492":             "0,70,66,30",
          " 493":             "0,46,23,5",
          " 494":             "0,33,13,0",
          " 495":             "0,24,11,0",
          " 496":             "0,16,9,0",
          " 497":             "0,70,100,78",
          " 498":             "0,64,100,60",
          " 499":             "0,58,100,49",
          " 500":             "0,38,21,11",
          " 501":             "0,27,13,3",
          " 502":             "0,18,10,1",
          " 503":             "0,11,8,0",
          " 4975":            "0,73,100,80",
          " 4985":            "0,59,48,48",
          " 4995":            "0,48,38,34",
          " 5005":            "0,38,27,23",
          " 5015":            "0,25,15,11",
          " 5025":            "0,18,12,7",
          " 5035":            "0,10,9,3",
          " 504":             "65,100,100,35",
          " 505":             "50,100,100,25",
          " 506":             "45,100,100,15",
          " 507":             "11,45,22,0",
          " 508":             "4,34,11,0",
          " 509":             "0,24,7,0",
          " 510":             "0,17,6,0",
          " 511":             "60,100,45,30",
          " 512":             "50,100,15,10",
          " 513":             "44,83,0,0",
          " 514":             "15,50,0,0",
          " 515":             "7,38,0,0",
          " 516":             "3,27,0,0",
          " 517":             "0,18,0,0",
          " 5115":            "75,100,70,15",
          " 5125":            "65,86,49,0",
          " 5135":            "47,64,28,0",
          " 5145":            "30,44,13,0",
          " 5155":            "17,29,8,0",
          " 5165":            "8,17,5,0",
          " 5175":            "5,10,3,0",
          " 518":             "70,100,55,25",
          " 519":             "67,100,30,10",
          " 520":             "64,100,12,0",
          " 521":             "27,47,0,0",
          " 522":             "17,37,0,0",
          " 523":             "10,26,0,0",
          " 524":             "6,15,0,0",
          " 5185":            "80,100,85,25",
          " 5195":            "72,90,75,15",
          " 5205":            "50,58,50,0",
          " 5215":            "28,35,24,0",
          " 5225":            "17,25,15,0",
          " 5235":            "10,15,10,0",
          " 5245":            "6,8,7,0",
          " 525":             "84,100,45,5",
          " 526":             "76,100,7,0",
          " 527":             "73,100,0,0",
          " 528":             "41,55,0,0",
          " 529":             "26,40,0,0",
          " 530":             "18,31,0,0",
          " 531":             "10,20,0,0",
          " 5255":            "100,80,0,55",
          " 5265":            "77,70,0,40",
          " 5275":            "60,47,0,30",
          " 5285":            "31,27,0,20",
          " 5295":            "20,15,0,10",
          " 5305":            "14,10,0,6",
          " 5315":            "6,6,0,5",
          " 532":             "100,80,70,25",
          " 533":             "100,83,46,13",
          " 534":             "100,80,30,5",
          " 535":             "42,27,7,0",
          " 536":             "31,20,5,0",
          " 537":             "22,12,3,0",
          " 538":             "12,7,2,0",
          " 539":             "100,49,0,70",
          " 540":             "100,55,0,55",
          " 541":             "100,57,0,38",
          " 542":             "62,22,0,3",
          " 543":             "41,11,0,0",
          " 544":             "30,6,0,0",
          " 545":             "22,3,0,0",
          " 5395":            "100,44,0,76",
          " 5405":            "58,17,0,46",
          " 5415":            "42,8,0,40",
          " 5425":            "30,4,0,31",
          " 5435":            "13,3,0,17",
          " 5445":            "8,1,0,13",
          " 5455":            "6,0,0,9",
          " 546":             "95,9,0,83",
          " 547":             "100,19,0,75",
          " 548":             "100,24,0,64",
          " 549":             "52,6,0,25",
          " 550":             "38,4,0,19",
          " 551":             "27,3,0,13",
          " 552":             "15,0,0,9",
          " 5463":            "100,0,18,83",
          " 5473":            "82,0,28,52",
          " 5483":            "62,0,21,31",
          " 5493":            "43,0,14,21",
          " 5503":            "29,0,10,14",
          " 5513":            "18,0,7,5",
          " 5523":            "11,0,5,3",
          " 5467":            "100,0,33,94",
          " 5477":            "55,0,27,73",
          " 5487":            "35,0,16,54",
          " 5497":            "17,0,9,63",
          " 5507":            "10,0,6,27",
          " 5517":            "8,0,5,17",
          " 5527":            "6,0,4,11",
          " 553":             "59,0,53,80",
          " 554":             "78,0,63,67",
          " 555":             "75,0,60,55",
          " 556":             "42,0,33,27",
          " 557":             "30,0,20,15",
          " 558":             "19,0,14,9",
          " 559":             "14,0,10,6",
          " 5535":            "66,0,57,82",
          " 5545":            "59,0,50,52",
          " 5555":            "43,0,34,38",
          " 5565":            "30,0,24,26",
          " 5575":            "20,0,16,17",
          " 5585":            "12,0,11,10",
          " 5595":            "7,0,8,7",
          " 560":             "80,0,63,75",
          " 561":             "85,0,54,52",
          " 562":             "85,0,50,31",
          " 563":             "52,0,32,1",
          " 564":             "37,0,20,0",
          " 565":             "23,0,13,0",
          " 566":             "14,0,10,0",
          " 5605":            "65,0,56,94",
          " 5615":            "49,0,44,64",
          " 5625":            "28,0,29,48",
          " 5635":            "13,0,18,33",
          " 5645":            "7,0,11,23",
          " 5655":            "6,0,9,16",
          " 5665":            "5,0,7,10",
          " 567":             "82,0,64,70",
          " 568":             "88,0,57,36",
          " 569":             "98,0,57,17",
          " 570":             "48,0,29,0",
          " 571":             "32,0,19,0",
          " 572":             "23,0,14,0",
          " 573":             "14,0,9,0",
          " 574":             "34,0,81,71",
          " 575":             "48,0,100,53",
          " 576":             "49,0,100,39",
          " 577":             "24,0,46,10",
          " 578":             "20,0,40,6",
          " 579":             "17,0,34,3",
          " 580":             "12,0,26,2",
          " 5743":            "33,0,85,82",
          " 5753":            "25,0,81,67",
          " 5763":            "16,0,74,57",
          " 5773":            "9,0,43,38",
          " 5783":            "6,0,28,27",
          " 5793":            "4,0,21,18",
          " 5803":            "2,0,12,11",
          " 5747":            "32,0,100,79",
          " 5757":            "27,0,95,55",
          " 5767":            "15,0,68,39",
          " 5777":            "10,0,49,28",
          " 5787":            "7,0,31,13",
          " 5797":            "5,0,24,9",
          " 5807":            "2,0,14,3",
          " 581":             "2,0,100,72",
          " 582":             "13,0,100,46",
          " 583":             "23,0,100,17",
          " 584":             "12,0,79,6",
          " 585":             "11,0,66,2",
          " 586":             "9,0,53,0",
          " 587":             "5,0,40,0",
          " 5815":            "0,0,91,79",
          " 5825":            "0,2,87,59",
          " 5835":            "0,2,67,40",
          " 5845":            "0,1,47,30",
          " 5855":            "0,0,31,18",
          " 5865":            "0,0,25,13",
          " 5875":            "0,0,26,11",
          " 600":             "0,0,29,0",
          " 601":             "0,0,40,0",
          " 602":             "0,0,50,0",
          " 603":             "0,0,69,1",
          " 604":             "0,0,88,3",
          " 605":             "0,2,100,7",
          " 606":             "0,4,100,12",
          " 607":             "0,0,18,1",
          " 608":             "0,0,32,2",
          " 609":             "0,0,46,4",
          " 610":             "0,0,58,6",
          " 611":             "0,1,92,11",
          " 612":             "0,2,100,20",
          " 613":             "0,4,100,30",
          " 614":             "0,0,20,4",
          " 615":             "0,1,27,6",
          " 616":             "0,2,35,9",
          " 617":             "0,2,48,17",
          " 618":             "0,3,87,30",
          " 619":             "0,4,100,43",
          " 620":             "0,5,100,53",
          " 621":             "13,0,10,2",
          " 622":             "24,0,19,4",
          " 623":             "32,0,24,10",
          " 624":             "44,0,35,20",
          " 625":             "56,0,44,33",
          " 626":             "76,0,64,62",
          " 627":             "90,0,75,83",
          " 628":             "19,0,6,0",
          " 629":             "34,0,9,0",
          " 630":             "47,0,11,0",
          " 631":             "67,0,12,2",
          " 632":             "92,0,15,5",
          " 633":             "100,0,10,25",
          " 634":             "100,0,9,40",
          " 635":             "32,0,8,0",
          " 636":             "45,0,9,0",
          " 637":             "55,0,9,0",
          " 638":             "83,0,10,0",
          " 639":             "100,0,5,5",
          " 640":             "100,0,0,22",
          " 641":             "100,4,0,30",
          " 642":             "16,4,0,2",
          " 643":             "25,7,0,4",
          " 644":             "42,15,0,6",
          " 645":             "55,24,0,9",
          " 646":             "65,30,0,11",
          " 647":             "100,56,0,23",
          " 648":             "100,62,0,52",
          " 649":             "10,4,0,1",
          " 650":             "24,9,0,2",
          " 651":             "38,18,0,6",
          " 652":             "50,25,0,10",
          " 653":             "100,62,0,20",
          " 654":             "100,67,0,38",
          " 655":             "100,68,0,52",
          " 656":             "14,3,0,0",
          " 657":             "24,7,0,0",
          " 658":             "30,15,0,0",
          " 659":             "55,30,0,0",
          " 660":             "90,57,0,0",
          " 661":             "100,69,0,9",
          " 662":             "100,71,0,18",
          " 663":             "7,6,0,0",
          " 664":             "11,9,0,0",
          " 665":             "20,17,0,2",
          " 666":             "31,30,0,7",
          " 667":             "52,49,0,14",
          " 668":             "65,64,0,30",
          " 669":             "76,78,0,47",
          " 670":             "0,13,0,0",
          " 671":             "1,20,0,0",
          " 672":             "3,34,0,0",
          " 673":             "6,49,0,0",
          " 674":             "9,67,0,0",
          " 675":             "17,100,0,3",
          " 676":             "6,100,0,22",
          " 677":             "2,13,0,0",
          " 678":             "3,21,0,0",
          " 679":             "5,27,0,0",
          " 680":             "10,43,0,2",
          " 681":             "21,61,0,4",
          " 682":             "25,79,0,12",
          " 683":             "11,100,0,43",
          " 684":             "0,17,0,2",
          " 685":             "0,25,0,3",
          " 686":             "0,30,0,5",
          " 687":             "2,44,0,12",
          " 688":             "5,57,0,19",
          " 689":             "7,77,0,34",
          " 690":             "0,97,0,59",
          " 691":             "0,15,8,1",
          " 692":             "0,23,10,2",
          " 693":             "0,30,12,6",
          " 694":             "0,36,21,10",
          " 695":             "0,50,28,20",
          " 696":             "0,60,36,32",
          " 697":             "0,68,47,42",
          " 698":             "0,16,8,0",
          " 699":             "0,24,10,0",
          " 700":             "0,36,14,0",
          " 701":             "0,45,20,0",
          " 702":             "0,69,34,5",
          " 703":             "0,83,54,16",
          " 704":             "0,90,72,29",
          " 705":             "0,9,6,0",
          " 706":             "0,17,10,0",
          " 707":             "0,30,14,0",
          " 708":             "0,46,22,0",
          " 709":             "0,66,38,0",
          " 710":             "0,79,58,0",
          " 711":             "0,100,80,2",
          " 712":             "0,14,31,0",
          " 713":             "0,19,41,0",
          " 714":             "0,27,55,0",
          " 715":             "0,36,71,0",
          " 716":             "0,45,91,0",
          " 717":             "0,53,100,2",
          " 718":             "0,56,100,8",
          " 719":             "0,10,25,0",
          " 720":             "0,15,36,1",
          " 721":             "0,24,52,3",
          " 722":             "0,36,76,9",
          " 723":             "0,43,97,17",
          " 724":             "0,51,100,36",
          " 725":             "0,53,100,48",
          " 726":             "0,8,23,2",
          " 727":             "0,15,34,5",
          " 728":             "0,21,48,10",
          " 729":             "0,31,62,18",
          " 730":             "0,38,78,29",
          " 731":             "0,52,100,54",
          " 732":             "0,55,100,64",
          " 7401":            "0,4,18,0",
          " 7402":            "0,6,30,0",
          " 7403":            "0,10,50,0",
          " 7404":            "0,9,79,0",
          " 7405":            "0,10,99,0",
          " 7406":            "0,18,100,0",
          " 7407":            "0,22,85,11",
          " 7408":            "0,25,95,0",
          " 7409":            "0,30,95,0",
          " 7410":            "0,30,55,0",
          " 7411":            "0,35,69,0",
          " 7412":            "0,42,100,7",
          " 7413":            "0,53,100,4",
          " 7414":            "0,46,100,11",
          " 7415":            "0,18,15,0",
          " 7416":            "0,60,60,0",
          " 7417":            "0,75,75,0",
          " 7418":            "0,70,60,5",
          " 7419":            "0,60,45,18",
          " 7420":            "0,80,42,20",
          " 7421":            "0,100,30,61",
          " 7422":            "0,9,5,0",
          " 7423":            "0,55,23,0",
          " 7424":            "0,75,30,0",
          " 7425":            "0,90,30,7",
          " 7426":            "0,100,45,18",
          " 7427":            "0,100,65,28",
          " 7428":            "0,80,45,55",
          " 7429":            "0,18,3,0",
          " 7430":            "2,31,0,0",
          " 7431":            "0,38,2,5",
          " 7432":            "0,55,3,10",
          " 7433":            "0,75,15,15",
          " 7434":            "0,80,15,20",
          " 7435":            "0,100,10,35",
          " 7436":            "3,8,0,0",
          " 7437":            "6,20,0,0",
          " 7438":            "15,35,0,0",
          " 7439":            "20,35,0,0",
          " 7440":            "30,40,0,0",
          " 7441":            "36,50,0,0",
          " 7442":            "50,70,0,0",
          " 7443":            "6,5,0,0",
          " 7444":            "20,17,0,0",
          " 7445":            "30,20,0,3",
          " 7446":            "43,38,0,0",
          " 7447":            "60,58,0,19",
          " 7448":            "32,42,0,55",
          " 7449":            "72,100,77,40",
          " 7450":            "20,10,0,0",
          " 7451":            "40,21,0,0",
          " 7452":            "50,32,0,0",
          " 7453":            "50,26,0,0",
          " 7454":            "50,24,0,10",
          " 7455":            "80,53,0,0",
          " 7456":            "55,35,0,7",
          " 7457":            "12,0,2,0",
          " 7458":            "40,0,5,6",
          " 7459":            "57,0,6,13",
          " 7460":            "100,0,0,5",
          " 7461":            "78,28,0,0",
          " 7462":            "100,50,0,10",
          " 7463":            "100,43,0,65",
          " 7464":            "25,0,10,0",
          " 7465":            "50,0,25,0",
          " 7466":            "70,0,23,0",
          " 7467":            "95,0,25,0",
          " 7468":            "100,10,0,28",
          " 7469":            "100,20,0,40",
          " 7470":            "80,15,0,45",
          " 7471":            "28,0,14,0",
          " 7472":            "52,0,25,0",
          " 7473":            "70,0,38,8",
          " 7474":            "90,0,28,22",
          " 7475":            "50,0,25,30",
          " 7476":            "100,0,43,60",
          " 7477":            "80,0,10,68",
          " 7478":            "18,0,14,0",
          " 7479":            "55,0,50,0",
          " 7480":            "60,0,50,0",
          " 7481":            "60,0,55,0",
          " 7482":            "80,0,75,0",
          " 7483":            "85,0,100,55",
          " 7484":            "100,0,85,50",
          " 7485":            "6,0,10,0",
          " 7486":            "20,0,30,0",
          " 7487":            "30,0,45,0",
          " 7488":            "43,0,60,0",
          " 7489":            "60,0,80,7",
          " 7490":            "45,0,80,35",
          " 7491":            "32,0,100,40",
          " 7492":            "12,0,50,7",
          " 7493":            "14,0,36,10",
          " 7494":            "25,0,40,15",
          " 7495":            "25,0,80,30",
          " 7496":            "40,0,100,38",
          " 7497":            "40,30,70,25",
          " 7498":            "25,0,100,80",
          " 7499":            "0,2,15,0",
          " 7500":            "0,2,15,3",
          " 7501":            "0,4,20,6",
          " 7502":            "0,8,35,10",
          " 7503":            "0,12,35,25",
          " 7504":            "0,25,45,40",
          " 7505":            "0,30,70,55",
          " 7506":            "0,5,15,0",
          " 7507":            "0,10,30,0",
          " 7508":            "0,15,40,4",
          " 7509":            "0,20,50,5",
          " 7510":            "0,30,72,11",
          " 7511":            "0,45,100,25",
          " 7512":            "0,46,100,33",
          " 7513":            "0,18,28,3",
          " 7514":            "0,24,38,5",
          " 7515":            "0,35,50,12",
          " 7516":            "0,52,100,35",
          " 7517":            "0,60,100,44",
          " 7518":            "0,40,55,60",
          " 7519":            "50,60,100,48",
          " 7520":            "0,16,19,0",
          " 7521":            "0,25,20,10",
          " 7522":            "0,40,30,16",
          " 7523":            "0,40,35,20",
          " 7524":            "0,55,60,27",
          " 7525":            "0,45,50,30",
          " 7526":            "0,65,100,35",
          " 7527":            "0,2,6,7",
          " 7528":            "0,3,10,10",
          " 7529":            "0,4,12,17",
          " 7530":            "0,8,21,32",
          " 7531":            "0,10,27,50",
          " 7532":            "0,17,50,65",
          " 7533":            "0,22,85,85",
          " 7534":            "0,2,8,10",
          " 7535":            "0,3,15,20",
          " 7536":            "0,4,22,32",
          " 7537":            "3,0,10,20",
          " 7538":            "9,0,13,30",
          " 7539":            "2,0,9,36",
          " 7540":            "0,0,0,72",
          " 7541":            "2,0,0,5",
          " 7542":            "10,0,3,16",
          " 7543":            "7,0,0,30",
          " 7544":            "10,1,0,40",
          " 7545":            "23,2,0,63",
          " 7546":            "33,4,0,72",
          " 7547":            "35,4,0,94",
          " 801":             "90,5,5,0",
          " 802":             "35,0,60,0",
          " 803":             "0,0,70,0",
          " 804":             "0,20,35,0",
          " 805":             "0,40,25,0",
          " 806":             "0,50,0,0",
          " 807":             "15,75,0,0",
          " 808":             "80,0,40,0",
          " 809":             "10,0,100,0",
          " 810":             "0,10,35,0",
          " 811":             "0,25,25,0",
          " 812":             "0,50,15,0",
          " 813":             "0,70,0,0",
          " 814":             "55,60,0,0",
          " 871":             "20,25,60,25",
          " 872":             "20,30,70,15",
          " 873":             "30,30,60,10",
          " 874":             "0,20,50,30",
          " 875":             "30,40,70,0",
          " 876":             "30,50,85,0",
          " 877":             "0,0,0,40",
          " 8003":            "30,25,40,20",
          " 8021":            "0,20,30,25",
          " 8062":            "5,35,15,25",
          " 8100":            "10,15,5,20",
          " 8201":            "25,0,0,25",
          " 8281":            "35,0,20,25",
          " 8321":            "20,0,30,25",
          " Black 2":         "0,3,55,87",
          " Black 3":         "60,0,60,91",
          " Black 4":         "0,22,100,89",
          " Black 5":         "0,40,22,87",
          " Black 6":         "100,35,0,100",
          " Black 7":         "0,0,15,82",
          " Warm Gray 1":     "0,2,3,6",
          " Warm Gray 2":     "0,2,5,9",
          " Warm Gray 3":     "0,4,8,17",
          " Warm Gray 4":     "0,4,9,24",
          " Warm Gray 5":     "0,5,10,29",
          " Warm Gray 6":     "0,6,12,31",
          " Warm Gray 7":     "0,8,14,38",
          " Warm Gray 8":     "0,9,16,43",
          " Warm Gray 9":     "0,11,20,47",
          " Warm Gray 10":    "0,14,28,55",
          " Warm Gray 11":    "0,17,34,62",
          " Cool Gray 1":     "0,0,0,6",
          " Cool Gray 2":     "0,0,0,10",
          " Cool Gray 3":     "0,0,0,17",
          " Cool Gray 4":     "0,0,0,24",
          " Cool Gray 5":     "0,0,0,29",
          " Cool Gray 6":     "0,0,0,31",
          " Cool Gray 7":     "0,0,0,37",
          " Cool Gray 8":     "0,1,0,43",
          " Cool Gray 9":     "0,1,0,51",
          " Cool Gray 10":    "0,2,0,60",
          " Cool Gray 11":    "0,2,0,68",
        };
      }

    }

  }

  init ();

} ());

