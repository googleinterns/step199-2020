package IO;

import data.Database;
import java.io.IOException;
import java.io.InputStream;

/*
 * DbReader class accesses blob information to read its contents with an
 * InputStream. If user makes DbReader object and calls the read() function,
 * user SHOULD NOT close the Inputstream returned directly. Instead, the user
 * must use the finish() function to handle closing the inputstream and any
 * other necessary end operations.
 */
public class DbReader {

  private Database database;
  private String runId;
  private String type;
  private InputStream in;

  /*
   * Comments out extension variable bc may not need it
   * private static final String extension = ".bin"; .
   */

  /* Makes a reader object. */
  public DbReader(Database database, String runId, String type) {
    this.database = database;
    this.runId = runId;
    this.type = type;
  }

  /*
   * Returns a stream object for reading from the file, eventually from the
   * database, right now reading a file that includes the database name.
   */
  public InputStream read() {
    in = database.readData(runId, type);
    return in;
  }

  /*
   * Handle alls actions that are necessary when done using the DbReader
   * Object.
   */
  public void finish() {
    try {
      in.close();
    } catch (IOException e) {
      System.err.println("Unable to close the file, an error occurred");
      e.printStackTrace();
    }
  }
}
