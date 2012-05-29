/// <reference path='../Scripts/knockout-2.1.0.js'/>

var FolderViewModel = function (folderInput, fileInput) {
  var self = this;
  self.folders = ko.observableArray(folderInput);
  self.files = ko.observableArray(fileInput);
  //Holds the current directory that you are viewing
  self.directory = ko.observable('');
  self.error = ko.observable('');

  self.displaydirectory = ko.computed(function() {
    if (!self.directory()) {
      return '\\';
    } else {
      return self.directory();
    }
  });

  self.directory.subscribe(function (newValue) {
    self.error('');
    $.getJSON('/endpoints/getlisting', { path: newValue }, function (data) {
      var folders = new Array();
      var files = new Array();
      $.each(data, function(index, value) {
        if (value.ItemType === 'folder') {
          folders.push(value);
        } else if (value.ItemType === 'file') {
          files.push(value);
        }
      });
      self.folders(folders);
      self.files(files);
    });
  });

  self.deleteItem = function (item) {
    self.error('');
    $.post('/endpoints/deleteitem', { path: self.directory, name: item.ItemName, type: item.ItemType }, function(data) {
      if (item.ItemType === 'folder') {
        self.folders.remove(function (folder) { return folder.ItemName === item.ItemName })
      } else if (item.ItemType === 'file') {
        self.files.remove(function (file) { return file.ItemName === item.ItemName })
      }
    }).error(function() {
      self.error('There was an error deleting the file or folder. Is it in use?');
    });
  }

  self.addItem = function (name, type) {
    self.error('');
    $.post('/endpoints/additem', { path: self.directory, name: name, type: type}, function (data) {
      if (type === 'folder') {
        self.folders.push(JSON.parse(data));
      } else if (type === 'file') {
        self.files.push(JSON.parse(data));
      }
    }).error(function() {
      self.error('There was an error creating the file or folder. Do you already have one that is the same name?');
    });
  }

  self.upALevel = function () {
    self.error('');
    var oldDirValue = self.directory();
    var newDirValue = oldDirValue.substring(0, oldDirValue.lastIndexOf('\\'));
    self.directory(newDirValue);
  }

  self.navigate = function (item) {
    self.error('');
    var oldDirValue = self.directory();
    var newDirValue = oldDirValue + '\\' + item.ItemName;
    self.directory(newDirValue);
  }
}

$(function () {
  $.getJSON('/endpoints/getlisting', function (data) {
    var folders = new Array();
    var files = new Array();
    $.each(data, function(index, value) {
      if (value.ItemType === 'folder') {
        folders.push(value);
      } else if (value.ItemType === 'file') {
        files.push(value);
      }
    });
    ko.applyBindings(new FolderViewModel(folders, files));
  });
});