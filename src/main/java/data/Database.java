package data;

import java.io.FileInputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

public interface Database {
  /* Abstract methods. */
  public String getDatabaseName();

  public InputStream readData(String runID, String type);

  public OutputStream writeData(String runId, String type);

  public ArrayList<String> getAllFiles();
}