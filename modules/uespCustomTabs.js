$(function() {
  function enableToggleTab() {
    $('.tabContainer .tabHeaderContainer .tab').click(function() {
      var container= $(this).parent().parent();
      if ($(this).hasClass('currentTab')) return false;
      var newTab = $(this).data('tabNum');
      if (typeof newTab != 'undefined') {
        $(container).children('.tabHeaderContainer').children('.currentTab').removeClass('currentTab');
        $(container).children('.tabContentsContainer').children('.currentTabContents').removeClass('currentTabContents');
        $(this).addClass('currentTab');
        $($(container).children('.tabContentsContainer').children('.tabContents')[newTab-1]).addClass('currentTabContents');
      }
    });
  }
  
  $(document).ready(function() {
  	enableToggleTab();
  });
});