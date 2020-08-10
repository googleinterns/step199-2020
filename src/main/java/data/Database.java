package data;

import java.io.FileInputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

/* This class creates an instance of a database that a file can be written to and read from.
Assumptions: for each runID, only 1 of each datatype can be associated with it. */
public class Database {
  /* When updating the Database, only things that need to be change are object declaration of private varable and
   initialization of the object in the constructor. */

  /* Type of database. */
  FileDatabase DatabaseType;

  /* Creates instance of a database with this name. */
  public Database(String name) {
    DatabaseType = new FileDatabase(name);
  }

  /* Returns name associated with Database. */
  public String getName() {
    return DatabaseType.getDatabaseName();
  }

  /*
   * Attempt to open and return a stream to the data, normally to database, in this case to
   * file. only reaches null return if attempt fails.
   */
  public InputStream readData(String runID, String type) {
     return DatabaseType.readData(runID, type);
  }

  /*
   * Attempt return an Outputstream of data. only reaches null return if attempt fails.
   */
  public OutputStream writeData(String runId, String type) {
       return DatabaseType.writeData(runId, type);
  }

  /* Returns list of files in database. */
  public List<File> getAllFiles() {
    return DatabaseType.getAllFiles();
  }
}