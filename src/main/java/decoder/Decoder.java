package decoder;

import com.google.protobuf.util.JsonFormat;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import proto.SensorData.Pose;

/** Decode data from the proto format to JSON. */
public class Decoder {
  public static void decode(InputStream dataStream, OutputStream outputStream) {
    // TODO(morleyd): buffer reading for large files.
    PrintWriter output = new PrintWriter(outputStream);
    Pose currentPose;
    try {
      currentPose = Pose.parseDelimitedFrom(dataStream);
    } catch (IOException e) {
      e.printStackTrace();
      System.err.println("Unable to parse the header.");
      output.close();
      return;
    }

    // First parentheses for JSON printing.
    output.write("[");
    // Read until nothing left to read, in which case null is returned.
    while (currentPose != null) {
      try {
        output.write(JsonFormat.printer().print(currentPose));
        currentPose = Pose.parseDelimitedFrom(dataStream);
      } catch (IOException e) {
        System.err.println("Invalid line");
        output.close();
        return;
      }
      // Write ',' on all but last entry.
      if (currentPose != null) output.write(",");
    }

    // End JSON printing.
    output.write("]");
    // Close the PrintWriter stream.
    output.close();
  }
}
