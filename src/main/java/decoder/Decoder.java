package decoder;

import com.google.protobuf.util.JsonFormat;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import proto.DataFormats.SerializedData;

public class Decoder {
  public static void decode(InputStream dataStream, OutputStream outputStream) {

    // At some point it would make sense to have this data read in chunks of the
    // data file and include headers in the proto definitions so we could
    // address issues with large files, stuff not fitting into RAM, etc.
    try {
      SerializedData protoData = SerializedData.parseFrom(dataStream);
      PrintWriter output = new PrintWriter(outputStream);
      output.write(JsonFormat.printer().print(protoData));
      // Now convert the data we have streamed in to JSON.
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
