package IO;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.util.Random;

import data.Database;

/* DbWriter class */
public class DbWriter {

  private String runId;
  private String type;
  private Database database;
  private String fileName;
  private static final int hashLength = 10;
  private OutputStream out;
  // private static final String extension = ".bin";

  /* Creates instance of a Writer with this runId. */
  public DbWriter(Database database, String runId, String type) {
    this.database = database;
    this.runId = generateRandomRunId();
    fileName = database.newDatabaseEntry(this.runId, this.type);
  }

  /* Creates instance of a Writer that doesnt have a runId yet. */
  public DbWriter(Database database, String type) {
    this.database = database;
    this.type = type;
    runId = generateRandomRunId();
    fileName = database.newDatabaseEntry(this.runId, this.type);
  }

  // Create writer object, then generate random runId if need one
  // Method so that the user can get the value of the runId if they need one
  public String getRunId() {
    return runId;
  }

  /* Gets an outputstream from the database. */
  public OutputStream write() {
    out = database.writeData(fileName);
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
    // Check if we already have an entry consisting of this runId and data type.
    // At some point this check would need to be better (when using database, to
    // ensure that pose, etc data doesn't randomly get associated with a run it
    // shouldn't by chance)
    File tmpDir = new File(constructName());
    boolean exists = tmpDir.exists();
    if (exists) {
      // In this case we need to try to generate a different runId
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

  // Code from online to generate a random hash of length n.
  private static String getAlphaNumericString(int n) {
    // chose a Character random from this String.
    String AlphaNumericString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "0123456789" + "abcdefghijklmnopqrstuvxyz";
    // Create StringBuffer size of AlphaNumericString.
    StringBuilder sb = new StringBuilder(n);
    for (int i = 0; i < n; i++) {
      /* Generate a random number between
       0 to AlphaNumericString variable length. */
      int index = (int) (AlphaNumericString.length() * Math.random());
      // Add Character one by one in end of sb.
      sb.append(AlphaNumericString.charAt(index));
    }
    return sb.toString();
  }

  /* Return file name that this reader should read from. */
  private String constructName() {
    String fileName = database.getName()+ "/" + runId + "_" + type;
    return fileName;
     }
}
