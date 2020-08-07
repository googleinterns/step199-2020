package data;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

import java.util.List;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.BucketInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageClass;
import com.google.cloud.storage.StorageOptions;

/* Class for creating, reading and modifying text blobs on Google Cloud. */
public class GCSDatabase{
  /* Buckets are containers that hold objects. They can be used to organize and control data access. */
  private Bucket bucket;

  /* Primary bucketname.*/
  private String bucketName;

  /* Before we can use Google Cloud storage, we have to create a service object. */
  private Storage storage;

 
  /* ProjectID. */ 
  private String projectId = "Pose-3D-Viewer";

  /* These two next variables are copied from GCS tutorials. */

  /*
  * See the StorageClass documentation for other valid storage classes:
  * https://googleapis.dev/java/google-cloud-clients/latest/com/google/cloud/storage/StorageClass.html
  */
  private StorageClass storageClass = StorageClass.STANDARD;

  /*
  * See this documentation for other valid locations:
  * http://g.co/cloud/storage/docs/bucket-locations#location-mr
  */
  private String location = "US";

  /* Initiates GCSDatabase. */
  public GCSDatabase(String name){
    bucketName = name; 

    storage = StorageOptions.newBuilder().setProjectId(projectId).build().getService();
    bucket = storage.create(BucketInfo.newBuilder(bucketName)
        .setStorageClass(storageClass).setLocation(location).build()); 
  }  
 
  /* Returns the appropiate and unique name for a particular file. */
    private String name(String runId, String type){
    return  bucketName + "/" + runId + "_" + type;
  }

  /* Writes file into GCSDatabase. */
  public OutputStream writeData(String runId, String type){
     String objectName = name(runId, type);
     return uploadObject(objectName); 
  }

  /* uploads blob with objectname to GCSDatabase. */
  private OutputStream uploadObject(String objectName){
    BlobId blobId = BlobId.of(bucketName, objectName);
    BlobInfo blobInfo = BlobInfo.newBuilder(blobId).build();
    storage.create(blobInfo, Files.readAllBytes(Paths.get(filePath)));
    return blob.setBinaryStream(1);
  }

  /* Reads file from GCSDatabase. */
  public InputStream readData(String runId, String type){
    String objectName = name(runId, type);
    return downloadObject(objectName);
  }

  /* Downloads blob with objectname to GCSDatabase. */
  private InputStream downloadObject(String objectName){
    Blob blob = storage.get(BlobId.of(bucketName, objectName));
    blob.downloadTo(destFilePath);
    return blob.getBinaryStream();
  }

  /* Returns list of files in database. */
  public List<Blob> getAllBlobs() { 
    Page<Blob> blobs = bucket.list();
    List<Blob> blobList = blobs.getContent();
    return blobList; 
  }
}
