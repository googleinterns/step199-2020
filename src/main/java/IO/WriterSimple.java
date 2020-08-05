package IO;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.util.Random;

import data.Database;

/* WriterSimple returns an FileOutputStream to take and store data.*/
public class WriterSimple {

  /*  RunId of data being written.*/
  private String runId;

  /* Type of data being written.*/
  private String type;
  
  /* Database the reader is associated with.*/
  private Database database;

  /* Filename that identifies how user can view the file*/
  private String fileName;

  /* Creates instance of a Writer with this runId. */
  public WriterSimple(Database database, String type, String runId) {
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

  /* Creates instance of a Writer with that doesn't have a runId yet. */
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

  /* Returns runId. */
  public String getRunId() {
    return runId;
  }

  /* Returns OutputStream. */
  public OutputStream write() {
    return out;
  }

  /* Returns unique runId  associated with particular writer. */
  private String generateRandomRunId() {
    byte[] array = new byte[7]; // length is bounded by 7
    new Random().nextBytes(array);
    String runID = new String(array, Charset.forName("UTF-8"));

    // Check if we already have an entry consisting of this runId and data type.
    // At some point this check would need to be better (when using database, to
    // ensure that pose, etc data doesn't randomly get associated with a run it
    // shouldn't by chance)
    File tmpDir = new File(database.getName() + runID + this.type + ".proto");
    boolean exists = tmpDir.exists();
    
    /* If file name is not unique, try again. */
    if (exists) {
      return generateRandomRunId();
    }
    return runId;
  }

    /*
     * Handle all actions that are necessary when done using the WriterSimple
     * Object.
     */
  public void finish() {
    try {
      out.close();
    } catch (IOException e) {
      System.err.println("Unable to close the file, an error occurred");
      e.printStackTrace();
    }
  }
  
}
