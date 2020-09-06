package servlets;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/terrain")
public class GetTerrain extends HttpServlet {

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html;");
    System.out.println("The terrain ran");
    /*
     * [11.143450874999994, 47.835723546120256],\ [12.022357124999994,
     * 47.835723546120256],\ [12.022357124999994, 48.42234523396127],\
     * [11.143450874999994, 48.42234523396127],\ [11.143450874999994,
     * 47.835723546120256]])
     */
    // localhost:8080/terrain?minLat=11.143450874999994&minLng=47.835723546120256&maxLat=12.022357124999994&maxLng=&maxLng=48.42234523396127
    String minLat = request.getParameter("minLat");
    System.out.println(minLat);
    String minLng = request.getParameter("minLng");
    System.out.println(minLng);
    String maxLat = request.getParameter("maxLat");
    System.out.println(maxLat);
    String maxLng = request.getParameter("maxLng");
    System.out.println(maxLng);
    String current = new java.io.File(".").getCanonicalPath();
    System.out.println("The path is " + current);
    String programPath =
        "python3 /home/dmoe/Documents/Google/ShadyFeatures/src/main/java/python/testFinalish.py "
            + minLat
            + " "
            + minLng
            + " "
            + maxLat
            + " "
            + maxLng;
    System.out.println(programPath);
    Process p = Runtime.getRuntime().exec(programPath);
    System.out.println("Got here");
    BufferedReader in = new BufferedReader(new InputStreamReader(p.getInputStream()));
    String line;
    System.out.println("done");
    while ((line = in.readLine()) != null) {
      System.out.println("The line is " + line);
      response.getWriter().println(line);
    }
  }
}
