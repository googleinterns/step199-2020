package servlets;

import IO.DbWriter;
import encoder.Encoder;
import java.io.IOException;
import java.io.InputStream;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import shared.sharedObjects;

/** Fetch the given data points for a specific run based on its runId and the dataType. */
@MultipartConfig
@WebServlet("/upload")
public class Upload extends HttpServlet {
  // Return numEntries runId and name pairs for getting urls to load viewer data.
  // Optional numEntries parameter limits the number of returned values.
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response)
      throws IOException, ServletException, IllegalStateException {
    response.setContentType("text/html;");

    String dataType = "pose";
    // Should take in database instance, along with data type.
    DbWriter dataWriter = new DbWriter(sharedObjects.dataInstance, dataType);
    Part filePart = null;

    filePart = request.getPart("file");
    if (filePart == null) {
      response.sendRedirect("/index.html");
    }
    // Get the input stream and encode it/store it in the given OutputStream.
    InputStream uploadedFile = filePart.getInputStream();
    Encoder.encode(uploadedFile, dataWriter.write());
    System.out.println("finishes encoding");
    // We now make would make an instance of the reader object to get a stream from
    // the database, then pass this value to the decoder, with a string as our ouput
    // stream.
    // As reader object is not yet defined instead get the file input stream
    // directly
  }
}
