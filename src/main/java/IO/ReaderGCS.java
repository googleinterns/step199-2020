package IO;
public class ReaderGCS <T> {
    private T val; 
    public ReaderGCS(T val){
        this.val = val;
    }
    public T getVal(){
        return val;
    }
}