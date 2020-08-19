package shared;

import data.Database;
import data.GCSDatabase;

/*
 * Variables that need to be accessed between multiple class instances (i.e. Database initialization
 * variable).
 */
public class sharedObjects extends Exception {
  public static Database dataInstance;
  // public static
  static {
    try {
      dataInstance = new GCSDatabase("testdb-pose-3d-viewer-step");
    } catch (Exception e) {
      System.out.println("*************COULD NOT INITIALIZE DATABASE*********************");
      System.out.println("Exception while initializing" + e.getMessage());
      throw new RuntimeException(e.getMessage());
    }
  }
}
