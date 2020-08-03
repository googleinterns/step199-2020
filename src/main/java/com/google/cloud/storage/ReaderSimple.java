/* GCS Reader class blob information to read its contents. */
/* Make generic for the readOneProto method */
 
public class ReaderSimple{
   private Database database;

   private String runID;

    private String type;

   private InputStream in;

   public ReaderSimple(Database database, String runID, String type){
       this.database = database;
       this.runId = runID;
       String proto = ".proto" ; 
       in = new FileInputStream(database.getName() + this.runID + this.type + proto);
   }
   public static InputStream read(String type){
      /**/
       return in;
   }

   /* */
    public void finish(){
        in.close();
    }

} 
