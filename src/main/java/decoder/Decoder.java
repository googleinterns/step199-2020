package decoder;

import com.google.protobuf.util.JsonFormat;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import proto.SensorData.Pose;

/** Decode data from the proto format to JSON. */
public class Decoder {
  public static void decode(InputStream dataStream, OutputStream outputStream) {
   // TODO(morleyd): buffer reading for large files.
    try {
      PrintWriter output = new PrintWriter(outputStream);
      Pose currentPose = Pose.parseDelimitedFrom(dataStream);
      // Read until nothing left to read, in which case null is returned.
      output.write("[");
      while (currentPose != null) {
        output.write(JsonFormat.printer().print(currentPose));
        currentPose = Pose.parseDelimitedFrom(dataStream);
        // Write ',' on all but last entry.
        if (currentPose != null) output.write(",");
      }
      output.write("]");
      // Close the PrintWriter stream.
      output.close();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
