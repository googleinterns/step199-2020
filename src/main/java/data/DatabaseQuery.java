package data;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.TreeSet;

/* Returns all files id and names with the purpose of having them show to webpage. */
public class DatabaseQuery {
  /* Returns all files id and names with the purpose of having them show to webpage. */
  private static ArrayList<String> getAllFiles(Database database) {
    return database.getAllFiles();
  }

  // A temporary method to replace the database until it is added in the near
  // future.
  public static String getJson(Database database) {

    // Example of sample Json format ~
    /*
     * [data: {runId: aks;ldfja entries: []}]
     */
    String fileName = database.getDatabaseName() + "/";
    fileName.trim();
    /*System.out.println("The filename is " + fileName);
    File dir = new File(fileName);
    System.out.println(dir.getAbsolutePath());
    */
    ArrayList<String> filenames = getAllFiles(database);
    if (filenames == null) {
      System.out.println("Directory is empty");
      return "{}";
    }

    HashMap<String, TreeSet<String>> dataMap = new HashMap<String, TreeSet<String>>();
    for (String file : filenames) {
      // Parse through all entries and write them as JSON
      System.out.println("The filename is " + file);
      String[] params = file.split("[_]");
      for (String param : params) System.out.println(param);
      if (params.length != 2) {
        System.err.println("Invalid database entry format!");
        return "";
      }
      String hash = params[0];
      String type = params[1];
      if (!dataMap.containsKey(hash)) {
        TreeSet<String> toAdd = new TreeSet<String>();
        toAdd.add(type);
        dataMap.put(hash, toAdd);
      } else {
        dataMap.get(hash).add(type);
      }
    }
    System.out.println(dataMap);
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    String json = gson.toJson(dataMap);
    System.out.println(json);
    return json;
  }
}
