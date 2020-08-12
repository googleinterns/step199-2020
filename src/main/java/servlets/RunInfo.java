package servlets;

import IO.ReaderSimple;
import data.Database;
import decoder.Decoder;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import shared.sharedObjects;

/** Fetch the given data points for a specific run based on its runId and the dataType. */
@WebServlet("/getrun")
public class RunInfo extends HttpServlet {
  // Return numEntries runId and name pairs for getting urls to load viewer data.
  // Optional numEntries parameter limits the number of returned values.
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Database dataInstance = new Database(sharedObjects.databaseName);
    response.setContentType("text/html;");
    String runId = request.getParameter("id");
    System.out.println("The run id is " + runId);
    String dataType = request.getParameter("dataType");
    System.out.println("The dataType is " + dataType);
    ReaderSimple dataReader = new ReaderSimple(dataInstance, runId, dataType);
    Decoder.decode(dataReader.read(), response.getOutputStream());
  }
}
