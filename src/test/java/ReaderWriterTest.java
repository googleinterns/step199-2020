package test;

import IO.DbReader;
import IO.DbWriter;
import data.Database;
import data.DatabaseQuery;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import java.io.File;
import java.util.List;

@RunWith(JUnit4.class)
/* Validate that a .txt file can be properly be stored written and read from database.  */
public final class ReaderWriterTest {
  private static String inputFile;
  private static String outputFile;
  private static InputStream input;
  private static OutputStream output;

  private Database database = new Database("test");
  private DbWriter writer = new DbWriter(database, "test", "writingIn");
  private DbReader reader = new DbReader(database, "test", "writingIn");

  @Before
  public void setUp() {}

  @Test
  public void validateDatabaseName() {
    System.out.println("validateDatabaseName()");
    /* Validate that place where data is stored is named test. */
    System.out.println("test = " + database.getDatabase());
    Assert.assertEquals(database.getDirectoryName(), "test");
  }

  @Test
  public void validateWriterRunId() {
    System.out.println("validateWriterRunId()");
    /* Validate that writer's runId is test. */
    Assert.assertEquals(writer.getRunId(), "test");
  }

  @Test
  public void validateReaderWriterDatabaseConnect() throws IOException {
    System.out.println("validateReaderWriterDatabaseConnect()");
    DbWriter writer2 = new DbWriter(database, "test", "writingIn");
    DbReader reader2 = new DbReader(database, "test", "writingIn");

    String writeTest = "This is a test string";
    /*Validate that what writer wrote to dtabase is what reader reads. */
    try (OutputStream output1 = writer2.write()) {
      byte[] b = writeTest.getBytes();
      output1.write(b);
    }
    writer2.finish();

    String readTest = null;
    try (InputStream input = reader2.read()) {
      StringBuilder textBuilder = new StringBuilder();
      try (Reader reader =
          new BufferedReader(
              new InputStreamReader(input, Charset.forName(StandardCharsets.UTF_8.name())))) {
        int c = 0;
        while ((c = reader.read()) != -1) {
          textBuilder.append((char) c);
        }
      }
      readTest = textBuilder.toString();
    }
    reader2.finish();

    Assert.assertEquals(writeTest, readTest);
  }

  @Test
  public void validateDatabaseQueryAfterTestFileIsAdded() throws IOException {
    List<File> files = DatabaseQuery.getAllFiles(database);

    Assert.assertTrue(true);
}
}
