import decoder.Decoder;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/** Validate that ReaderSimple class works properly */
@RunWith(JUnit4.class)
public final class ReaderSimpleTest {
  private static String inputFile;
  private static String outputFile;
  private static InputStream input;
  private static OutputStream output;

  @Autowired
  private WebApplicationContext wac;
  private MockMvc mockMvc;

  @Before
  public void setUp() {
    DefaultMockMvcBuilder builder = MockMvcBuilders.webAppContextSetup(this.wac);
    this.mockMvc = builder.build();
  }

  @Test
  /**
   * Initiate a ReaderSimple object.
   * What's the behavior? - call write and read with fake data. 
   */
  public void  SimpleReader() {
    ReaderSimple simpleReader = new ReaderSimple();

    Assert.assertEquals("Hello Ada", greeting);
  }

  @Test
  public void testController() throws Exception {
      ResultMatcher ok = MockMvcResultMatchers.status().isOk();

      String fileName = "test.txt";
      File file = new File(FileUploadController.targetFolder + fileName);
      //delete if exits
      file.delete();

      MockMultipartFile mockMultipartFile = new MockMultipartFile("user-file",fileName,
              "text/plain", "test data".getBytes());

      MockHttpServletRequestBuilder builder =
              MockMvcRequestBuilders.multipart("/upload")
                                    .file(mockMultipartFile);
      this.mockMvc.perform(builder).andExpect(ok)
                  .andDo(MockMvcResultHandlers.print());;
      Assert.assertTrue(file.exists());
  }

  @Test
  /**
   * initiate a ReaderSimple object.
   */
  public void  SimpleReader() {
    ReaderSimple simpleReader = new ReaderSimple();

    Assert.assertEquals("Hello Ada", greeting);
  }
}