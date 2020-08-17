package data;

import com.google.api.gax.paging.Page;
import com.google.appengine.tools.cloudstorage.GcsService;
import com.google.appengine.tools.cloudstorage.GcsServiceFactory;
import com.google.appengine.tools.cloudstorage.RetryParams;
import com.google.cloud.ReadChannel;
import com.google.cloud.WriteChannel;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.BucketInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageClass;
import com.google.cloud.storage.StorageOptions;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.channels.Channels;
import java.util.ArrayList;

/* Class for creating, reading and modifying text blobs on Google Cloud. */
public class GCSDatabase implements Database {
  /* Buckets are containers that hold objects. They can be used to organize and control data access. */
  private Bucket bucket;

  /* Primary bucketname.*/
  private String bucketName;

  /* Before we can use Google Cloud storage, we have to create a service object. */
  private Storage storage;

  /* ProjectID. */
  private String projectId = "pose-3d-viewer-step-2020";

  /* Used below to determine the size of chucks to read in. Should be > 1kb and < 10MB. */
  private static final int BUFFER_SIZE = 2 * 1024 * 1024;

  /* These two next variables are copied from GCS tutorials. */
  /*
   * See the StorageClass documentation for other valid storage classes:
   * https://googleapis.dev/java/google-cloud-clients/latest/com/google/cloud/storage/StorageClass.html
   */
  private StorageClass storageClass = StorageClass.STANDARD;

  /**
   * This is where backoff parameters are configured. Here it is aggressively retrying with backoff,
   * up to 10 times but taking no more that 15 seconds total to do so.
   */
  private final GcsService gcsService =
      GcsServiceFactory.createGcsService(
          new RetryParams.Builder()
              .initialRetryDelayMillis(10)
              .retryMaxAttempts(10)
              .totalRetryPeriodMillis(15000)
              .build());

  //  private Credentials credentials;

  /*
   * See this documentation for other valid locations:
   * http://g.co/cloud/storage/docs/bucket-locations#location-mr
   */
  private String location = "US";

  /* Initiates GCSDatabase. */
  public GCSDatabase(String name) {
    System.out.println("in constructor");

    System.out.println("initializing storage");

    storage = StorageOptions.newBuilder().setProjectId(projectId).build().getService();
    System.out.println("making bucket");
    bucketName = name;
    bucket = storage.get(bucketName);

    if (bucket == null) bucket = storage.create(BucketInfo.of(bucketName));
    System.out.println("Created bucket " + bucket.getName());
  }

  /* Returns database name.*/
  @Override
  public String getDatabaseName() {
    return bucketName;
  }

  /* Returns the appropiate and unique name for a particular file. */
  private String name(String runId, String type) {
    return runId + "_" + type;
  }

  /* Writes file into GCSDatabase. */
  @Override
  public OutputStream writeData(String runId, String type) throws IOException {
    String objectName = name(runId, type);
    return uploadFile(objectName);
  }

  /* uploads file with objectname to GCSDatabase. */
  /*private OutputStream uploadFile(String objectName) throws IOException {
    GcsFilename filename = new GcsFilename(bucketName, objectName);
    GcsFileOptions instance = GcsFileOptions.getDefaultInstance();
    GcsOutputChannel outputChannel;
    outputChannel = gcsService.createOrReplace(filename, instance);
    return Channels.newOutputStream(outputChannel);
  }*/
  private OutputStream uploadFile(String objectName) throws IOException {

    Blob blob = bucket.create(objectName, new byte[0]);
    WriteChannel writeChannel = blob.writer();
    OutputStream out = Channels.newOutputStream(writeChannel);
    System.out.println(out);
    blob = blob.reload();
    return out;
  }

  /* private OutputStream uploadFile(String objectName) throws IOException {
         BlobId blobId = BlobId.of(bucketName, objectName);
         BlobInfo objectInfo = BlobInfo.newBuilder(blobId).setContentType("text/plain").build();
         Blob objectCreated = bucket.create(objectInfo, topicMessagesMap.get(topicName).getBytes());
         Blob blob = bucket.create(objectName, new byte[0]);
         WriteChannel writeChannel = blob.writer();
         OutputStream out = Channels.newOutputStream(writeChannel);
         System.out.println(out);
         out.write(5);
         blob = blob.reload();
         return out;
    }
  */

  /* Reads file from GCSDatabase. */
  @Override
  public InputStream readData(String runId, String type) throws IOException {
    String objectName = name(runId, type);
    return downloadFile(objectName);
  }

  /* Downloads file with objectpath from GCSDatabase. */
  /*private InputStream downloadFile(String objectName) throws IOException {
    GcsFilename filename = new GcsFilename(bucketName, objectName);
    GcsInputChannel readChannel = gcsService.openPrefetchingReadChannel(filename, 0, BUFFER_SIZE);
    return Channels.newInputStream(readChannel);
  }*/

  private InputStream downloadFile(String objectName) throws IOException {
    Blob blob = bucket.get(objectName);
    ReadChannel readChannel = blob.reader();
    return Channels.newInputStream(readChannel);
  }

  /* Returns list of files in database. */
  public ArrayList<String> getAllFiles() {
    Page<Blob> blobs = bucket.list();
    ArrayList<String> blobList = new ArrayList<String>();
    for (Blob blob : blobs.iterateAll()) {
      blobList.add(blob.getName());
    }
    return blobList;
  }

  /*
   * No need to delete GCS right now as these entries and bucket should be permanent,
   * but needed as an overide method.
   */
  public void delete() {}
}
