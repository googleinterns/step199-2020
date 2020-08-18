package data;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;

/* This class creates an instance of a database that a file can be written to and read from.
Assumptions: for each runID, only 1 of each datatype can be associated with it. */
public class FileDatabase implements Database {
  /* Folder for Database. */
  File folder;

  /* Creates instance of a database with this name. */
  public FileDatabase(String name) throws IOException {
    folder = new File(name);
    folder.mkdir();
  }

  /* Returns name of database. */
  @Override
  public String getDatabaseName() {
    return folder.getName();
  }

  /*
   * Attempt to open and return a stream to the data, normally to database, in this case to
   * file. only reaches null return if attempt fails.
   */
  @Override
  public InputStream readData(String runID, String type) {
    String fileName = fileName(runID, type);
    try {
      return new FileInputStream(fileName);
    } catch (FileNotFoundException e) {
      System.err.format("Unable to locate the give file with name %s", fileName);
    }
    return null;
  }