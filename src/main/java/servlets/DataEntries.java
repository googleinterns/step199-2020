package servlets;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import data.Database;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.TreeSet;
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
  // Return numEntries runId and name pairs for getting urls to load viewer data.
  // Optional numEntries parameter limits the number of returned values.
  private Database dataInstance = new Database(sharedObjects.databaseName);

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
    // Logic that goes here that calls two methods from the intermediate Database
    // depending on what exactly.
    String json = getJson();
    response.getWriter().println(json);
  }

  // A temporary method to replace the database until it is added in the near
  // future.
  private String getJson() {
    // In the future this will be implemented by calling a method from the database
    // class. For now this is implemented as reading from a file. Although the name
    // could be recovered from the shared instance, this implementation will be
    // changed when merged into Frelica's database implementation and this function
    // will no longer be called.
    String fileName = dataInstance.getName() + "/";
    // Remove extraneous whitespace from the name.
    File dir = new File(fileName);
    System.out.println(dir.getAbsolutePath());
    File[] dataEntries = dir.listFiles();
    if (dataEntries == null) {
      System.out.println("Directory is empty");
      return "{}";
    }

    // Associate a runID with a list (for json) of the entry types that are found
    // for it.
    HashMap<String, TreeSet<String>> idToDataTypes = new HashMap<String, TreeSet<String>>();
    for (File file : dataEntries) {
      // Parse through all entries and write them as JSON.
      String name = file.getName();
      // Use regex to extract name and type from string.
      String[] params = name.split("[_.]");
      if (params.length != 3) {
        System.err.println("Invalid database entry format!");
        return "";
      }
      String runId = params[0];
      String type = params[1];

      // Add empty TreeSet to map if none is present.
      TreeSet<String> typeList = idToDataTypes.computeIfAbsent(runId, id -> new TreeSet<String>());
      // Add specific entry.
      typeList.add(type);
    }
    System.out.println(idToDataTypes);
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    String json = gson.toJson(idToDataTypes);
    System.out.println(json);
    return json;
  }
}
