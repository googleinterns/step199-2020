import decoder.Decoder;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/** Validate that ReaderSimple class works properly */
@RunWith(JUnit4.class)
public final class ReaderSimpleTest {
  private static String inputFile;
  private static String outputFile;
  private static InputStream input;
  private static OutputStream output;

  @Before
  public void setUp() {
  }

  @Test
  /**
   * initiate a ReaderSimple object.
   */
  public void  SimpleReader() {
    ReaderSimple simpleReader = new ReaderSimple();

    Assert.assertEquals("Hello Ada", greeting);
  }

  @Test
  /**
   * initiate a ReaderSimple object.
   */
  public void  SimpleReader() {
    ReaderSimple simpleReader = new ReaderSimple();

    Assert.assertEquals("Hello Ada", greeting);
  }
}