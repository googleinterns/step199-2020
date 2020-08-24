package servlets;

import IO.DbWriter;
import data.Database;
import data.GCSDatabase;
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

  private Database database;
  // Return numEntries runId and name pairs for getting urls to load viewer data.
  // Optional numEntries parameter limits the number of returned values.
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response)
      throws IOException, ServletException, IllegalStateException {
    response.setContentType("text/html;");
    String runid = request.getParameter("runID");
    String dataType = "pose";

    /*
     * Make a database object and write file to it. redirect to index page.
     */
    try {
      database = new GCSDatabase(sharedObjects.databaseName);
    } catch (Exception e) {
      System.err.println("*************COULD NOT INITIALIZE DATABASE*********************");
      System.err.println("Exception while initializing" + e.getMessage());
      throw new RuntimeException(e.getMessage());
    }
    DbWriter dataWriter = new DbWriter(database, runid, dataType);
    Part filePart = request.getPart("file");
    if (filePart == null) {
      response.sendRedirect("/index.html");
    }
    // Get the input stream and encode it/store it in the given OutputStream.
    InputStream uploadedFile = filePart.getInputStream();
    // dataWriter.write();
    Encoder.encode(uploadedFile, dataWriter.write());
    System.out.println("finishes encoding");
    response.sendRedirect("/index.html");
  }
}
