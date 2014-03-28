var RequestDefinitionLoader = Toolbox.Base.extend({
  constructor: function(ulSelector) {
    var ul = $(ulSelector);

    // loads a request definition from each LI
    ul.find('li').each(function(){
      var el = $(this).children().first();
      switch (el.prop('tagName')) {
        case 'FORM':
          new FormRequestHandler(el);
          break;
        case 'A':
          new BasicRequestHandler(el);
          break;
        default:
      }
    });
  }
});
