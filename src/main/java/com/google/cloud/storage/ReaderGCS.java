
/* GCS Reader class blob information to read its contents*/
public class ReaderGCS{
    
    /* Binary file data in the blob*/
    private InputStream stream_;

    /* */
    private ReadChannel reader_;

    /* creates instance of a Reader with this runId*/
    public ReaderGCS(String runID){
    }

    /* If Blob of the particular data type is found located in this particular database,
     * blob is read and streamed. If file not found, prints error.
     */
    public OutputStream read(Message type){
    }

    /* If  blob of the particular data type is found located in this particular database,
     * blob is read and streamed. If file not found, prints error.
     */
    public Stream readBlob(Message type,double* time_stamp){

    }
    
    /* Returns true if number of bytes in buffer is less then buffer capacity. */
    private boolean atTheEnd(){
      
    }
 

    public bool SeekToTime(double time_stamp) {
        // Binary search to seek to target records.
    }
} 
