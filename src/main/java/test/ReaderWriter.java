/*package java;

import java.io.InputStream;
import java.io.OutputStream;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

@RunWith(JUnit4.class)
/* Validate that a .txt file can be properly be stored written and read from database.  */
/*public final class ReaderWriterTest {
private static String inputFile;
private static String outputFile;
private static InputStream input;
private static OutputStream output;

@Before
public void setUp() {
  inputFile = "testInput2.txt";
  outputFile = "testOutput.sstable";
  Database database = new Database("test");
  DbWriter writer = new DbWriter(database, "test", "writingIn");
  DbReader reader = new DbReader(database, "test", "writingIn");
}

@Test
public void validateDatabaseName() {
  System.out.println("validateDatabaseName()");
  /* Validate that place where data is stored is named test. */
  /*  Assert.assertEquals(database.getDatabase(), "test");
  }

  @Test
  public void validateWriterRunId() {
    System.out.println("validateWriterRunId()");
    /* Validate that writer's runId is test. */
   /* Assert.assertEquals(writer.getRunId(), "test");
   }

   @Test
   public void validateReaderRunId() {
     System.out.println("validateReaderRunId()");
     /* Validate that reader's runId is test. */
   /* Assert.assertEquals(reader.getRunId(), "test");
   }

   @Test
   public void validateReaderWriterDatabaseConnect() {
     System.out.println("validateReaderWriterDatabaseConnect()");
     /* Validate that what writer wrote to dtabase is what reader read. */
   /* output = writer.write();
   input = reader.read();

   /* TODO: put written contents in file and read contents in another file and compare. */
   /* Assert.assertEquals(outputFile, inputFile);
     }
   }*/
