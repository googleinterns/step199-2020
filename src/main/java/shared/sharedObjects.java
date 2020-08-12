package shared;

import data.Database;

// Variables that need to be accessed between multiple class instances (i.e. Database initialization
// variable).
public class sharedObjects {
  // public static
  public static Database dataInstance = new Database("testDB");
}
