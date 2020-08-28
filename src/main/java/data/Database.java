package data;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;

public interface Database {
  /* Abstract methods. */
  /* Returns Database name that was given when database was initialized. */
  public String getDatabaseName();

  /* Returns inputstream of  data associated with runid and type. */
  public InputStream readData(String runID, String type) throws IOException;

  /* Returns outputstream of  data associated with runid and type. */
  public OutputStream writeData(String runId, String type) throws IOException;

  /* Returns list of all files in the database. */
  public ArrayList<String> getAllFiles();

  /* Deletes database and files in it. */
  public void delete();
}
