package data;

import java.io.File;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;

public interface Database {
  /* Abstract methods. */
  public String getDatabaseName();

  public InputStream readData(String runID, String type);

  public OutputStream writeData(String runId, String type);

  public ArrayList<String> getAllFiles();

  /*
   * TODO: I dont really want to include this in the interface,
   * but i need to delete directories after i make them in tests.
   * Since these tests are run locally, i know im using the file system
   * implementation, so i need a method to give me acces to the file/directory
   * in order to then delete it.
   */
  public File getDatabase();
}
