function loadThemeFile(theme) {
  console.log('Theme: '+theme);
  var themeFile = '/w/extensions/CodeMirror/resources/themes/'+theme+'.css';
  if (theme === 'default') themeFile = '';
  console.log('Theme File: '+themeFile);
  if ($('#CMTheme').length > 0) {
    console.log('CMTheme found, updating');
    $('#CMTheme').attr('href',themeFile);
  } else {
    console.log('CMTheme not found, adding');
    var CMThemeLink = $('<link>').attr({'id':'CMTheme','rel':'stylesheet','href':themeFile});
    console.log('User Style Link: '+$('link[href*="modules=site.styles"]')[0]);
    console.log('Theme Link: '+$(CMThemeLink).prop('outerHTML'));
    $(CMThemeLink).insertAfter($('link[href*="modules=site.styles"]')[0]);
    console.log('CMTheme added: '+$('#CMTheme').prop('outerHTML'));
  }
}
 
function changeTheme(newTheme) {
  console.log('Attempting to change theme to '+newTheme);
  if (newTheme == 'default') {
    $('.CodeMirror').removeClass(function(index, className) {
      return (className.match (/(^|\s)cm-s-\S+/g) || []).join(' ');
    }).addClass('cm-s-'+newTheme);
    $('#CMTheme').remove();
  } else {
    var curTheme = $('.CodeMirror').attr('class').match(/(^|\s)cm-s-\S+/g)[0].trim();
    console.log('Attempting to change theme from '+curTheme);
    if (curTheme != 'cm-s-'+newTheme) {
      $('.CodeMirror').addClass('cm-s-'+newTheme);
    }
    loadThemeFile(newTheme);
    //$('#CMTheme').load(function() {
    setTimeout(function(curTheme, newTheme) {
    console.log('Theme file loaded.');
      if (curTheme != 'cm-s-'+newTheme) {
        console.log('Remove class '+curTheme+' from CodeMirror');
        $('.CodeMirror').removeClass(curTheme);
      }
    }, 200, curTheme, newTheme);
  }
}

function buildSelector() {
  var themeNames = ['default', '3024-day','3024-night','abbott','abcdef','ambiance-mobile','ambiance','ayu-dark','ayu-mirage','base16-dark','base16-light','bespin','blackboard','cobalt','colorforth','darcula','dracula','duotone-dark','duotone-light','eclipse','elegant','erlang-dark','gruvbox-dark','hopscotch','icecoder','idea','isotope','juejin','lesser-dark','liquibyte','lucario','material-darker','material-ocean','material-palenight','material','mbo','mdn-like','midnight','monokai','moxer','neat','neo','night','nord','oceanic-next','panda-syntax','paraiso-dark','paraiso-light','pastel-on-dark','railscasts','rubyblue','seti','shadowfox','solarized','ssms','the-matrix','tomorrow-night-bright','tomorrow-night-eighties','ttcn','twilight','vibrant-ink','xq-dark','xq-light','yeti','yonce','zenburn'];
  var mwApi = new mw.Api();
  var theme = mw.user.options.get('codemirrortheme') || 'default';
  changeTheme(theme);
  var selector = $('<select>').attr('id','themeSelector').css({'margin-left':'10px', 'border-radius': '5px', 'border-color': 'var(--light2)'});
  themeNames.forEach(function(val) {
    var option = $('<option>').attr('value',val).text(val);
    if (theme == val) { $(option).attr('selected', 'true'); }
    $(selector).append(option);
  });
  $(selector).change(function() {
    var newTheme = $(this).val();
    changeTheme(newTheme);
    mw.user.options.set('codemirrortheme', newTheme);
    mwApi.saveOption('codemirrortheme', newTheme);
  });
  if ($('.wikiEditor-ui-toolbar').length > 0) {
    var container = $('<span>').addClass('tab tab-themes').css({'padding-left':'10px', 'border-left':'1px solid #c8ccd1'}).text('Theme: ');
    $(container).append(selector);
    $('.wikiEditor-ui-toolbar .tabs').append(container);
  } else {
    var container = $('<span>').addClass('mw-editselect-codemirror-theme').css({'padding-left':'5px', 'border-left':'1px solid #c8ccd1', 'margin-left':'10px'}).text('Theme: ');
    $(container).append(selector);
    $('#mw-editbutton-codemirror').parent().append(container);    
  }
}
function enableThemeSelector() {
  if ( [ 'edit', 'submit' ].indexOf( mw.config.get( 'wgAction' ) ) !== -1 ) {
  $( '#wpTextbox1' ).on( 'codeMirror-initialized', function() {
    if ($('#themeSelector').length == 0) {
      buildSelector();
    }
    var keys = window.$codeMirror.getOption('extraKeys');
    keys['Ctrl-LeftClick'] = function(cm, pos) {
      //debugger;
      let token = cm.getTokenAt(pos);
      let classes = token.type || '';
      if (classes.indexOf('mw-pagename') >= 0) {
        let page = getFullToken(cm, pos, token);
        if (classes.indexOf('mw-template-name') >= 0) {
          if (page.indexOf(':') == -1) {
            page = 'Template:'+page;
          }
        }
        window.open('/wiki/'+page, "_blank");
      }
    };
    window.$codeMirror.setOption('extraKeys', keys);
  });
  }
}
  
function getFullToken(cm, pos) {
  let token = cm.getTokenAt(pos);
  let classes = token.type | '';
  let currToken = getPrevToken(cm, pos, token);
  let page = token.string;
  while (currToken && currToken.type == token.type) {
    page = currToken.string + page;
    currToken = getPrevToken(cm, pos, currToken);
  }
  currToken = getNextToken(cm, pos, token);
  while (currToken && currToken.type == token.type) {
    page = page + currToken.string;
    currToken = getNextToken(cm, pos, currToken);
  }
  return page;
}

function getPrevToken(cm, pos, token) {
  let currLineTokens = cm.getLineTokens(pos.line);
    let currTokenIdx = currLineTokens.findIndex((e) => e.start == token.start && e.end == token.end && e.string == token.string);
  if (currTokenIdx < 0) {
    debugger;
    console.log("Error when matching token");
  }
  if (currTokenIdx == 0) {
    if (pos.line == 0) return false;
    return cm.getLineTokens(pos.line-1).at(-1);
  }
  return currLineTokens.at(currTokenIdx-1);
}

function getNextToken(cm, pos, token) {
  let currLineTokens = cm.getLineTokens(pos.line);
  let currTokenIdx = cm.getLineTokens(pos.line).findIndex((e) => e.start == token.start && e.end == token.end && e.string == token.string);
  if (currTokenIdx < 0) {
    debugger;
    console.log("Error when matching token");
  }
  if (currTokenIdx == currLineTokens.length-1) {
    if (cm.getLineTokens(pos.line+1).length === 0) return false;
    return cm.getLineTokes(pos.line+1).at(0);
  }
  return currLineTokens.at(currTokenIdx+1);
}

$(document).ready(function() {
  if (mw.user.options.get('usecodemirror') > 0 && mw.config.get('wgPageContentModel') === 'wikitext') {
    if ( [ 'edit', 'submit' ].indexOf( mw.config.get( 'wgAction' ) ) !== -1 ) {
      var theme = mw.user.options.get('codemirrortheme') || 'default';
      loadThemeFile(theme);
    }
    var tmpLoader = 'mediawiki.toolbar';
    if (mw.user.options.get('usebetatoolbar') > 0) {
      tmpLoader = 'ext.wikiEditor';
    }
    mw.loader.using( ['ext.CodeMirror.addons', tmpLoader] ).done( function () {
      enableThemeSelector();
    });
  }
});