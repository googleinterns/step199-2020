package servlets;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Fetch all the given recorded run ids in the database with their associated
 * Pose, Pointcloud, etc records.
 */
@WebServlet("/dataentries")
public class DataEntries extends HttpServlet {
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
        // Logic that goes here that calls two methods from the intermediate Database
        // depending on what exactly
        String json = getJson();
        response.getWriter().println(json);
    }

    // A temporary method to replace the database until it is added in the near
    // future.
    private String getJson() {
        // In the future this will be implemented by calling a method from the database
        // class. For now this is implemented as reading from a file.

        // Example of sample Json format ~
        /*
         * [data: {runId: aks;ldfja entries: []}]
         */

        String tempFileName = "SampleDatabaseEntries.json";
        try {
            return new String(Files.readAllBytes(Paths.get(tempFileName)));
        } catch (Exception e) {
            System.err.println("Unable to read the given file");
        }
        return null;
    }
}