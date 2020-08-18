package data;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;

/* Interface for dealing with any database. */
public interface Database {
  /* Abstract methods. */
  public String getDatabaseName();

  public InputStream readData(String runID, String type) throws IOException;

  public OutputStream writeData(String runId, String type) throws IOException;

  public ArrayList<String> getAllFiles();

  public void delete();
}
