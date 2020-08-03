import java.util.ArrayList;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import IO.ReaderGCS;

@RunWith(JUnit4.class)
/** Validate that a .txt file can be properly encoded into a .proto file. */
public final class TestReader {
    private ArrayList<ReaderGCS> readerObjects = new ArrayList<ReaderGCS>();

    @Before
    public void setUp() {
        /*
         * ReaderGCS<Long> val1= new ReaderGCS<Long>(); ReaderGCS<Double> val2 = new
         * ReaderGCS<Double>(); readerObjects = new
         * ArrayList<ReaderGCS>(Arrays.asList(val1, val2));
         */
    }

    @Test
    public void testCompile() {
        ReaderGCS<String> val1 = new ReaderGCS<String>("5");
        ReaderGCS<Double> val2 = new ReaderGCS<Double>(5.234);
        System.out.println(readerObjects);
        readerObjects.add(val1);
        readerObjects.add(val2);
        System.out.println(readerObjects.get(0).getVal());
        System.out.println(readerObjects.get(1).getVal());

    }
}
