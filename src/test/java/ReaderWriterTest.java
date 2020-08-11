package test;

import static org.junit.Assert.assertEquals;

import IO.DbReader;
import IO.DbWriter;
import data.Database;
import data.DatabaseQuery;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

@RunWith(JUnit4.class)
/* Validate that a .txt file can be properly be stored written and read from database.  */
public final class ReaderWriterTest {

  @Test
  public void validateDatabaseName() throws IOException {
    System.out.println("validateDatabaseName()");
    Database database = new Database("validateDatabaseName");
    /* Validate that place where data is stored is named test. */
    System.out.println("test = " + database.getDatabaseName());
    assertEquals("validateDatabaseName", database.getDatabaseName());

    /* Delete directory.*/
    database.getDatabase().delete();
  }

  @Test
  public void validateWriterRunId() throws IOException {
    System.out.println("validateWriterRunId()");
    Database database = new Database("validateWriterRunId");
    /* Validate that writer's runId is test. */
    DbWriter writer = new DbWriter(database, "2ndTestRunId", "writingIn");
    assertEquals("2ndTestRunId", writer.getRunId());

    /* Delete directory.*/
    database.getDatabase().delete();
  }

  @Test
  public void validateReaderWriterDatabaseConnect() throws IOException {
    System.out.println("validateReaderWriterDatabaseConnect()");

    /*Validate that what writer wrote to database is what reader reads. */
    /* Initialize Database, reader, and writer. */
    Database database = new Database("validateConnect");
    DbWriter writer = new DbWriter(database, "3rdTestRunId", "writingIn");
    DbReader reader = new DbReader(database, "3rdTestRunId", "writingIn");

    String writeTest = "This is a test string";

    /* Write writeTest into database.*/
    try (OutputStream output1 = writer.write()) {
      byte[] b = writeTest.getBytes();
      output1.write(b);
    }
    /* Close outputStream. */
    writer.finish();

    String readTest = null;

    /* Read contents of file written to database. */
    try (Reader reads =
        new BufferedReader(
            new InputStreamReader(reader.read(), Charset.forName(StandardCharsets.UTF_8.name())))) {
      /*Convert inputStream to Stringbuilder*/
      StringBuilder textBuilder = new StringBuilder();
      int c = 0;
      while ((c = reads.read()) != -1) textBuilder.append((char) c);
      /* Convert Stringbuilder to a string. */
      readTest = textBuilder.toString();
    }
    /* Close inputStream. */
    reader.finish();

    assertEquals(writeTest, readTest);

    /* Delete directory  recursively. */
    File[] allContents = database.getDatabase().listFiles();
    if (allContents != null) {
      for (File file : allContents) {
        file.delete();
      }
    }
    database.getDatabase().delete();
  }

  @Test
  public void validateDatabaseQuery() throws IOException {
    /* TODO: Test if DatabaseQuery method returns all files stored in the database.*/
    Database database = new Database("validateDatabaseQuery");
    ArrayList<String> expectedFiles = new ArrayList<String>();

    /* Add files to Database.*/
    DbWriter writer1 = new DbWriter(database, "1stFile", "");
    writer1.write();
    expectedFiles.add(writer1.getRunId() + "_" + writer1.getType());

    DbWriter writer2 = new DbWriter(database, "2ndFile", "");
    writer2.write();
    expectedFiles.add(writer2.getRunId() + "_" + writer2.getType());

    DbWriter writer3 = new DbWriter(database, "3rdFile", "");
    writer3.write();
    expectedFiles.add(writer3.getRunId() + "_" + writer3.getType());

    ArrayList<String> files = DatabaseQuery.getAllFiles(database);
    Assert.assertTrue(expectedFiles.containsAll(files));

    /* Delete directory recursively.*/
    File[] allContents = database.getDatabase().listFiles();
    if (allContents != null) {
      for (File file : allContents) {
        file.delete();
      }
    }
    database.getDatabase().delete();
  }
}
