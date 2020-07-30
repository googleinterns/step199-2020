package com.google.cloud;

import java.io.FileInputStream;
import java.io.OutputStream;
import javax.jms;

/* GCS Writer class */
public class WriterGCS{
    
    /* Streams_ represents the streams of all files in a specific bucket. message is type and OutputStream is the binary info inside */
    private HashMap<Message, OutputStream> streams_;

    /* RunID. */
    private String runID;

    /* Initiates a WriterGCS object to store file's sensorData in runID bucket. */
    public WriterGCS(String runID){
         open();
    }

    /* Returns outputstream to write new file of message type in memory. */
    public OutputStream write(Message type)throws FileNotFoundException{
    }

    /* Returns outputstream to write 1 proto of message type in memory. */
    public OutputStream writeOneProto(Message type)throws FileNotFoundException{  
    }

    /* Close file, and finishes streaming to database. */    
    public void close(){
    }

    /* Opens file and allocated storage space for this file's contents. */
    private void open(){
    }

}