/* GCS Reader class blob information to read its contents. */
/* Make generic for the readOneProto method */
package IO;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import data.Database;

public class DbReader {

    private Database database;
    private String runId;
    private String type;
    private InputStream in;

    /* Comments out extension variable bc may not need it
     private static final String extension = ".bin"; . */
    private String fileName;

    public DbReader(Database database, String runId, String type) {
        this.database = database;
        this.runId = runId;
        this.type = type;
        fileName = database.findName(this.runId, this.type);
    }

    /*
     * Return a stream object for reading from the file, eventually from the
     * database, right now reading a file that includes the database name.
     */
    public InputStream read() {
        in = database.readData(fileName);
        return in;
    }

    /*
     * Handle all actions that are necessary when done using the DbReader
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
