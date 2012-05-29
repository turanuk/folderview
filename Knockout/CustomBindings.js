/// <reference path="../Scripts/knockout-2.1.0.js" />
/// <reference path="../Scripts/jquery-1.7.2.js" />

ko.bindingHandlers.deletePrompt = {
  init: function (element, valueAccessor, allBindingsAccessor, model) {
    var viewModel = valueAccessor();
    $(element).click(function () {
      $('.dialog-delete-element').html('<p>Are you sure you want to delete '  + model.ItemType + ' ' + model.ItemName + '?</p>');
      $('.dialog-delete-element').dialog({
        height: 200,
        modal: true,
        buttons: {
          'Yes': function () {
            $(this).dialog('close');
            viewModel.deleteItem(model);
          },
          'No': function () {
            $(this).dialog('close');
          }
        }
      });
    });
  }
}

ko.bindingHandlers.inputPrompt = {
  init: function (element, valueAccessor, allBindingsAccessor, model) {
    var viewModel = valueAccessor();
    var type = allBindingsAccessor().type;
    $(element).click(function () {
      $('#' + type + 'InputName').val('');
      $('.dialog-form-' + type).dialog({
        height: 200,
        modal: true,
        buttons: {
          'Add': function () {
            var name = $('#' + type + 'InputName').val();
            if (name) {
              viewModel.addItem(name, type);
              $(this).dialog('close');
            }
          },
          'Cancel': function () {
            $(this).dialog('close');
          }
        }
      });
    });
  }
}