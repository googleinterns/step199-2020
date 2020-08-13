package data;

import java.io.IOException;

/* Class is called to decide what type of database is needed to be made. */
public final class DatabaseFactory {

  private static final String LOCAL_FILE_NAME = "localDirectory";
  private static final String GCS_BUCKET_NAME = "STEP-StellarPoint-bucket";

  /* Returns the appropiate database type. */
  public static Database create() throws IOException {
    String appEngineVersion = System.getProperty("com.google.appengine.runtime.version");

    if (appEngineVersion.contains("App Engine")) {
      return new GCSDatabase(GCS_BUCKET_NAME);
    } else {
      return new FileDatabase(LOCAL_FILE_NAME);
    }
  }

  private DatabaseFactory() {}
}
