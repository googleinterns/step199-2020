/* GCS generic Writer class */
public class WriterSimple{

    private OutputStream out; 

    private String runID;

    private String type;

   private Database database;

    /* Creates instance of a Writer with this runId. */
    public WriterSimple(Database database, String runID, String type){
       this.database = database;
       this.runId = runID;
       String proto = ".proto";
       out = new FileOutputStream(database.getName() + this.runID + this.type + ".proto");
    }

    public OutputStream write(){
    /*some database method*/
    return out;
    }
    
    private String generateRandomRunID(){
         byte[] array = new byte[7]; // length is bounded by 7
        new Random().nextBytes(array);
        String runID = new String(array, Charset.forName("UTF-8"));

    File tmpDir = new File(database.getName() + runID + this.type + ".proto");
    boolean exists = tmpDir.exists();
    }

    /* */
    public void finish(){
      out.close();
    }
}
