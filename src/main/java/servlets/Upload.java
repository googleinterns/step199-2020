package servlets;

import java.io.IOException;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import IO.ReaderSimple;
import decoder.Decoder;

/**
 * Fetch the given data points for a specific run based on its runId and the
 * dataType.
 */
@WebServlet("/getrun")
public class Upload extends HttpServlet {
    // Return numEntries runId and name pairs for getting urls to load viewer data.
    // Optional numEntries parameter limits the number of returned values.
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html;");
        
        
        String dataType = "pose";


        // should take in database instance, along with data type
        WriterSimple dataWriter = new WriterSimple( ,runID, datatype);
        Decoder.decode(dataWriter.write(), response.getOutputStream());
        // We now make would make an instance of the reader object to get a stream from
        // the database, then pass this value to the decoder, with a string as our ouput
        // stream.
        // As reader object is not yet defined instead get the file input stream
        // directly
    }

}