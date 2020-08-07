package data;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;

/* This class creates an instance of a database that a file can be written to and read from.
Assumptions: for each runID, only 1 of each datatype can be associated with it. */
public class FileDatabase {
  /* Place where files are stored.*/
  private String directory;

  /* List of all files stored in Database.*/
  private ArrayList<String> files;

  /* Creates instance of a database with this name. */
  public FileDatabase(String name) {
    this.directory = name;
    files = new ArrayList<String>();
  }

  /* Returns name associated with Database. */
  public String getDatabase() {
    return directory;
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
    return null;
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

  private String makeFileName(String runId, String type){
     return getDatabase() + "/" + runId + "_" + type;
  }

  /* Adds file to database given its runid and type. */
  private void newDatabaseEntry(String fileName) {
    files.add(fileName);
  }

  /* Return name of file with runid and type in database. */
  public String findName(String runId, String type) {
    String fileName = getDatabase() + "/" + runId + "_" + type;
    
    // TODO: update 0 placeholder so it can actually return the run id and type of file.
    return files.get(0);
  }

  /* Returns list of files in database. */
  public ArrayList<String> getAllFiles() {
    return files;
  }
}