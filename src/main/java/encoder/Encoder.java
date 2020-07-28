package encoder;

import com.google.protobuf.Descriptors.FieldDescriptor;
import com.google.protobuf.GeneratedMessageV3;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.InputMismatchException;
import java.util.List;
import proto.DataFormats.Data;
import proto.DataFormats.Heading;
import proto.DataFormats.Position;
import proto.DataFormats.SerializedData;

/** Change file format from .txt to proto format. */
public class Encoder {
  // Define interface for functional programming style.
  public interface Lambda<T, U> {
    T parseToType(U input);
  }

  private static Lambda<Float, String> toFloat = (String x) -> Float.parseFloat(x);

  public static void encode(InputStream inStream, OutputStream outStream) {
    // Set an upper threshold by default on the maximum number of fields, this
    // will make the call to split faster.
    int maxFields = 20;
    // Split the input based on spaces, any number of spaces is allowed.
    final String regex = " +";
    SerializedData.Builder serialized = SerializedData.newBuilder();
    try (BufferedReader reader = new BufferedReader(new InputStreamReader(inStream, "UTF-8"))) {
      // The first thing we want to do is read the header line, this will tell
      // us the names of the fields, and how many input fields that there are.
      String headLine = reader.readLine();
      // Check to ensure that a header exists in our input file.
      if (headLine == null) {
        System.err.println("Invalid file format: no header provided");
        System.exit(-1);
      }
      String[] header = parseFields(headLine, regex, maxFields);
      maxFields = header.length;
      String nextLine = null;
      while ((nextLine = reader.readLine()) != null) {
        String[] currentEntry = parseFields(nextLine, regex, maxFields);
        serialized.addData(parseData(currentEntry));
        // TODO(morleyd): Generalize this part of the code by using java
        // reflection so it is generally applicable.
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
    try {
      // Build the entire message.
      serialized.build().writeTo(outStream);
      // Ensure we close the file stream.
      outStream.close();
    } catch (Exception e) {
      e.getStackTrace();
    }
  }
  // Split into array based on the given RegEx.
  private static String[] parseFields(String currentLine, String regex, int maxFields) {
    // Split all the files based on a RegEx.
    // TODO(morleyd): Add some file sanity checking, throw an error on
    // unexpected format (might not do though as slows down operation).
    String[] fields = currentLine.split(regex, maxFields);
    return fields;
  }

  private static Heading parseHeading(String[] input, int startIndex, int endIndex) {
    Heading.Builder head = Heading.newBuilder();
    List<FieldDescriptor> currentFields = head.getDescriptor().getFields();
    ArrayList<Lambda> headingTypes = new ArrayList<>(Arrays.asList(toFloat, toFloat, toFloat));
    setFields(head, currentFields, input, headingTypes, startIndex, endIndex);
    return head.build();
  }

  private static Position parsePosition(String[] input, int startIndex, int endIndex) {
    Position.Builder position = Position.newBuilder();
    List<FieldDescriptor> currentFields = position.getDescriptor().getFields();
    ArrayList<Lambda> headingTypes = new ArrayList<>(Arrays.asList(toFloat, toFloat, toFloat));
    setFields(position, currentFields, input, headingTypes, startIndex, endIndex);
    return position.build();
  }

  private static Data parseData(String[] input) {
    // TODO(morleyd): Might be possible to make this more generalizable with
    // recursion.
    Data.Builder data = Data.newBuilder();
    // Only an even number can ever be included due to the size constraints.
    Position position = parsePosition(input, 0, input.length / 2);
    Heading head = parseHeading(input, input.length / 2, input.length - 1);
    return data.setHead(head).setPose(position).build();
  }

  private static void setFields(
      GeneratedMessageV3.Builder toBuild,
      List<FieldDescriptor> currentFields,
      String[] input,
      ArrayList<Lambda> types,
      int startIndex,
      int endIndex)
      throws InputMismatchException {
    int listLength = currentFields.size();
    int arrayLength = endIndex - startIndex;
    if (arrayLength != listLength) {
      // Invalid message format, raise an exception.
      throw new InputMismatchException();
    }
    // The index of the one array and the other are no longer the same.
    for (int i = startIndex; i != endIndex; i++) {
      int currentFieldsIndex = i - startIndex;
      toBuild.setField(
          currentFields.get(currentFieldsIndex),
          types.get(currentFieldsIndex).parseToType(input[i]));
    }
  }
}
