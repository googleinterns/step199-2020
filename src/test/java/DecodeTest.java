import static org.junit.Assert.assertEquals;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import decoder.Decoder;
import encoder.Encoder;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/** Validate that decoding the protobuf file to json works properly. */
@RunWith(JUnit4.class)
public final class DecodeTest {

  @Test
  /**
   * Convert the encoded .sstable file (proto format) into json. Basic sanity checks, up to the user
   * to make sure the output is indeed as expected.
   */
  public void validateDecoding() throws Exception {
    // Attempt to open both the input and output streams for testing.
    String[] testInputArray =
        new String[] {
          "gps_timestamp lat lng alt roll_deg pitch_deg yaw_deg",
          "1140885738.407125 48.129872 11.582905 10.015034 -177.971817 -3.228588 10.700191",
          "1140885738.475212 48.129872 11.582905 10.014367 -177.982559 -3.510518 10.743480"
        };
    String testInput = String.join("\n", testInputArray);
    InputStream encoderInput = new ByteArrayInputStream(testInput.getBytes());
    ByteArrayOutputStream encoderOutput = new ByteArrayOutputStream();
    OutputStream decoderOutput = new ByteArrayOutputStream();
    // The encoder test relies on the encoder to generate the proper proto file to
    // decode.
    // First encode data from text to proto format.
    Encoder.encode(encoderInput, encoderOutput);
    byte[] encoderOutputBytes = encoderOutput.toByteArray();
    // Now decode the data that was just created in that file.
    InputStream decoderInput = new ByteArrayInputStream(encoderOutputBytes);
    Decoder.decode(decoderInput, decoderOutput);

    String decoderOutputString = decoderOutput.toString();
    // Construct a Gson object to read the contents of the JSON object.
    final String regex = " +";
    Gson gson = new Gson();
    JsonArray object = gson.fromJson(decoderOutputString, JsonArray.class);
    JsonObject firstLine = object.get(0).getAsJsonObject();
    JsonObject secondLine = object.get(1).getAsJsonObject();

    // Get the input as String arrays.
    String[] firstLineString = testInputArray[1].split(regex);
    String[] secondLineString = testInputArray[2].split(regex);

    // Validate that JSON contents match original input.
    verifyLine(firstLine, firstLineString);
    verifyLine(secondLine, secondLineString);
  }

  private void verifyLine(JsonObject readInLine, String[] expectedLine) {
    // The amount to allow for rounding when Double conversions are taking place in
    // the JUnit assertEquals for Double documentation.
    Double epsilon = .01;
    assertEquals(
        readInLine.get("gpsTimestamp").getAsDouble(), Double.parseDouble(expectedLine[0]), epsilon);
    assertEquals(readInLine.get("lat").getAsDouble(), Double.parseDouble(expectedLine[1]), epsilon);
    assertEquals(readInLine.get("lng").getAsDouble(), Double.parseDouble(expectedLine[2]), epsilon);
    assertEquals(readInLine.get("alt").getAsDouble(), Double.parseDouble(expectedLine[3]), epsilon);
    assertEquals(
        readInLine.get("rollDeg").getAsFloat(), Float.parseFloat(expectedLine[4]), epsilon);
    assertEquals(
        readInLine.get("pitchDeg").getAsFloat(), Float.parseFloat(expectedLine[5]), epsilon);
    assertEquals(readInLine.get("yawDeg").getAsFloat(), Float.parseFloat(expectedLine[6]), epsilon);
  }
}
