(function () {
 'use strict';

 try {
  init();
 } catch (e){
  alert(e);
 }

 function init() {
  var csInterface = new CSInterface();
  themeManager.init();
  if (csInterface.isWindowVisible()) {
   csInterface.requestOpenExtension('ai_layout_panel');
   csInterface.closeExtension();
  }
 }
}());

