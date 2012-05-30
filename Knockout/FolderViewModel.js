/// <reference path='../Scripts/knockout-2.1.0.js'/>

var FolderViewModel = function (folderInput, fileInput, directory) {
  var self = this;
  self.folders = ko.observableArray(folderInput);
  self.files = ko.observableArray(fileInput);
  //Holds the current directory that you are viewing
  self.directory = ko.observable(directory);
  self.keyword = ko.observable('');
  self.error = ko.observable('');

  self.displaydirectory = ko.computed(function() {
    if (!self.directory()) {
      return '\\';
    } else {
      return self.directory();
    }
  });

  self.directory.subscribe(function (newValue) {
    localStorage.directory = newValue;
    self.refreshListing(newValue);
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
      } else if (type === 'search') {
        alert('run search');
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

  self.search = function (key) {
    self.error('');
    self.keyword(key);
    $.getJSON('/endpoints/search', { keyword: key }, function (data) {
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
  }

  self.backToView = function () {
    self.error('');
    self.keyword('');
    self.refreshListing(self.directory());
  }

  self.refresh = function () {
    self.refreshListing(self.directory());
  }

  self.home = function() {
    self.keyword('');
    localStorage.directory = '';
    if (self.directory() === '') {
      self.refreshListing('');
    }
    self.directory('');
  }

  self.refreshListing = function (path) {
    self.error('');
    $.getJSON('/endpoints/getlisting', { path: path }, function (data) {
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
  }
}

$(function () {
  var directory = '';
  if (localStorage.directory) {
    directory = localStorage.directory;
  }
  $.getJSON('/endpoints/getlisting', { path: directory }, function (data) {
    var folders = new Array();
    var files = new Array();
    $.each(data, function(index, value) {
      if (value.ItemType === 'folder') {
        folders.push(value);
      } else if (value.ItemType === 'file') {
        files.push(value);
      }
    });
    ko.applyBindings(new FolderViewModel(folders, files, directory));
  });
});