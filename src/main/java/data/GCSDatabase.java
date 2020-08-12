package data;

import com.google.api.gax.paging.Page;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.BucketInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageClass;
import com.google.cloud.storage.StorageOptions;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
  private String projectId = "Pose-3D-Viewer";

  /* Used below to determine the size of chucks to read in. Should be > 1kb and < 10MB. */
  private static final int BUFFER_SIZE = 2 * 1024 * 1024;

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
  public GCSDatabase(String name) {
    bucketName = name;

    storage = StorageOptions.newBuilder().setProjectId(projectId).build().getService();
    bucket =
        storage.create(
            BucketInfo.newBuilder(bucketName)
                .setStorageClass(storageClass)
                .setLocation(location)
                .build());
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

  /* Returns the appropiate and unique name for a particular file. */
  private String path(String runId, String type) {
    return bucketName + "/" + runId + "_" + type;
  }

  /* Writes file into GCSDatabase. */
  @Override
  public OutputStream writeData(String runId, String type) {
    String objectName = name(runId, type);
    String objectPath = path(runId, type);
    return uploadObject(objectName, objectPath);
  }

  /* uploads blob with objectname to GCSDatabase. */
  private OutputStream uploadObject(String objectName, String objectPath) {
    BlobId blobId = BlobId.of(bucketName, objectName);
    BlobInfo blobInfo = BlobInfo.newBuilder(blobId).build();
    Blob blob = storage.create(blobInfo, Files.readAllBytes(Paths.get(objectPath)));
    return blob.setBinaryStream(1);
  }

    /* uploads file with objectpath to GCSDatabase. */
  private OutputStream uploadFile(String objectName) throws IOException {
    GCSFileName filename = new GCSFileName(bucketName, objectName);
    GcsFileOptions instance = GcsFileOptions.getDefaultInstance();
    GcsOutputChannel outputChannel;
    outputChannel = gcsService.createOrReplace(filename, instance);
    return Channels.newOutputStream(outputChannel);
  }

  /* Reads file from GCSDatabase. */
  @Override
  public InputStream readData(String runId, String type) {
    String objectName = name(runId, type);
    String objectPath = path(runId, type);
    return downloadObject(objectName, objectPath);
  }

  /* Downloads blob with objectname to GCSDatabase. */
  private InputStream downloadObject(String objectName, String objectPath) {
    Blob blob = storage.get(BlobId.of(bucketName, objectName));
    Path path = Paths.get(objectPath);
    blob.downloadTo(path);
    return blob.getBinaryStream();
  }

  /* Downloads file with objectpath from GCSDatabase. */
  private InputStream downloadFile(String objectName) throws IOException {
    GCSFileName filename = new GCSFileName(bucketName, objectName);
    GcsInputChannel readChannel = gcsService.openPrefetchingReadChannel(objectName, 0, BUFFER_SIZE);
      copy(Channels.newInputStream(readChannel), resp.getOutputStream());
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
}
