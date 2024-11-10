/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder*/

var PT_TO_MM = 2.834645668;
var MM_TO_PT = 0.352777778;
var DISTORS = 0;

function makeLayout(str) {
 var margTop = +str.nmb.margTop,
  margBott = +str.nmb.margBott,
  margLeft = +str.nmb.margLeft,
  margRight = +str.nmb.margRight;

 // scrollWin (showObjDeep (str));

 _addDoc(str);
 _showRulers(str);
 _addGuides(str);
 _addTestElems(str);
 _delAllUnused();

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

  var docName = opts.txt.fileName;
  var railW = +opts.nmb.railWidth;
  var margVert = +opts.nmb.margTop + +(opts.nmb.margBott);
  var margHor = +opts.nmb.margLeft + +(opts.nmb.margRight);
  var docW = (+opts.nmb.layoutWidth * +opts.nmb.streams + margHor + +opts.nmb.indentIn * 2 + railW * 2) * PT_TO_MM;
  var docH = (+opts.sel.z + margVert - DISTORS) * PT_TO_MM;

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

  var doc = documents.addDocument('', pres, false);
  // doc.saveAs (new File (Folder.desktop + '/ze_test.ai'), new IllustratorSaveOptions ());
  doc.artboards[0].rulerOrigin = doc.rulerOrigin = [
   (+opts.nmb.margLeft + +opts.nmb.railWidth + +opts.nmb.indentIn) * PT_TO_MM, docH - opts.nmb.margTop * PT_TO_MM
  ];

  addLayer({rgb: [0, 128, 128], doc: doc, title: 'color'});
  __addVrAndPrPlates(opts, doc);
  addLayer({rgb: [128, 128, 0], doc: doc, title: 'test'});
  doc.layers[doc.layers.length - 1].remove();

  /** !!! WARN !!! This function working correctrly.
   * But other code worked non-correct - needs to refactoring
   * */
  // __setZero();

  function __addVrAndPrPlates(opts, doc) {
   var colArr = opts.col;
   var sw = 0;
   var lay, vr, pr;
   var plateX = 0,
    plateY = 0;

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
     lay = addLayer({rgb: [128, 0, 128], doc: doc, title: 'L'});
     ___addVr();
     break;
    case 2:
     lay = addLayer({rgb: [128, 0, 128], doc: doc, title: 'Pr'});
     ___addPr();
     break;
    case 3:
     lay = addLayer({rgb: [128, 0, 128], doc: doc, title: 'L+Pr'});
     ___addVr();
     ___addPr();
     break;
    case 4:
     lay = addLayer({rgb: [128, 0, 128], doc: doc, title: 'W'});
     break;
    case 5:
     lay = addLayer({rgb: [128, 0, 128], doc: doc, title: 'W'});
     lay = addLayer({rgb: [128, 0, 128], doc: doc, title: 'L'});
     ___addVr();
     break;
    case 6:
     lay = addLayer({rgb: [128, 0, 128], doc: doc, title: 'W'});
     lay = addLayer({rgb: [128, 0, 128], doc: doc, title: 'Pr'});
     ___addPr();
     break;
    case 7:
     lay = addLayer({rgb: [128, 0, 128], doc: doc, title: 'W'});
     lay = addLayer({rgb: [128, 0, 128], doc: doc, title: 'L+Pr'});
     ___addVr();
     ___addPr();
     break;
    default:
     break;
   }

   function ___addVr() {
    vr = lay.pathItems.rectangle(
     plateY,
     (plateX - opts.nmb.indentIn) * PT_TO_MM,
     (+opts.nmb.layoutWidth * +opts.nmb.streams + +opts.nmb.indentIn * 2) * PT_TO_MM,
     (+opts.sel.z - DISTORS) * PT_TO_MM
    );
    vr.stroked = false;
    vr.fillColor = getColor('L', ___getCmyk(opts, 'L'), 100);
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
    pr.fillColor = getColor('Pr', ___getCmyk(opts, 'Pr'), 100);
    pr.fillOverprint = true;
   }

   function ___getCmyk(opts, name) {
    var arr = opts.col;
    for (var i = 0; i < arr.length; i++) {
     var obj = arr[i];
     if (obj.name == name) {
      return obj.cmyk.split(',');
     }
    }
   }

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
   lay = getLayByName('test'),
   docW = doc.width,
   docH = doc.height;

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
  var lay = getLayByName('test'),
   fontName = __getFonts()[0];

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

  /**
   * LIB TO ADD TEST ELEMENTS
   * */
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

   var crossCircle = crossGr.pathItems.ellipse(
    +opts.nmb.crossWidth * PT_TO_MM,
    -opts.nmb.crossWidth * PT_TO_MM / 2,
    +opts.nmb.crossWidth * PT_TO_MM,
    +opts.nmb.crossWidth * PT_TO_MM
   );

   crossCircle.filled = false;
   crossCircle.strokeWidth = +opts.nmb.crossStroke * PT_TO_MM;
   crossCircle.strokeColor = getRegistration();
   crossCircle.resize(50, 50);
   crossCircle.strokeOverprint = true;

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
    line.strokeColor = getColor(obj.name, cmykArr, 100);

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

     light.fillOverprint = true;
     lightStroke.strokeOverprint = true;

     light.fillColor = getColor(obj.name, cmykArr, 100);
     lightStroke.strokeColor = getRegistration();
     lightBg.fillColor = getColor(obj.name, cmykArr, 100);

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
}

/**
 * COMMON LIB
 * */
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
  'Rhodamine Red': 'Rhod',
  'Purple': 'Purp',
  'Violet': 'Viol',
  'Blue 072': '072',
  'Reflex Blue': 'Refl',
  'Process Blue': 'PrBlue',
  'Green': 'Gr',
  'Black': 'K2',
  'Black 2': 'Black2',
  'Black 3': 'Black3',
  'Black 4': 'Black4',
  'Black 5': 'Black5',
  'Black 6': 'Black6',
  'Black 7': 'Black7',
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

  if (pantName.match(key)) {
   return aliases[key] + pantName.slice(-2);
  }
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
 tint = tint || 100;

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

 if (name != 'L' && name != 'W' && name != 'Pr' && name != 'film') {
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

function addLayer(o/*{o.rgb, o.doc, o.title}*/) {
 var rgb = o.rgb || [128, 255, 128];
 var doc = o.doc || activeDocument;
 var title = o.title || 'test';

 var col = new RGBColor();
 var lay = o.doc.layers.add();

 col.red = rgb[0];
 col.green = rgb[1];
 col.blue = rgb[2];

 lay.name = title;
 lay.color = col;

 return lay;
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
