package data;

public final class DatabaseFactory {

  private static final String LOCAL_FILE_NAME = "localDirectory";
  private static final String GCS_BUCKET_NAME = "STEP-StellarPoint-bucket";

  public static Database create() {
    if (false) {
      return new GCSDatabase(LOCAL_FILE_NAME);
    } else {
      return new FileDatabase(GCS_BUCKET_NAME);
    }
  }

  private DatabaseFactory() {}
}
