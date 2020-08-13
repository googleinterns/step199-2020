package data;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;

/*
 * This class creates an instance of a database that a file can
 * be written to and read from. Assumptions: for each runID, only
 * 1 of each datatype can be associated with it.
 */
public class Database {

  /* Folder for Database. */
  File folder;

  /* Creates instance of a database with this name. */
  public Database(String name) throws IOException {
    folder = new File(name);
    folder.mkdir();
  }

  /* Returns name of database. */
  public String getDatabaseName() {
    return folder.getName();
  }

  /*
   * Attempt to open and return a stream to the data, normally to database, in this case to
   * file. only reaches null return if attempt fails.
   */
  public InputStream readData(String runID, String type) {
    String fileName = fileName(runID, type);
    try {
      return new FileInputStream(fileName);
    } catch (FileNotFoundException e) {
      System.err.format("Unable to locate the give file with name %s", fileName);
    }
    return null;
  }

  /*
   * Attempt to open a stream to the data, normally to database, in this case to
   * file. only reaches null return if attempt fails.
   */
  public OutputStream writeData(String runId, String type) {
    String fileName = fileName(runId, type);
    try {
      return new FileOutputStream(fileName);
    } catch (FileNotFoundException e) {
      System.err.format("Unable to locate the give file with name %s", fileName);
    }
    return null;
  }

  /* Returns appropiate file name for data with this runId and type. */
  private String fileName(String runId, String type) {
    return getDatabaseName() + "/" + runId + "_" + type;
  }

  /* Returns list of files in database. */
  public ArrayList<String> getAllFiles() {
    File[] files = folder.listFiles();
    ArrayList<String> filesAsStrings = new ArrayList<String>();
    for (int i = 0; i < files.length; i++) filesAsStrings.add(files[i].getName());
    return filesAsStrings;
  }
  
  /* Delete database. */
  public void delete(){
      /* Delete directory recursively. */
    File[] allContents = folder.listFiles();
    if (allContents != null) {
      for (File file : allContents) {
        file.delete();
      }
    }
    folder.delete();
  }
}
