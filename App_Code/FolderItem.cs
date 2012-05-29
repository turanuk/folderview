using System;
using System.Collections.Generic;
using System.Web;

public class FolderItem
{
  public string ItemName { get; set;}
  public string ItemType { get; set;}
  public FolderItem(string Name, string type) {
    ItemName = Name;
    ItemType = type;
  }
}
