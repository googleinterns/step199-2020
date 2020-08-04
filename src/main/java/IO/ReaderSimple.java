package IO;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import data.Database;

/* ReaderSimple class attempts to stream file information from  
 * storage to an Inputstream.
 */
public class ReaderSimple {
    /* Database the reader is associated with. */
    private Database database;

    /* RunId of data being read. */
    private String runId;

    /* Type of data being read. */
    private String type;

    /* InputStream produced. */
    private InputStream in;

    /* Filename that identifies how user can view the file*/
    private String fileName;

    /* Produces an FileInputStream in database associated to runId and type. */
    public ReaderSimple(Database database, String runId, String type) {
        this.database = database;
        this.runId = runId;
        String extension = ".proto";
        String fileName = database.getName() + this.runId + this.type + extension;

        // Attempt to open a stream to the data, normally to database, in this case to
        // file.
        try {
            in = new FileInputStream(fileName);
        } catch (FileNotFoundException e) {
            System.err.format("Unable to locate the give file with name %s", fileName);
        }
    }

    /*
     * Return a stream object for reading from the file, eventually from the
     * database, right now reading a file that includes the database name.
     */
    public InputStream read() {
        return in;
    }

    /*
     * Handle all actions that are necessary when done using the ReaderSimple
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
