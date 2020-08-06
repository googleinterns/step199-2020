
package data;

import java.io.InputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.File; 

/* This class creates an instance of a database that a file can be written to and read from.
Assumptions: for each runID, only 1 of each datatype can be associated with it. */
public class Database {
  /* Name of folderwhere files are stored.*/
  private String name;

  /* List of all files stored in Database.*/
  private File[] files;

  /* Folder for Database. */
  File folder; 

  /* Creates instance of a database with this name. */
  public Database(String name) {
    this.name = name;
    folder = new File(name);  
    folder.mkdir();
  }

  /* Returns name associated with Database. */
  public File getDatabase() {  
    return folder;
  }
  
  /* Returns name of database. */
  public String getName(){
      return name;
  }

  /*
   * Attempt to open and return a stream to the data, normally to database, in this case to
   * file. only reaches null return if attempt fails.
   */
  public InputStream readData(String runID, String type) {
    String fileName = makeFileName(runID, type);
    try {
      return new FileInputStream(fileName);
    } catch (FileNotFoundException e) {
      System.err.format("Unable to locate the give file with name %s", fileName);
    }

  /*
   * Attempt to open a stream to the data, normally to database, in this case to
   * file. only reaches null return if attempt fails.
   */
  public OutputStream writeData(String runId, String type) {
    String fileName = makeFileName(runId, type);
    try {
      return new FileOutputStream(fileName);
    } catch (FileNotFoundException e) {
      System.err.format("Unable to locate the give file with name %s", fileName);
    }
    return null;
  }

  private String makeFileName(String runId, String type) {
    return getName() + "/" + runId + "_" + type;
  }

  /* Adds file to database given its runid and type. */
  public String newDatabaseEntry(String runId, String type) {
    String fileName = makeFileName(runId, type);
    return fileName;
     }

  /* Return name of file with runid and type in database. */
  public String findName(String runId, String type) {
    String fileName = getName() + "/" + runId + "_" + type;
    return fileName;
  }

  /* Returns list of files in database. */
  public File[] getAllFiles() {
    return getDatabase().listFiles();
  }


  /*public static boolean deleteDirectory() {
     File[] children = getDatabase().listFiles();
        for (int i = 0; i < children.length; i++) {
          boolean success = deleteDirectory(children[i]);
          if (!success) return false; 
        }

    // either file or an empty directory 
    System.out.println("removing file or directory : " + dir.getName()); 
    return dir.delete(); 
    }*/
}
