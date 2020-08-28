package encoder;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import proto.SensorData.Pose;

/**
 * Change file format from .txt to proto format. Expected file format consists of the following
 * lines in order of the header: gps_timestamp lat lng alt roll_deg pitch_deg yaw_deg
 */
public class Encoder {
  /*
   * Convert a given .txt that contains a header line specifying file contents
   * into the defined protobuf format.
   */
  // The expected number of fields in our input format.
  static final int maxFields = 7;

  public static void encode(InputStream inStream, OutputStream outStream) {
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
      if (maxFields != header.length) {
        System.err.println("Invalid header provided");
        closeStream(outStream);
        return;
      }
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

  private static String[] parseFields(String currentLine, int maxFields) {
    final String regex = " +";
    // Split all the files based on a RegEx.
    String[] fields = currentLine.split(regex, maxFields);
    return fields;
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
