package com.google.cloud.storage;

import java.util.ArrayList<E>;
import java.util.HashMap;


/* This class creates an instance of a database that a file can be written to and read from. */
public class Database{

    /* Name of Database. */
    private String name;

    /* List of all buckets in Database. */
    private Arraylist<Bucket> buckets; 
    
     /* Before we can use Google Cloud storage, we have to create a service object. */
    private Storage storage;

    /* Creates instance of a database with this name. */
    public Database(String name){
      /* Database will be GCS and buckets. Bucket will named by different runids. */
    }
    
    /* Returns name of Database. */
    public String getDatabaseName(){
        return name; 
    }

    /* Searches for bucket named runID, and if it doesnt find it, makes a new one. */
    public Bucket updateBucket(String runID){
    }

    /* Returns all files id and names with the purpose of having them show to webpage.  */
    public HashMap<String, String>  getAllFiles(){
    }

}