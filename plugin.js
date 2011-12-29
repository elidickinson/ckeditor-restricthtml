(function()
{

    var needsRedraw = false;
    var allowedAttribs = "id|class|style|title"; // these are always allowed
    var allowedTags;
    // list allowed tags plus any additional attributes
    var masterAllowedTags = {
        'a': 'name|href|title|class|target',
        'strong':'',
        'b':'',
        'em':'',
        'i':'',
        'strike':'',
        'p': 'align',
        'ol':'',
        'ul':'',
        'li':'',
        'br':'',
        'img': 'alt|src|border|title|hspace|vspace|width|height|align',
        'sub':'',
        'sup':'',
        'blockquote':'',
        'table': 'border|cellspacing|cellpadding|width|frame|rules|height|align|summary|bgcolor|background|bordercolor',
        'tbody': '',
        'thead': '',
        'tfoot': '',
        'td': 'colspan|rowspan|width|height|align|valign|bgcolor|background|bordercolor|scope',
        'th': 'colspan|rowspan|width|height|align|valign|scope',
        'span': '',
        'code': '',
        'pre': '',
        'h1': '',
        'h2': '',
        'h3': '',
        'h4': '',
        'h5': '',
        'h6': '',
        'hr': 'size|noshade',
        'font': 'face|size|color',
        'object': 'width|height|type|data',
        'embed': 'src|type|wmode|width|height',
        'param': 'name|value'
    };

    function arrContains(a, obj) {
        var i = a.length;
        while (i--) {
           if (a[i] === obj) {
               return true;
           }
        }
        return false;
    }

    var redrawTimer = false;
    function redrawEditor(editor) {
        // setTimeout(function(ed) { ed.setData(ed.getData()) })
        if(!editor.config.restricthtml_aggressive) { return; }
        if(redrawTimer) { return; }

        // console.log("redraw kickoff");
        redrawTimer = setTimeout(function() {
                // console.log("redraw");
                var data = editor.getData();
                if(data) {
                    editor.setData(data);
                }
                redrawTimer = false;
            }, 50);
    }

    CKEDITOR.plugins.add( 'restricthtml',
    {
        afterInit : function( editor )
        {
            var config = editor.config;

            if ( !config.restricthtml )
                return;

            var dataProcessor = editor.dataProcessor,
                htmlFilter = dataProcessor && dataProcessor.htmlFilter,
                dataFilter = dataProcessor && dataProcessor.dataFilter;

            if(config.restricthtml_allowed_tags) {
                allowedTags = {};
                var customAllow = config.restricthtml_allowed_tags.split(',');
                for (tagName in masterAllowedTags) 
                {
                    if (arrContains(customAllow,tagName)) 
                    {
                        allowedTags[tagName] = masterAllowedTags[tagName];
                    }
                }
            }
            else {
                allowedTags = masterAllowedTags;
            }

            var myRules = {
                        elements : {
                            $ : function( element )
                            {
                                var attribs = element.attributes;
                                var handledTag = false;
                                // attrData = split(attrData, '|');
                                for (tagName in allowedTags)
                                {
                                    if(element.name == tagName)
                                    {
                                        var validAttribs = allowedAttribs.split('|');
                                       
                                        if(allowedTags[tagName]) 
                                        {
                                            validAttribs = validAttribs.concat(allowedTags[tagName].split('|'))
                                        }
                                        
                                        // clean up attributes
                                        for(attribName in element.attributes)
                                        {
                                            if (arrContains(validAttribs,attribName))
                                            {
                                                // do nothing; allowed attrib
                                            }
                                            else
                                            {
                                                // remove attrib
                                                delete element.attributes[attribName];
                                            }
                                        }

                                        handledTag = true;
                                        break;
                                    }
                                }
                                if (!handledTag)
                                {
                                    // remove element without nuking its children
                                    // console.log("delete "+ element.name);
                                    delete element.name;
                                    redrawEditor(editor);
                                }
                                return element;
                            },
                            span : function (element)
                            {
                                // remove empty spans
                                if (element.attributes.length == 0)
                                {
                                    delete element.name;
                                }
                            }
                        }
                    }

            if ( dataFilter )
            {
                // input - orig
                dataFilter.addRules(myRules);
            }
            if ( htmlFilter )
            {
                // output
                htmlFilter.addRules(myRules);
            }
        }
    });
})();

CKEDITOR.config.restricthtml = true;
// CKEDITOR.config.restricthtml_one_line = false;
CKEDITOR.config.restricthtml_aggressive = false;
CKEDITOR.config.restricthtml_allowed_tags = ''; // if blank allows anything in masterAllowedTags defined above
