package data;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.List;

/* This class creates an instance of a database that a file can be written to and read from.
Assumptions: for each runID, only 1 of each datatype can be associated with it. */
public class Database {

  /* Folder for Database. */
  File folder;

  /* Creates instance of a database with this name. */
  public Database(String name) {
    folder = new File(name);
    folder.mkdir();
  }

  /* Returns name associated with Database. */
  public File getDatabase() {
    return folder;
  }

  /* Returns name of database. */
  public String getDirectoryName() {
    return folder.getName();
  }

  /*
   * Attempt to open and return a stream to the data, normally to database, in this case to
   * file. only reaches null return if attempt fails.
   */
  public InputStream readData(String runID, String type) {
    String fileName = FileName(runID, type);
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
    String fileName = FileName(runId, type);
    try {
      return new FileOutputStream(fileName);
    } catch (FileNotFoundException e) {
      System.err.format("Unable to locate the give file with name %s", fileName);
    }
    return null;
  }

  /*Returns appropiate file name for data with this runId and type. */
  private String FileName(String runId, String type) {
    return getDirectoryName() + "/" + runId + "_" + type;
  }

  /* Adds file to database given its runid and type. */
  public String newDatabaseEntry(String runId, String type) {
    String fileName = FileName(runId, type);
    return fileName;
  }

  /* Returns list of files in database. */
  public List<File> getAllFiles() {
    File[] files = getDatabase().listFiles();
    return Arrays.asList(files);
  }
}
