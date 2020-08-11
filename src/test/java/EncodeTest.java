import encoder.Encoder;
import java.io.ByteArrayInputStream;
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
import proto.SensorData.Pose;

@RunWith(JUnit4.class)
/** Validate that a .txt file can be properly encoded into a .proto file. */
public final class EncodeTest {
  private static String outputFile;
  private static InputStream input;
  private static OutputStream output;
  private static String[] testInputArray;
  private static String testInput;

  @Before
  public void setUp() throws SecurityException, FileNotFoundException, IOException {
    outputFile = "testOutput";
    // Attempt to open both the input and output streams for testing.
    // Will throw the appropriate exceptions upon finding the

    // Now initialize this temporary file with the following data.
    testInputArray =
        new String[] {
          "gps_timestamp lat lng alt roll_deg pitch_deg yaw_deg",
          "1140885738.407125 48.129872 11.582905 10.015034 -177.971817 -3.228588 10.700191",
          "1140885738.475212 48.129872 11.582905 10.014367 -177.982559 -3.510518 10.743480"
        };
    testInput = testInputArray[0] + "\n" + testInputArray[1] + "\n" + testInputArray[2];
    input = new ByteArrayInputStream(testInput.getBytes());
    output = new FileOutputStream(outputFile);
  }

  @Test
  public void validateEncoding() throws IOException {

    // Run the encoder on the given testInput.
    Encoder.encode(input, output);
    try {
      output.close();
    } catch (IOException e) {
      System.out.println("Unable to close the stream");
    }
    // Split lines based on spaces. We start at 1 to ignore the header line.
    final String regex = " +";
    String[] firstLineString = testInputArray[1].split(regex);
    String[] secondLineString = testInputArray[2].split(regex);
    InputStream readTestOutput = new FileInputStream(outputFile);

    // Validate the contents of the output match the contents of what was inputted
    // for first line.
    Pose firstLine = Pose.parseDelimitedFrom(readTestOutput);
    verifyLine(firstLine, firstLineString);

    // Validate the contents of the output match the contents of what was inputted
    // for the second line.
    Pose secondLine = Pose.parseDelimitedFrom(readTestOutput);
    verifyLine(secondLine, secondLineString);

    // Validate the outputFile was generated
    File verifyFile = new File(outputFile);
    Assert.assertEquals(verifyFile.exists(), true);

    // Delete the output file
    verifyFile.delete();
  }

  private void verifyLine(Pose readInLine, String[] expectedLine) {
    // The amount to allow for rounding when Double conversions are taking place in
    // the JUnit assertEquals for Double documentation
    Double epsilon = .01;
    Assert.assertEquals(readInLine.getGpsTimestamp(), Double.parseDouble(expectedLine[0]), epsilon);
    Assert.assertEquals(readInLine.getLat(), Double.parseDouble(expectedLine[1]), epsilon);
    Assert.assertEquals(readInLine.getLng(), Double.parseDouble(expectedLine[2]), epsilon);
    Assert.assertEquals(readInLine.getAlt(), Double.parseDouble(expectedLine[3]), epsilon);
    Assert.assertEquals(readInLine.getRollDeg(), Float.parseFloat(expectedLine[4]), epsilon);
    Assert.assertEquals(readInLine.getPitchDeg(), Float.parseFloat(expectedLine[5]), epsilon);
    Assert.assertEquals(readInLine.getYawDeg(), Float.parseFloat(expectedLine[6]), epsilon);
  }
}
