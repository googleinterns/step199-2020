package shared;

import data.Database;
import data.GCSDatabase;
import java.io.IOException;

// Variables that need to be accessed between multiple class instances (i.e. Database initialization
// variable).
public class sharedObjects extends IOException {
  public static Database dataInstance;
  // public static
  static {
    try {
      dataInstance = new GCSDatabase("testDB");
    } catch (Exception e) {
      System.out.println("Something went wrong.");
    }
  }
}
