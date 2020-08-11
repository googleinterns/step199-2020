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

/*
* Validate that decoding the protobuf file to json works properly. 
*/
@RunWith(JUnit4.class)
public final class DecodeTest {
  private static String inputFile;
  private static String outputFile;
  private static InputStream input;
  private static OutputStream output;

  @Before
  public void setUp() {
    inputFile = "sampleProto.sstable";
    outputFile = "testOutput.json";
    // Attempt to open both the input and output streams for testing.
    try {
      input = new FileInputStream(inputFile);
    } catch (FileNotFoundException e) {
      System.out.format("Unable to open the input file with name %s", inputFile);
      e.printStackTrace();
    } catch (SecurityException e) {
      System.out.format("Permission error when opening the input file %s", inputFile);
      e.printStackTrace();
    }
    try {
      output = new FileOutputStream(outputFile);
    } catch (FileNotFoundException e) {
      System.out.format("Unable to open the output file with name %s", outputFile);
      e.printStackTrace();

    } catch (SecurityException e) {
      System.out.format("Permission error when opening the output file %s", outputFile);
      e.printStackTrace();
    }
  }

  @Test
  /**
   * Convert the encoded .sstable file (proto format) into json. Basic sanity
   * checks, up to the user to make sure the output is indeed as expected.
   */
  public void validateDecoding() {
    Decoder.decode(input, output);
    try {
      input.close();
      output.close();
    } catch (IOException e) {
      System.out.println("Unable to close the stream");
    }

    // Check to make sure that the output file exists.
    File verifyFile = new File(outputFile);
    Assert.assertEquals(verifyFile.exists(), true);

    // Check to make sure that the output JSON file is large than the compressed
    // protobuf one.
    File originalInput = new File(inputFile);
    boolean isSmaller = verifyFile.length() > originalInput.length();
    Assert.assertEquals(isSmaller, true);
  }
}
