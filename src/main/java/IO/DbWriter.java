package IO;

import data.Database;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;

/* DbWriter class provides output stream from database to client.
 * If user makes DbWriter object and calls the write() function,
 * user SHOULD NOT close the Outputstream returned directly. Instead, the user
 * must use the finish() function to handle closing the inputstream and any
 * other necessary end operations.  */
public class DbWriter {

  private String runId;
  private String type;
  private Database database;
  private String fileName;
  private static final int hashLength = 10;
  private OutputStream out;

  /* Creates instance of a Writer with this runId. */
  public DbWriter(Database database, String runId, String type) {
    this.database = database;
    this.runId = generateRandomRunId();
    database.newDatabaseEntry(this.runId, this.type);
  }

  /* Creates instance of a Writer that doesnt have a runId yet. */
  public DbWriter(Database database, String type) {
    this.database = database;
    this.type = type;
    runId = generateRandomRunId();
    database.newDatabaseEntry(this.runId, this.type);
  }

  /* Returns runId. */
  public String getRunId() {
    return runId;
  }

  /* Gets an outputstream from the database. */
  public OutputStream write() {
    out = database.writeData(runId, type);
    return out;
  }

  /* Returns unique runid. */
  private String generateRandomRunId() {
    return getRandomRunId();
  }

  /* Returns and makes unique runid. */
  private String getRandomRunId() {
    String newRunId = getAlphaNumericString(hashLength);
    System.out.println("This generated id is " + newRunId);
    /*
     * Check if we already have an entry consisting of this runId and data type.
     * At some point this check would need to be better (when using database, to
     * ensure that pose, etc data doesn't randomly get associated with a run it
     *shouldn't by chance)
     */
    File tmpDir = new File(constructName());
    boolean exists = tmpDir.exists();
    if (exists) {
      /* In this case we need to try to generate a different runId. */
      return getRandomRunId();
    }
    return newRunId;
  }

  /* Closing procedures for outputstream. */
  public void finish() {
    try {
      out.close();
    } catch (IOException e) {
      System.err.println("Unable to close the file, an error occurred");
      e.printStackTrace();
    }
  }

  /* Code from online to generate a random hash of length n.*/
  private static String getAlphaNumericString(int n) {
    /* Chose a Character random from this String.*/
    String AlphaNumericString =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "0123456789" + "abcdefghijklmnopqrstuvxyz";
    /* Create StringBuffer size of AlphaNumericString.*/
    StringBuilder sb = new StringBuilder(n);
    for (int i = 0; i < n; i++) {
      /* Generate a random number between
      0 to AlphaNumericString variable length. */
      int index = (int) (AlphaNumericString.length() * Math.random());
      /* Add Character one by one in end of sb.*/
      sb.append(AlphaNumericString.charAt(index));
    }
    return sb.toString();
  }

  /* Return file name that this Writer should write to. */
  private String constructName() {
    String fileName = database.getDatabase() + "/" + runId + "_" + type;
    return fileName;
  }
}
