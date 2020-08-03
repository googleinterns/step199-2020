package IO;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.util.Random;

import data.Database;

/* GCS generic Writer class */
public class WriterSimple {

  private OutputStream out;
  private String runId;
  private String type;
  private Database database;
  private String fileName;

  /* Creates instance of a Writer with this runId. */
  public WriterSimple(Database database, String runId, String type) {
    this.database = database;
    this.runId = runId;
    String extension = ".proto";
    fileName = database.getName() + this.runId + this.type + extension;

    // Attempt to open a stream to the data, normally to database, in this case to
    // file.
    try {
      out = new FileOutputStream(fileName);
    } catch (FileNotFoundException e) {
      System.err.format("Unable to locate the give file with name %s", fileName);
    }
  }

  public WriterSimple(Database database, String type) {
    this.database = database;
    this.runId = generateRandomRunId();
    String extension = ".proto";
    fileName = database.getName() + this.runId + this.type + extension;

    // Attempt to open a stream to the data, normally to database, in this case to
    // file.
    try {
      out = new FileOutputStream(fileName);
    } catch (FileNotFoundException e) {
      System.err.format("Unable to locate the give file with name %s", fileName);
    }
  }

  // Create writer object, then generate random runId if need one
  // Method so that the user can get the value of the runId if they need one
  public String getRunId() {
    return runId;
  }

  public OutputStream write() {
    /* some database method */
    return out;
  }

  public String generateRandomRunId() {
    byte[] array = new byte[7]; // length is bounded by 7
    new Random().nextBytes(array);
    String runID = new String(array, Charset.forName("UTF-8"));

    // Check if we already have an entry consisting of this runId and data type.
    // At some point this check would need to be better (when using database, to
    // ensure that pose, etc data doesn't randomly get associated with a run it
    // shouldn't by chance)
    File tmpDir = new File(database.getName() + runID + this.type + ".proto");
    boolean exists = tmpDir.exists();
    if (exists) {
      // In this case we need to try to generate a different runId
      return generateRandomRunId();
    }
    return runId;
  }

  /* */
  public void finish() {
    try {
      out.close();
    } catch (IOException e) {
      System.err.println("Unable to close the file, an error occurred");
      e.printStackTrace();
    }
  }
}
