package data;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;

/* This class creates an instance of a database that a file can be written to and read from.
Assumptions: for each runID, only 1 of each datatype can be associated with it. */
public class Database {

  /* Type of database. */
  FileDatabase fileDatabase;

  /* Creates instance of a database with this name. */
  public Database(String name) {
    fileDatabase = new FileDatabase(name);
  }

  /* Returns name associated with Database. */
  public String getName() {
    return fileDatabase.getDatabase();
  }

  /*
   * Attempt to open and return a stream to the data, normally to database, in this case to
   * file. only reaches null return if attempt fails.
   */
  public InputStream readData(String runID, String type) {
     return fileDatabase.readData(runID, type);
  }

  /*
   * Attempt to open a stream to the data, normally to database, in this case to
   * file. only reaches null return if attempt fails.
   */
  public OutputStream writeData(String runId, String type) {
       return fileDatabase.writeData(runID, type);
  }

  /* Returns list of files in database. */
  public ArrayList<String> getAllFiles() {
    return fileDatabase.getAllFiles();
  }
}