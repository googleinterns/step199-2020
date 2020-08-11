import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import decoder.Decoder;
import encoder.Encoder;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/** Validate that decoding the protobuf file to json works properly. */
@RunWith(JUnit4.class)
public final class DecodeTest {
  private static InputStream encoderInput;
  private static OutputStream encoderOutput;
  private static String decoderOutputFile;
  private static InputStream decoderInput;
  private static OutputStream decoderOutput;
  private static String[] testInputArray;
  private static String testInput;
  private static String decoderInputFile;

  @Before
  public void setUp() throws SecurityException, FileNotFoundException {
    decoderOutputFile = "decodeTestOutput.json";
    decoderInputFile = "testProtoFile";
    // Attempt to open both the input and output streams for testing.
    testInputArray =
        new String[] {
          "gps_timestamp lat lng alt roll_deg pitch_deg yaw_deg",
          "1140885738.407125 48.129872 11.582905 10.015034 -177.971817 -3.228588 10.700191",
          "1140885738.475212 48.129872 11.582905 10.014367 -177.982559 -3.510518 10.743480"
        };
    testInput = testInputArray[0] + "\n" + testInputArray[1] + "\n" + testInputArray[2];
    encoderInput = new ByteArrayInputStream(testInput.getBytes());
    encoderOutput = new FileOutputStream(decoderInputFile);
    decoderOutput = new FileOutputStream(decoderOutputFile);
  }

  @Test
  /**
   * Convert the encoded .sstable file (proto format) into json. Basic sanity checks, up to the user
   * to make sure the output is indeed as expected.
   */
  public void validateDecoding() throws IOException, OutOfMemoryError, SecurityException {
    // The encoder test relies on the encoder to generate the proper proto file to
    // decode.
    // First encode data from text to proto format.
    Encoder.encode(encoderInput, encoderOutput);

    // Now decode the data that was just created in that file.
    decoderInput = new FileInputStream(decoderInputFile);
    Decoder.decode(decoderInput, decoderOutput);

    // Open the file and create a String from its contents.
    File verifyFile = new File(decoderOutputFile);
    String fileContent = new String(Files.readAllBytes(verifyFile.toPath()));

    // Construct a Gson object to read the contents of the JSON object.
    final String regex = " +";
    Gson gson = new Gson();
    JsonArray object = gson.fromJson(fileContent, JsonArray.class);
    JsonObject firstLine = object.get(0).getAsJsonObject();
    JsonObject secondLine = object.get(1).getAsJsonObject();

    // Get the input as String arrays.
    String[] firstLineString = testInputArray[1].split(regex);
    String[] secondLineString = testInputArray[2].split(regex);

    // Validate that JSON contents match original input.
    System.out.println(firstLine);
    verifyLine(firstLine, firstLineString);
    System.out.println(secondLine);
    verifyLine(secondLine, secondLineString);

    // Delete the generated files.
    File in = new File(decoderInputFile);
    File out = new File(decoderOutputFile);
    in.delete();
    out.delete();
  }

  private void verifyLine(JsonObject readInLine, String[] expectedLine) {
    // The amount to allow for rounding when Double conversions are taking place in
    // the JUnit assertEquals for Double documentation.
    Double epsilon = .1;
    Assert.assertEquals(
        readInLine.get("gpsTimestamp").getAsDouble(), Double.parseDouble(expectedLine[0]), epsilon);
    Assert.assertEquals(
        readInLine.get("lat").getAsDouble(), Double.parseDouble(expectedLine[1]), epsilon);
    Assert.assertEquals(
        readInLine.get("lng").getAsDouble(), Double.parseDouble(expectedLine[2]), epsilon);
    Assert.assertEquals(
        readInLine.get("alt").getAsDouble(), Double.parseDouble(expectedLine[3]), epsilon);
    Assert.assertEquals(
        readInLine.get("rollDeg").getAsFloat(), Float.parseFloat(expectedLine[4]), epsilon);
    Assert.assertEquals(
        readInLine.get("pitchDeg").getAsFloat(), Float.parseFloat(expectedLine[5]), epsilon);
    Assert.assertEquals(
        readInLine.get("yawDeg").getAsFloat(), Float.parseFloat(expectedLine[6]), epsilon);
  }
}
