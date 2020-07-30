package decoder;

import com.google.protobuf.util.JsonFormat;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import proto.SensorData.Pose;

/** Decode data from the proto format to JSON. */
public class Decoder {
  public static void decode(InputStream dataStream, OutputStream outputStream) {

    // At some point it would make sense to have this data read in chunks of the
    // data file and include headers in the proto definitions so we could
    // address issues with large files, stuff not fitting into RAM, etc.
    try {
      int i = 0;
      PrintWriter output = new PrintWriter(outputStream);
      Pose currentPose = Pose.parseDelimitedFrom(dataStream);
      ;
      for (; currentPose != null && i != 10; i++) {
        output.write(JsonFormat.printer().print(currentPose));
        currentPose = Pose.parseDelimitedFrom(dataStream);
      }
      output.close();
      // Now convert the data we have streamed in to JSON.parseFrom
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
