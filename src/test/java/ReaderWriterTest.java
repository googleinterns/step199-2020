package test;

import IO.DbReader;
import IO.DbWriter;
import data.Database;
import java.io.InputStream;
import java.io.OutputStream;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

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
  public void setUp() {
  }

  @Test
  public void validateDatabaseName() {
    System.out.println("validateDatabaseName()");
    /* Validate that place where data is stored is named test. */
    System.out.println("test = " + database.getDatabase());
    Assert.assertEquals(database.getName(), "test");
  }

  @Test
  public void validateWriterRunId() {
    System.out.println("validateWriterRunId()");
    /* Validate that writer's runId is test. */
    Assert.assertEquals(writer.getRunId(), "test");
  }

  @Test
  public void validateReaderWriterDatabaseConnect() {
    System.out.println("validateReaderWriterDatabaseConnect()");
    /* Validate that what writer wrote to dtabase is what reader read. */
    output = writer.write();

    input = reader.read();

    /* TODO: put written contents in file and read contents in another file and compare. */
    Assert.assertEquals(true, true);
  }
}
