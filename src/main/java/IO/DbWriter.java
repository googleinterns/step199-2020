package IO;

import data.Database;
import java.io.IOException;
import java.io.OutputStream;
import java.util.UUID;

/* DbWriter class provides output stream from database to client.
 * If user makes DbWriter object and calls the write() function,
 * user either close the Outputstream returned directly or
 * use the finish() function to handle closing the inputstream and any
 * other necessary end operations. If both are called there should be no
 * problems as the close() method does nothing on an OutputStream.
 */
public class DbWriter {

  private String runId;
  private String type;
  private Database database;
  private String fileName;
  private OutputStream out;

  /* Creates instance of a Writer with this runId. */
  public DbWriter(Database database, String runId, String type) {
    this.database = database;
    this.runId = runId;
    this.type = type;
  }

  /* Creates instance of a Writer that doesnt have a runId yet. */
  public DbWriter(Database database, String type) {
    this.database = database;
    this.type = type;
    runId = UUID.randomUUID().toString();
  }

  /* Returns runId. */
  public String getRunId() {
    return runId;
  }

  /* Returns type. */
  public String getType() {
    return type;
  }

  /* Gets an outputstream from the database. */
  public OutputStream write() throws IOException {
    if (database == null) System.out.println("Database is null");
    out = database.writeData(runId, type);
     System.out.println("returns outputstream");
    return out;
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
}
