(function () {
 'use strict';
 const csInterface = new CSInterface();
 try {
  init();
 } catch (e) {
  alert(e);
 }

 function init() {
  themeManager.init();
  if (csInterface.isWindowVisible()) {
   csInterface.requestOpenExtension('ai_layout_panel');
   csInterface.closeExtension();
  }
 }
}());
