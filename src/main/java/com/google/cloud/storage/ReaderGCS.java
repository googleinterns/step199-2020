package com.google.cloud;

import java.io.InputStream;
import java.io.OutputStream;
import javax.jms;

/* GCS Reader class blob information to read its contents. */
public class ReaderGCS{
    
    /* Streams_ represents the streams of all files in a specific bucket. message is type and InputStream is the binary info inside */
    private HashMap<Message, InputStream> streams_;

    /* Jie put this as a global variable in pseudo code, but im confused on its use. Maybe redundant bc we already have the input streams for each datatype.*/
    private ReadChannel reader_;

    private String runID;

    /* Creates instance of a Reader with this runId. */
    public ReaderGCS(String runID){
    }

    /* If Blob of the particular data type is located in this particular database,
     * blob is read and streamed. If file not found, throws exception.
     */
    public InputStream read(Message type) throws FileNotFoundException{
    }


    /* If blob of the particular data type is located in this particular database,
     * blob is read and streamed. If file not found, prints error. We dont know what the return type should be (maybe a protobuf builder obj?)
     */
    public InputStream readOneProto(Message type)throws FileNotFoundException{

    }
    
    /* Returns true if number of bytes in buffer is less then buffer capacity. is this function redundant bc can stream tell when they are at the end? */
    private boolean atTheEnd(Message type){
      
    }
 
    /* Returns true is time_stamp is a valid time in this reader instance. */
    private boolean SeekToTime(double time_stamp) {
        // Binary search to seek to target records.
    }

    /* Close file, and finishes streaming to database. */    
    public void close(){
    }

    /* Opens file and allocated storage space for this file's contents. */
    private void open(){
    }

} 
