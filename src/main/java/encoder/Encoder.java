package encoder;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import proto.SensorData.Pose;

/** Change file format from .txt to proto format. */
public class Encoder {
  /*
   * Convert a given .txt that contains a header line specifying file contents
   * into the defined protobuf format.
   */
  public static void encode(InputStream inStream, OutputStream outStream) {
    // Set an upper threshold by default on the maximum number of fields, this
    // will make the call to split faster.
    int maxFields = 20;
    // Split the input based on spaces, any number of spaces is allowed.

    try (BufferedReader reader = new BufferedReader(new InputStreamReader(inStream, "UTF-8"))) {
      // The first thing we want to do is read the header line, this will tell
      // us the names of the fields, and how many input fields that there are.
      String headLine = reader.readLine();
      // Check to ensure that a header exists in our input file.
      if (headLine == null) {
        System.err.println("Invalid file format: no header provided");
        closeStream(outStream);
        return;
      }
      String[] header = parseFields(headLine, maxFields);
      maxFields = header.length;
      String nextLine = null;
      while ((nextLine = reader.readLine()) != null) {

        String[] currentEntry = parseFields(nextLine, maxFields);
        Pose currentPose = parsePose(currentEntry);
        // Write the pose data to the necessary output stream.
        currentPose.writeDelimitedTo(outStream);
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
    closeStream(outStream);
  }

  private static void closeStream(OutputStream outStream) {
    try {
      outStream.close();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private static String[] parseFields(String currentLine, int maxFields, String regex) {
    // Split all the files based on a RegEx.
    String[] fields = currentLine.split(regex, maxFields);
    return fields;
  }

  private static String[] parseFields(String currentLine, int maxFields) {
    // Provide overloading to give default regex value, reduce scope of regex
    // variable.
    final String regex = " +";
    return parseFields(currentLine, maxFields, regex);
  }

  private static Pose parsePose(String[] input) {
    Pose.Builder pose = Pose.newBuilder();
    pose.setGpsTimestamp(Double.parseDouble(input[0]))
        .setLat(Double.parseDouble(input[1]))
        .setLng(Double.parseDouble(input[2]))
        .setAlt(Double.parseDouble(input[3]))
        .setRollDeg(Float.parseFloat(input[4]))
        .setPitchDeg(Float.parseFloat(input[5]))
        .setYawDeg(Float.parseFloat(input[6]));
    return pose.build();
  }
}
