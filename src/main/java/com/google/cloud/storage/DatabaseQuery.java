package google.cloud.storage;

import data.Database;
import java.util.ArrayList;

/* Returns all files id and names with the purpose of having them show to webpage.  */
public class DatabaseQuery{  
    /* Returns all files id and names with the purpose of having them show to webpage.  */
    public static ArrayList<String>  getAllFiles(Database database){
        return database.getAllFiles();
    }
}
