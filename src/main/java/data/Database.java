/* This class creates an instance of a database that a file can be written to and read from.
Assumptions: for each runID, only 1 of each datatype can be associated with it */
package data;
public class Database{
 
    /* Place where files are stored.*/
    private String name;

    /* OutputStream to be given to client.*/
    private OutputStream out;

 
    /* Creates instance of a database with this name. */
    public Database(String name){
      /* Database will be GCS and buckets. Bucket will named by different runids. */
      this.name = name;
    }

    
    /* Returns projectID of Database. */
    public String getName(){
        return name; 
    }
   
}
