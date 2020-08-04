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
  /* OutputStream to be given to client.*/
  private OutputStream out;

  /*  RunId of data being written.*/
  private String runId;

  /* Type of data being written.*/
  private String type;
  
  /* Database the reader is associated with.*/
  private Database database;

  /* Filename that identifies how user can view the file*/
  private String fileName;
  private static final int hashLength = 10;
  private static final String extension = ".bin";

  /* Creates instance of a Writer with this runId. */
  public WriterSimple(Database database, String type, String runId) {
    this.database = database;
    this.runId = runId;
    fileName = constructName();
    // Use the binary extension as protobuf generates a binary file.

    // Attempt to open a stream to the data, normally to database, in this case to
    // file.
    try {
      File file = new File(fileName);
      out = new FileOutputStream(file);
    } catch (FileNotFoundException e) {
      System.err.format("Unable to locate the give file with name %s", fileName);
    }
  }

  /* Creates instance of a Writer with that doesn't have a runId yet. */
  public WriterSimple(Database database, String type) {
    this.database = database;
    this.type = type;
    generateRandomRunId();
    fileName = constructName();
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

  private String getRandomRunId() {
    String newRunId = getAlphaNumericString(hashLength);
    System.out.println("This generated id is " + newRunId);
    // Check if we already have an entry consisting of this runId and data type.
    // At some point this check would need to be better (when using database, to
    // ensure that pose, etc data doesn't randomly get associated with a run it
    // shouldn't by chance)
    File tmpDir = new File(constructName());
    boolean exists = tmpDir.exists();
    
    /* If file name is not unique, try again. */
    if (exists) {
      return generateRandomRunId();
    }
    return newRunId;
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

  // Code from online to generate a random hash of length n
  private static String getAlphaNumericString(int n) {
    // chose a Character random from this String
    String AlphaNumericString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "0123456789" + "abcdefghijklmnopqrstuvxyz";
    // create StringBuffer size of AlphaNumericString
    StringBuilder sb = new StringBuilder(n);
    for (int i = 0; i < n; i++) {
      // generate a random number between
      // 0 to AlphaNumericString variable length
      int index = (int) (AlphaNumericString.length() * Math.random());
      // add Character one by one in end of sb
      sb.append(AlphaNumericString.charAt(index));
    }

    return sb.toString();
  }

  private String constructName() {
    String fileName = database.getName()+ "/" + this.runId + "_" + this.type + extension;
    return fileName;
  }
}
