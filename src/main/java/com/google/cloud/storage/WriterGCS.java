package com.google.cloud;

import java.io.FileInputStream;
import java.io.OutputStream;
import javax.jms;

/* GCS Writer class */
public class WriterGCS{
    
    /* Type of data of file, wheter its Pose or Proto or something different. */
    private Message datatype;
 
    /* File stream. */
    private FileInputStream stream;

    /* RunID. */
    private String runID;

    /* raw data in file*/
    private String sensorData;

    /* streams  sensorData to file dataType in Bucket runID*/
    public void write(Message type, Stream stream){
    }

    /* Close file, and finishes streaming to database. */    
    public void close(){
    }

    /* Initiates a WriterGCS object to store file's sensorData in runID bucket and identify it by its datatype. */
    public WriterGCS(String runID, Message datatype, String sensorData){
         open();
    }

    /* Opens file and allocated storage space for this file's contents. */
    private void open(){
    }


}