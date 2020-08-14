import static org.junit.Assert.assertEquals;

import encoder.Encoder;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import proto.SensorData.Pose;

@RunWith(JUnit4.class)
/** Validate that a .txt file can be properly encoded into a .proto file. */
public final class EncodeTest {

  @Test
  public void validateEncoding() throws Exception {
    // Attempt to open both the input and output streams for testing.
    // Now initialize this temporary file with the following data.
    String[] testInputArray =
        new String[] {
          "gps_timestamp lat lng alt roll_deg pitch_deg yaw_deg",
          "1140885738.407125 48.129872 11.582905 10.015034 -177.971817 -3.228588 10.700191",
          "1140885738.475212 48.129872 11.582905 10.014367 -177.982559 -3.510518 10.743480"
        };
    String testInput = testInputArray[0] + "\n" + testInputArray[1] + "\n" + testInputArray[2];
    InputStream input = new ByteArrayInputStream(testInput.getBytes());
    ByteArrayOutputStream output = new ByteArrayOutputStream();

    // Run the encoder on the given testInput.
    Encoder.encode(input, output);
    byte[] outputProto = output.toByteArray();
    // Split lines based on spaces. We start at 1 to ignore the header line.
    InputStream protoInput = new ByteArrayInputStream(outputProto);
    final String regex = " +";
    String[] firstLineString = testInputArray[1].split(regex);
    String[] secondLineString = testInputArray[2].split(regex);

    // Validate the contents of the output match the contents of what was inputted
    // for first line.
    Pose firstLine = Pose.parseDelimitedFrom(protoInput);
    verifyLine(firstLine, firstLineString);

    // Validate the contents of the output match the contents of what was inputted
    // for the second line.
    Pose secondLine = Pose.parseDelimitedFrom(protoInput);
    verifyLine(secondLine, secondLineString);
  }

  private void verifyLine(Pose readInLine, String[] expectedLine) {
    // The amount to allow for rounding when Double conversions are taking place in
    // the JUnit assertEquals for Double documentation.
    Double epsilon = .01;
    assertEquals(readInLine.getGpsTimestamp(), Double.parseDouble(expectedLine[0]), epsilon);
    assertEquals(readInLine.getLat(), Double.parseDouble(expectedLine[1]), epsilon);
    assertEquals(readInLine.getLng(), Double.parseDouble(expectedLine[2]), epsilon);
    assertEquals(readInLine.getAlt(), Double.parseDouble(expectedLine[3]), epsilon);
    assertEquals(readInLine.getRollDeg(), Float.parseFloat(expectedLine[4]), epsilon);
    assertEquals(readInLine.getPitchDeg(), Float.parseFloat(expectedLine[5]), epsilon);
    assertEquals(readInLine.getYawDeg(), Float.parseFloat(expectedLine[6]), epsilon);
  }
}
