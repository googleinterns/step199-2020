import encoder.Encoder;
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

@RunWith(JUnit4.class)
/** Validate that a .txt file can be properly encoded into a .proto file. */
public final class EncodeTest {
  private static String inputFile;
  private static String outputFile;
  private static InputStream input;
  private static OutputStream output;

  @Before
  public void setUp() {
    inputFile = "testInput2.txt";
    outputFile = "testOutput.sstable";
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
  public void validateEncoding() {

    Encoder.encode(input, output);
    try {
      input.close();
      output.close();
    } catch (IOException e) {
      System.out.println("Unable to close the stream");
    }

    // Validate the outputFile was generated
    File verifyFile = new File(outputFile);
    Assert.assertEquals(verifyFile.exists(), true);

    // Validate that the size of the output file is smaller than the size of the
    // input one (this should be true as protobuf compresses data at a smaller
    // granularity than the txt encoding).
    File originalInput = new File(inputFile);
    boolean isSmaller = verifyFile.length() < originalInput.length();
    Assert.assertEquals(isSmaller, true);
  }
}
