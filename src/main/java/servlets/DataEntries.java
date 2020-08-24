package servlets;

import data.Database;
import data.DatabaseQuery;
import data.GCSDatabase;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import shared.sharedObjects;

/**
 * Fetch all the given recorded run ids in the database with their associated Pose, Pointcloud, etc
 * records.
 */
@WebServlet("/data")
public class DataEntries extends HttpServlet {

  private Database database;
  // Return numEntries runId and name pairs for getting urls to load viewer data.
  // Optional numEntries parameter limits the number of returned values.
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html;");
    String entriesUnparsed = request.getParameter("numEntries");
    // If the numEntries value is not set default to getting all the entries.
    int numEntries = -1;
    if (entriesUnparsed != null) {
      try {
        numEntries = Integer.parseInt(entriesUnparsed);
      } catch (Exception e) {
        System.err.println("Invalid value provided stick to default");
        numEntries = -1;
      }
    }
    // get JSON from Database.
    try {
      database = new GCSDatabase(sharedObjects.databaseName);
    } catch (Exception e) {
      System.err.println("*************COULD NOT INITIALIZE DATABASE*********************");
      System.err.println("Exception while initializing" + e.getMessage());
      throw e;
    }
    String json = DatabaseQuery.getJson(database);
    response.getWriter().println(json);
  }
}
