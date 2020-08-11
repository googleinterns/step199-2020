package data;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.Arrays;

/* This class creates an instance of a database that a file can be written to and read from.
Assumptions: for each runID, only 1 of each datatype can be associated with it. */
public class FileDatabase implements Database {
  /* Place where files are stored.*/
  private File directoryName;

  /* Creates instance of a database with this name. */
  public FileDatabase(String directoryName) {
    this.directoryName = new File(directoryName);
    this.directoryName.mkdir();
  }

  /* Returns name associated with Database, which is the directory of this filesystem. */
  @Override
  public String getDatabaseName() {
    return directoryName.getName();
  }

  /*
   * Attempt to open and return a stream to the data, normally to database, in this case to
   * file. only reaches null return if attempt fails.
   */
   @Override
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
   @Override
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
     return directoryName + "/" + runId + "_" + type;
  }


  /* Return name of file with runid and type in database. */
  public String findName(String runId, String type) {
    String fileName = directoryName + "/" + runId + "_" + type;
    return fileName;
  }

  /* Returns list of files in database. */
  @Override
  public List<File> getAllFiles() {
    File[] files = directoryName.listFiles();
    return Arrays.asList(files);
  }
}
