package servlets;

import IO.DbReader;
import data.Database;
import data.GCSDatabase;
import decoder.Decoder;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import shared.sharedObjects;

/* Fetch the given data points for a specific run based on its runId and the dataType. */
@WebServlet("/getrun")
public class RunInfo extends HttpServlet {
  Database database;
  /* Initialize the database. */
  @Override
  public void init() throws ServletException {
    database = new GCSDatabase(sharedObjects.databaseName);
  }

  // Return numEntries runId and name pairs for getting urls to load viewer data.
  // Optional numEntries parameter limits the number of returned values.
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html;");
    String runId = request.getParameter("id");
    System.out.println("The run id is " + runId);
    String dataType = request.getParameter("dataType");
    System.out.println("The dataType is " + dataType);

    // We now make would make an instance of the reader object to get a stream from
    // the database, then pass this value to the decoder, with a string as our ouput
    // stream.
    DbReader dataReader = new DbReader(database, runId, dataType);
    Decoder.decode(dataReader.read(), response.getOutputStream());
  }
}
