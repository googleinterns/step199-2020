package IO;

import java.io.InputStream;
// getMessageClass can take the message name and convert it into the relevant proto.
// http://googleapis.github.io/gax-java/0.2.0/apidocs/com/google/api/gax/protobuf/ProtoReflectionUtil.html
// Then use getDefaultInstance along with the instructions from this stackoverflow post
// https://stackoverflow.com/questions/43675811/create-new-builder-using-com-google-protobuf-descriptors-descriptor
public class ReaderSimple {
    private InputStream currentStream;
    public InputStream read(){


    }
}