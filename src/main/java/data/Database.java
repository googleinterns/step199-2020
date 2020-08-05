
package data;

import java.io.InputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;

/* This class creates an instance of a database that a file can be written to and read from.
Assumptions: for each runID, only 1 of each datatype can be associated with it */
public class Database{
 
    /* Place where files are stored.*/
    private String name;

    /* List of all files stored in Database.*/
    ArrayList<String> files;
 
    /* Creates instance of a database with this name. */
    public Database(String name){
      /* Database will be GCS and buckets. Bucket will named by different runids. */
      this.name = name;
    }
    
    /* Returns projectID of Database. */
    public String getName(){
        return name; 
    }

    // Attempt to open a stream to the data, normally to database, in this case to
    // file.
    public InputStream readData(String fileName){
       try {
            return new FileInputStream(fileName);
        } catch (FileNotFoundException e) {
            System.err.format("Unable to locate the give file with name %s", fileName);
        }
        return null; 
    }

    // Attempt to open a stream to the data, normally to database, in this case to
    // file.
    public OutputStream writeData(String fileName){
         try {
        return new FileOutputStream(fileName);
         } catch (FileNotFoundException e) {
         System.err.format("Unable to locate the give file with name %s", fileName);
        }
        return null;
    }
    
    /* Adds file to database given its runid and type. */
    public String newDatabaseEntry(String runId, String type) {
    String fileName = getName()+ "/" + runId + "_" + type;
    files.add(fileName);
    return fileName;
     }

    /* Return name of file with runid and type in database. */
    public String findName(String runId, String type) {
        String fileName = getName() + "/" + runId + "_" + type;
        return files.get(0);
    }
    
    /* Returns list of files in database. */
    public ArrayList<String> getAllFiles(){
        return files; 
    }
   
}