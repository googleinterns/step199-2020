/* GCS Reader class blob information to read its contents. */
/* Make generic for the readOneProto method */
package IO;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import data.Database;

public class ReaderSimple {
    private Database database;
    private String runId;
    private String type;
    private InputStream in;
    private static final String extension = ".bin";
    private String fileName;

    public ReaderSimple(Database database, String runId, String type) {
        this.database = database;
        this.runId = runId;
        this.type = type;
        fileName = constructName();
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

    private String constructName() {
        String fileName = database.getName() + "/" + this.runId + "_" + this.type + extension;
        return fileName;
    }

}
